const path = require ('path');
const { app, BrowserWindow} = require('electron');
const { create } = require('domain');

function createMainwindow(){

    const mainWindow = new BrowserWindow({
        title: 'Fitness',
        width: 500,
        height: 600,

    });

    mainWindow.loadFile(path.join(__dirname, 'index.html'));

}

app.whenReady().then(() =>{
    createMainwindow()
});