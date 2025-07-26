
const {app, BrowserWindow, ipcMain} = require('electron');
const pty = require('node-pty');
const os = require('os');
const path = require('path');
require("electron-reload")(__dirname);
app.disableHardwareAcceleration();
const WebSocket = require('ws');

var shell = os.platform() === 'win32' ? 'C:\\Program Files\\Git\\bin\\bash.exe' : 'bash';
let wss;


let mainWindow;
let ptyProcess;

function createWindow () {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
            contextIsolation: false,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    mainWindow.setMenuBarVisibility(false);

    mainWindow.loadURL('file://' + __dirname + '/index.html');

    mainWindow.on('closed', function () {
        mainWindow = null;
    });

    ptyProcess = pty.spawn(shell, [], {
        name: 'xterm-color',
        cols: 80,
        rows: 30,
        cwd: process.env.HOME,
        env: process.env
    });

    ptyProcess.on('data', function(data) {
        mainWindow.webContents.send('terminal.incomingData', data);
    });
    ipcMain.on('terminal.keystroke', (event, data) => {
        ptyProcess.write(data);
    }); 
}

app.on('ready', () => {
    createWindow();

    wss = new WebSocket.Server({ port: 3000 });
    wss.on('connection', ws => {
        ws.on('message', message => {

            // Deconstruct message into json dict
            messageDict = JSON.parse(message);
            switch (messageDict["cmd"]) {
                case 'command':
                    terminal_command = messageDict["terminalcommand"].toString('utf8');
                    ptyProcess.write(terminal_command + '\n');
                    break;
                case 'open':
                    path_to_open = messageDict["path"].toString('utf8');
                    ptyProcess.write('cd ' + '\"' + path_to_open + '\"' + '\n');
                    // ptyProcess.write("hello");
                    break;

                default:
                    console.error('Unknown message type:', messageDict.cmd);
            }
        });
    });

    // Listen for keystrokes from renderer and broadcast to all clients
    ipcMain.on('terminal.keystroke', (event, data) => {
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(data);
            }
        });
    });
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
app.on('activate', function () { 
    if (mainWindow === null) {
        createWindow();
    }
});