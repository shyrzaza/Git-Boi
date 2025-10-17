const ipc = require('electron').ipcRenderer;
var term = new Terminal();

const fitAddon = new FitAddon.FitAddon();
term.loadAddon(fitAddon);

term.open(document.getElementById('terminal'));
fitAddon.fit();
// Send initial dimensions to main process
ipc.send('terminal.resize', { cols: term.cols, rows: term.rows });

ipc.on('terminal.incomingData', (event, data) => {
    term.write(data);
});

term.onData((data) => {
    ipc.send('terminal.keystroke', data);
});

window.addEventListener('resize', () => {
    fitAddon.fit();
    // Send new dimensions to main process
    ipc.send('terminal.resize', { cols: term.cols, rows: term.rows });
});
