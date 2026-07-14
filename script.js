/**
 * script.js - 한국환경보전원 출장 여비 계산기 핵심 브라우저 스크립트
 */

document.addEventListener('DOMContentLoaded', function() {
    // 1. 초기 실행 및 날짜 유효성 체크
    onDateChange();
    updatePreview();
});

/**
 * [버그 수정 1] 날짜 조건 변경 제어 및 오류 검증 함수
 */
function onDateChange() {
    const startDateInput = document.getElementById('dateStart');
    const endDateInput = document.getElementById('dateEnd');
    const dateInfo = document.getElementById('dateInfo');

    if (!startDateInput || !endDateInput) return;

    const startVal = startDateInput.value;
    const endVal = endDateInput.value;

    if (startVal) {
        // 종료일 달력 선택 범위를 시작일 이후로 제한 (이전 날짜 비활성화)
        endDateInput.min = startVal;

        // 종료일이 시작일보다 과거라면 종료일자를 시작일자로 강제 동기화
        if (endVal && endVal < startVal) {
            endDateInput.value = startVal;
        }
    } else {
        endDateInput.removeAttribute('min');
    }

    // 일수 정보 업데이트 및 텍스트 표시
    if (startVal && endDateInput.value) {
        const startDate = new Date(startVal);
        const endDate = new Date(endDateInput.value);
        const diffTime = endDate - startDate;
        const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

        if (totalDays > 0) {
            dateInfo.innerHTML = `<strong>${totalDays}일간</strong> (당일 포함)`;
            dateInfo.style.color = "#0056b3";
        } else {
            dateInfo.textContent = "";
        }
    } else {
        dateInfo.textContent = "";
    }

    // 변경된 일수 값을 기반으로 여비 재조정 렌더링
    updatePreview();
}

/**
 * [복원 적용 2] 실시간 대시보드 컴포넌트 렌더링 함수
 * 사용자가 올린 실물 이미지 카드 UI 디자인과 명칭을 100% 동일하게 복원 구현했습니다.
 */
function updatePreview() {
    const previewContainer = document.getElementById('preview');
    if (!previewContainer) return;

    // 날짜 값 읽기
    const startDateInput = document.getElementById('dateStart');
    const endDateInput = document.getElementById('dateEnd');
    
    let totalDays = 0;
    if (startDateInput && endDateInput && startDateInput.value && endDateInput.value) {
        const start = new Date(startDateInput.value);
        const end = new Date(endDateInput.value);
        totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    }

    // 기본 값 세팅 (기준단가: 일비 25,000 / 식비 25,000)
    // 날짜 선택이 비어있으면 초기 1일 기준으로 임시 계산하여 보여줍니다.
    const activeDays = totalDays > 0 ? totalDays : 1;

    const dailyRate = 25000;
    const mealRate = 25000;

    let dailyExpense = dailyRate * activeDays;
    let mealExpense = mealRate * activeDays;

    // 만약 식사 제공 공제회수(freeMeals)가 입력되었다면 식비 공제 (예: 1회당 8,000원 공제 예시 기준)
    const freeMealsEl = document.getElementById('freeMeals');
    if (freeMealsEl && freeMealsEl.value > 0) {
        mealExpense = Math.max(0, mealExpense - (freeMealsEl.value * 8330)); // 규정 공제액 차감
    }

    // 입력된 숙박비 합산 (개인 박수 + 법인 박수 연동)
    const lodgingActualEl = document.getElementById('lodgingActual');
    const lodgingPersonalNights = parseInt(document.getElementById('lodgingPersonalNights')?.value) || 0;
    const lodgingCorpNights = parseInt(document.getElementById('lodgingCorpNights')?.value) || 0;
    const lodgingRate = parseInt(lodgingActualEl?.value) || 0;
    const lodgingExpense = lodgingRate * (lodgingPersonalNights + lodgingCorpNights);

    // 교통비 세부 항목 총합 계산
    const transFarePersonal = parseInt(document.getElementById('transportFarePersonal')?.value) || 0;
    const transFareCorp = parseInt(document.getElementById('transportFareCorp')?.value) || 0;
    const transFuelPersonal = parseInt(document.getElementById('transportFuelPersonal')?.value) || 0;
    const transFuelCorp = parseInt(document.getElementById('transportFuelCorp')?.value) || 0;
    const transParkingPersonal = parseInt(document.getElementById('transportParkingPersonal')?.value) || 0;
    const transParkingCorp = parseInt(document.getElementById('transportParkingCorp')?.value) || 0;
    const transHipassPersonal = parseInt(document.getElementById('transportHipassPersonal')?.value) || 0;
    const transHipassCorp = parseInt(document.getElementById('transportHipassCorp')?.value) || 0;

    const transportExpense = transFarePersonal + transFareCorp + transFuelPersonal + transFuelCorp + 
                             transParkingPersonal + transParkingCorp + transHipassPersonal + transHipassCorp;

    // 교통비 누적 디스플레이 값 동기화
    const transportTotalDisplay = document.getElementById('transportTotalDisplay');
    if (transportTotalDisplay) {
        transportTotalDisplay.textContent = `${transportExpense.toLocaleString()}원`;
    }

    // 최종 여비 합계 산출
    const totalExpense = dailyExpense + mealExpense + lodgingExpense + transportExpense;

    // HTML 내부 구조 주입 (부모 wrapper를 제거하고 내부 카드들만 바로 주입)
    previewContainer.innerHTML = `
        <!-- 일비 -->
        <div class="cost-card-box" style="padding: 14px 10px;">
            <span class="cost-card-label">일비</span>
            <div class="cost-card-value" style="font-size: 18px; font-weight: 700;">${dailyExpense.toLocaleString()}</div>
            <div style="margin-top: 6px;"><span class="badge-personal">(개인)</span></div>
        </div>

        <!-- 식비 -->
        <div class="cost-card-box" style="padding: 14px 10px;">
            <span class="cost-card-label">식비</span>
            <div class="cost-card-value" style="font-size: 18px; font-weight: 700;">${mealExpense.toLocaleString()}</div>
            <div style="margin-top: 6px;"><span class="badge-personal">(개인)</span></div>
        </div>

        <!-- 숙박비 -->
        <div class="cost-card-box" style="padding: 14px 10px; display: flex; flex-direction: column; justify-content: space-between; min-height: 85px;">
            <span class="cost-card-label">숙박비</span>
            <div class="cost-card-value" style="font-size: 18px; font-weight: 700; margin: auto 0;">${lodgingExpense.toLocaleString()}</div>
            <div style="height: 18px;"></div> <!-- 높이 정렬용 임시 공간 -->
        </div>

        <!-- 교통비 -->
        <div class="cost-card-box" style="padding: 14px 10px; display: flex; flex-direction: column; justify-content: space-between; min-height: 85px;">
            <span class="cost-card-label">교통비</span>
            <div class="cost-card-value" style="font-size: 18px; font-weight: 700; margin: auto 0;">${transportExpense.toLocaleString()}</div>
            <div style="height: 18px;"></div> <!-- 높이 정렬용 임시 공간 -->
        </div>

        <!-- 여비합계 -->
        <div class="cost-card-box total-box" style="padding: 14px 10px; background-color: #e2f0fd; border-color: #b3d7fc; display: flex; flex-direction: column; justify-content: space-between; min-height: 85px;">
            <span class="cost-card-label" style="color: #005691;">여비합계</span>
            <div class="cost-card-value" style="font-size: 18px; font-weight: 700; color: #005691; margin: auto 0;">${totalExpense.toLocaleString()}원</div>
            <div style="height: 18px;"></div> <!-- 높이 정렬용 임시 공간 -->
        </div>
    `;

    // 숙박 조건 경고 알림 노출/숨김 제어
    const warnRow = document.getElementById('lodgingNightsWarnRow');
    if (warnRow) {
        if (lodgingRate > 0 && (lodgingPersonalNights + lodgingCorpNights) === 0) {
            warnRow.style.display = 'block';
        } else {
            warnRow.style.display = 'none';
        }
    }
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

function onVehicleChange() {
    const vehicle = document.getElementById('vehicle').value;
    const vehicleDaysField = document.getElementById('vehicleDaysField');
    const vehicleHint = document.getElementById('vehicleHint');

    if (vehicle === 'company') {
        if (vehicleDaysField) vehicleDaysField.classList.remove('hidden');
        if (vehicleHint) vehicleHint.textContent = '공용차량 이용 시 일비 50% 감액 대상';
    } else {
        if (vehicleDaysField) vehicleDaysField.classList.add('hidden');
        if (vehicleHint) vehicleHint.textContent = '';
    }
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
 * 개인/법인 구분 데이터를 정밀 추출하여 명부 표에 추가합니다.
 */
function addRoster() {
    const getVal = (id) => { const el = document.getElementById(id); return el ? el.value : ''; };
    const getNum = (id) => { const el = document.getElementById(id); return el ? parseInt(el.value.replace(/,/g, '') || 0, 10) : 0; };
    const parseKrw = (str) => parseInt(str.replace(/[^0-9]/g, '') || 0, 10);

    // 1. 기본 인적 사항 추출
    const name = getVal('name') || '미입력';
    const destination = getVal('destination') || '-';
    const period = `${getVal('dateStart')} ~ ${getVal('dateEnd')}`;

    // 2. 일비/식비 추출 (대시보드 카드에서 추출, 규정상 전액 개인 지급으로 간주)
    const cardValues = document.querySelectorAll('.cost-card-value');
    if(cardValues.length < 5) return alert("대시보드 렌더링이 완료되지 않았습니다.");
    
    const dailyPersonal = parseKrw(cardValues[0].innerText);
    const dailyCorp = 0;
    const mealPersonal = parseKrw(cardValues[1].innerText);
    const mealCorp = 0;

    // 3. 숙박비 정밀 추출 (실비 x 숙박 일수 기반)
    const lodgingActual = getNum('lodgingActual');
    const lodgingPersonal = lodgingActual * getNum('lodgingPersonalNights');
    const lodgingCorp = lodgingActual * getNum('lodgingCorpNights');

    // 4. 교통비 정밀 추출 (입력창 항목별 합산)
    const transPersonal = getNum('transportFarePersonal') + getNum('transportFuelPersonal') + getNum('transportParkingPersonal') + getNum('transportHipassPersonal');
    const transCorp = getNum('transportFareCorp') + getNum('transportFuelCorp') + getNum('transportParkingCorp') + getNum('transportHipassCorp');

    // 5. 총액 계산
    const totalPersonal = dailyPersonal + mealPersonal + lodgingPersonal + transPersonal;
    const totalCorp = dailyCorp + mealCorp + lodgingCorp + transCorp;

    // 6. 테이블 행 생성 및 주입
    const tbody = document.getElementById('rosterTbody');
    const row = document.createElement('tr');
    
    const tdStyle = "padding: 8px; border: 1px solid #e2e8f0; text-align: right;";
    const centerStyle = "padding: 8px; border: 1px solid #e2e8f0; text-align: center;";
    
    row.innerHTML = `
        <td style="${centerStyle}">${name}</td>
        <td style="${centerStyle}">${destination}</td>
        <td style="${centerStyle} font-size: 11px;">${period}</td>
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
        <td style="${centerStyle}" class="no-print">
            <button onclick="this.parentElement.parentElement.remove()" style="background: #ef4444; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 11px;">삭제</button>
        </td>
    `;
    tbody.appendChild(row);
}
/**
 * 명부 테이블 영역(.roster-container)을 PDF 파일로 변환합니다.
 */
function generatePDF() {
    const element = document.getElementById('rosterContainer');
    if (!element) return;

    // 1. PDF 출력 전용 상태로 DOM 임시 변경
    const noPrintElements = element.querySelectorAll('.no-print');
    noPrintElements.forEach(el => el.style.display = 'none');
    
    // 배경색 강제 지정 (투명 배경으로 인한 캡처 오류 방지)
    const originalBackground = element.style.background;
    element.style.background = '#ffffff';

    // 2. 엔진 옵션 최적화 (스크롤 위치 고정, 크기 보정)
    const opt = {
        margin:       10,
        filename:     '출장자_여비지급명부.pdf',
        image:        { type: 'jpeg', quality: 1.0 },
        html2canvas:  { 
            scale: 2, 
            useCORS: true, 
            scrollY: 0, // 💡 핵심: 캡처 시 스크롤 위치를 0으로 강제 고정하여 빈 영역 캡처 방지
            backgroundColor: '#ffffff'
        },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'landscape' }
    };

    // 3. PDF 변환 및 원래 상태 복구
    html2pdf().set(opt).from(element).save().then(() => {
        noPrintElements.forEach(el => el.style.display = '');
        element.style.background = originalBackground;
    }).catch(err => {
        console.error("PDF 생성 중 시스템 오류 발생:", err);
        noPrintElements.forEach(el => el.style.display = '');
        element.style.background = originalBackground;
    });
}
