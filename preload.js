const { remote } = require('electron');

let currWindow = remote.BrowserWindow.getFocusedWindow();

window.closeCurrentWindow = () => {
    if (currWindow) {
        currWindow.close();
    }
}