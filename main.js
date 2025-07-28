
const {app, BrowserWindow, ipcMain} = require('electron');
const pty = require('node-pty');
const os = require('os');
const path = require('path');
const fs = require('fs');

// Check if the app is running in development mode
if (process.env.NODE_ENV === 'development') {
  require('electron-reload')(__dirname, {
    electron: require(`${__dirname}/node_modules/electron`)
  });
}
app.disableHardwareAcceleration();
const WebSocket = require('ws');

function loadConfig() {
  try {
    const data = fs.readFileSync(configPath, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Failed to read config file:', err);
    // fallback to default
    return {
      customPath: os.platform() === 'win32' ? 'C:\\Program Files\\Git\\bin\\bash.exe' : 'bash'
    };
  }
}






const configPath = path.join(app.getPath('userData'), 'config.json');
const config = loadConfig();

var shell = config.customPath;;
let wss;
let mainWindow;
let ptyProcess;


const windowStatePath = path.join(app.getPath('userData'), 'window-state.json');

// Load window state
function loadWindowState() {
  try {
    return JSON.parse(fs.readFileSync(windowStatePath, 'utf8'));
  } catch (e) {
    // Default size if file doesn't exist or is malformed
    return {
      width: 800,
      height: 600,
      x: 0,
      y: 0    
    };
  }
}

// Save window state
function saveWindowState(window) {
  if (!window.isDestroyed()) {
    const bounds = window.getBounds();
    fs.writeFileSync(windowStatePath, JSON.stringify(bounds));
  }
}


function createWindow () {
    const savedState = loadWindowState();

    mainWindow = new BrowserWindow({
        width: savedState.width,
        height: savedState.height,
        x: savedState.x,
        y: savedState.y,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
            contextIsolation: false,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    mainWindow.setMenuBarVisibility(false);

    mainWindow.loadURL('file://' + __dirname + '/index.html');

    mainWindow.on('close', function () {
        saveWindowState(mainWindow);
    });

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