const { app, BrowserWindow, Menu, ipcMain, shell, Tray } = require("electron");
const path = require("path");
const windowStateKeeper = require("electron-window-state");
const Store = require("electron-store");
const store = new Store();
const { autoUpdater } = require("electron-updater");
const { showNotification } = require("./services/notifications");
require("dotenv").config();

// Remover menu padrão para um visual de "App" puro
Menu.setApplicationMenu(null);

let win;
let splash;
let tray = null;
let isQuitting = false;

// Detecção de início oculto (Background)
const isHiddenStart =
  process.argv.includes("--hidden") ||
  app.getLoginItemSettings().wasOpenedAsHidden;

// 1. Instância Única e Deep Linking
app.name = "Vestibuline";
app.setAppUserModelId("Vestibuline");

// Registrar o protocolo vestibuline://
if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient("vestibuline", process.execPath, [
      path.resolve(process.argv[1]),
    ]);
  }
} else {
  app.setAsDefaultProtocolClient("vestibuline");
}

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", (event, commandLine) => {
    if (win) {
      if (win.isMinimized()) win.restore();
      if (!win.isVisible()) win.show();
      win.focus();

      // No Windows, o link vem via commandLine (argv)
      const url = commandLine.pop();
      if (url && url.startsWith("vestibuline://")) {
        handleDeepLink(url);
      }
    }
  });
}

// Handler para macOS
app.on("open-url", (event, url) => {
  event.preventDefault();
  handleDeepLink(url);
});

/**
 * Processa a URL de Deep Link e navega para a rota correta
 * Ex: vestibuline://callback?token=123 -> /callback?token=123
 */
function handleDeepLink(url) {
  try {
    const rawPath = url.replace("vestibuline://", "");
    const cleanPath = rawPath.startsWith("/") ? rawPath : `/${rawPath}`;

    if (win) {
      if (win.isMinimized()) win.restore();
      if (!win.isVisible()) win.show();
      win.focus();

      const baseUrl = process.env.ELECTRON_START_URL || "http://localhost:3000";
      const fullTargetUrl = baseUrl.endsWith("/")
        ? baseUrl.slice(0, -1) + cleanPath
        : baseUrl + cleanPath;

      console.log(`[DeepLink] Navegando para: ${fullTargetUrl}`);
      win.loadURL(fullTargetUrl);
    } else {
      // Se a janela não existir, cria uma com o path inicial
      createWindow(cleanPath);
    }
  } catch (error) {
    console.error("Erro ao processar Deep Link:", error);
  }
}

// 2. Função da Splash Screen
function createSplashScreen() {
  splash = new BrowserWindow({
    width: 400,
    height: 500,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    resizable: false,
    center: true,
    icon: path.join(__dirname, "../public/favicon.ico"),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload/preload.js"),
    },
  });

  splash.loadFile(path.join(__dirname, "ui/splash.html"));
}

function createWindow(initialPath = "") {
  // 3. Persistência de Estado da Janela
  let mainWindowState = windowStateKeeper({
    defaultWidth: 1300,
    defaultHeight: 850,
  });

  win = new BrowserWindow({
    x: mainWindowState.x,
    y: mainWindowState.y,
    width: mainWindowState.width,
    height: mainWindowState.height,
    minWidth: 1000,
    minHeight: 700,
    title: "Vestibuline",
    icon: path.join(__dirname, "../public/favicon.ico"),
    frame: false,
    titleBarStyle: "hidden",
    titleBarOverlay: {
      color: "#00000000", // Fundo 100% transparente
      symbolColor: "#0071e3", // Cor dos ícones (Azul)
      height: 30,
    },
    show: false,
    backgroundColor: "#00000000", // Transparente para permitir o efeito Mica/Acrylic
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      preload: path.join(__dirname, "preload/preload.js"),
    },
    autoHideMenuBar: true,
    // Efeito Windows 11 Mica/Acrylic
    backgroundMaterial: "mica",
  });

  // Torna o topo da janela (40px) arrastável sem precisar alterar os arquivos do Front-end
  win.webContents.on("dom-ready", () => {
    win.webContents.insertCSS(`
      body::after {
        content: "";
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        height: 32px;
        -webkit-app-region: drag;
        z-index: 999999;
        pointer-events: none;
      }
    `);
  });

  mainWindowState.manage(win);

  win.once("ready-to-show", () => {
    if (splash && !splash.isDestroyed()) {
      splash.close();
    }

    // Se não for início em background, mostra a janela normalmente
    if (!isHiddenStart) {
      win.show();
      win.focus();
    } else {
      console.log(
        "[Main] Iniciado em segundo plano. Janela carregada mas oculta.",
      );
    }
  });

  // Listener para queda de internet (Página Offline Customizada)
  win.webContents.on(
    "did-fail-load",
    (event, errorCode, errorDescription, validatedURL) => {
      // Impede loop infinito se a própria página offline falhar
      if (validatedURL.includes("ui/offline.html")) return;

      if (errorCode !== -3 && !validatedURL.includes("localhost")) {
        const offlinePath = path.join(__dirname, "ui/offline.html");
        win.loadURL(
          `file://${offlinePath}?from=${encodeURIComponent(validatedURL)}`,
        );
      }
    },
  );

  win.on("close", (event) => {
    if (!isQuitting) {
      event.preventDefault();
      win.hide();
    }
    return false;
  });

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  const baseUrl = process.env.ELECTRON_START_URL || "http://localhost:3000";
  const startUrl = initialPath
    ? baseUrl.endsWith("/")
      ? baseUrl.slice(0, -1) + initialPath
      : baseUrl + initialPath
    : baseUrl;

  win.loadURL(startUrl).catch(() => {
    if (win && !win.isDestroyed()) {
      const offlinePath = path.join(__dirname, "ui/offline.html");
      win.loadURL(`file://${offlinePath}?from=${encodeURIComponent(startUrl)}`);
    }
  });

  // 6. Lógica de Auto-Updater
  autoUpdater.on("update-available", () => {
    showNotification(
      "Atualização Disponível",
      "Uma nova versão do Vestibuline está sendo baixada.",
    );
  });

  autoUpdater.on("update-downloaded", () => {
    showNotification(
      "Atualização Pronta",
      "A nova versão foi baixada e será instalada ao reiniciar.",
    );
  });
}

// 4. Integração com a Bandeja (Tray)
function createTray() {
  const iconPath = path.join(__dirname, "../public/favicon.ico");
  tray = new Tray(iconPath);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Abrir Vestibuline",
      click: () => {
        win.show();
      },
    },
    { type: "separator" },
    {
      label: "Sair",
      click: () => {
        isQuitting = true;
        app.quit();
      },
    },
  ]);

  tray.setToolTip("Vestibuline");
  tray.setContextMenu(contextMenu);

  tray.on("double-click", () => {
    win.show();
  });
}

// 5. Handlers IPC
ipcMain.handle("get-app-version", () => app.getVersion());

// Get/Set de configurações locais via electron-store
ipcMain.handle("get-config", (event, key) => store.get(key));
ipcMain.on("set-config", (event, key, value) => {
  store.set(key, value);
});

// Configurar Início com o Windows (Auto-launch)
ipcMain.handle("set-auto-launch", (event, enable) => {
  try {
    app.setLoginItemSettings({
      openAtLogin: enable,
      path: process.execPath,
      args: ["--hidden"],
    });
    return { success: true };
  } catch (error) {
    console.error("Erro ao configurar Auto-launch:", error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle("get-auto-launch", () => {
  return app.getLoginItemSettings().openAtLogin;
});

ipcMain.on("window-minimize", () => {
  if (win) win.minimize();
});

ipcMain.on("window-maximize", () => {
  if (win) {
    if (win.isMaximized()) {
      win.unmaximize();
    } else {
      win.maximize();
    }
  }
});

ipcMain.on("window-close", () => {
  if (win) win.hide();
});

// Toggle Always on Top (Modo Estudo)
ipcMain.handle("window-toggle-top", () => {
  if (win) {
    const isTop = !win.isAlwaysOnTop();
    win.setAlwaysOnTop(isTop, "screen-saver"); // 'screen-saver' garante que fique acima de quase tudo
    return isTop;
  }
  return false;
});

ipcMain.handle("is-always-on-top", () => {
  return win ? win.isAlwaysOnTop() : false;
});

// Envio de notificações via Front-end
ipcMain.on("send-notification", (event, { title, body }) => {
  showNotification(title, body);
});

// Inicialização
app.whenReady().then(() => {
  // Só cria splash se não estiver iniciando oculto
  if (!isHiddenStart) {
    createSplashScreen();
  }

  createTray();

  // Verifica se o app foi aberto via Deep Link (Windows)
  const lastArg = process.argv.pop();
  if (lastArg && lastArg.startsWith("vestibuline://")) {
    handleDeepLink(lastArg);
  } else {
    // Se estiver oculto, não precisa de timeout (delay do splash)
    const delay = isHiddenStart ? 0 : 800;
    setTimeout(createWindow, delay);
  }

  // Iniciar verificação de atualizações
  autoUpdater.checkForUpdatesAndNotify();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    } else {
      win.show();
    }
  });
});

app.on("before-quit", () => {
  isQuitting = true;
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    if (isQuitting) app.quit();
  }
});

process.on("uncaughtException", (error) => {
  console.error("Erro não tratado no Main Process:", error);
});
