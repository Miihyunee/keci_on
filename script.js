/**
 * ==========================================================================
 * 1. 여비 규정 구성 데이터 설정 영역
 * ==========================================================================
 */
var TRIP_CONFIG = {
  effectiveDate: "2025.12.18.",

  outer: {                       // 근무지 외 출장 (제14조)
    ilbiPerDay: 25000,           // 일비 (원/일) — 대중교통·자가용 기준
    ilbiVehiclePerDay: 12500,    // 일비 — 업무용차량 이용 시 (통상 ilbiPerDay의 1/2)
    mealPerDay: 25000,           // 식비 (원/일)
    lodgingCap: {
      "서울": 100000,            // 서울 숙박비 상한 (원/박)
      "광역시": 80000,           // 광역시 숙박비 상한 (원/박)
      "기타": 70000              // 기타 지역 숙박비 상한 (원/박)
    }
  },

  inner: {                       // 근무지 내 출장 (제16조)
    ilbi4hPlus: 20000,           // 일비 — 4시간 이상 (원)
    ilbiUnder4h: 10000,          // 일비 — 4시간 미만 (원)
    vehicleDeduct: 10000         // 차량 이용 시 일비 감액분 (원)
  }
};

/**
 * ==========================================================================
 * 2. 출장 여비 코어 연산 엔진 모듈
 * ==========================================================================
 */
function calcTrip(data, cfg) {
  var c = cfg || (typeof TRIP_CONFIG !== 'undefined' ? TRIP_CONFIG : DEFAULT_CONFIG);
  var lodgingCap = c.outer.lodgingCap;
  var isInner = data.tripType.indexOf('내') === 0;

  var vDays = 0;
  if (data.vehicle !== 'public') {
    vDays = (data.vehicleDays !== undefined)
      ? Math.min(Math.max(0, data.vehicleDays), data.days)
      : data.days;
  }
  var pubDays = data.days - vDays;

  var ilbi = 0, meal = 0, lodging = 0, transport = data.transport;
  var ilbiPerDay = 0, ilbiVehiclePerDay = 0, mealDeduct = 0, mealFull = 0;

  if (isInner) {
    ilbiPerDay = (data.tripType === '내4') ? c.inner.ilbi4hPlus : c.inner.ilbiUnder4h;
    if (data.vehicle === 'company') ilbiVehiclePerDay = Math.max(0, ilbiPerDay - c.inner.vehicleDeduct);
    else if (data.vehicle === 'exclusive') ilbiVehiclePerDay = 0;
    else ilbiVehiclePerDay = ilbiPerDay;
    ilbi = ilbiPerDay * pubDays + ilbiVehiclePerDay * vDays;
  } else {
    ilbiPerDay = c.outer.ilbiPerDay;
    if (data.vehicle === 'company') ilbiVehiclePerDay = c.outer.ilbiVehiclePerDay;
    else if (data.vehicle === 'exclusive') ilbiVehiclePerDay = 0;
    else ilbiVehiclePerDay = c.outer.ilbiPerDay;
    ilbi = ilbiPerDay * pubDays + ilbiVehiclePerDay * vDays;

    mealFull = c.outer.mealPerDay * data.days;
    mealDeduct = Math.floor(data.freeMeals * (c.outer.mealPerDay / 3));
    meal = Math.floor(Math.max(0, mealFull - mealDeduct) / 10) * 10;

    if (data.nights > 0) {
      if (data.grade === '1') {
        lodging = data.lodgingPerNight * data.nights;
      } else {
        var cap = lodgingCap[data.region];
        lodging = Math.min(data.lodgingPerNight, cap) * data.nights;
      }
    }
  }

  var total = ilbi + meal + lodging + transport;
  return { ilbi: ilbi, meal: meal, lodging: lodging, transport: transport, total: total,
           ilbiPerDay: ilbiPerDay, ilbiVehiclePerDay: ilbiVehiclePerDay,
           vDays: vDays, pubDays: pubDays,
           mealDeduct: mealDeduct, mealFull: mealFull, isInner: isInner };
}

function calcDeposit(result, payment) {
  var personal = result.ilbi + result.meal;
  var corp = 0;
  if (payment === '개인카드') {
    personal += result.lodging + result.transport;
  } else {
    corp = result.lodging + result.transport;
  }
  return { personal: personal, corp: corp };
}

function isInnerTrip(regionName) {
  return regionName.indexOf('서울') === 0;
}

/**
 * ==========================================================================
 * 3. 렌더링 및 인터랙션 핸들러 구현
 * ==========================================================================
 */
var trips = [];
var editingIdx = -1;

function fmt(n) {
  return n.toLocaleString('ko-KR') + '원';
}
function fmtN(n) {
  return n.toLocaleString('ko-KR');
}
function nb(s) {
  return '<span style="display:inline-block;">' + s + '</span>';
}

function onNumberInput(el) {
  var val = parseInt(el.value) || 0;
  var hintEl = document.getElementById(el.id + 'Hint');
  if (hintEl) {
    hintEl.textContent = val > 0 ? val.toLocaleString('ko-KR') + '원' : '';
  }
}

function onDateChange() {
  var startEl = document.getElementById('dateStart');
  var endEl = document.getElementById('dateEnd');
  var infoEl = document.getElementById('dateInfo');

  if (startEl.value && !endEl.value) {
    endEl.value = startEl.value;
  }

  if (startEl.value && endEl.value) {
    var s = new Date(startEl.value);
    var e = new Date(endEl.value);
    if (e < s) { endEl.value = startEl.value; e = s; }
    var diff = Math.round((e - s) / 86400000) + 1;
    infoEl.textContent = diff + '일';
  } else {
    infoEl.textContent = '';
  }
  clearFieldError(startEl.closest('.form-field'));
  updatePreview();
}

function getCalcDays() {
  var startEl = document.getElementById('dateStart');
  var endEl = document.getElementById('dateEnd');
  if (startEl.value && endEl.value) {
    var s = new Date(startEl.value);
    var e = new Date(endEl.value);
    return Math.max(1, Math.round((e - s) / 86400000) + 1);
  }
  return 1;
}

function formatPeriod() {
  var startEl = document.getElementById('dateStart');
  var endEl = document.getElementById('dateEnd');
  if (!startEl.value) return '';
  var s = new Date(startEl.value);
  var days = getCalcDays();

  function fmtDate(d) {
    var y = String(d.getFullYear()).slice(2);
    var m = d.getMonth() + 1;
    var day = d.getDate();
    return "'" + y + '.' + m + '.' + day + '.';
  }

  var dayNames = ['일','월','화','수','목','금','토'];

  if (days === 1) {
    var dow = dayNames[s.getDay()];
    return fmtDate(s) + '(' + dow + ')';
  } else {
    var e = new Date(endEl.value);
    var sy = String(s.getFullYear()).slice(2);
    var ey = String(e.getFullYear()).slice(2);
    var startStr = fmtDate(s);
    var endStr;
    if (sy === ey && s.getMonth() === e.getMonth()) {
      endStr = e.getDate() + '.';
    } else if (sy === ey) {
      endStr = (e.getMonth()+1) + '.' + e.getDate() + '.';
    } else {
      endStr = fmtDate(e);
    }
    return startStr + '~' + endStr + '(' + days + '일)';
  }
}

function onTripTypeChange() {
  var tripType = document.getElementById('tripType').value;
  var isInner = tripType.indexOf('내') === 0;

  var conditionalFields = ['regionField', 'freeMealsField', 'lodgingField'];
  conditionalFields.forEach(function(id) {
    var el = document.getElementById(id);
    if (isInner) el.classList.add('hidden');
    else el.classList.remove('hidden');
  });

  var helpEl = document.getElementById('tripTypeHelp');
  if (isInner) {
    helpEl.textContent = '동일 시·군 권역 정산 (본원 기준: 서울 권역)';
  } else {
    helpEl.textContent = '타 시·군 관할 이동 정산';
  }

  if (isInner) {
    document.getElementById('lodgingPersonalNights').value = '0';
    document.getElementById('lodgingCorpNights').value = '0';
    document.getElementById('freeMeals').value = '0';
    document.getElementById('lodgingActual').value = '0';
    var hint = document.getElementById('lodgingActualHint');
    if (hint) hint.textContent = '';
  }
}

function calcLodgingSplit(data) {
  var lodgingCap = { '서울': 100000, '광역시': 80000, '기타': 70000 };
  var perNight = data.lodgingPerNight || 0;
  if (data.grade !== '1') perNight = Math.min(perNight, lodgingCap[data.region] || 70000);
  return {
    personal: perNight * (data.lodgingPersonalNights || 0),
    corp: perNight * (data.lodgingCorpNights || 0)
  };
}

function calcPreviewDeposit(r, data) {
  var personal = r.ilbi + r.meal;
  var corp = 0;
  var ls = calcLodgingSplit(data);
  personal += ls.personal;
  corp += ls.corp;
  personal += (data.transportFarePersonal || 0) + (data.transportFuelPersonal || 0) +
              (data.transportParkingPersonal || 0) + (data.transportHipassPersonal || 0);
  corp += (data.transportFareCorp || 0) + (data.transportFuelCorp || 0) +
          (data.transportParkingCorp || 0) + (data.transportHipassCorp || 0);
  return { personal: personal, corp: corp };
}

function onVehicleChange() {
  var v = document.getElementById('vehicle').value;
  var hint = document.getElementById('vehicleHint');
  var vDaysField = document.getElementById('vehicleDaysField');
  if (v === 'company') {
    hint.textContent = '공용 차량 운행일 일비 50% 감액 처리';
    vDaysField.classList.remove('hidden');
    var days = getCalcDays();
    var cur = parseInt(document.getElementById('vehicleDays').value) || 0;
    if (cur === 0 || cur > days) document.getElementById('vehicleDays').value = days;
  } else if (v === 'exclusive') {
    hint.textContent = '전용차 탑승일 기준 일비 미지급 처리';
    vDaysField.classList.remove('hidden');
    var days = getCalcDays();
    var cur = parseInt(document.getElementById('vehicleDays').value) || 0;
    if (cur === 0 || cur > days) document.getElementById('vehicleDays').value = days;
  } else {
    hint.textContent = '';
    vDaysField.classList.add('hidden');
  }
  updateVehicleDaysHint();
}

function updateVehicleDaysHint() {
  var v = document.getElementById('vehicle').value;
  if (v === 'public') return;
  var days = getCalcDays();
  var vd = Math.min(Math.max(0, parseInt(document.getElementById('vehicleDays').value) || 0), days);
  var pub = days - vd;
  var hintEl = document.getElementById('vehicleDaysHint');
  if (pub > 0 && vd > 0) {
    hintEl.textContent = '잔여 ' + pub + '일은 일반 대중교통 산출';
  } else if (pub === 0) {
    hintEl.textContent = '전체 일정 차량운행 적용';
  } else {
    hintEl.textContent = '';
  }
}

function updatePreview() {
  updateVehicleDaysHint();
  var data = getFormData();
  var warnRow = document.getElementById('lodgingNightsWarnRow');
  if (warnRow) {
    var lodgingVal = parseInt(document.getElementById('lodgingActual').value) || 0;
    var totalNights = (parseInt(document.getElementById('lodgingPersonalNights').value) || 0) +
                      (parseInt(document.getElementById('lodgingCorpNights').value) || 0);
    warnRow.style.display = (lodgingVal > 0 && totalNights === 0) ? 'block' : 'none';
  }
  var totalEl = document.getElementById('transportTotalDisplay');
  if (totalEl) totalEl.textContent = data.transport.toLocaleString('ko-KR') + '원';

  [
    { label: '운임', p: data.transportFarePersonal, c: data.transportFareCorp, hint: 'transportFareHint' },
    { label: '주유', p: data.transportFuelPersonal, c: data.transportFuelCorp, hint: 'transportFuelHint' },
    { label: '주차', p: data.transportParkingPersonal, c: data.transportParkingCorp, hint: 'transportParkingHint' },
    { label: '하이패스', p: data.transportHipassPersonal, c: data.transportHipassCorp, hint: 'transportHipassHint' }
  ].forEach(function(x) {
    var hintEl = document.getElementById(x.hint);
    if (!hintEl) return;
    var total = (x.p || 0) + (x.c || 0);
    hintEl.textContent = total > 0 ? '합계 ' + total.toLocaleString('ko-KR') + '원' : '';
  });

  var r = calcTrip(data);
  var isInner = r.isInner;
  
  var ls = calcLodgingSplit(data);
  var dep = calcPreviewDeposit(r, data);

  var html = '';
  
  // 1. 일비
  html += '<div class="cost-card-box">';
  html += '  <span class="cost-card-label">일비</span>';
  html += '  <input type="text" class="cost-card-value" readonly value="' + fmtN(r.ilbi) + '">';
  html += '  <span class="badge-personal">(개인)</span>';
  html += '</div>';

  // 2. 식비
  html += '<div class="cost-card-box">';
  html += '  <span class="cost-card-label">식비</span>';
  html += '  <input type="text" class="cost-card-value" readonly value="' + (isInner ? '-' : fmtN(r.meal)) + '">';
  if(!isInner) html += '  <span class="badge-personal">(개인)</span>';
  html += '</div>';

  // 3. 숙박비
  html += '<div class="cost-card-box">';
  html += '  <span class="cost-card-label">숙박비</span>';
  html += '  <input type="text" class="cost-card-value" readonly value="' + (isInner ? '-' : fmtN(r.lodging)) + '">';
  if(!isInner && r.lodging > 0) {
    var labelText = (ls.personal > 0 && ls.corp > 0) ? '개/법 혼합' : (ls.personal > 0 ? '(개인)' : '(법인)');
    html += '  <span class="' + (ls.personal > 0 ? 'badge-personal' : 'badge-corp') + '">' + labelText + '</span>';
  }
  html += '</div>';

  // 4. 교통비
  html += '<div class="cost-card-box">';
  html += '  <span class="cost-card-label">교통비</span>';
  html += '  <input type="text" class="cost-card-value" readonly value="' + fmtN(r.transport) + '">';
  if(r.transport > 0) {
    var tHasP = (data.transportFarePersonal || 0) + (data.transportFuelPersonal || 0) + (data.transportParkingPersonal || 0) + (data.transportHipassPersonal || 0) > 0;
    var tHasC = (data.transportFareCorp || 0) + (data.transportFuelCorp || 0) + (data.transportParkingCorp || 0) + (data.transportHipassCorp || 0) > 0;
    var tLabel = (tHasP && tHasC) ? '개/법 혼합' : (tHasP ? '(개인)' : '(법인)');
    html += '  <span class="' + (tHasP ? 'badge-personal' : 'badge-corp') + '">' + tLabel + '</span>';
  }
  html += '</div>';

  // 5. 총합계
  html += '<div class="cost-card-box highlight total-box">';
  html += '  <span class="cost-card-label" style="color:var(--primary-color);">여비합계</span>';
  html += '  <input type="text" class="cost-card-value" readonly value="' + fmtN(r.total) + '원" style="color:var(--primary-color);">';
  html += '</div>';

  document.getElementById('preview').innerHTML = html;
}

function getFormData() {
  var days = getCalcDays();
  var tFP  = Math.max(0, parseInt(document.getElementById('transportFarePersonal').value)    || 0);
  var tFC  = Math.max(0, parseInt(document.getElementById('transportFareCorp').value)        || 0);
  var tFuP = Math.max(0, parseInt(document.getElementById('transportFuelPersonal').value)    || 0);
  var tFuC = Math.max(0, parseInt(document.getElementById('transportFuelCorp').value)        || 0);
  var tPaP = Math.max(0, parseInt(document.getElementById('transportParkingPersonal').value) || 0);
  var tPaC = Math.max(0, parseInt(document.getElementById('transportParkingCorp').value)     || 0);
  var tHP  = Math.max(0, parseInt(document.getElementById('transportHipassPersonal').value)  || 0);
  var tHC  = Math.max(0, parseInt(document.getElementById('transportHipassCorp').value)      || 0);
  var lodgingPN = Math.max(0, parseInt(document.getElementById('lodgingPersonalNights').value) || 0);
  var lodgingCN = Math.max(0, parseInt(document.getElementById('lodgingCorpNights').value)     || 0);
  return {
    name: document.getElementById('name').value.trim(),
    jobTitle: document.getElementById('jobTitle').value.trim(),
    destination: document.getElementById('destination').value.trim(),
    dateStart: document.getElementById('dateStart').value,
    dateEnd: document.getElementById('dateEnd').value,
    period: formatPeriod(),
    purpose: document.getElementById('purpose').value.trim(),
    grade: document.getElementById('grade').value,
    gradeText: document.getElementById('grade').options[document.getElementById('grade').selectedIndex].text,
    tripType: document.getElementById('tripType').value,
    tripTypeText: document.getElementById('tripType').options[document.getElementById('tripType').selectedIndex].text,
    region: document.getElementById('region').value,
    regionText: document.getElementById('region').options[document.getElementById('region').selectedIndex].text,
    days: days,
    nights: lodgingPN + lodgingCN,
    lodgingPersonalNights: lodgingPN,
    lodgingCorpNights: lodgingCN,
    vehicle: document.getElementById('vehicle').value,
    vehicleText: document.getElementById('vehicle').options[document.getElementById('vehicle').selectedIndex].text,
    vehicleDays: Math.max(0, parseInt(document.getElementById('vehicleDays').value) || 0),
    freeMeals: Math.max(0, parseInt(document.getElementById('freeMeals').value) || 0),
    transportFarePersonal:    tFP,
    transportFareCorp:        tFC,
    transportFuelPersonal:    tFuP,
    transportFuelCorp:        tFuC,
    transportParkingPersonal: tPaP,
    transportParkingCorp:     tPaC,
    transportHipassPersonal:  tHP,
    transportHipassCorp:      tHC,
    transport: tFP + tFC + tFuP + tFuC + tPaP + tPaC + tHP + tHC,
    lodgingPerNight: Math.max(0, parseInt(document.getElementById('lodgingActual').value) || 0),
    attachment: document.getElementById('attachment').value.trim()
  };
}

function setFieldError(field) {
  field.classList.add('has-error');
  field.classList.add('shake');
  setTimeout(function() { field.classList.remove('shake'); }, 350);
  var input = field.querySelector('input, select');
  if (input) {
    input.addEventListener('input', function handler() {
      clearFieldError(field);
      input.removeEventListener('input', handler);
    }, { once: true });
  }
}
function clearFieldError(field) {
  if (field) field.classList.remove('has-error');
}

function addTrip() {
  var data = getFormData();
  var hasError = false;

  document.querySelectorAll('.form-field.has-error').forEach(function(f) {
    f.classList.remove('has-error');
  });

  if (!data.name) {
    setFieldError(document.getElementById('name').closest('.form-field'));
    hasError = true;
  }
  if (!data.destination) {
    setFieldError(document.getElementById('destination').closest('.form-field'));
    hasError = true;
  }
  if (!data.period) {
    setFieldError(document.getElementById('dateStart').closest('.form-field'));
    hasError = true;
  }
  if (hasError) return;

  var r = calcTrip(data);
  if (editingIdx >= 0) {
    trips[editingIdx] = { data: data, result: r };
    editingIdx = -1;
    document.getElementById('addTripBtn').innerHTML = '<i class="fa-solid fa-plus"></i> 명부 추가';
  } else {
    trips.push({ data: data, result: r });
  }
  renderAll();
  resetForm();
}

function editTrip(idx) {
  var d = trips[idx].data;
  document.getElementById('name').value = d.name || '';
  document.getElementById('jobTitle').value = d.jobTitle || '';
  document.getElementById('destination').value = d.destination || '';
  document.getElementById('dateStart').value = d.dateStart || '';
  document.getElementById('dateEnd').value = d.dateEnd || '';
  document.getElementById('purpose').value = d.purpose || '';
  document.getElementById('grade').value = d.grade;
  document.getElementById('tripType').value = d.tripType;
  onTripTypeChange();
  document.getElementById('region').value = d.region;
  document.getElementById('vehicle').value = d.vehicle;
  document.getElementById('vehicleDays').value = d.vehicleDays !== undefined ? d.vehicleDays : getCalcDays();
  onVehicleChange();
  document.getElementById('lodgingPersonalNights').value = d.lodgingPersonalNights || 0;
  document.getElementById('lodgingCorpNights').value = d.lodgingCorpNights || 0;
  document.getElementById('freeMeals').value = d.freeMeals;
  document.getElementById('lodgingActual').value = d.lodgingPerNight;
  document.getElementById('transportFarePersonal').value    = d.transportFarePersonal    || 0;
  document.getElementById('transportFareCorp').value        = d.transportFareCorp        || 0;
  document.getElementById('transportFuelPersonal').value    = d.transportFuelPersonal    || 0;
  document.getElementById('transportFuelCorp').value        = d.transportFuelCorp        || 0;
  document.getElementById('transportParkingPersonal').value = d.transportParkingPersonal || 0;
  document.getElementById('transportParkingCorp').value     = d.transportParkingCorp     || 0;
  document.getElementById('transportHipassPersonal').value  = d.transportHipassPersonal  || 0;
  document.getElementById('transportHipassCorp').value      = d.transportHipassCorp      || 0;
  document.getElementById('attachment').value = d.attachment || '';
  onDateChange();
  updatePreview();
  editingIdx = idx;
  document.getElementById('addTripBtn').innerHTML = '<i class="fa-solid fa-check"></i> 수정 완료';
  document.querySelector('.card').scrollIntoView({ behavior: 'smooth' });
}

function removeTrip(idx) {
  trips.splice(idx, 1);
  renderAll();
}

function moveTrip(idx, dir) {
  var target = idx + dir;
  if (target < 0 || target >= trips.length) return;
  var tmp = trips[idx];
  trips[idx] = trips[target];
  trips[target] = tmp;
  renderAll();
}

function clearAll() {
  if (confirm('모든 출장 정산 기록을 삭제하시겠습니까?')) {
    trips = [];
    renderAll();
  }
}

function resetForm() {
  document.getElementById('destination').value = '';
  document.getElementById('dateStart').value = '';
  document.getElementById('dateEnd').value = '';
  document.getElementById('dateInfo').textContent = '';
  document.getElementById('purpose').value = '';
  document.getElementById('lodgingPersonalNights').value = '0';
  document.getElementById('lodgingCorpNights').value = '0';
  document.getElementById('vehicle').value = 'public';
  document.getElementById('vehicleDays').value = '1';
  onVehicleChange();
  document.getElementById('freeMeals').value = '0';
  document.getElementById('transportFarePersonal').value    = '0';
  document.getElementById('transportFareCorp').value        = '0';
  document.getElementById('transportFuelPersonal').value    = '0';
  document.getElementById('transportFuelCorp').value        = '0';
  document.getElementById('transportParkingPersonal').value = '0';
  document.getElementById('transportParkingCorp').value     = '0';
  document.getElementById('transportHipassPersonal').value  = '0';
  document.getElementById('transportHipassCorp').value      = '0';
  var totalEl = document.getElementById('transportTotalDisplay');
  if (totalEl) totalEl.textContent = '0원';
  document.getElementById('lodgingActual').value = '0';
  document.getElementById('attachment').value = '';
  document.getElementById('tripType').value = '외';
  document.querySelectorAll('.comma-hint').forEach(function(h) { h.textContent = ''; });
  document.querySelectorAll('.form-field.has-error').forEach(function(f) { f.classList.remove('has-error'); });
  onTripTypeChange();
  updatePreview();
}

function renderAll() {
  var hasTrips = trips.length > 0;
  document.getElementById('listCard').style.display = hasTrips ? 'block' : 'none';
  document.getElementById('outputCard').style.display = hasTrips ? 'block' : 'none';
  var uniqueNames = trips.reduce(function(acc, t) { var n = t.data.name || ''; if (n && acc.indexOf(n) === -1) acc.push(n); return acc; }, []);
  document.getElementById('tripCount').textContent = uniqueNames.length || trips.length;

  var listHtml = '';
  trips.forEach(function(t, i) {
    var tagClass = t.result.isInner ? 'tag inner' : 'tag';
    var tagText = t.result.isInner ? '근무지 내' : '근무지 외';
    listHtml += '<div class="trip-item">';
    listHtml += '  <div class="move-btns no-print">';
    listHtml += '    <button class="btn-move" onclick="moveTrip(' + i + ',-1)" ' + (i === 0 ? 'disabled' : '') + ' title="위로">▲</button>';
    listHtml += '    <button class="btn-move" onclick="moveTrip(' + i + ',1)" ' + (i === trips.length - 1 ? 'disabled' : '') + ' title="아래로">▼</button>';
    listHtml += '  </div>';
    var nameDisplay = t.data.name + (t.data.jobTitle ? ' ' + t.data.jobTitle : '');
    listHtml += '  <div class="info"><strong>' + nameDisplay + '</strong> <span class="' + tagClass + '">' + tagText + '</span> | ' + t.data.destination + ' | ' + t.data.period + '</div>';
    listHtml += '  <span class="amount">' + fmt(t.result.total) + '</span>';
    listHtml += '  <button class="btn btn-ghost no-print" onclick="editTrip(' + i + ')">수정</button>';
    listHtml += '  <button class="btn btn-danger no-print" onclick="removeTrip(' + i + ')">삭제</button>';
    listHtml += '</div>';
  });
  document.getElementById('tripList').innerHTML = listHtml;

  var sumPersonalDeposit = 0;
  var sumCorpDeposit = 0;
  var tbody = '';
  var regulations = {};

  trips.forEach(function(t, i) {
    var d = t.data;
    var r = t.result;

    var dep = calcPreviewDeposit(r, d);
    var personalDeposit = dep.personal;
    var corpDeposit = dep.corp;
    sumPersonalDeposit += personalDeposit;
    sumCorpDeposit += corpDeposit;

    var ilbiStr = '-';
    if (r.ilbi > 0) {
      if (r.pubDays > 0 && r.vDays > 0) {
        ilbiStr = nb(fmt(r.ilbiPerDay)) + '/일×' + r.pubDays + '일';
        ilbiStr += '<br>+' + nb(fmt(r.ilbiVehiclePerDay)) + '/일×' + r.vDays + '일';
        ilbiStr += '<br>=' + nb(fmt(r.ilbi));
      } else {
        ilbiStr = nb(fmt(r.vDays > 0 ? r.ilbiVehiclePerDay : r.ilbiPerDay)) + '/일×' + d.days + '일';
        if (d.days > 1) ilbiStr += '<br>=' + nb(fmt(r.ilbi));
      }
      ilbiStr += '<br><span class="badge-personal">(개인)</span>';
    }

    var mealStr = '-';
    if (!r.isInner) {
      if (d.freeMeals > 0 && r.meal > 0) {
        mealStr = '25,000원/일x' + d.days + '일';
        mealStr += '<br>-' + nb(fmt(r.mealDeduct));
        mealStr += '<br>(' + d.freeMeals + '식 공제)';
        mealStr += '<br>=' + nb(fmt(r.meal));
        mealStr += '<br><span class="badge-personal">(개인)</span>';
      } else if (d.freeMeals > 0 && r.meal === 0) {
        mealStr = '-';
      } else if (r.meal > 0) {
        mealStr = '25,000원/일x' + d.days + '일';
        mealStr += '<br>=' + nb(fmt(r.meal));
        mealStr += '<br><span class="badge-personal">(개인)</span>';
      }
    }

    var lodgingStr = '-';
    if (r.lodging > 0) {
      var ls = calcLodgingSplit(d);
      if (ls.personal > 0 && ls.corp > 0) {
        lodgingStr = '개인: ' + nb(fmt(ls.personal)) + ' <span class="badge-personal">(개인)</span><br>';
        lodgingStr += '법인: ' + nb(fmt(ls.corp)) + ' <span class="badge-corp">(법인)</span><br>';
        lodgingStr += '<b>계: ' + nb(fmt(r.lodging)) + '</b>';
      } else {
        lodgingStr = nb(fmt(r.lodging)) + '<br>' + (ls.personal > 0
          ? '<span class="badge-personal">(개인)</span>'
          : '<span class="badge-corp">(법인)</span>');
      }
    }

    var tItemsRender = [
      { label: '운임',     p: d.transportFarePersonal    || 0, c: d.transportFareCorp    || 0 },
      { label: '주유',     p: d.transportFuelPersonal    || 0, c: d.transportFuelCorp    || 0 },
      { label: '주차',     p: d.transportParkingPersonal || 0, c: d.transportParkingCorp || 0 },
      { label: '하이패스', p: d.transportHipassPersonal  || 0, c: d.transportHipassCorp  || 0 }
    ].filter(function(x) { return (x.p + x.c) > 0; });

    var transportStr = '-';
    if (tItemsRender.length > 0) {
      var tLineStrs = tItemsRender.map(function(x) {
        var total = x.p + x.c;
        if (x.p > 0 && x.c > 0) {
          return x.label + ':<br><span class="badge-personal">(개인)</span> ' + nb(fmt(x.p)) +
                 '<br><span class="badge-corp">(법인)</span> ' + nb(fmt(x.c));
        } else {
          var badge = x.p > 0 ? '<span class="badge-personal">(개인)</span>' : '<span class="badge-corp">(법인)</span>';
          return x.label + ':<br>' + nb(fmt(total)) + ' ' + badge;
        }
      });
      if (tItemsRender.length === 1) {
        transportStr = tLineStrs[0];
      } else {
        transportStr = tLineStrs.join('<br>') + '<br><b>합계: ' + nb(fmt(r.transport)) + '</b>';
      }
    }

    var nameStr = d.name;
    if (d.jobTitle) nameStr += '<br>' + d.jobTitle;
    if (d.attachment) nameStr += '<br><span style="font-size:11px;color:var(--text-muted);display:inline-block;margin-top:3px;">' + d.attachment + '</span>';

    tbody += '<tr>';
    tbody += '  <td class="center">' + nameStr + '</td>';
    tbody += '  <td class="left">' + d.destination + '</td>';
    tbody += '  <td class="center">' + d.period + '</td>';
    tbody += '  <td class="left">' + d.purpose + '</td>';
    tbody += '  <td class="right">' + ilbiStr + '</td>';
    tbody += '  <td class="right">' + mealStr + '</td>';
    tbody += '  <td class="right">' + lodgingStr + '</td>';
    tbody += '  <td class="right">' + transportStr + '</td>';
    tbody += '  <td class="right" style="font-weight:600;">' + (personalDeposit > 0 ? nb(fmtN(personalDeposit)) : '-') + '</td>';
    tbody += '  <td class="right" style="font-weight:600;">' + (corpDeposit > 0 ? nb(fmtN(corpDeposit)) : '-') + '</td>';
    tbody += '  <td class="right" style="font-weight:700;">' + nb(fmtN(r.total)) + '</td>';
    tbody += '</tr>';

    collectRegulations(d, r, regulations);
  });

  var allIlbi = 0, allMeal = 0, allLodging = 0, allTransport = 0;
  trips.forEach(function(t) {
    allIlbi += t.result.ilbi;
    allMeal += t.result.meal;
    allLodging += t.result.lodging;
    allTransport += t.result.transport;
  });

  tbody += '<tr class="total-row">';
  tbody += '  <td colspan="4" class="center" style="font-weight:700;">총 금액(원)</td>';
  tbody += '  <td class="right">' + nb(fmtN(allIlbi)) + '</td>';
  tbody += '  <td class="right">' + nb(fmtN(allMeal)) + '</td>';
  tbody += '  <td class="right">' + nb(fmtN(allLodging)) + '</td>';
  tbody += '  <td class="right">' + nb(fmtN(allTransport)) + '</td>';
  tbody += '  <td class="right highlight">' + (sumPersonalDeposit > 0 ? nb(fmtN(sumPersonalDeposit)) : '-') + '</td>';
  tbody += '  <td class="right highlight">' + (sumCorpDeposit > 0 ? nb(fmtN(sumCorpDeposit)) : '-') + '</td>';
  tbody += '  <td class="right highlight">' + nb(fmtN(sumPersonalDeposit + sumCorpDeposit)) + '</td>';
  tbody += '</tr>';

  document.getElementById('tableBody').innerHTML = tbody;
  renderRegulations(regulations);
}

function addReg(regs, rule, name) {
  if (!regs[rule]) regs[rule] = [];
  if (regs[rule].indexOf(name) === -1) regs[rule].push(name);
}

function collectRegulations(d, r, regs) {
  var lodgingCap = { '서울': 100000, '광역시': 80000, '기타': 70000 };
  var isInner = r.isInner;
  var n = d.name;

  addReg(regs, d.gradeText + ' 기준 적용', n);
  addReg(regs, d.tripTypeText + ' 출장 기준 적용', n);

  if (isInner) {
    addReg(regs, '근무지 내 출장: 식비·숙박비 미지급 (일비만 정산)', n);
    if (d.tripType === '내4') addReg(regs, '근무지 내 4시간 이상: 일비 20,000원 적용', n);
    else addReg(regs, '근무지 내 4시간 미만: 일비 10,000원 적용', n);
  } else {
    addReg(regs, '근무지 외 출장: 일비 25,000원, 식비 25,000원 적용', n);

    if (d.nights > 0 && d.grade === '2') {
      var cap = lodgingCap[d.region];
      addReg(regs, d.regionText + ' 숙박비 상한 ' + fmt(cap) + ' 적용 (제2호 기준)', n);
    }
    if (d.nights > 0 && d.grade === '1') {
      addReg(regs, d.regionText + ' 숙박비 실비 정산 (제1호 임원 기준)', n);
    }

    if (d.freeMeals > 0) {
      addReg(regs, '무료 식사 ' + d.freeMeals + '식 공제: 1식당 ' + fmt(Math.floor(25000/3)) + ' 차감', n);
      if (!regs['식비 차감 후 10원 미만 절사 처리']) regs['식비 차감 후 10원 미만 절사 처리'] = [];
    }
  }

  if (d.vehicle === 'company') {
    var vd = r.vDays, pd = r.pubDays;
    var label = '공용차량/자가용 운행 ' + vd + '일: 해당 일비 50% 감액';
    if (pd > 0) label += ' (나머지 ' + pd + '일은 일반 대중교통 기준)';
    addReg(regs, label, n);
  } else if (d.vehicle === 'exclusive') {
    var vd2 = r.vDays, pd2 = r.pubDays;
    var label2 = '전용차량 탑승 ' + vd2 + '일: 해당 일비 미지급';
    if (pd2 > 0) label2 += ' (나머지 ' + pd2 + '일은 대중교통 기준)';
    addReg(regs, label2, n);
  }
}

function renderRegulations(regs) {
  var el = document.getElementById('regulationNote');
  var calcEl = document.getElementById('calcNote');

  var TRUNCATION_KEY = '식비 차감 후 10원 미만 절사 처리';
  var hasTruncation = TRUNCATION_KEY in regs;
  var filteredRegs = {};
  Object.keys(regs).forEach(function(k) { if (k !== TRUNCATION_KEY) filteredRegs[k] = regs[k]; });

  var keys = Object.keys(filteredRegs).sort(function(a, b) { return a.length - b.length; });
  if (keys.length === 0) { el.style.display = 'none'; } else {
    el.style.display = 'block';
    var html = '<strong>여비 규정 적용 근거 기준 (여비규정 [시행 2025.12.18.] 기준)</strong><ul>';
    keys.forEach(function(rule) {
      var names = filteredRegs[rule];
      html += '<li>' + rule;
      if (names.length > 0) html += ' <span style="color:var(--text-muted);">— ' + names.join(', ') + '</span>';
      html += '</li>';
    });
    html += '</ul>';
    el.innerHTML = html;
  }

  if (hasTruncation) {
    calcEl.style.display = 'block';
    calcEl.textContent = '※ 원 단위 식비 정산 절차 시 규정에 의거 10원 미만의 우수리는 절삭하여 산정합니다.';
  } else {
    calcEl.style.display = 'none';
  }
}

function loadSampleData() {
  trips = [];

  trips.push({
    data: { name:'홍길동', jobTitle:'사원', destination:'강남역 회의실(스파크플러스)', period:"'26.2.15.(토)",
            purpose:'TEMM 청년대표단 1차 워크숍', grade:'2', gradeText:'제2호 (일반 직원 전체)',
            tripType:'내4', tripTypeText:'근무지 내 (4시간 이상)', region:'서울', regionText:'서울특별시',
            days:1, nights:0, lodgingPersonalNights:0, lodgingCorpNights:0, vehicle:'public', vehicleText:'대중교통',
            freeMeals:0, transportFarePersonal:0, transportFareCorp:0, transportFuelPersonal:0, transportFuelCorp:0,
            transportParkingPersonal:0, transportParkingCorp:0, transportHipassPersonal:0, transportHipassCorp:0,
            transport:0, lodgingPerNight:0, attachment:'붙임1' },
    result: calcTrip({ tripType:'내4', grade:'2', region:'서울', days:1, nights:0, vehicle:'public', freeMeals:0, transport:0, lodgingPerNight:0 })
  });

  trips.push({
    data: { name:'홍길동', jobTitle:'사원', destination:'인천광역시 일원', period:"'26.3.4.~3.7.(4일)",
            purpose:'한중일 교사교류 프로그램(TTEP) 참석', grade:'2', gradeText:'제2호 (일반 직원 전체)',
            tripType:'외', tripTypeText:'근무지 외', region:'광역시', regionText:'인천광역시',
            days:4, nights:0, lodgingPersonalNights:0, lodgingCorpNights:0, vehicle:'public', vehicleText:'대중교통',
            freeMeals:2, transportFarePersonal:0, transportFareCorp:0, transportFuelPersonal:0, transportFuelCorp:0,
            transportParkingPersonal:0, transportParkingCorp:0, transportHipassPersonal:0, transportHipassCorp:0,
            transport:0, lodgingPerNight:0, attachment:'붙임2' },
    result: calcTrip({ tripType:'외', grade:'2', region:'광역시', days:4, nights:0, vehicle:'public', freeMeals:2, transport:0, lodgingPerNight:0 })
  });

  trips.push({
    data: { name:'홍길동', jobTitle:'사원', destination:'대전시 유성구 일대', period:"'26.4.13.(토)",
            purpose:'TEMM 청년대표단 4차 워크숍 운행 및 열차 혼합결제', grade:'2', gradeText:'제2호 (일반 직원 전체)',
            tripType:'외', tripTypeText:'근무지 외', region:'기타', regionText:'대전광역시',
            days:1, nights:0, lodgingPersonalNights:0, lodgingCorpNights:0, vehicle:'public', vehicleText:'대중교통',
            freeMeals:0, transportFarePersonal:11700, transportFareCorp:11700, transportFuelPersonal:0, transportFuelCorp:0,
            transportParkingPersonal:0, transportParkingCorp:0, transportHipassPersonal:0, transportHipassCorp:0,
            transport:23400, lodgingPerNight:0, attachment:'붙임6-1, 붙임6-2' },
    result: calcTrip({ tripType:'외', grade:'2', region:'기타', days:1, nights:0, vehicle:'public', freeMeals:0, transport:23400, lodgingPerNight:0 })
  });

  trips.push({
    data: { name:'홍길동', jobTitle:'사원', destination:'경기도 수원시 일대', period:"'26.5.20.~5.21.(2일)",
            purpose:'환경교육 연장 현장 점검 출장', grade:'2', gradeText:'제2호 (일반 직원 전체)',
            tripType:'외', tripTypeText:'근무지 외', region:'기타', regionText:'경기도',
            days:2, nights:1, lodgingPersonalNights:0, lodgingCorpNights:1, vehicle:'public', vehicleText:'대중교통',
            freeMeals:0, transportFarePersonal:0, transportFareCorp:15000, transportFuelPersonal:0, transportFuelCorp:0,
            transportParkingPersonal:0, transportParkingCorp:0, transportHipassPersonal:0, transportHipassCorp:0,
            transport:15000, lodgingPerNight:65000, attachment:'붙임7' },
    result: calcTrip({ tripType:'외', grade:'2', region:'기타', days:2, nights:1, vehicle:'public', freeMeals:0, transport:15000, lodgingPerNight:65000 })
  });

  renderAll();
}

function exportToExcel() {
  if (trips.length === 0) { alert('정산 산출 기록이 존재하지 않습니다.'); return; }

  var fmtX = function(n) { return n > 0 ? n.toLocaleString('ko-KR') + '원' : '-'; };
  var nl = function(s) { return s.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, ''); };

  var rows = [['출장자', '붙임', '출장지', '출장 기간', '출장 용무', '일비', '식비',
    '숙박비(개인)', '숙박비(법인)', '숙박비합계',
    '운임(개인)', '운임(법인)', '주유(개인)', '주유(법인)', '주차(개인)', '주차(법인)', '하이패스(개인)', '하이패스(법인)', '교통비합계',
    '개인예금', '법인예금', '여비총액']];

  var sumIlbi=0, sumMeal=0, sumLodging=0, sumTransport=0, sumPersonal=0, sumCorp=0;

  trips.forEach(function(t) {
    var d = t.data; var r = t.result;
    var dep = calcPreviewDeposit(r, d);
    var ls = calcLodgingSplit(d);
    sumIlbi+=r.ilbi; sumMeal+=r.meal; sumLodging+=r.lodging;
    sumTransport+=r.transport; sumPersonal+=dep.personal; sumCorp+=dep.corp;
    rows.push([
      d.name, d.attachment || '', d.destination, d.period, d.purpose,
      r.ilbi > 0 ? r.ilbi : 0, r.meal > 0 ? r.meal : 0,
      ls.personal || 0, ls.corp || 0, r.lodging > 0 ? r.lodging : 0,
      d.transportFarePersonal    || 0, d.transportFareCorp    || 0,
      d.transportFuelPersonal    || 0, d.transportFuelCorp    || 0,
      d.transportParkingPersonal || 0, d.transportParkingCorp || 0,
      d.transportHipassPersonal  || 0, d.transportHipassCorp  || 0,
      r.transport, dep.personal, dep.corp, r.total
    ]);
  });
  rows.push(['합계', '', '', '', '', sumIlbi, sumMeal, '', '', sumLodging, '', '', '', '', '', '', '', '', sumTransport, sumPersonal, sumCorp, sumIlbi+sumMeal+sumLodging+sumTransport]);

  var numCols = [5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21];
  var style = '<style>body{font-family:"맑은 고딕",sans-serif;font-size:10pt;}' +
    'table{border-collapse:collapse;width:100%;}' +
    'th,td{border:1px solid #000;padding:4px 6px;vertical-align:middle;}' +
    'th{background:#d9d9d9;font-weight:bold;text-align:center;}' +
    '.num{text-align:right;} .ctr{text-align:center;}' +
    '.personal{color:#0055cc;} .total-row{font-weight:bold;background:#f2f2f2;}</style>';

  var thead = '<tr>';
  rows[0].forEach(function(h) { thead += '<th>' + h + '</th>'; });
  thead += '</tr>';

  var tbody2 = '';
  for (var i = 1; i < rows.length; i++) {
    var row = rows[i];
    var isTotal = (i === rows.length - 1);
    tbody2 += '<tr' + (isTotal ? ' class="total-row"' : '') + '>';
    row.forEach(function(cell, ci) {
      var isNum = numCols.indexOf(ci) > -1;
      var cls = isNum ? ' class="num"' : ' class="ctr"';
      var val = (isNum && typeof cell === 'number') ? (cell > 0 ? cell.toLocaleString('ko-KR') : '-') : (cell || '-');
      tbody2 += '<td' + cls + '>' + val + '</td>';
    });
    tbody2 += '</tr>';
  }

  var today = new Date();
  var dateStr = today.getFullYear() + ('0'+(today.getMonth()+1)).slice(-2) + ('0'+today.getDate()).slice(-2);

  var html = '<!DOCTYPE html><html xmlns:o="urn:schemas-microsoft-com:office:office" ' +
    'xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">' +
    '<head><meta charset="utf-8">' +
    '<!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>' +
    '<x:Name>출장여비</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>' +
    '</x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->' +
    style + '</head><body>' +
    '<table><thead>' + thead + '</thead><tbody>' + tbody2 + '</tbody></table>' +
    '</body></html>';

  var blob = new Blob(['\ufeff' + html], { type: 'application/vnd.ms-excel;charset=utf-8' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = '출장여비명세_' + dateStr + '.xls';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// 최초 기본 초기화 실행 코드
onTripTypeChange();
updatePreview();
