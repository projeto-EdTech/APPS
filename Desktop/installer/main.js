const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { startInstallation } = require("./services/install-logic");

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 850,
    height: 650,
    frame: false,
    transparent: true,
    backgroundColor: "#00000000",
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadFile("ui/index.html");

  // Opcional: Abrir DevTools para debug durante desenvolvimento
  // mainWindow.webContents.openDevTools({ mode: 'detach' });
}

app.whenReady().then(createWindow);

ipcMain.handle("start-install", async (event) => {
  try {
    await startInstallation(mainWindow);
    return { success: true };
  } catch (error) {
    console.error("Erro na instalação:", error);
    return { success: false, error: error.message };
  }
});

ipcMain.on("close-app", () => app.quit());
ipcMain.on("minimize-app", () => mainWindow.minimize());
ipcMain.on("maximize-app", () => {
  if (mainWindow.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow.maximize();
  }
});
