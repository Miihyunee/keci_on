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

    // 식비 계산: 규정 "해당일 식비의 1/3을 감액, 감액 후 1원 단위 절사"
    // 근무지 내 출장은 식비 자체가 0원이므로 공제 없음
    const mealDeductionPerMeal = (baseMeal > 0) ? Math.floor(Math.floor(baseMeal / 3) / 10) * 10 : 0;
    let mealExpense = (baseMeal * tripDays) - (freeMeals * mealDeductionPerMeal);
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
    const tdBase = "padding: 6px 8px; border: 1px solid #cbd5e1; text-align: right; white-space: nowrap; vertical-align: middle;";
    const centerStyle = "padding: 6px 8px; border: 1px solid #cbd5e1; text-align: center; vertical-align: middle;";
    
    // 숙박비·교통비·총액은 개인/법인 2줄 표시, 일비·식비는 단일 값
    const twoLine = (personal, corp) => `
        <span style="color:#1a73e8; font-size:11px;">(개인)</span> ${personal.toLocaleString()}원<br>
        <span style="color:#64748b; font-size:11px;">(법인)</span> <span style="color:#94a3b8;">${corp.toLocaleString()}원</span>
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

    // thead가 단일 행이므로 rowspan 변환 불필요
    const fixedCells = [];

    function restore() {
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
    const today = new Date().toLocaleDateString('en-CA');
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        if (input.type === 'date') input.value = today;
        else input.value = '';
    });
    document.getElementById('vehicle').value = "public";
    document.getElementById('tripType').value = "외";
    onDateChange();
    onVehicleChange();
    onTripTypeChange();
}
