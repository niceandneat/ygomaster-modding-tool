import { BrowserWindow, Session, app, dialog, net, protocol } from 'electron';
import log from 'electron-log/main';
import path from 'path';
import { pathToFileURL } from 'url';

import { handleIpc } from './ipc';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

// Static file serve for `static://` protocol
// https://github.com/electron/electron/issues/23393#issuecomment-1937592773
// https://www.electronjs.org/docs/latest/api/protocol#protocolhandlescheme-handler
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'static',
    privileges: {
      secure: true,
      supportFetchAPI: true,
      bypassCSP: true,
    },
  },
]);
const handleStaticProtocol = (session: Session) => {
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    session.protocol.handle('static', (req) => {
      const { host, pathname } = new URL(req.url);
      const filePath = path.join(host, pathname);

      // Relay requests to dev server
      return net.fetch(`${MAIN_WINDOW_VITE_DEV_SERVER_URL}/${filePath}`, {
        method: req.method,
        headers: req.headers,
        body: req.body,
      });
    });
  } else {
    session.protocol.handle('static', (req) => {
      const { host, pathname } = new URL(req.url);
      const filePath = path.join(
        __dirname,
        `../renderer/${MAIN_WINDOW_VITE_NAME}`,
        host,
        pathname,
      );

      // Access post-build static files
      return net.fetch(pathToFileURL(filePath).toString());
    });
  }
};

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
    // mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    );
  }

  // make 'beforeunload' event work
  mainWindow.webContents.on('will-prevent-unload', (event) => {
    const response = dialog.showMessageBoxSync(mainWindow, {
      message: 'Are you sure you want to leave?',
      detail: 'Changes that you made may not be saved.',
      buttons: ['Leave', 'Stay'],
      cancelId: 1,
    });
    if (response === 0) event.preventDefault();
  });

  return mainWindow;
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  const mainWindow = createWindow();
  handleStaticProtocol(mainWindow.webContents.session);
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Set up logger
// https://github.com/megahertz/electron-log/blob/master/docs/initialize.md
log.initialize();
log.errorHandler.startCatching();
log.transports.file.resolvePathFn = (variables) => {
  return path.join(app.getPath('userData'), variables.fileName || 'main.log');
};
log.transports.file.inspectOptions.maxArrayLength = 3;
console.error = log.error;

handleIpc(app);
