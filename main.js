const path = require('path');
const { app, BrowserWindow, ipcMain, dialog } = require('electron');

function createMainWindow() {
    const mainWindow = new BrowserWindow({
        title: 'Fitness',
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            // Enable localStorage persistence
            enableRemoteModule: false,
            sandbox: false
        }
    });

    // Open DevTools for debugging
    mainWindow.webContents.openDevTools();
    
    mainWindow.loadFile(path.join(__dirname, 'index.html'));
    
    // Handle window close to ensure data is saved
    mainWindow.on('close', (e) => {
        console.log("Window closing...");
        // You could add a save confirmation here if needed
    });
}

// Add dialog handlers
ipcMain.handle('show-dialog', async (event, options) => {
    const result = await dialog.showMessageBox({
        type: 'question',
        buttons: options.buttons || ['OK', 'Cancel'],
        defaultId: 0,
        title: options.title || 'Input',
        message: options.message || '',
        detail: options.detail || ''
    });
    
    return { response: result.response };
});

ipcMain.handle('show-alert', async (event, message) => {
    await dialog.showMessageBox({
        type: 'info',
        buttons: ['OK'],
        title: 'Alert',
        message: message
    });
});

app.whenReady().then(() => {
    createMainWindow();
});

// Quit when all windows are closed
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});