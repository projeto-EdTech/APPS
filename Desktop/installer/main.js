const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const { startInstallation } = require("./services/install-logic");
const { exec } = require("child_process");
const util = require("util");
const execAsync = util.promisify(exec);

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 850,
    height: 650,
    frame: false,
    transparent: true,
    backgroundColor: "#00000000",
    resizable: true,
    maximizable: true,
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

ipcMain.handle("select-folder", async (event) => {
  try {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ["openDirectory"],
      title: "Selecione a pasta de instalação",
      buttonLabel: "Selecionar",
    });

    if (result.canceled) {
      return null;
    }

    return result.filePaths[0];
  } catch (error) {
    console.error("Erro ao selecionar pasta:", error);
    throw error;
  }
});

ipcMain.handle("start-installation", async (event, destinationPath) => {
  try {
    console.log("Iniciando instalacao em:", destinationPath);
    return { success: true, path: destinationPath };
  } catch (error) {
    console.error("Erro ao iniciar instalacao:", error);
    throw error;
  }
});

ipcMain.handle("get-disk-space", async (event, driveLetter) => {
  try {
    const drive = (driveLetter || "C").charAt(0).toUpperCase();

    // Script PowerShell mais robusto usando WMI (Win32_LogicalDisk)
    // Usamos CultureInfo Invariant para garantir que números venham com ponto decimal (ex: 10.5 e não 10,5)
    // $ProgressPreference = 'SilentlyContinue' suprime barras de progresso que poluem o stderr
    const psCommand = `
      $ProgressPreference = 'SilentlyContinue'
      try {
        $disk = Get-CimInstance -ClassName Win32_LogicalDisk -Filter "DeviceID='${drive}:'" -ErrorAction Stop
        $freeGB = [math]::Round($disk.FreeSpace / 1GB, 2).ToString('G', [System.Globalization.CultureInfo]::InvariantCulture)
        $totalGB = [math]::Round($disk.Size / 1GB, 2).ToString('G', [System.Globalization.CultureInfo]::InvariantCulture)
        Write-Output "$freeGB|$totalGB"
      } catch {
        Write-Error $_.Exception.Message
      }
    `;

    // Codifica para Base64 para evitar erros de sintaxe/acentuação/quebra de linha no terminal
    const encodedCommand = Buffer.from(psCommand, "utf16le").toString("base64");

    // Executa de forma assíncrona
    const { stdout, stderr } = await execAsync(
      `powershell -NoProfile -EncodedCommand ${encodedCommand}`,
    );

    if (stderr && stderr.trim().length > 0) {
      console.warn("Aviso do PowerShell (stderr):", stderr);
    }

    const result = stdout.trim();

    const parts = result.split("|").filter((p) => p.trim() !== "");

    if (parts.length < 2) {
      throw new Error(
        "Não foi possível ler as informações do disco. O drive existe?",
      );
    }

    const freeGB = parseFloat(parts[0]) || 0;
    const totalGB = parseFloat(parts[1]) || 0;

    console.log(`Disco ${drive}: ${freeGB}GB livre de ${totalGB}GB total`);

    return {
      success: true,
      freeGB: freeGB,
      totalGB: totalGB,
      drive: drive,
    };
  } catch (error) {
    console.error("Erro ao obter espaço em disco:", error);
    return {
      success: false,
      freeGB: 0,
      totalGB: 0,
      error: error.message,
    };
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
