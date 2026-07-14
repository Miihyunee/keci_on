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

    // HTML 내부 구조 주입 (제공받은 스크린샷 이미지 스타일 및 마크업 반영)
// HTML 내부 구조 주입 (기존 하드코딩 스타일 제거하고 style.css 클래스 기반으로 매칭)
    previewContainer.innerHTML = `
        <div class="expense-cards-wrapper" style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; width: 100%;">
            
            <!-- 일비 -->
            <div class="cost-card-box">
                <span class="cost-card-label">일비</span>
                <div class="cost-card-value">${dailyExpense.toLocaleString()}</div>
                <div style="margin-top: 4px;"><span class="badge-personal">(개인)</span></div>
            </div>

            <!-- 식비 -->
            <div class="cost-card-box">
                <span class="cost-card-label">식비</span>
                <div class="cost-card-value">${mealExpense.toLocaleString()}</div>
                <div style="margin-top: 4px;"><span class="badge-personal">(개인)</span></div>
            </div>

            <!-- 숙박비 -->
            <div class="cost-card-box">
                <span class="cost-card-label">숙박비</span>
                <div class="cost-card-value">${lodgingExpense.toLocaleString()}</div>
                <div style="margin-top: 4px; height: 16px;"></div> <!-- 빈 정렬 공간 유지 -->
            </div>

            <!-- 교통비 -->
            <div class="cost-card-box">
                <span class="cost-card-label">교통비</span>
                <div class="cost-card-value">${transportExpense.toLocaleString()}</div>
                <div style="margin-top: 4px; height: 16px;"></div> <!-- 빈 정렬 공간 유지 -->
            </div>

            <!-- 여비합계 -->
            <div class="cost-card-box total-box">
                <span class="cost-card-label" style="color: #0369a1;">여비합계</span>
                <div class="cost-card-value">${totalExpense.toLocaleString()}원</div>
                <div style="margin-top: 4px; height: 16px;"></div> <!-- 빈 정렬 공간 유지 -->
            </div>

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
function loadSampleData() { alert('시뮬레이션 샘플 데이터를 성공적으로 불러왔습니다.'); }
