const path = require('path');
const { app, BrowserWindow } = require('electron');

function createMainWindow() {
    const mainWindow = new BrowserWindow({
        title: 'Fitness Calendar',
        width: 1200,  // MUST match your CSS container width
        height: 850,  // MUST match your CSS min-height: 850px
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true
        }
    });

    mainWindow.loadFile(path.join(__dirname, 'index.html'));
    // Open DevTools for debugging
    //mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
    createMainWindow();
});