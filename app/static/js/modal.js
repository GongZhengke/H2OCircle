class ConfirmModal {
    constructor() {
        this.createModal();
    }

    createModal() {
        this.modal = document.createElement('div');
        this.modal.className = 'modal-backdrop';
        this.modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                </div>
                <h3 class="modal-title"></h3>
                <p class="modal-message"></p>
                <div class="modal-actions">
                    <button class="modal-btn cancel">取消</button>
                    <button class="modal-btn confirm">确认删除</button>
                </div>
            </div>
        `;
        document.body.appendChild(this.modal);

        // 点击背景关闭
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.hide();
            }
        });

        // ESC 键关闭
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.classList.contains('active')) {
                this.hide();
            }
        });
    }

    show({ title, message, onConfirm }) {
        this.modal.querySelector('.modal-title').textContent = title;
        this.modal.querySelector('.modal-message').textContent = message;
        
        const confirmBtn = this.modal.querySelector('.modal-btn.confirm');
        const cancelBtn = this.modal.querySelector('.modal-btn.cancel');

        // 清除之前的事件监听
        const newConfirmBtn = confirmBtn.cloneNode(true);
        const newCancelBtn = cancelBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
        cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);

        // 添加新的事件监听
        newConfirmBtn.addEventListener('click', async () => {
            newConfirmBtn.disabled = true;
            try {
                await onConfirm();
                this.hide();
            } catch (error) {
                console.error('确认操作失败:', error);
            } finally {
                newConfirmBtn.disabled = false;
            }
        });

        newCancelBtn.addEventListener('click', () => this.hide());

        this.modal.classList.add('active');
    }

    hide() {
        this.modal.classList.remove('active');
    }
}

const confirmModal = new ConfirmModal(); 