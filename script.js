/**
 * script.js - 한국환경보전원 출장 여비 계산기 핵심 브라우저 스크립트
 */

document.addEventListener('DOMContentLoaded', function() {
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
    
    // 수정됨: 역방향 날짜 선택에 대한 유효성 방어 로직 추가
    if (startEl && endEl && startEl.value && endEl.value) {
        if (new Date(endEl.value) < new Date(startEl.value)) {
            alert("종료일은 시작일보다 빠를 수 없습니다. 올바른 일정을 선택해 주십시오.");
            endEl.value = startEl.value; // 강제 보정
        }
    }
    
    const lpNights = document.getElementById('lodgingPersonalNights');
    const lpAmount = document.getElementById('lodgingPersonalAmount');
    const lcNights = document.getElementById('lodgingCorpNights');
    const lcAmount = document.getElementById('lodgingCorpAmount');

    if (!startEl || !endEl) return;

    // 시작일과 종료일이 같아 '당일' 출장인 경우
    if (startEl.value && endEl.value && startEl.value === endEl.value) {
        const hasValue = (lpAmount && parseInt(lpAmount.value || 0, 10) > 0) || 
                        (lcAmount && parseInt(lcAmount.value || 0, 10) > 0) ||
                        (lpNights && parseInt(lpNights.value || 0, 10) > 0) || 
                        (lcNights && parseInt(lcNights.value || 0, 10) > 0);
        
        if (hasValue) {
            alert("[1박 미만의 당일 출장의 경우 숙박비는 입력할 수 없습니다.]");
        }
        
        if (lpNights) lpNights.value = '0';
        if (lpAmount) lpAmount.value = '0';
        if (lcNights) lcNights.value = '0';
        if (lcAmount) lcAmount.value = '0';
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
        const formattedStart = startVal.replace(/-/g, '/');
        const formattedEnd = endVal.replace(/-/g, '/');
        const periodText = `${formattedStart} ~ ${formattedEnd}`;
        
        const previewEl = document.getElementById('periodPreview');
        if (previewEl) previewEl.innerText = periodText;
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
    const mealDeductionPerMeal = (tripType === '외') ? 8300 : 0; 
    let mealExpense = (baseMeal * tripDays) - (freeMeals * mealDeductionPerMeal);
    if (mealExpense < 0) mealExpense = 0;

    // 3. 숙박비 계산
    const lodgingPersonal = getNum('lodgingPersonalAmount');
    const lodgingCorp = getNum('lodgingCorpAmount');
    const lodgingExpense = lodgingPersonal + lodgingCorp;

    const previewTextEl = document.getElementById('lodgingPreviewText');
    if (previewTextEl) {
        if (lodgingExpense > 0) {
            previewTextEl.innerText = `[입력값: ${lodgingExpense.toLocaleString()} 원]`;
        } else {
            previewTextEl.innerText = ""; 
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
        <div class="cost-card-box" style="padding: 14px 10px;">
            <span class="cost-card-label">일비</span>
            <div class="cost-card-value" style="font-size: 18px; font-weight: 700;">${dailyExpense.toLocaleString()}</div>
            <div style="margin-top: 6px;"><span class="badge-personal">(개인)</span></div>
        </div>
        <div class="cost-card-box" style="padding: 14px 10px;">
            <span class="cost-card-label">식비</span>
            <div class="cost-card-value" style="font-size: 18px; font-weight: 700;">${mealExpense.toLocaleString()}</div>
            <div style="margin-top: 6px;"><span class="badge-personal">(개인)</span></div>
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
                el.value = '0';      
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
    const period = `${formattedStart} ~ ${formattedEnd}`;

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
    const tdStyle = "padding: 6px 4px; border: 1px solid #cbd5e1; text-align: right; width: 75px; white-space: nowrap;";
    const centerStyle = "padding: 6px 4px; border: 1px solid #cbd5e1; text-align: center; width: 80px;";
    
    row.innerHTML = `
        <td style="${centerStyle}">${name}</td>
        <td style="${centerStyle}">${destination}</td>
        <td style="padding: 6px 4px; border: 1px solid #cbd5e1; text-align: center; width: 140px; font-size: 11px;">${period}</td>
        <td style="${tdStyle}">${dailyPersonal.toLocaleString()}</td>
        <td style="${tdStyle} color: #94a3b8;">${dailyCorp.toLocaleString()}</td>
        <td style="${tdStyle}">${mealPersonal.toLocaleString()}</td>
        <td style="${tdStyle} color: #94a3b8;">${mealCorp.toLocaleString()}</td>
        <td style="${tdStyle}">${lodgingPersonal.toLocaleString()}</td>
        <td style="${tdStyle} color: #94a3b8;">${lodgingCorp.toLocaleString()}</td>
        <td style="${tdStyle}">${transPersonal.toLocaleString()}</td>
        <td style="${tdStyle} color: #94a3b8;">${transCorp.toLocaleString()}</td>
        <td style="${tdStyle} font-weight: 700; color: #0284c7; background-color:#f0f9ff;">${totalPersonal.toLocaleString()}</td>
        <td style="${tdStyle} font-weight: 700; color: #16a34a; background-color:#f0fdf4;">${totalCorp.toLocaleString()}</td>
        <td style="padding: 6px 4px; border: 1px solid #cbd5e1; text-align: center; width: 50px;" class="no-print">
            <button onclick="this.parentElement.parentElement.remove()" style="background: #ef4444; color: white; border: none; padding: 3px 6px; border-radius: 4px; cursor: pointer; font-size: 11px;">삭제</button>
        </td>
    `;
    tbody.appendChild(row);
}

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
    target.style.width    = '1200px';
    target.style.minWidth = '1200px';

    // ── rowspan 임시 변환 ──────────────────────────────────────────────
    // html2canvas는 rowspan 높이를 잘못 계산하므로
    // 캡처 전에 rowspan 제거 후 각 행에 병합처럼 보이는 td를 직접 삽입
    const table   = document.getElementById('rosterTable');
    const rows    = table.querySelectorAll('thead tr');
    const row1    = rows[0];
    const row2    = rows[1];
    const fixedCells = []; // 복원용

    row1.querySelectorAll('th[rowspan]').forEach(function(th) {
        const span    = parseInt(th.getAttribute('rowspan'));
        const text    = th.textContent.trim();
        const bgColor = window.getComputedStyle(row1).backgroundColor;
        const isPrint = th.classList.contains('no-print');

        // rowspan 제거 → 1행 높이만 차지하도록
        th.removeAttribute('rowspan');
        th.style.verticalAlign = 'middle';

        if (span > 1) {
            // 2행에 동일 내용 셀 삽입 (시각적으로 병합처럼 보이게)
            const td2 = document.createElement('th');
            td2.textContent = '';  // 2행은 비워서 경계만 표시
            td2.style.cssText = th.style.cssText;
            td2.style.background = window.getComputedStyle(row2).backgroundColor;
            td2.style.border = '1px solid #e2e8f0';
            td2.style.padding = '4px 8px';
            if (isPrint) td2.classList.add('no-print');

            // row2의 첫 번째 위치에 삽입 (성명→출장지→기간 순서 맞춤)
            row2.insertBefore(td2, row2.firstChild);
            fixedCells.push({ row: row2, el: td2, th: th });
        }
    });
    // ──────────────────────────────────────────────────────────────────

    function restore() {
        // rowspan 원복
        fixedCells.forEach(function(item) {
            item.th.setAttribute('rowspan', '2');
            item.row.removeChild(item.el);
        });
        document.getElementById('pdfHeader').style.display = 'none';
        document.getElementById('pdfFooter').style.display = 'none';
        noPrintElements.forEach(el => el.style.display = '');
        scrollWrapper.style.overflowX = originalOverflow;
        target.style.width    = originalWidth;
        target.style.minWidth = originalMinWidth;
    }

    const captureW = target.scrollWidth  + 40;
    const captureH = target.scrollHeight + 40;

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
        const pdf     = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
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

        while (srcY < canvasH) {
            if (pageIdx > 0) pdf.addPage();
            const sliceH = Math.min(pageHpx, canvasH - srcY);
            const tmp    = document.createElement('canvas');
            tmp.width    = canvasW;
            tmp.height   = sliceH;
            tmp.getContext('2d').drawImage(canvas, 0, srcY, canvasW, sliceH, 0, 0, canvasW, sliceH);
            pdf.addImage(tmp.toDataURL('image/jpeg', 0.95), 'JPEG', margin, margin, usableW, sliceH * scale);
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

        setVal('dateStart', "2026-07-14");
        setVal('dateEnd', "2026-07-16");

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
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        if (input.type === 'date') input.value = '';
        else if (input.type === 'number') input.value = '0';
        else input.value = '';
    });
    document.getElementById('vehicle').value = "public";
    document.getElementById('tripType').value = "외";
    onDateChange();
    onVehicleChange();
    onTripTypeChange();
}
