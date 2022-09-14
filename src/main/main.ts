/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import {
  app,
  BrowserWindow,
  shell,
  ipcMain,
  dialog,
  webContents,
} from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';

autoUpdater.autoDownload = false;

autoUpdater.requestHeaders = {
  'Cache-Control':
    'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
};

autoUpdater.on('error', (error) => {
  dialog.showErrorBox(
    'Error: ',
    error == null ? 'unknown' : (error.stack || error).toString()
  );
});

autoUpdater.on('update-available', () => {
  dialog
    .showMessageBox({
      title: '업데이트 확인',
      message: '새로운 업데이트가 있습니다. 지금 다운로드 받으시겠습니까?',
      icon: path.join(__dirname, '../../renderer/img/favicon.ico'),
      buttons: ['아니요', '예'],
    })
    .then((buttonIndex) => {
      if (buttonIndex.response === 1) {
        dialog.showMessageBox({
          title: '업데이트 다운로드',
          message: '업데이트 다운로드를 시작합니다. 잠시만 기다려주세요.',
          icon: path.join(__dirname, '../../renderer/img/favicon.ico'),
        });
        // 업데이트 창켜기
        webContents.getAllWebContents().map((win) => {
          if (win.getTitle().slice(0, 6) === 'index_')
            win.send('updateDivOpen');
          return win;
        });
        autoUpdater.downloadUpdate();
      } else {
        dialog.showMessageBox({
          title: '업데이트 다운로드',
          message: '업데이트 다운로드를 취소하였습니다.',
          icon: path.join(__dirname, '../../renderer/img/favicon.ico'),
        });
      }
    })
    .catch((err) => {
      dialog.showMessageBox({
        title: 'Error',
        message: `에러입니다: ${err}`,
      });
    });
});

autoUpdater.on('update-not-available', () => {
  // dialog.showMessageBox({
  //   title: '업데이트 확인',
  //   message: '현재 최신 버전입니다.',
  // icon: path.join(__dirname, '../../renderer/img/favicon.ico'),
  // })
});

autoUpdater.on('update-downloaded', () => {
  dialog
    .showMessageBox({
      title: '업데이트 설치',
      message: '업데이트를 위해 어플리케이션이 종료됩니다.',
      icon: path.join(__dirname, '../../renderer/img/favicon.ico'),
    })
    .then(() => {
      setImmediate(() => autoUpdater.quitAndInstall());
    })
    .catch((err) => {
      dialog.showMessageBox({
        title: 'Error',
        message: `에러입니다: ${err}`,
      });
    });
});

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdates();
  }
}

let mainWindow: BrowserWindow | null = null;

ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  event.reply('ipc-example', msgTemplate('pong'));
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      sandbox: false,
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
