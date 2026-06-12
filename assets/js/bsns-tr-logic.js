/**
 * 출장복명서 핵심 업무 도메인 처리 로직 스크립트
 * @author Full-Stack Developer
 * [유지보수] 기존 스프링 연동을 위한 함수 및 데이터 매핑 원본 로직 온전 전수 유지
 */

// 비용 인풋 실시간 감지 환산 및 합산 연산 함수
function fnProcessParseNumberToCurrency(event) {
    StringUtils.numberCurrency(event);
    event.target.value = event.target.value || '0';
    fnCalcSum();

    function fnCalcSum() {
        const $cost = $(event.target).closest('.costs');
        const $costElems = $cost.find('input[name^="costs["][type=text]').not('[name$=totalCost]');
        let companionSum = 0;
        $costElems.each((idx, elem) => { companionSum += Number(StringUtils.unComma($(elem).val())) });
        const result = StringUtils.numberFormat(companionSum);
        $cost.find('input[name$=totalCost]').val(result);

        const costTypeName = $(event.target).attr('name').replaceAll('costs[].','');
        const $costTypeElems = $(`input[name="costs[].${costTypeName}"]`);
        let costTypeSum = 0;
        $costTypeElems.each((idx, elem) => { costTypeSum += Number(StringUtils.unComma($(elem).val())) });
        const result2 = StringUtils.numberFormat(costTypeSum);
        const $totalCostType = $(`[name=${costTypeName}]`);
        $totalCostType.val(result2);

        const $totalElems = $('#companionCosts').find('input[name^="costs[].totalCost"]');
        let totalSum = 0;
        $totalElems.each((idx, elem) => { totalSum += Number(StringUtils.unComma($(elem).val())) });
        const result3 = StringUtils.numberFormat(totalSum);
        $('input[name="totalCost"]').val(result3);
    }
}

// 데이터 전송 전 입력값 벨리데이션 체크 유틸 함수
function fnValidateData(data) {
    if (StringUtils.isBlank(data.domIntlType)) { AlertUtils.flashAlertText('출장유형(출장지구분)을 선택해주세요', 'warning'); return false; }
    if (StringUtils.isBlank(data.bsnsTrStartDate)) { AlertUtils.flashAlertText('출장 시작일자을 입력해주세요', 'warning'); return false; }
    if (StringUtils.isBlank(data.bsnsTrStartTime) || !TimeUtils.isValidTimeValue(data.bsnsTrStartTime)) { AlertUtils.flashAlertText('출장 시작시간을 확인해주세요', 'warning'); return false; }
    if (StringUtils.isBlank(data.bsnsTrEndDate)) { AlertUtils.flashAlertText('출장 종료일자을 입력해주세요', 'warning'); return false; }
    if (StringUtils.isBlank(data.bsnsTrEndTime) || !TimeUtils.isValidTimeValue(data.bsnsTrEndTime)) { AlertUtils.flashAlertText('출장 종료시간을 확인해주세요', 'warning'); return false; }
    if (data.bsnsTrStartDate > data.bsnsTrEndDate) { AlertUtils.flashAlertText('시작 일자는 종료 일자보다 늦을 수 없습니다.', 'warning'); return false; }
    if (!data.vehicleInfo || data.vehicleInfo.cd.length === 0) { AlertUtils.flashAlertText('교통수단을 선택해주세요', 'warning'); return false; }
    if (StringUtils.isBlank(data.location)) { AlertUtils.flashAlertText('출장지를 입력해주세요', 'warning'); return false; }
    if (StringUtils.isBlank(data.site)) { AlertUtils.flashAlertText('방문처를 입력해주세요', 'warning'); return false; }
    return true;
}

// 원출장 검색 레이어 팝업 핸들러
function fnOpenModalBsnsTrList() {
    const data = {}
    CommonUtils.layerHandler('./modal/bsns-tr-list', data, 'modalBsnsTrList', 'static');
}

// 팝업 콜백 데이터 바인딩 맵퍼
function fnApplyCallBackData(data) {
    const { bsnsTrSeq, memberId, memberName, domIntlType, bsnsTrStartDate, bsnsTrStartTime, bsnsTrEndDate, bsnsTrEndTime, location, site, workDetail } = data;
    $('[name=bsnsTrSeq]').val(bsnsTrSeq);
    $('[name=memberId]').val(memberId).trigger('change');
    $('[name=memberName]').val(memberName).trigger('change');
    $('[name=domIntlType]').filter((idx, elem) => $(elem).val() === domIntlType).prop('checked', true);
    $('[name=bsnsTrStartDate]').val(bsnsTrStartDate);
    $('[name=bsnsTrStartTime]').val(bsnsTrStartTime);
    $('[name=bsnsTrEndDate]').val(bsnsTrEndDate);
    $('[name=bsnsTrEndTime]').val(bsnsTrEndTime);

    const startTime = bsnsTrStartTime?.split(':');
    const endTime = bsnsTrEndTime?.split(':');
    if(startTime) {
        $('[name=bsnsTrStartTime]').parent().find('.ui-timepicker-hour').val(startTime[0]);
        $('[name=bsnsTrStartTime]').parent().find('.ui-timepicker-minute').val(startTime[1]);
    }
    if(endTime) {
        $('[name=bsnsTrEndTime]').parent().find('.ui-timepicker-hour').val(endTime[0]);
        $('[name=bsnsTrEndTime]').parent().find('.ui-timepicker-minute').val(endTime[1]);
    }
    $('[name=location]').val(location);
    $('[name=site]').val(site);
    $('[name=workDetail]').val(workDetail);

    fnGetCompanion(data);
}

// 동행자 수집용 비동기 서브 루틴
function fnGetCompanion(data){
    fnResetCompanion();
    fnResetCompanionCosts();
    AjaxUtils.get(`/hr/user/att/att-request/companion/${data.bsnsTrSeq}`, null, {hideBeforeSpinner: true})
        .then((companions)=>{
            for(const companion of companions){
                if(companion.memberId !== data.memberId){
                    fnCbCompanionSingleSelect(companion);
                    fnSetCompanionCosts(companion);
                }
            }
        });
}

// 대시보드 비용 리셋 유틸리티 함수
function fnResetTotalCost(){
    $('.cost-dashboard-container').find('input').val('0');
}

// 최종 폼 서브밋 제어 및 서포트 비동기 트랜잭션 함수
async function fnSave() {
    if (!!FormUtils.checkSubmit()) return false;
    const {data} = FormUtils.getFormData();
    if (!ApprovalUtils.processApproval(data)) return false;

    const beforeSend = async () => {
        if (StringUtils.isBlank(data.memberId)) { AlertUtils.flashAlertText('신청자를 선택해주세요', 'warning'); return false; }
        return await Promise.resolve(fnValidateData(data));
    }

    const options = { success: res => { AlertUtils.flashAlert(res.title, res.description, res.icon, res.callback); } }
    const valid = await beforeSend();
    if (!valid) return;

    AjaxUtils.confirmSave('./add', JSON.stringify(data), options);
}