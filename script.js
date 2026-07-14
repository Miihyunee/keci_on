/**
 * script.js - 한국환경보전원 출장 여비 계산기 핵심 브라우저 스크립트
 */

document.addEventListener('DOMContentLoaded', function() {
    // 1. 초기 실행 및 날짜 / 교통수단 입력 제한 유효성 체크
    if (typeof onDateChange === 'function') onDateChange();
    if (typeof onVehicleChange === 'function') onVehicleChange();
    if (typeof updatePreview === 'function') updatePreview();
});

// [4번 문제 해결] 당일 출장 시 숙박비 입력 제한 및 경고 팝업 로직
function onDateChange() {
    const startEl = document.getElementById('dateStart');
    const endEl = document.getElementById('dateEnd');
    
    const lpNights = document.getElementById('lodgingPersonalNights');
    const lpAmount = document.getElementById('lodgingPersonalAmount');
    const lcNights = document.getElementById('lodgingCorpNights');
    const lcAmount = document.getElementById('lodgingCorpAmount');

    if (!startEl || !endEl) return;

    // 시작일과 종료일이 같아 '당일(1일)' 출장인 경우
    if (startEl.value && endEl.value && startEl.value === endEl.value) {
        const hasValue = (lpAmount && parseInt(lpAmount.value || 0, 10) > 0) || 
                        (lcAmount && parseInt(lcAmount.value || 0, 10) > 0) ||
                        (lpNights && parseInt(lpNights.value || 0, 10) > 0) || 
                        (lcNights && parseInt(lcNights.value || 0, 10) > 0);
        
        if (hasValue) {
            alert("[1박 미만의 출장의 경우 숙박비는 입력할 수 없습니다.]");
        }
        
        if (lpNights) lpNights.value = '0';
        if (lpAmount) lpAmount.value = '0';
        if (lcNights) lcNights.value = '0';
        if (lcAmount) lcAmount.value = '0';
    }

    if (typeof updatePreview === 'function') updatePreview();
}

function loadSampleData() {
    // 1. 날짜 데이터 입력 (2박 3일 예시)
    const startInput = document.getElementById('dateStart');
    const endInput = document.getElementById('dateEnd');
    if (startInput) startInput.value = "2026-07-14";
    if (endInput) endInput.value = "2026-07-16";

    // 2. 숙박일수 및 금액 데이터 주입 (논리적 보완)
    const lpNights = document.getElementById('lodgingPersonalNights');
    const lpAmount = document.getElementById('lodgingPersonalAmount');
    const lcNights = document.getElementById('lodgingCorpNights');
    const lcAmount = document.getElementById('lodgingCorpAmount');

    if (lpNights) lpNights.value = "2";
    if (lpAmount) lpAmount.value = "160000";
    if (lcNights) lcNights.value = "0";
    if (lcAmount) lcAmount.value = "0";

    // 3. 변경사항 반영 및 데이터 검증 함수 호출
    if (typeof onDateChange === 'function') {
        onDateChange();
    } else if (typeof updatePreview === 'function') {
        updatePreview();
    }
}

/**
 * 대시보드 상단 카드 및 숙박비 가이드 문구를 실시간으로 업데이트하는 핵심 함수
 */
function updatePreview() {
    const startVal = document.getElementById('dateStart').value; // yyyy-mm-dd
    const endVal = document.getElementById('dateEnd').value;     // yyyy-mm-dd

    if (startVal && endVal) {
        // 하이픈(-)을 슬래시(/)로 바꾸어 무조건 yyyy/mm/dd 구조로 통일
        const formattedStart = startVal.replace(/-/g, '/');
        const formattedEnd = endVal.replace(/-/g, '/');
        
        // [수정] 기존에 dd/mm/yyyy 형태로 쪼개서 재조합하던 코드가 있다면 과감히 지우고 아래 라인으로 대체합니다.
        const periodText = `${formattedStart} ~ ${formattedEnd}`;
        
        // 프리뷰 화면이나 텍스트 노드에 반영하는 엘리먼트 ID에 맞게 바인딩
        const previewEl = document.getElementById('periodPreview');
        if (previewEl) previewEl.innerText = periodText;
    }
    
    // 안전하게 DOM 요소를 찾아 값을 가져오는 헬퍼 함수들
    const getVal = (id) => { const el = document.getElementById(id); return el ? el.value.trim() : ''; };
    const getNum = (id) => { const el = document.getElementById(id); return el ? parseInt(el.value.replace(/,/g, '') || 0, 10) : 0; };
    
    // 0. 대시보드를 그려줄 부모 컨테이너 탐색 (HTML 구조에 맞춰 자동 매칭)
    const previewContainer = document.getElementById('costDashboardContainer') || document.querySelector('.cost-dashboard-container');
    if (!previewContainer) return;

    // 1. 출장 일수(Days) 계산 logic
    const dateStart = getVal('dateStart');
    const dateEnd = getVal('dateEnd');
    let tripDays = 1; // 기본 1일 출장으로 가정

    if (dateStart && dateEnd) {
        const start = new Date(dateStart);
        const end = new Date(dateEnd);
        if (!isNaN(start) && !isNaN(end)) {
            const diffTime = end - start;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            tripDays = diffDays >= 0 ? diffDays + 1 : 1;
        }
    }

    // 2. 일비 & 식비 기본 규정 적용 계산
    const tripType = getVal('tripType'); // '외' (근무지 외), '내' (근무지 내)
    const vehicle = getVal('vehicle');   // 'public' (대중교통), 'corp'/'personal' (자동차류)
    const freeMeals = getNum('freeMeals');

    let baseDaily = 25000; // 근무지 외 기본 일비 2.5만
    let baseMeal = 25000;  // 근무지 외 기본 식비 2.5만

    if (tripType === '내') {
        baseDaily = 20000; // 근무지 내 기본 일비 2만
        baseMeal = 0;      // 근무지 내 식비 없음
    }

    // [규정 준용 적용] 자가용 또는 업무용 차량 이용 시 일비 2분의 1(50%) 감액
    if (vehicle !== 'public') {
        baseDaily = baseDaily / 2;
    }

    // 최종 일비 및 무료 식사 공제를 반영한 식비 산출
    const dailyExpense = baseDaily * tripDays;
    const mealDeductionPerMeal = tripType === '외' ? 8300 : 0; // 한 끼당 공제액 예시
    let mealExpense = (baseMeal * tripDays) - (freeMeals * mealDeductionPerMeal);
    if (mealExpense < 0) mealExpense = 0;

    // 3. 숙박비 계산 (개인 금액 + 법인 금액 합산)
    const lodgingPersonal = getNum('lodgingPersonalAmount');
    const lodgingCorp = getNum('lodgingCorpAmount');
    const lodgingExpense = lodgingPersonal + lodgingCorp;

    // [오류 해결] 숙박비를 입력했다가 지웠을 때 가이드 문구 잔상 제거 처리
    const previewTextEl = document.getElementById('lodgingPreviewText');
    if (previewTextEl) {
        if (lodgingExpense > 0) {
            previewTextEl.innerText = `[입력값: ${lodgingExpense.toLocaleString()} 원]`;
        } else {
            previewTextEl.innerText = ""; // 0원이거나 비어있으면 깔끔하게 비움
        }
    }

    // 4. 교통비 계산 (개인 실비 항목 일체 + 법인 실비 항목 일체 합산)
    // 일반 대중교통('public')일 때는 주유/주차/하이패스가 잠기고 0원으로 처리되어 들어옵니다.
    const transportExpense = 
        getNum('transportFarePersonal') + getNum('transportFuelPersonal') + 
        getNum('transportParkingPersonal') + getNum('transportHipassPersonal') +
        getNum('transportFareCorp') + getNum('transportFuelCorp') + 
        getNum('transportParkingCorp') + getNum('transportHipassCorp');

    // 5. 총 여비 합계 산출
    const totalExpense = dailyExpense + mealExpense + lodgingExpense + transportExpense;

    // 6. 상단 대시보드 5개 카드 동적 렌더링 (CSS 깨짐 방지 레이아웃 유지)
    previewContainer.innerHTML = `
        <!-- 일비 카트 -->
        <div class="cost-card-box" style="padding: 14px 10px;">
            <span class="cost-card-label">일비</span>
            <div class="cost-card-value" style="font-size: 18px; font-weight: 700;">${dailyExpense.toLocaleString()}</div>
            <div style="margin-top: 6px;"><span class="badge-personal">(개인)</span></div>
        </div>

        <!-- 식비 카드 -->
        <div class="cost-card-box" style="padding: 14px 10px;">
            <span class="cost-card-label">식비</span>
            <div class="cost-card-value" style="font-size: 18px; font-weight: 700;">${mealExpense.toLocaleString()}</div>
            <div style="margin-top: 6px;"><span class="badge-personal">(개인)</span></div>
        </div>

        <!-- 숙박비 카드 -->
        <div class="cost-card-box" style="padding: 14px 10px; display: flex; flex-direction: column; justify-content: space-between; min-height: 85px;">
            <span class="cost-card-label">숙박비</span>
            <div class="cost-card-value" style="font-size: 18px; font-weight: 700; margin: auto 0;">${lodgingExpense.toLocaleString()}</div>
            <div style="height: 18px;"></div>
        </div>

        <!-- 교통비 카드 -->
        <div class="cost-card-box" style="padding: 14px 10px; display: flex; flex-direction: column; justify-content: space-between; min-height: 85px;">
            <span class="cost-card-label">교통비</span>
            <div class="cost-card-value" style="font-size: 18px; font-weight: 700; margin: auto 0;">${transportExpense.toLocaleString()}</div>
            <div style="height: 18px;"></div>
        </div>

        <!-- 여비합계 카드 -->
        <div class="cost-card-box total-box" style="padding: 14px 10px; background-color: #e2f0fd; border-color: #b3d7fc; display: flex; flex-direction: column; justify-content: space-between; min-height: 85px;">
            <span class="cost-card-label" style="color: #005691;">여비합계</span>
            <div class="cost-card-value" style="font-size: 18px; font-weight: 700; color: #005691; margin: auto 0;">${totalExpense.toLocaleString()}원</div>
            <div style="height: 18px;"></div>
        </div>
    `;
}

/**
 * 폼 요소들의 바인딩 컨트롤러 함수군
 */
function onTripTypeChange() {
    const tripType = document.getElementById('tripType').value;
    const tripTypeHelp = document.getElementById('tripTypeHelp');
    const regionField = document.getElementById('regionField');

    if (tripType === '외') {
        if (tripTypeHelp) tripTypeHelp.textContent = '타 시·군 등으로의 출장 복명';
        if (regionField) regionField.style.display = 'block';
    } else {
        if (tripTypeHelp) tripTypeHelp.textContent = '근무지 인근 12km 이내 출장 복명';
        if (regionField) regionField.style.display = 'none';
    }
}

/**
 * 교통수단 변경 시 주유비, 주차비, 하이패스 입력 제어 로직
 */
function onVehicleChange() {
    const vehicleEl = document.getElementById('vehicle');
    if (!vehicleEl) return;

    // 자동차 관련 필드 목록
    const carFields = [
        'transportFuelPersonal', 'transportFuelCorp',
        'transportParkingPersonal', 'transportParkingCorp',
        'transportHipassPersonal', 'transportHipassCorp'
    ];

    if (vehicleEl.value === 'public') { // 일반 대중교통 선택 시
        carFields.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.value = '0';      // 값 0으로 초기화
                el.disabled = true;  // 입력 불가 처리
            }
        });
    } else { // 자가용/업무용 차량 등 선택 시
        carFields.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.disabled = false; // 입력 활성화
        });
    }

    if (typeof updatePreview === 'function') updatePreview();
}

function onNumberInput(input) {
    // 세 자릿수 가독성을 위한 유틸 헬퍼 함수
    const rawValue = input.value.replace(/[^0-9]/g, '');
    const id = input.id;
    const hintEl = document.getElementById(`${id}Hint`);
    
    if (hintEl && rawValue) {
        hintEl.textContent = `입력값: ${parseInt(rawValue).toLocaleString()} 원`;
    } else if (hintEl) {
        hintEl.textContent = '';
    }
}

function resetForm() {
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        if (input.type === 'date') input.value = '';
        else if (input.type === 'number') input.value = '0';
        else input.value = '';
    });
    
    onDateChange();
    updatePreview();
}

// 명부 추가, 일괄 삭제 등의 잔여 서브 함수 명세 (필요시 맞춤 확장)
function addTrip() { alert('출장 명부가 정상 추가되었습니다.'); }
function clearAll() { alert('모든 명부가 비워졌습니다.'); }
/**
 * 시뮬레이션 샘플 데이터를 화면의 입력 필드에 자동으로 주입하는 함수
 */
function loadSampleData() {
    console.log("HTML 내부 샘플 로드 함수 실행");

    const setVal = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.value = value;
    };

    try {
        // 1. 기본 정보 주입
        setVal('name', '홍길동');
        setVal('role', '11');
        setVal('destination', '정부세종청사');
        setVal('purpose', '기후부 업무보고');

        // 2. 날짜 설정 (오늘부터 2박 3일)
        const today = new Date();
        const afterTwoDays = new Date();
        afterTwoDays.setDate(today.getDate() + 2);

        const formatDate = (date) => {
            const yyyy = date.getFullYear();
            const mm = String(date.getMonth() + 1).padStart(2, '0');
            const dd = String(date.getDate()).padStart(2, '0');
            return `${yyyy}-${mm}-${dd}`;
        };

        setVal('dateStart', formatDate(today));
        setVal('dateEnd', formatDate(afterTwoDays));

        // 3. 여비 적용 조건 주입
        setVal('tripType', '외');
        setVal('grade', '2');
        setVal('region', '기타');
        setVal('vehicle', 'public');

        // 4. 숙박비 및 식사 공제 횟수 설정
        setVal('lodgingActual', '70000');
        setVal('lodgingPersonalNights', '2');
        setVal('lodgingCorpNights', '0');
        setVal('freeMeals', '0');

        // 5. 교통비 세부 실비 정산값 설정
        setVal('transportFarePersonal', '35000');
        setVal('transportFareCorp', '0');
        setVal('transportFuelPersonal', '0');
        setVal('transportFuelCorp', '0');
        setVal('transportParkingPersonal', '0');
        setVal('transportParkingCorp', '0');
        setVal('transportHipassPersonal', '0');
        setVal('transportHipassCorp', '0');

        // 6. 외부 스크립트에 선언된 업데이트 함수 강제 호출 시도
        if (typeof onDateChange === 'function') onDateChange();
        if (typeof onTripTypeChange === 'function') onTripTypeChange();
        if (typeof onVehicleChange === 'function') onVehicleChange();
        if (typeof updatePreview === 'function') updatePreview();

        alert('시뮬레이션 샘플 데이터를 성공적으로 로드했습니다.');
    } catch (error) {
        console.error("샘플 로드 중 오류 발생:", error);
    }
}
/**
 * 날짜 필수값 검증이 추가된 명부 데이터 추가 함수
 */
function addRoster() {
    const getVal = (id) => { const el = document.getElementById(id); return el ? el.value.trim() : ''; };
    const getNum = (id) => { const el = document.getElementById(id); return el ? parseInt(el.value.replace(/,/g, '') || 0, 10) : 0; };
    const parseKrw = (str) => parseInt(str.replace(/[^0-9]/g, '') || 0, 10);

    // 1. 필수 유효성 체크 강화 (성명, 출장지, 시작일, 종료일 모두 누락 차단)
    const name = getVal('name');
    const destination = getVal('destination');
    const dateStart = getVal('dateStart');
    const dateEnd = getVal('dateEnd');
    
    // 유효성 검증을 날짜 변환 및 중복 선언 전에 수행하여 팝업이 정상 작동하도록 구성
    if (!name || !destination || !dateStart || !dateEnd) {
        alert("⚠️ 필수 항목 입력 누락\n출장자 성명, 출장지, 출장 시작일 및 종료일을 모두 명확히 입력하셔야 명부 등록이 가능합니다.");
        return; 
    }

    // [5번 기능 반영] 하이픈(-)을 슬래시(/)로 변경하여 yyyy/mm/dd 형태로 통일
    const formattedStart = dateStart.replace(/-/g, '/');
    const formattedEnd = dateEnd.replace(/-/g, '/');
    const period = `${formattedStart} ~ ${formattedEnd}`;

    // 2. 대시보드 카드 연동 데이터 매칭
    const cardValues = document.querySelectorAll('.cost-card-value');
    if(cardValues.length < 5) return alert("대시보드 계산이 완료되지 않았습니다.");
    
    const dailyPersonal = parseKrw(cardValues[0].innerText);
    const dailyCorp = 0;
    const mealPersonal = parseKrw(cardValues[1].innerText);
    const mealCorp = 0;

    // 3. 수정된 독립형 구조에서 직접 숙박비 비용 확보
    const lodgingPersonal = getNum('lodgingPersonalAmount');
    const lodgingCorp = getNum('lodgingCorpAmount');

    // 4. 교통비 취합 및 총계 구성
    const transPersonal = getNum('transportFarePersonal') + getNum('transportFuelPersonal') + getNum('transportParkingPersonal') + getNum('transportHipassPersonal');
    const transCorp = getNum('transportFareCorp') + getNum('transportFuelCorp') + getNum('transportParkingCorp') + getNum('transportHipassCorp');

    const totalPersonal = dailyPersonal + mealPersonal + lodgingPersonal + transPersonal;
    const totalCorp = dailyCorp + mealCorp + lodgingCorp + transCorp;

    // 5. 표에 바인딩
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
 * 표 깨짐이 완전 방지된 고해상도 PDF 다운로드 함수
 */
function generatePDF() {
    const target = document.getElementById('pdfTargetWrapper');
    if (!target) return;

    // 1. 문서화 전용 데코레이션 활성화
    document.getElementById('pdfHeader').style.display = 'block';
    document.getElementById('pdfFooter').style.display = 'block';
    
    const noPrintElements = target.querySelectorAll('.no-print');
    noPrintElements.forEach(el => el.style.display = 'none');

    const scrollWrapper = document.getElementById('tableScrollWrapper');
    const originalOverflow = scrollWrapper.style.overflowX;
    scrollWrapper.style.overflowX = 'visible'; 

    // 2. 가로 픽셀을 물리적으로 고정하여 html2canvas가 압축 렌더링하는 현상 원천 차단
    const originalWidth = target.style.width;
    target.style.width = '1050px'; 

    const opt = {
        margin:       [12, 10, 12, 10],
        filename:     '출장별첨_여비지급명부.pdf',
        image:        { type: 'jpeg', quality: 1.0 },
        html2canvas:  { 
            scale: 2.5, // 화질 선명도 상향
            useCORS: true, 
            scrollY: 0,
            windowWidth: 1200
        },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'landscape' }
    };

    // 3. 파일 배출 후 환경 복원
    html2pdf().set(opt).from(target).save().then(() => {
        document.getElementById('pdfHeader').style.display = 'none';
        document.getElementById('pdfFooter').style.display = 'none';
        noPrintElements.forEach(el => el.style.display = '');
        scrollWrapper.style.overflowX = originalOverflow;
        target.style.width = originalWidth;
    }).catch(err => {
        console.error("PDF 변환 오류 수습:", err);
        document.getElementById('pdfHeader').style.display = 'none';
        document.getElementById('pdfFooter').style.display = 'none';
        noPrintElements.forEach(el => el.style.display = '');
        scrollWrapper.style.overflowX = originalOverflow;
        target.style.width = originalWidth;
    });
}
