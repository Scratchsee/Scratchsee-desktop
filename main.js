const { app, BrowserWindow, ipcMain, net } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    frame: false, // Custom Titlebar için çerçevesiz yapıyoruz
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'src', 'index.html'));
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// PENCERE KONTROLLERİ
ipcMain.on('window-minimize', () => mainWindow.minimize());
ipcMain.on('window-maximize', () => {
  if (mainWindow.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow.maximize();
  }
});
ipcMain.on('window-close', () => mainWindow.close());

// SCRATCH API İSTEK SİSTEMİ (Geliştirilmiş)
ipcMain.handle('fetch-scratch', async (event, endpoint) => {
  return new Promise((resolve) => {
    // Eğer istek tam bir URL değilse varsayılan API kökünü ekle
    const baseUrl = endpoint.startsWith('http') ? endpoint : `https://api.scratch.mit.edu/${endpoint}`;
    
    const request = net.request({
      method: 'GET',
      url: baseUrl
    });

    request.on('response', (response) => {
      let data = '';
      response.on('data', (chunk) => {
        data += chunk;
      });
      response.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(null);
        }
      });
    });

    request.on('error', () => {
      resolve(null);
    });

    request.end();
  });
});