const KECI_LOGO_B64 = 'data:image/png;base64,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';

/**
 * script.js - 한국환경보전원 출장 여비 계산기 핵심 브라우저 스크립트
 */

document.addEventListener('DOMContentLoaded', function() {
    // 오늘 날짜를 기본값으로 설정
    const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD 형식
    const dateStartEl = document.getElementById('dateStart');
    const dateEndEl = document.getElementById('dateEnd');
    if (dateStartEl && !dateStartEl.value) dateStartEl.value = today;
    if (dateEndEl && !dateEndEl.value) dateEndEl.value = today;

    // 페이지 로드 시점의 기본 선택 값에 맞추어 UI를 즉시 동기화합니다.
    onDateChange();
    onVehicleChange();
    onTripTypeChange();
});

/**
 * 날짜 변경 처리 핵심 로직 및 유효성 검사 추가 반영
 */
function onDateChange() {
    const startEl = document.getElementById('dateStart');
    const endEl = document.getElementById('dateEnd');
    
    // 역방향 날짜 선택 유효성 방어 로직
    if (startEl && endEl && startEl.value && endEl.value) {
        if (new Date(endEl.value) < new Date(startEl.value)) {
            alert("종료일은 시작일보다 빠를 수 없습니다. 올바른 일정을 선택해 주십시오.");
            endEl.value = startEl.value;
        }
    }
    
    const lpNights = document.getElementById('lodgingPersonalNights');
    const lpAmount = document.getElementById('lodgingPersonalAmount');
    const lcNights = document.getElementById('lodgingCorpNights');
    const lcAmount = document.getElementById('lodgingCorpAmount');

    if (!startEl || !endEl) return;

    // 출장 박수 계산
    let maxNights = 0;
    if (startEl.value && endEl.value) {
        const start = new Date(startEl.value);
        const end = new Date(endEl.value);
        if (!isNaN(start) && !isNaN(end)) {
            maxNights = Math.max(0, Math.round((end - start) / (1000 * 60 * 60 * 24)));
        }
    }

    // 당일 출장인 경우 숙박비 입력 초기화
    if (maxNights === 0) {
        const hasValue = (lpAmount && parseInt(lpAmount.value || 0, 10) > 0) || 
                        (lcAmount && parseInt(lcAmount.value || 0, 10) > 0) ||
                        (lpNights && parseInt(lpNights.value || 0, 10) > 0) || 
                        (lcNights && parseInt(lcNights.value || 0, 10) > 0);
        if (hasValue) {
            alert("[1박 미만의 당일 출장의 경우 숙박비는 입력할 수 없습니다.]");
        }
        if (lpNights) lpNights.value = '';
        if (lpAmount) lpAmount.value = '';
        if (lcNights) lcNights.value = '';
        if (lcAmount) lcAmount.value = '';
        updatePreview();
        return;
    }

    // ── 박수 상한 적용 ──────────────────────────────────────────
    // 개인 + 법인 합산이 maxNights를 초과하지 않도록 제한
    let pNights = parseInt(lpNights ? lpNights.value || 0 : 0, 10);
    let cNights = parseInt(lcNights ? lcNights.value || 0 : 0, 10);

    // 개별 입력값이 maxNights를 초과하면 잘라냄
    if (pNights > maxNights) { pNights = maxNights; if (lpNights) lpNights.value = pNights; }
    if (cNights > maxNights) { cNights = maxNights; if (lcNights) lcNights.value = cNights; }

    // 합산이 maxNights를 초과하면 나중에 입력한 쪽(법인)을 줄임
    if (pNights + cNights > maxNights) {
        cNights = maxNights - pNights;
        if (lcNights) lcNights.value = cNights;
    }

    // max 속성 동적 업데이트 (UX 보조)
    if (lpNights) lpNights.max = maxNights;
    if (lcNights) lcNights.max = maxNights;

    // ── 제2호 금액 상한 적용 ────────────────────────────────────
    const grade = document.getElementById('grade') ? document.getElementById('grade').value : '';
    const region = document.getElementById('region') ? document.getElementById('region').value : '';

    if (grade === '2' && region) {
        // 지역별 1박 상한액
        const regionCapMap = { '특별시': 100000, '광역시': 80000, '기타': 70000, '도': 70000, '특별자치도': 70000 };
        const capPerNight = regionCapMap[region] || 70000;

        // 개인/법인 각각의 상한 = 해당 박수 × 1박 상한액
        const pCap = pNights * capPerNight;
        const cCap = cNights * capPerNight;

        let pAmt = parseInt(lpAmount ? lpAmount.value.replace(/[^0-9]/g, '') || 0 : 0, 10);
        let cAmt = parseInt(lcAmount ? lcAmount.value.replace(/[^0-9]/g, '') || 0 : 0, 10);

        if (pAmt > pCap) {
            pAmt = pCap;
            if (lpAmount) lpAmount.value = pAmt;
            alert(`제2호 기준: 개인 숙박비는 ${pNights}박 × ${capPerNight.toLocaleString()}원 = 최대 ${pCap.toLocaleString()}원까지 입력 가능합니다.`);
        }
        if (cAmt > cCap) {
            cAmt = cCap;
            if (lcAmount) lcAmount.value = cAmt;
            alert(`제2호 기준: 법인 숙박비는 ${cNights}박 × ${capPerNight.toLocaleString()}원 = 최대 ${cCap.toLocaleString()}원까지 입력 가능합니다.`);
        }
    }

    updatePreview();
}

/**
 * 대시보드 상단 카드 및 숙박비 가이드 문구를 실시간으로 업데이트하는 함수
 */
function updatePreview() {
    const startVal = document.getElementById('dateStart').value;
    const endVal = document.getElementById('dateEnd').value;

    if (startVal && endVal) {
        const start = new Date(startVal);
        const end = new Date(endVal);
        if (!isNaN(start) && !isNaN(end)) {
            const diffDays = Math.round((end - start) / (1000 * 60 * 60 * 24));
            const nights = diffDays;
            const days = diffDays + 1;
            const periodText = nights === 0
                ? `당일 (1일)`
                : `${nights}박 ${days}일`;
            const previewEl = document.getElementById('periodPreview');
            if (previewEl) previewEl.innerText = periodText;
        }
    } else {
        const previewEl = document.getElementById('periodPreview');
        if (previewEl) previewEl.innerText = '';
    }
    
    const getVal = (id) => { const el = document.getElementById(id); return el ? el.value.trim() : ''; };
    const getNum = (id) => { const el = document.getElementById(id); return el ? parseInt(el.value.replace(/,/g, '') || 0, 10) : 0; };
    
    const previewContainer = document.getElementById('costDashboardContainer');
    if (!previewContainer) return;

    // 1. 출장 일수(Days) 계산
    let tripDays = 1;
    if (startVal && endVal) {
        const start = new Date(startVal);
        const end = new Date(endVal);
        if (!isNaN(start) && !isNaN(end)) {
            const diffTime = end - start;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            tripDays = diffDays >= 0 ? diffDays + 1 : 1;
        }
    }

    // 2. 일비 & 식비 계산 규정 적용
    const tripType = getVal('tripType'); 
    const vehicle = getVal('vehicle');   
    const freeMeals = getNum('freeMeals');

    let baseDaily = 25000; 
    let baseMeal = 25000;  

    if (tripType === '내' || tripType === '내4') {
        baseDaily = 20000; 
        baseMeal = 0;      
        if(tripType === '내') baseDaily = 10000; // 4시간 미만 감액 예시 규칙 적용 커스텀
    }

    // 자가용('personal') 또는 업무용 차량 이용 시 일비 50% 감액
    if (vehicle === 'company' || vehicle === 'personal' || vehicle === 'exclusive') {
        baseDaily = baseDaily / 2;
    }

    const dailyExpense = baseDaily * tripDays;

    // 식비 계산: 규정 "해당일 식비 × (식사 제공 공제회수 / 3)을 감액, 감액 후 원(10원) 단위 절사"
    // 예) 식비 25,000원 기준
    //   - 1회 제공: 25,000 × 1/3 = 8,333 감액 → 25,000 - 8,333 = 16,667 → 원단위 절사 16,660원
    //   - 2회 제공: 25,000 × 2/3 = 16,666 감액 → 25,000 - 16,666 = 8,334 → 원단위 절사 8,330원
    // 근무지 내 출장은 식비 자체가 0원이므로 공제 없음
    const mealDeduction = (baseMeal > 0) ? Math.floor((baseMeal * freeMeals) / 3) : 0;
    let mealExpense = Math.floor(((baseMeal * tripDays) - mealDeduction) / 10) * 10;
    if (mealExpense < 0) mealExpense = 0;


    // 3. 숙박비 계산
    const lodgingPersonal = getNum('lodgingPersonalAmount');
    const lodgingCorp = getNum('lodgingCorpAmount');
    const lodgingExpense = lodgingPersonal + lodgingCorp;

    const previewTextEl = document.getElementById('lodgingPreviewText');
    if (previewTextEl) {
        // 박수 및 제2호 상한 안내 문구
        const startVal2 = document.getElementById('dateStart').value;
        const endVal2 = document.getElementById('dateEnd').value;
        let maxNights2 = 0;
        if (startVal2 && endVal2) {
            const s = new Date(startVal2), e = new Date(endVal2);
            if (!isNaN(s) && !isNaN(e)) maxNights2 = Math.max(0, Math.round((e - s) / (1000 * 60 * 60 * 24)));
        }
        const gradeVal = document.getElementById('grade') ? document.getElementById('grade').value : '';
        const regionVal = document.getElementById('region') ? document.getElementById('region').value : '';
        const regionCapMap = { '특별시': 100000, '광역시': 80000, '기타': 70000, '도': 70000, '특별자치도': 70000 };

        let guideText = '';
        if (maxNights2 > 0) {
            guideText = `최대 ${maxNights2}박 입력 가능`;
            if (gradeVal === '2' && regionVal && regionCapMap[regionVal]) {
                const cap = regionCapMap[regionVal];
                const totalCap = cap * maxNights2;
                guideText += ` | 제2호 상한: 1박 ${cap.toLocaleString()}원 × ${maxNights2}박 = 총 ${totalCap.toLocaleString()}원`;
            }
        }

        if (lodgingExpense > 0) {
            previewTextEl.innerHTML = `[입력값: ${lodgingExpense.toLocaleString()} 원]${guideText ? `<br><span style="color:#64748b; font-size:12px;">${guideText}</span>` : ''}`;
        } else {
            previewTextEl.innerHTML = guideText ? `<span style="color:#64748b; font-size:12px;">${guideText}</span>` : '';
        }
    }

    // 4. 교통비 계산
    const transportExpense = 
        getNum('transportFarePersonal') + getNum('transportFuelPersonal') + 
        getNum('transportParkingPersonal') + getNum('transportHipassPersonal') +
        getNum('transportFareCorp') + getNum('transportFuelCorp') + 
        getNum('transportParkingCorp') + getNum('transportHipassCorp');

    // 누적 합계 디스플레이 업데이트
    const transDisplay = document.getElementById('transportTotalDisplay');
    if(transDisplay) transDisplay.innerText = `${transportExpense.toLocaleString()}원`;

    // 5. 총 여비 합계
    const totalExpense = dailyExpense + mealExpense + lodgingExpense + transportExpense;

    // 6. 대시보드 카드 동적 렌더링
    previewContainer.innerHTML = `
        <div class="cost-card-box" style="padding: 14px 10px; display: flex; flex-direction: column; justify-content: space-between; min-height: 85px;">
            <span class="cost-card-label">일비</span>
            <div class="cost-card-value" style="font-size: 18px; font-weight: 700; margin: auto 0;">${dailyExpense.toLocaleString()}</div>
            <div style="height: 18px;"></div>
        </div>
        <div class="cost-card-box" style="padding: 14px 10px; display: flex; flex-direction: column; justify-content: space-between; min-height: 85px;">
            <span class="cost-card-label">식비</span>
            <div class="cost-card-value" style="font-size: 18px; font-weight: 700; margin: auto 0;">${mealExpense.toLocaleString()}</div>
            <div style="height: 18px;"></div>
        </div>
        <div class="cost-card-box" style="padding: 14px 10px; display: flex; flex-direction: column; justify-content: space-between; min-height: 85px;">
            <span class="cost-card-label">숙박비</span>
            <div class="cost-card-value" style="font-size: 18px; font-weight: 700; margin: auto 0;">${lodgingExpense.toLocaleString()}</div>
            <div style="height: 18px;"></div>
        </div>
        <div class="cost-card-box" style="padding: 14px 10px; display: flex; flex-direction: column; justify-content: space-between; min-height: 85px;">
            <span class="cost-card-label">교통비</span>
            <div class="cost-card-value" style="font-size: 18px; font-weight: 700; margin: auto 0;">${transportExpense.toLocaleString()}</div>
            <div style="height: 18px;"></div>
        </div>
        <div class="cost-card-box total-box" style="padding: 14px 10px; background-color: #e2f0fd; border-color: #b3d7fc; display: flex; flex-direction: column; justify-content: space-between; min-height: 85px;">
            <span class="cost-card-label" style="color: #005691;">여비합계</span>
            <div class="cost-card-value" style="font-size: 18px; font-weight: 700; color: #005691; margin: auto 0;">${totalExpense.toLocaleString()}원</div>
            <div style="height: 18px;"></div>
        </div>
    `;
}

/**
 * 출장 권역 변경 시 필드 제어 및 데이터 갱신
 */
function onTripTypeChange() {
    const tripTypeEl = document.getElementById('tripType'); 
    const regionField = document.getElementById('regionField');

    if (!tripTypeEl || !regionField) return;

    if (tripTypeEl.value === '외') {
        // [수정 3] display:flex로 변경하여 form-grid 내 다른 요소들과 줄맞춤 일치
        regionField.style.display = 'flex'; 
    } else {
        regionField.style.display = 'none';  
        
        const regionSelect = document.getElementById('region');
        if (regionSelect) {
            regionSelect.value = ''; // HTML의 빈 option과 연동되어 정상 초기화 됨
        }
    }

    if (typeof updatePreview === 'function') {
        updatePreview();
    }
}

/**
 * 차량 종류 변경 이벤트 핸들러
 */
function onVehicleChange() {
    const vehicleEl = document.getElementById('vehicle');
    if (!vehicleEl) return;

    const carFields = [
        'transportFuelPersonal', 'transportFuelCorp',
        'transportParkingPersonal', 'transportParkingCorp',
        'transportHipassPersonal', 'transportHipassCorp'
    ];

    if (vehicleEl.value === 'public') { 
        carFields.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.value = '';      
                el.disabled = true;  
            }
        });
    } else { 
        carFields.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.disabled = false; 
        });
    }

    updatePreview();
}

/**
 * 명부 데이터 추가 함수
 */
function addRoster() {
    const getVal = (id) => { const el = document.getElementById(id); return el ? el.value.trim() : ''; };
    const getNum = (id) => { const el = document.getElementById(id); return el ? parseInt(el.value.replace(/,/g, '') || 0, 10) : 0; };
    const parseKrw = (str) => parseInt(str.replace(/[^0-9]/g, '') || 0, 10);

    const name = getVal('name');
    const destination = getVal('destination');
    const dateStart = getVal('dateStart');
    const dateEnd = getVal('dateEnd');
    
    if (!name || !destination || !dateStart || !dateEnd) {
        alert("⚠️ 필수 항목 입력 누락\n출장자 성명, 출장지, 출장 시작일 및 종료일을 모두 명확히 입력하셔야 명부 등록이 가능합니다.");
        return; 
    }

    const formattedStart = dateStart.replace(/-/g, '/');
    const formattedEnd = dateEnd.replace(/-/g, '/');
    // 시작일/종료일을 각각 끊기지 않는 단위로 묶어, 폭이 좁아지면 정확히 두 줄로만 나뉘게 한다
    const period = `<span style="white-space: nowrap;">${formattedStart} ~</span> <span style="white-space: nowrap;">${formattedEnd}</span>`;

    const cardValues = document.querySelectorAll('.cost-card-value');
    if(cardValues.length < 5) return alert("대시보드 계산이 완료되지 않았습니다.");
    
    const dailyPersonal = parseKrw(cardValues[0].innerText);
    const dailyCorp = 0;
    const mealPersonal = parseKrw(cardValues[1].innerText);
    const mealCorp = 0;

    const lodgingPersonal = getNum('lodgingPersonalAmount');
    const lodgingCorp = getNum('lodgingCorpAmount');

    const transPersonal = getNum('transportFarePersonal') + getNum('transportFuelPersonal') + getNum('transportParkingPersonal') + getNum('transportHipassPersonal');
    const transCorp = getNum('transportFareCorp') + getNum('transportFuelCorp') + getNum('transportParkingCorp') + getNum('transportHipassCorp');

    const totalPersonal = dailyPersonal + mealPersonal + lodgingPersonal + transPersonal;
    const totalCorp = dailyCorp + mealCorp + lodgingCorp + transCorp;

    const tbody = document.getElementById('rosterTbody');
    if (!tbody) return alert("명부 테이블(rosterTbody)을 찾을 수 없습니다.");
    
    const row = document.createElement('tr');
    const tdBase = "padding: 6px 8px; border: 1px solid #cbd5e1; text-align: right; white-space: nowrap; vertical-align: middle;";
    const centerStyle = "padding: 6px 8px; border: 1px solid #cbd5e1; text-align: center; vertical-align: middle;";
    
    // 숙박비·교통비·총액은 개인/법인 2줄 표시, 일비·식비는 단일 값
    // paren-label: 괄호 라벨만 PDF 에서 본문보다 2pt 작게 렌더링된다(금액 span 은 본문 크기 유지)
    const twoLine = (personal, corp) => `
        <span class="paren-label" style="color:#1a73e8; font-size:11px;">(개인)</span> ${personal.toLocaleString()}원<br>
        <span class="paren-label" style="color:#64748b; font-size:11px;">(법인)</span> <span style="color:#94a3b8;">${corp.toLocaleString()}원</span>
    `;

    row.innerHTML = `
        <td style="${centerStyle}">${name}</td>
        <td style="${centerStyle}">${destination}</td>
        <td style="${centerStyle}; width: 140px; font-size: 11px;">${period}</td>
        <td style="${tdBase}">${dailyPersonal.toLocaleString()}원</td>
        <td style="${tdBase}">${mealPersonal.toLocaleString()}원</td>
        <td style="${tdBase}">${twoLine(lodgingPersonal, lodgingCorp)}</td>
        <td style="${tdBase}">${twoLine(transPersonal, transCorp)}</td>
        <td style="${tdBase} font-weight: 700;">${twoLine(totalPersonal, totalCorp)}</td>
        <td style="${centerStyle}" class="no-print">
            <button onclick="this.parentElement.parentElement.remove()" style="background: #ef4444; color: white; border: none; padding: 3px 6px; border-radius: 4px; cursor: pointer; font-size: 11px;">삭제</button>
        </td>
    `;
    tbody.appendChild(row);
}

/**
 * PDF 캡처 최소 폭(px).
 * 이 값이 A4 본문 폭(190mm)으로 축소되므로, 값이 작을수록 PDF 글자가 커진다.
 * 표가 실제로 더 넓으면 자연 너비를 우선한다.
 */
const PDF_MIN_CAPTURE_W = 720;

/** A4 세로 기준 본문 폭(mm) — 210mm 에서 좌우 여백 10mm 씩 제외한 값 */
const PDF_USABLE_W_MM = 190;

/** 1pt 를 mm 로 환산한 값 */
const PT_TO_MM = 25.4 / 72;

/** 괄호 라벨((개인)/(법인))을 본문보다 몇 pt 작게 찍을지 */
const PDF_PAREN_PT_DELTA = 2;

/**
 * PDF 다운로드 함수
 * rowspan 셀을 캡처 전 임시 변환하여 html2canvas 렌더링 버그 우회
 */
function generatePDF() {
    const target = document.getElementById('pdfTargetWrapper');
    if (!target) return;

    document.getElementById('pdfHeader').style.display = 'block';
    document.getElementById('pdfFooter').style.display = 'block';
    const noPrintElements = target.querySelectorAll('.no-print');
    noPrintElements.forEach(el => el.style.display = 'none');
    const scrollWrapper = document.getElementById('tableScrollWrapper');
    const originalOverflow = scrollWrapper.style.overflowX;
    scrollWrapper.style.overflowX = 'visible';
    const originalWidth    = target.style.width;
    const originalMinWidth = target.style.minWidth;

    // 캡처 전용 확대 스타일 적용 (style.css 의 .pdf-export 규칙)
    target.classList.add('pdf-export');

    // 캡처 폭을 표가 필요로 하는 최소 폭까지 좁힌다.
    // 캔버스는 A4 본문 폭(190mm)에 맞춰 축소되므로, 캡처 폭이 좁을수록 PDF 글자가 커진다.
    const rosterTable = document.getElementById('rosterTable');
    const basePx = parseFloat(getComputedStyle(target).getPropertyValue('--pdf-base-font')) || 16;
    let naturalW = PDF_MIN_CAPTURE_W;
    let captureW = PDF_MIN_CAPTURE_W;

    // 괄호 라벨 크기가 표 너비에, 표 너비가 다시 축소 배율에 영향을 주므로 두 번 반복해 수렴시킨다.
    for (let pass = 0; pass < 2; pass++) {
        // 1) 폭을 하한값까지 좁혀 표의 실제 최소 폭을 측정하고
        target.style.width    = PDF_MIN_CAPTURE_W + 'px';
        target.style.minWidth = PDF_MIN_CAPTURE_W + 'px';
        // 2) 그 값(하한 미만이면 하한)에 좌우 여백을 더해 최종 캡처 폭으로 고정한다.
        naturalW = Math.max(rosterTable ? rosterTable.scrollWidth : 0, PDF_MIN_CAPTURE_W) + 24;
        target.style.width    = naturalW + 'px';
        target.style.minWidth = naturalW + 'px';
        captureW = Math.max(target.scrollWidth, naturalW) + 16;

        // 3) 캡처가 190mm 로 축소되는 배율을 역산해, 괄호 라벨이 본문보다
        //    정확히 PDF_PAREN_PT_DELTA(pt) 만큼 작게 찍히도록 px 값을 정한다.
        const pxPerMm  = captureW / PDF_USABLE_W_MM;
        const parenPx  = Math.max(basePx - PDF_PAREN_PT_DELTA * PT_TO_MM * pxPerMm, basePx * 0.5);
        target.style.setProperty('--pdf-paren-font', parenPx.toFixed(2) + 'px');
    }

    function restore() {
        document.getElementById('pdfHeader').style.display = 'none';
        document.getElementById('pdfFooter').style.display = 'none';
        noPrintElements.forEach(el => el.style.display = '');
        scrollWrapper.style.overflowX = originalOverflow;
        target.classList.remove('pdf-export');
        target.style.removeProperty('--pdf-paren-font');
        target.style.width    = originalWidth;
        target.style.minWidth = originalMinWidth;
    }

    const captureH = target.scrollHeight + 24;

    html2canvas(target, {
        scale:        2,
        useCORS:      true,
        allowTaint:   true,
        scrollX:      0,
        scrollY:      0,
        x:            0,
        y:            0,
        width:        captureW,
        height:       captureH,
        windowWidth:  captureW,
        windowHeight: captureH,
        logging:      false
    }).then(function(canvas) {
        restore();

        const { jsPDF } = window.jspdf;
        const pdf     = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const pageW   = pdf.internal.pageSize.getWidth();
        const pageH   = pdf.internal.pageSize.getHeight();
        const margin  = 10;
        const usableW = pageW - margin * 2;
        const usableH = pageH - margin * 2;

        const canvasW = canvas.width;
        const canvasH = canvas.height;
        const scale   = usableW / canvasW;
        const pageHpx = usableH / scale;
        let   srcY    = 0;
        let   pageIdx = 0;

        // ── 워터마크 크기: 로고 원본 종횡비를 그대로 사용해 왜곡 방지 ──
        const wmW = 80; // mm 단위 워터마크 너비
        let   wmH = wmW * 0.65;
        try {
            const wmProps = pdf.getImageProperties(KECI_LOGO_B64);
            if (wmProps && wmProps.width && wmProps.height) {
                wmH = wmW * (wmProps.height / wmProps.width);
            }
        } catch (e) {
            console.warn('워터마크 비율 계산 실패, 기본 비율 사용:', e);
        }
        const wmX = (pageW - wmW) / 2;
        const wmY = (pageH - wmH) / 2;

        while (srcY < canvasH) {
            if (pageIdx > 0) pdf.addPage();
            const sliceH = Math.min(pageHpx, canvasH - srcY);
            const tmp    = document.createElement('canvas');
            tmp.width    = canvasW;
            tmp.height   = sliceH;
            tmp.getContext('2d').drawImage(canvas, 0, srcY, canvasW, sliceH, 0, 0, canvasW, sliceH);
            pdf.addImage(tmp.toDataURL('image/jpeg', 0.95), 'JPEG', margin, margin, usableW, sliceH * scale);

            // ── 워터마크: 로고 이미지 중앙 반투명 삽입 (원본 비율 유지) ──
            pdf.saveGraphicsState();
            pdf.setGState(new pdf.GState({ opacity: 0.10 }));
            pdf.addImage(KECI_LOGO_B64, 'PNG', wmX, wmY, wmW, wmH);
            pdf.restoreGraphicsState();
            // ────────────────────────────────────────────

            srcY += pageHpx;
            pageIdx++;
        }

        pdf.save('출장별첨_여비지급명부.pdf');

    }).catch(function(err) {
        console.error('PDF 오류:', err);
        restore();
    });
}
/**
 * 시뮬레이션 샘플 데이터 자동 로드
 */
function loadSampleData() {
    const setVal = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.value = value;
    };

    try {
        setVal('name', '홍길동');
        setVal('role', '11');
        setVal('destination', '정부세종청사');
        setVal('purpose', '기후부 업무보고');

        if (window._fpStart) window._fpStart.setDate("2026-07-14");
        if (window._fpEnd) window._fpEnd.setDate("2026-07-16");

        setVal('tripType', '외');
        setVal('grade', '2');
        setVal('region', '기타');
        setVal('vehicle', 'public');

        setVal('lodgingPersonalNights', '2');
        setVal('lodgingPersonalAmount', '140000');
        setVal('lodgingCorpNights', '0');
        setVal('lodgingCorpAmount', '0');
        setVal('freeMeals', '0');

        setVal('transportFarePersonal', '35000');
        setVal('transportFareCorp', '0');
        setVal('transportFuelPersonal', '0');
        setVal('transportFuelCorp', '0');
        setVal('transportParkingPersonal', '0');
        setVal('transportParkingCorp', '0');
        setVal('transportHipassPersonal', '0');
        setVal('transportHipassCorp', '0');

        onDateChange();
        onVehicleChange();
        onTripTypeChange();

        alert('시뮬레이션 샘플 데이터를 성공적으로 로드했습니다.');
    } catch (error) {
        console.error("샘플 로드 중 오류 발생:", error);
    }
}

function resetForm() {
    const today = new Date();
    // Flatpickr 인스턴스 초기화
    if (window._fpStart) window._fpStart.setDate(today);
    if (window._fpEnd) window._fpEnd.setDate(today);

    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        if (input.id === 'dateStart' || input.id === 'dateEnd') return; // flatpickr가 관리
        input.value = '';
    });
    document.getElementById('vehicle').value = "public";
    document.getElementById('tripType').value = "외";
    onDateChange();
    onVehicleChange();
    onTripTypeChange();
}

/* ============================================================
   Flatpickr 커스텀 날짜 피커 초기화
   ============================================================ */
document.addEventListener('DOMContentLoaded', function () {
    flatpickr.localize(flatpickr.l10ns.ko);

    const sharedConfig = {
        dateFormat: 'Y-m-d',
        locale: 'ko',
        disableMobile: true,
        wrap: true,
        yearSelectorType: 'select',
        onChange: function () { onDateChange(); }
    };

    function syncCalendarWidth(fp) {
        const wrap = fp.element;
        const w = wrap.offsetWidth;
        if (w > 0) fp.calendarContainer.style.width = w + 'px';
    }

    function injectYearSelect(fp) {
        fp.calendarContainer.classList.add('keci-fp');

        // numInputWrapper(연도 숫자입력) → select로 교체
        const numWrap = fp.calendarContainer.querySelector('.numInputWrapper');
        if (!numWrap) return;

        const curYear = fp.currentYear;
        const sel = document.createElement('select');
        sel.className = 'flatpickr-year-select';
        const startYear = curYear - 2;
        const endYear = curYear + 2;
        for (let y = startYear; y <= endYear; y++) {
            const opt = document.createElement('option');
            opt.value = y;
            opt.textContent = y + '년';
            if (y === curYear) opt.selected = true;
            sel.appendChild(opt);
        }
        sel.addEventListener('change', function () {
            fp.changeYear(parseInt(this.value, 10));
        });

        numWrap.replaceWith(sel);
    }

    window._fpStart = flatpickr('#wrapStart', {
        ...sharedConfig,
        defaultDate: new Date(),
        onReady: function(_, __, fp) { injectYearSelect(fp); },
        onOpen: function(_, __, fp) { syncCalendarWidth(fp); },
        onYearChange: function(_, __, fp) {
            const sel = fp.calendarContainer.querySelector('.flatpickr-year-select');
            if (sel) sel.value = fp.currentYear;
        }
    });

    window._fpEnd = flatpickr('#wrapEnd', {
        ...sharedConfig,
        defaultDate: new Date(),
        onReady: function(_, __, fp) { injectYearSelect(fp); },
        onOpen: function(_, __, fp) { syncCalendarWidth(fp); },
        onYearChange: function(_, __, fp) {
            const sel = fp.calendarContainer.querySelector('.flatpickr-year-select');
            if (sel) sel.value = fp.currentYear;
        }
    });

    // 시작일 변경 시 종료일 최소값 동기화
    window._fpStart.config.onChange.push(function(dates) {
        if (dates[0]) window._fpEnd.set('minDate', dates[0]);
    });

    onDateChange();
});
