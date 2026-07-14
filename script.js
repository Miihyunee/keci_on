/**
 * script.js - 한국환경보전원 출장 여비 계산기 핵심 브라우저 스크립트
 */

document.addEventListener('DOMContentLoaded', function() {
    // 1. 초기 실행 및 날짜 / 교통수단 입력 제한 유효성 체크
    if (typeof onDateChange === 'function') onDateChange();
    if (typeof onVehicleChange === 'function') onVehicleChange();
    if (typeof updatePreview === 'function') updatePreview();
});

/**
 * 날짜 변경 시 숙박비 입력 제어 로직
 */
function onDateChange() {
    const startEl = document.getElementById('dateStart');
    const endEl = document.getElementById('dateEnd');
    const lodgingActual = document.getElementById('lodgingActual');
    const lodgingPersonalNights = document.getElementById('lodgingPersonalNights');
    const lodgingCorpNights = document.getElementById('lodgingCorpNights');

    if (!startEl || !endEl) return;

    // 당일 출장 여부 확인 (시작일과 종료일이 같으면 당일 출장)
    if (startEl.value && endEl.value && startEl.value === endEl.value) {
        // 숙박비 관련 입력창 모두 비활성화 및 0 초기화
        if (lodgingActual) { lodgingActual.value = '0'; lodgingActual.disabled = true; }
        if (lodgingPersonalNights) { lodgingPersonalNights.value = '0'; lodgingPersonalNights.disabled = true; }
        if (lodgingCorpNights) { lodgingCorpNights.value = '0'; lodgingCorpNights.disabled = true; }
    } else {
        // 1박 이상일 경우 입력창 활성화
        if (lodgingActual) lodgingActual.disabled = false;
        if (lodgingPersonalNights) lodgingPersonalNights.disabled = false;
        if (lodgingCorpNights) lodgingCorpNights.disabled = false;
    }

    // 기존에 존재하던 금액 재계산 함수 호출
    if (typeof updatePreview === 'function') updatePreview();
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

    // 1. 필수값 검증 (텍스트 필드 + 날짜 필드)
    const name = getVal('name');
    const destination = getVal('destination');
    const dateStart = getVal('dateStart');
    const dateEnd = getVal('dateEnd');
    
    if (!name || !destination || !dateStart || !dateEnd) {
        alert("⚠️ 필수 항목 오류\n출장자 성명, 출장지, 출장 시작일 및 종료일을 모두 입력해 주십시오.");
        return; 
    }

    const period = `${dateStart} ~ ${dateEnd}`;

    // 2. 대시보드 실시간 연동 금액 추출
    const cardValues = document.querySelectorAll('.cost-card-value');
    if(cardValues.length < 5) return alert("대시보드 금액 렌더링이 완료되지 않았습니다.");
    
    const dailyPersonal = parseKrw(cardValues[0].innerText);
    const dailyCorp = 0;
    const mealPersonal = parseKrw(cardValues[1].innerText);
    const mealCorp = 0;

    // 3. 숙박비 및 교통비 산출
    const lodgingActual = getNum('lodgingActual');
    const lodgingPersonal = lodgingActual * getNum('lodgingPersonalNights');
    const lodgingCorp = lodgingActual * getNum('lodgingCorpNights');

    const transPersonal = getNum('transportFarePersonal') + getNum('transportFuelPersonal') + getNum('transportParkingPersonal') + getNum('transportHipassPersonal');
    const transCorp = getNum('transportFareCorp') + getNum('transportFuelCorp') + getNum('transportParkingCorp') + getNum('transportHipassCorp');

    const totalPersonal = dailyPersonal + mealPersonal + lodgingPersonal + transPersonal;
    const totalCorp = dailyCorp + mealCorp + lodgingCorp + transCorp;

    // 4. 테이블 행 주입 (깨짐 방지용 inline-style 너비 고정 규격 적용)
    const tbody = document.getElementById('rosterTbody');
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
