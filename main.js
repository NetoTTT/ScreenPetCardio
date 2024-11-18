const { app, BrowserWindow, ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });
    win.loadFile('index.html');
}

app.whenReady().then(createWindow);

ipcMain.handle('save-all-snapshots', async (event, snapshots) => {
    const saveDir = path.join(app.getPath('documents'), 'Capturas_ECG');

    // Cria a pasta se não existir
    if (!fs.existsSync(saveDir)) {
        fs.mkdirSync(saveDir);
    }

    // Salva cada snapshot como um arquivo PNG na pasta
    snapshots.forEach((dataURL, index) => {
        const base64Data = dataURL.replace(/^data:image\/png;base64,/, '');
        const filePath = path.join(saveDir, `snapshot_${index + 1}.png`);
        fs.writeFileSync(filePath, base64Data, 'base64');
    });
});
