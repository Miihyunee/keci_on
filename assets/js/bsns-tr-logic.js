/**
 * KECI ON - 출장복명 기능 제어 코어 비즈니스 스크립트
 */

$(document).ready(function() {
    // 내부 시간 입력 및 이벤트 활성화 초기화 
    if ($.fn.timepicker) {
        $('.timepicker').timepicker({
            timeFormat: 'HH:mm',
            interval: 30,
            minTime: '00:00',
            maxTime: '23:30',
            dynamic: false,
            dropdown: true,
            scrollbar: true
        });
    }

    // 통화 단위 자동 환산 및 인풋 이벤트 가동
    $(document).on('input change', '[name^="costs["]', fnProcessParseNumberToCurrency);

    // 기본 비용 테이블 행 초기 렌더링 수행
    fnResetCompanionCosts();
});

/**
 * 실시간 개별/종합 여비 계산식 로직 
 */
function fnProcessParseNumberToCurrency(event) {
    if (window.StringUtils && typeof StringUtils.numberCurrency === 'function') {
        StringUtils.numberCurrency(event);
    }
    event.target.value = event.target.value || '0';
    fnCalcSum();

    function fnCalcSum() {
        const $cost = $(event.target).closest('.costs');
        const $costElems = $cost.find('input[name^="costs["][type=text]').not('[name$=totalCost]');
        let companionSum = 0;
        
        $costElems.each((idx, elem) => { 
            companionSum += Number(window.StringUtils ? StringUtils.unComma($(elem).val()) : $(elem).val()); 
        });
        
        const result = window.StringUtils ? StringUtils.numberFormat(companionSum) : companionSum;
        $cost.find('input[name$=totalCost]').val(result);

        const costTypeName = $(event.target).attr('name').replaceAll('costs[].','');
        const $costTypeElems = $(`input[name="costs[].${costTypeName}"]`);
        let costTypeSum = 0;
        $costTypeElems.each((idx, elem) => { 
            costTypeSum += Number(window.StringUtils ? StringUtils.unComma($(elem).val()) : $(elem).val()); 
        });
        
        const result2 = window.StringUtils ? StringUtils.numberFormat(costTypeSum) : costTypeSum;
        $(`[name=${costTypeName}]`).val(result2);

        const $totalElems = $('#companionCosts').find('input[name^="costs[].totalCost"]');
        let totalSum = 0;
        $totalElems.each((idx, elem) => { 
            totalSum += Number(window.StringUtils ? StringUtils.unComma($(elem).val()) : $(elem).val()); 
        });
        
        const result3 = window.StringUtils ? StringUtils.numberFormat(totalSum) : totalSum;
        $('input[name="totalCost"]').val(result3);
    }
}

/**
 * 기본 비용 행 테이블 동적 초기화 함수 
 */
function fnResetCompanionCosts() {
    const costsArea = $('#companionCosts').empty();
    const currentMemberName = $('input[name="memberName"]').val() || "신청자";
    const currentMemberId = $('input[name="memberId"]').val() || "10797";

    const membersHtml = `
        <tr class="costs">
            <input type="hidden" name="costs[].memberId" value="${currentMemberId}">
            <input type="hidden" name="costs[].memberName" value="${currentMemberName}">
            <td><strong>${currentMemberName} (본인)</strong></td>
            <td><input type="text" name="costs[].dayCost" class="form-control text-end" value="0" maxlength="9"></td>
            <td><input type="text" name="costs[].foodCost" class="form-control text-end" value="0" maxlength="9"></td>
            <td><input type="text" name="costs[].stayCost" class="form-control text-end" value="0" maxlength="9"></td>
            <td><input type="text" name="costs[].transCost" class="form-control text-end" value="0" maxlength="9"></td>
            <td><input type="text" name="costs[].otherCost" class="form-control text-end" value="0" maxlength="9"></td>
            <td><input type="text" name="costs[].totalCost" class="form-control text-end bg-light fw-bold" value="0" readonly></td>
        </tr>`;
    costsArea.append(membersHtml);
}

/**
 * 레이어 팝업 목업 가상 연동 인터페이스 함수 정의
 */
function fnOpenModalMemberSingleSelect() { Swal.fire('안내', '신청자 조회 검색 팝업 시스템 모듈 연동 영역입니다.', 'info'); }
function fnOpenModalApprovalLine() { Swal.fire('안내', '승인자 결재선 조회 모듈 연동 영역입니다.', 'info'); }
function fnOpenCompanionMemberSingleSelect() { Swal.fire('안내', '동행자 임직원 추가 모듈 연동 영역입니다.', 'info'); }
function fnOpenModalBsnsTrList() { Swal.fire('안내', '원출장 연동 문서 검색 인터페이스 영역입니다.', 'info'); }

/**
 * 최종 검증 데이터 보존 및 가상 제출 프로세스 함수
 */
function fnSave() {
    const data = {
        domIntlType: $('input[name="domIntlType"]:checked').val(),
        bsnsTrStartDate: $('input[name="bsnsTrStartDate"]').val(),
        location: $('input[name="location"]').val(),
        site: $('input[name="site"]').val()
    };

    if (!data.domIntlType) { Swal.fire('입력 누락', '출장지 구분을 선택하세요.', 'warning'); return; }
    if (!data.bsnsTrStartDate) { Swal.fire('입력 누락', '출장 시작일을 지정하세요.', 'warning'); return; }
    if (!data.location || !data.site) { Swal.fire('입력 누락', '출장지와 방문처는 필수 입력 사항입니다.', 'warning'); return; }

    if (window.AjaxUtils && typeof AjaxUtils.confirmSave === 'function') {
        AjaxUtils.confirmSave('./add', JSON.stringify(data));
    }
}
