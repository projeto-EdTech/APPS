const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("installerAPI", {
  startInstall: () => ipcRenderer.invoke("start-install"),
  onProgress: (callback) =>
    ipcRenderer.on("install-progress", (event, data) => callback(data)),
  closeApp: () => ipcRenderer.send("close-app"),
  minimizeApp: () => ipcRenderer.send("minimize-app"),
  maximizeApp: () => ipcRenderer.send("maximize-app"),
});
