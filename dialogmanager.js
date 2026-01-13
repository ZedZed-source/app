// dialogManager.js - Reusable dialog system
console.log("Dialog Manager loaded");

// Store all active dialogs
const activeDialogs = new Set();

// Create a confirmation dialog
function createConfirmationDialog(options) {
    return new Promise((resolve) => {
        const dialogId = 'dialog-' + Date.now();
        
        // Create dialog element
        const dialog = document.createElement('div');
        dialog.id = dialogId;
        dialog.className = 'custom-dialog-overlay';
        dialog.innerHTML = `
            <div class="custom-dialog">
                <div class="dialog-header">
                    <h3>${options.title || 'Confirmation'}</h3>
                </div>
                <div class="dialog-body">
                    <p>${options.message}</p>
                    ${options.details ? `<p class="dialog-details">${options.details}</p>` : ''}
                </div>
                <div class="dialog-footer">
                    <button class="dialog-btn btn-secondary" data-action="cancel">
                        ${options.cancelText || 'Cancel'}
                    </button>
                    <button class="dialog-btn ${options.danger ? 'btn-danger' : ''}" data-action="confirm">
                        ${options.confirmText || 'Confirm'}
                    </button>
                </div>
            </div>
        `;
        
        // Add to page
        document.body.appendChild(dialog);
        activeDialogs.add(dialogId);
        
        // Handle button clicks
        dialog.addEventListener('click', function(e) {
            const target = e.target;
            
            // Click outside dialog (on overlay)
            if (target === dialog) {
                closeDialog(dialogId);
                resolve(false);
                return;
            }
            
            // Click on button
            if (target.hasAttribute('data-action')) {
                const action = target.getAttribute('data-action');
                closeDialog(dialogId);
                resolve(action === 'confirm');
            }
        });
    });
}

// Create a simple alert dialog
function createAlertDialog(title, message) {
    return new Promise((resolve) => {
        const dialogId = 'dialog-' + Date.now();
        
        const dialog = document.createElement('div');
        dialog.id = dialogId;
        dialog.className = 'custom-dialog-overlay';
        dialog.innerHTML = `
            <div class="custom-dialog">
                <div class="dialog-header">
                    <h3>${title}</h3>
                </div>
                <div class="dialog-body">
                    <p>${message}</p>
                </div>
                <div class="dialog-footer">
                    <button class="dialog-btn" data-action="ok">OK</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(dialog);
        activeDialogs.add(dialogId);
        
        dialog.addEventListener('click', function(e) {
            const target = e.target;
            
            if (target === dialog || target.hasAttribute('data-action')) {
                closeDialog(dialogId);
                resolve();
            }
        });
    });
}

// Create a prompt dialog (for input)
function createPromptDialog(options) {
    return new Promise((resolve) => {
        const dialogId = 'dialog-' + Date.now();
        
        const dialog = document.createElement('div');
        dialog.id = dialogId;
        dialog.className = 'custom-dialog-overlay';
        dialog.innerHTML = `
            <div class="custom-dialog">
                <div class="dialog-header">
                    <h3>${options.title || 'Input'}</h3>
                </div>
                <div class="dialog-body">
                    <p>${options.message}</p>
                    <input type="text" 
                           id="${dialogId}-input" 
                           class="dialog-input" 
                           value="${options.defaultValue || ''}" 
                           placeholder="${options.placeholder || ''}">
                </div>
                <div class="dialog-footer">
                    <button class="dialog-btn btn-secondary" data-action="cancel">
                        ${options.cancelText || 'Cancel'}
                    </button>
                    <button class="dialog-btn" data-action="confirm">
                        ${options.confirmText || 'OK'}
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(dialog);
        activeDialogs.add(dialogId);
        
        // Focus input
        setTimeout(() => {
            const input = document.getElementById(`${dialogId}-input`);
            if (input) input.focus();
        }, 100);
        
        dialog.addEventListener('click', function(e) {
            const target = e.target;
            
            if (target === dialog) {
                closeDialog(dialogId);
                resolve(null);
                return;
            }
            
            if (target.hasAttribute('data-action')) {
                const action = target.getAttribute('data-action');
                const input = document.getElementById(`${dialogId}-input`);
                
                closeDialog(dialogId);
                
                if (action === 'confirm' && input) {
                    resolve(input.value.trim());
                } else {
                    resolve(null);
                }
            }
        });
        
        // Handle Enter key
        dialog.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const input = document.getElementById(`${dialogId}-input`);
                if (input) {
                    closeDialog(dialogId);
                    resolve(input.value.trim());
                }
            }
        });
    });
}

// Close a specific dialog
function closeDialog(dialogId) {
    const dialog = document.getElementById(dialogId);
    if (dialog) {
        dialog.remove();
        activeDialogs.delete(dialogId);
    }
}

// Close all dialogs
function closeAllDialogs() {
    activeDialogs.forEach(dialogId => {
        const dialog = document.getElementById(dialogId);
        if (dialog) {
            dialog.remove();
        }
    });
    activeDialogs.clear();
}

// Make functions available globally
window.dialogManager = {
    confirm: createConfirmationDialog,
    alert: createAlertDialog,
    prompt: createPromptDialog,
    closeAll: closeAllDialogs
};

// Close dialogs on escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && activeDialogs.size > 0) {
        closeAllDialogs();
    }
});

// Auto-initialize
console.log("Dialog Manager ready");