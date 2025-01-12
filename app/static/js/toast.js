class Toast {
    constructor() {
        this.container = null;
        this.createContainer();
    }

    createContainer() {
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.className = 'toast-container';
            document.body.appendChild(this.container);
        }
    }

    show(options) {
        const {
            type = 'info',
            title = '',
            message = '',
            duration = 3000
        } = options;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        const icons = {
            success: `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2">
                        <path d="M20 6L9 17L4 12"></path>
                     </svg>`,
            info: `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12" y2="8"></line>
                   </svg>`,
            warning: `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" stroke-width="2">
                        <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                     </svg>`,
            error: `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="2">
                     <circle cx="12" cy="12" r="10"></circle>
                     <line x1="15" y1="9" x2="9" y2="15"></line>
                     <line x1="9" y1="9" x2="15" y2="15"></line>
                    </svg>`
        };

        toast.innerHTML = `
            ${icons[type]}
            <div class="toast-content">
                ${title ? `<div class="toast-title">${title}</div>` : ''}
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 6L6 18M6 6l12 12"></path>
                </svg>
            </button>
        `;

        this.container.appendChild(toast);

        const close = () => {
            toast.classList.add('removing');
            setTimeout(() => {
                this.container.removeChild(toast);
            }, 300);
        };

        toast.querySelector('.toast-close').addEventListener('click', close);

        if (duration) {
            setTimeout(close, duration);
        }
    }

    success(message, title = '成功') {
        this.show({ type: 'success', title, message });
    }

    info(message, title = '提示') {
        this.show({ type: 'info', title, message });
    }

    warning(message, title = '警告') {
        this.show({ type: 'warning', title, message });
    }

    error(message, title = '错误') {
        this.show({ type: 'error', title, message });
    }
}

const toast = new Toast(); 