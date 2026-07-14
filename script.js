document.addEventListener('DOMContentLoaded', () => {
    const actionBtn = document.getElementById('action-btn');
    const messageEl = document.getElementById('message');
    if (actionBtn && messageEl) {
        actionBtn.addEventListener('click', () => {
            messageEl.textContent = '버튼이 성공적으로 클릭되었습니다! 기능이 정상 작동합니다.';
        });
    }
});
