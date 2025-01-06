const { ipcRenderer, contextBridge} = require('electron');

console.log('Preload script carregado');


// Expondo funções seguras para o contexto da janela
contextBridge.exposeInMainWorld('electronAPI', {
    // Pegar as Portas disponiveis do PC do Usuario
    onSerialPorts: (callback) => ipcRenderer.on('serial-ports', (_event, ports) => callback(ports)),
    //Envia as portas para o Front end
    sendSelectPort: (port) => ipcRenderer.send('select-port', port),
    // Pega os Dados ECG que o ESP32 forneceu via USB
    onEcgData: (callback) => ipcRenderer.on('ecg-data', (_event, data) => callback(data)),
    // Envia os Dados ECG para o Front end
    send: (channel, data) => ipcRenderer.send(channel, data),
    // Certifica se existe Portas disponiveis no PC do usuario
    on: (channel, func) => {
        ipcRenderer.on(channel, (_event, ...args) => func(...args));
    },
    //Função do Electron
    navigateTo: (path) => ipcRenderer.send('navigate-to', path),
});
