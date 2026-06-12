/**
 * 어플리케이션 UI 초기화 및 이벤트 리스너 관리 매니저
 * @author Full-Stack Developer
 */

 $(() => {
    // 1. 증빙 첨부파일 컴포넌트 업로드 엔진 셋업
    new WizUpload.Upload({
            selector: 'file',
            uploadUrl: '/hr/file/ajax/upload',
            maxFileSize: 25,
    });

    // 2. 시간/날짜 입력 모듈 인스턴스 할당
    $('.timepicker').timepicker();
    DateUtils.initDatePicker(['input[name="bsnsTrStartDate"]', 'input[name="bsnsTrEndDate"]']);

    // 3. 개별 비용 입력 감지 바인딩 인터셉터
    $(document).on('input change','[name^="costs["]', fnProcessParseNumberToCurrency);

    // 4. 초기 마운트 시 기본 환경 적재 데이터 바인딩 로드
    fnResetCompanion();
    fnResetCompanionCosts();
    fnApprovalLineLoad();
    fnNoticeLoad();

    // 5. 동행자 뱃지 단추 제거 바인딩 라이브러리 리스너
    $(document).on('click', 'button[data-companion-key]', function () {
        const memberId = $(this).data('companion-key');
        $(this).closest('.badge').remove();
        $(`[data-companion-key="${memberId}"]`).remove();
        requestNameJoin();
        fnSetCompanionCosts();
    });
});

function fnUpdateMemberId(){
    fnResetCompanion();
    fnResetCompanionCosts();
}

function fnResetCompanion(){
    $('div.companionArea').empty();
    $('div.companion-btn-area').empty();
    const data = FormUtils.getFormData().data;
    fnCbCompanionSingleSelect(data);
    $('.btn-delete-member').remove();
}

function fnOpenCompanionMemberSingleSelect() {
    const data = { searchType: 'ALL', callback:'fnCbCompanionSingleSelect' }
    CommonUtils.layerHandler('/hr/member/cmn/single-select', data, 'modalMemberSingleSelect', 'static');
}

function fnCbCompanionSingleSelect(result) {
    const memberArea = $('div.companionArea');
    const memberBtnArea = $('div.companion-btn-area');
    if ($(`[data-companion-key="${result.memberId}"]`).length > 0) {
        AlertUtils.flashAlertText('이미 선택되었습니다.')
        return;
    }

    const membersHtml =
        `<div class="member" data-companion-key="${result.memberId}">
            <input type="hidden" name="companions[].memberId" value="${result.memberId}"/>
            <input type="hidden" name="companions[].memberName" value="${result.memberName}"/>
            <input type="hidden" name="companions[].memberDept" value="${result.memberDept||''}"/>
            <input type="hidden" name="companions[].memberDuty" value="${result.memberDuty||''}"/>
            <input type="hidden" name="companions[].memberPosition" value="${result.memberPosition||''}"/>
        </div>`

    const btnTitle = result.memberDeptName ? `${result.memberName}(${result.memberDeptName})` : `${result.memberName}`
    const memberRequestBtn =
        `<div class="badge bg-primary bg-opacity-75 d-inline-flex align-items-center me-1 mb-1 p-2 text-white" style="border-radius:4px;">${btnTitle}
            <button type="button" class="btn-close btn-close-white ms-2 btn-delete-member" data-companion-key="${result.memberId}" style="font-size:10px;"></button>
        </div>`;
    memberArea.append(membersHtml);
    memberBtnArea.append(memberRequestBtn);

    requestNameJoin();
    fnSetCompanionCosts();
}

function requestNameJoin() {
    const joinedNames = $('[name=companions\\[\\]\\.memberName]').map(function () { return $(this).val(); }).get().join(', ');
    $('input.companion-select-name').val(joinedNames);
}

function fnSetCompanionCosts(){
    fnResetCompanionCosts();
    const data = FormUtils.getFormData().data;
    const companions = data.companions;
    const costsArea = $('#companionCosts');
    for(const companion of companions){
        if(companion.memberId !== data.memberId){
            const membersHtml = `
        <tr class="costs">
            <input type="hidden" name="costs[].memberId" value="${companion.memberId}">
            <input type="hidden" name="costs[].memberName" value="${companion.memberName}">
            <td><strong>${companion.memberName}</strong></td>
            <td><input type="text" name="costs[].dayCost" class="form-control text-end" value="0" maxlength="9"></td>
            <td><input type="text" name="costs[].foodCost" class="form-control text-end" value="0" maxlength="9"></td>
            <td><input type="text" name="costs[].stayCost" class="form-control text-end" value="0" maxlength="9"></td>
            <td><input type="text" name="costs[].transCost" class="form-control text-end" value="0" maxlength="9"></td>
            <td><input type="text" name="costs[].otherCost" class="form-control text-end" value="0" maxlength="9"></td>
            <td><input type="text" name="costs[].totalCost" class="form-control text-end bg-light fw-semibold" value="0" readonly></td>
        </tr>`;
            costsArea.append(membersHtml);
        }
    }
}

function fnResetCompanionCosts(){
    const costsArea = $('#companionCosts').empty();
    const data = FormUtils.getFormData().data;
    const membersHtml = `
        <tr class="costs">
            <input type="hidden" name="costs[].memberId" value="${data.memberId}">
            <input type="hidden" name="costs[].memberName" value="${data.memberName}">
            <td><strong>${data.memberName} (신청자)</strong></td>
            <td><input type="text" name="costs[].dayCost" class="form-control text-end" value="0" maxlength="9"></td>
            <td><input type="text" name="costs[].foodCost" class="form-control text-end" value="0" maxlength="9"></td>
            <td><input type="text" name="costs[].stayCost" class="form-control text-end" value="0" maxlength="9"></td>
            <td><input type="text" name="costs[].transCost" class="form-control text-end" value="0" maxlength="9"></td>
            <td><input type="text" name="costs[].otherCost" class="form-control text-end" value="0" maxlength="9"></td>
            <td><input type="text" name="costs[].totalCost" class="form-control text-end bg-light fw-semibold" value="0" readonly></td>
        </tr>`;
    costsArea.append(membersHtml);
    fnResetTotalCost();
}

const fnApprovalLineLoad = () => {
    AjaxUtils.get(`/hr/user/att/att-request/task-approval-line/bsns_tr_rprt`, {}, {hideBeforeSpinner: true})
        .then(function (html) {
            $('.approvalArea').empty().append(html);
            const items = document.querySelectorAll('.approvalArea .approvalItem');
            if(items.length === 0) return;
            const names = Array.from(items).map(item => item.querySelector('input[name$="approvalName"]').value).join(', ');
            $('[name=approvalDto\\.approvalLine]').val(names);
            $('.btn-approval-line').remove();
        });
}

const fnNoticeLoad = () => {
    AjaxUtils.get(`/hr/user/att/att-request/task-notice/bsns_tr_rprt`, {}, {hideBeforeSpinner: true})
        .then(function (html) {
            if(html){
                $('#editor').empty().append(html);
                CKEditor.Viewer('#editor');
            }else{
                $('#cardNotice').hide();
            }
        });
}