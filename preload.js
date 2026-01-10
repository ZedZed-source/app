// preload.js - Add dialog functions
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    showDialog: (options) => ipcRenderer.invoke('show-dialog', options),
    showAlert: (message) => ipcRenderer.invoke('show-alert', message)
});

console.log('Preload script loaded with dialog API');