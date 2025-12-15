// toast notification system
class Toast {
    static show(message, type = 'error', duration = 5000) {
        // remove existing toasts
        document.querySelectorAll('.toast-alert').forEach(toast => toast.remove());
        
        // create toast element
        const toast = document.createElement('div');
        toast.className = `toast-alert alert alert-${type} alert-dismissible fade show`;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            min-width: 300px;
            max-width: 400px;
            animation: slideIn 0.3s ease;
        `;
        
        toast.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="fas ${this.getIcon(type)} me-2"></i>
                <div class="flex-grow-1">${message}</div>
                <button type="button" class="btn-close btn-close-white" onclick="this.parentElement.parentElement.remove()"></button>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        // auto-remove after duration
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, duration);
        
        return toast;
    }
    
    static getIcon(type) {
        const icons = {
            'error': 'fa-exclamation-circle',
            'success': 'fa-check-circle',
            'warning': 'fa-exclamation-triangle',
            'info': 'fa-info-circle'
        };
        return icons[type] || 'fa-info-circle';
    }
}

// global helper function
function showErrorToast(message) {
    Toast.show(message, 'error');
}

function showSuccessToast(message) {
    Toast.show(message, 'success', 3000);
}

// add css for animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .toast-alert {
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
    }
`;
document.head.appendChild(style);



class LoadingState {
    static show(button, text = 'Processing...'){
        const originalHTML = button.innerHTML;
        const originalWidth = button.offsetWidth;

        //store orignal state 
        button.dataset.originalHtml = originalHTML;
        button.dataset.originalWidth = originalWidth;

        //set loading state
        button.innerHTML = `
        <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>${text}`;
        button.disabled = true;

        //maintain width to prevent layout shift
        button.style.minWidth = `${originalWidth}px`;
    }
    static hide(button){
        if (button.dataset.originalHtml){
            button.innerHTML = button.dataset.originalHtml;
            button.disabled = false;
            button.style.minWidth = '';

            //clean up
            delete button.dataset.originalHtml;
            delete button.dataset.originalWidth;
        }
    }
    static showGlobal(){
        //create global overlay if not exists
        let overlay = document.getElementById('global-loading-overlay');
        if (!overlay){
            overlay = document.createElement('div');
            overlay.id = 'global-loading-overlay';
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                backdrop-filter: blur(4px);
            `;
            overlay.innerHTML = `
            <div class="text-center">
                <div class="spinner-border text-primary" style="width: 3rem; height: 3rem;"></div>
                    <p class="text-light mt-3">Processing...</p>
            </div>
            `;
            document.body.appendChild(overlay);

        }
        overlay.style.display = 'flex';
    }
    static hideGlobal(){
        const overlay = document.getElementById('global-loading-overlay');
        if (overlay){
            overlay.style.display = 'none';
        }
    }
}