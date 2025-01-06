const { app, BrowserWindow, ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');
const { SerialPort } = require('serialport');  // Importa a biblioteca serialport

let serialPort;
let ecgData = [];

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        fullscreen: false,
        webPreferences: {
            preload: path.join(__dirname, '/painel/ECG/preload.js'),
            contextIsolation: true, // Habilita para segurança
            nodeIntegration: false,
            enableRemoteModule: false, // Evita nodeIntegration por segurança
        }
    });

    win.loadFile('index.html').catch((err) => {
        console.error("Erro ao carregar index.html:", err.message);
    });

    // Monitorar carregamento de páginas
    win.webContents.on('did-navigate', (event, url) => {
        console.log("Página carregada:", url);

        if (url.includes('ECG.html')) {
            console.log("Página ECG carregada. Iniciando conexão com porta serial...");

            // Lista as portas seriais disponíveis
            SerialPort.list()
                .then((ports) => {
                    console.log("Portas seriais disponíveis:", ports); // Log das portas listadas

                    // Envia as portas seriais para o renderer process
                    win.webContents.send('serial-ports', ports);
                    console.log("Portas enviadas para o renderer process.");

                    // Aguardar o usuário selecionar a porta
                    ipcMain.once('select-port', (event, selectedPort) => {
                        console.log("Porta selecionada pelo usuário:", selectedPort);

                        if (selectedPort) {
                            // Conecta à porta serial escolhida
                            console.log(`Tentando conectar à porta ${selectedPort.path}...`);
                            const serialPort = new SerialPort({
                                path: selectedPort.path,
                                baudRate: 115200
                            });

                            serialPort.on('data', (data) => {
                                const message = data.toString();
                                console.log('Dados recebidos da porta serial:', message);

                                // Processa os dados recebidos
                                const [ecgValue, timestamp] = message.split(',');
                                if (ecgValue && timestamp) {
                                    console.log("Dados processados:", { ecgValue, timestamp });

                                    ecgData.push({
                                        ecgValue: parseInt(ecgValue),
                                        timestamp: parseInt(timestamp)
                                    });

                                    // Limitar os dados armazenados (por exemplo, manter apenas os últimos 100 pontos)
                                    if (ecgData.length > 100) {
                                        ecgData.shift(); // Remove o primeiro item para não sobrecarregar a memória
                                    }

                                    // Envia os dados para o renderer process
                                    win.webContents.send('ecg-data', {
                                        ecgValue: parseInt(ecgValue),
                                        timestamp: parseInt(timestamp)
                                    });
                                } else {
                                    console.warn("Mensagem recebida com formato inválido:", message);
                                }
                            });

                            serialPort.on('error', (err) => {
                                console.error("Erro na porta serial:", err.message);
                            });

                            console.log(`Conexão estabelecida com a porta serial: ${selectedPort.path}`);
                        } else {
                            console.error('Nenhuma porta selecionada pelo usuário.');
                        }
                    });
                })
                .catch((err) => {
                    console.error('Erro ao listar portas seriais:', err.message);
                });
        }
    });
}


// Criação da janela principal
app.whenReady().then(() => {
    createWindow();
});

// Fecha o app quando todas as janelas são fechadas (exceto no macOS)
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // Recria uma janela se não houver nenhuma aberta
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// IPC para salvar capturas
ipcMain.handle('save-all-snapshots', async (event, snapshots) => {
    const saveDir = path.join(app.getPath('documents'), 'Capturas_ECG');

    // Cria a pasta se não existir
    try {
        if (!fs.existsSync(saveDir)) {
            fs.mkdirSync(saveDir, { recursive: true });
        }

        // Salva cada snapshot
        snapshots.forEach((dataURL, index) => {
            try {
                const base64Data = dataURL.replace(/^data:image\/png;base64,/, '');
                const filePath = path.join(saveDir, `snapshot_${index + 1}.png`);
                fs.writeFileSync(filePath, base64Data, 'base64');
            } catch (err) {
                console.error(`Erro ao salvar snapshot_${index + 1}:`, err.message);
            }
        });

        return { success: true, message: 'Snapshots salvos com sucesso!' };
    } catch (err) {
        console.error("Erro ao criar diretório ou salvar snapshots:", err.message);
        return { success: false, message: 'Erro ao salvar snapshots.' };
    }
});

// IPC para navegar entre páginas
ipcMain.on('navigate-to', (event, filePath) => {
    try {
        const win = BrowserWindow.getFocusedWindow();
        if (!win) {
            console.error("Nenhuma janela está focada para carregar o arquivo.");
            return;
        }

        const fullPath = path.join(__dirname, filePath);
        win.loadFile(fullPath).catch((err) => {
            console.error("Erro ao carregar o arquivo:", err.message);
        });
    } catch (err) {
        console.error("Erro na navegação:", err.message);
    }
});
