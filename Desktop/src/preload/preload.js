const { contextBridge, ipcRenderer } = require("electron");

// 1. Ponte Segura (contextBridge)
// Expõe APIs específicas para o Front-end sem expor o Node.js inteiro
contextBridge.exposeInMainWorld("electronAPI", {
  // Controle de Janela
  minimize: () => ipcRenderer.send("window-minimize"),
  maximize: () => ipcRenderer.send("window-maximize"),
  close: () => ipcRenderer.send("window-close"),

  // Informações do Sistema
  getAppVersion: () => ipcRenderer.invoke("get-app-version"),

  // Gerenciamento de Configurações Locais
  getConfig: (key) => ipcRenderer.invoke("get-config", key),
  setConfig: (key, value) => ipcRenderer.send("set-config", key, value),

  // Notificações Nativas
  sendNotification: (title, body) =>
    ipcRenderer.send("send-notification", { title, body }),

  // Controle de Inicialização com o Sistema
  setAutoLaunch: (enable) => ipcRenderer.invoke("set-auto-launch", enable),
  getAutoLaunch: () => ipcRenderer.invoke("get-auto-launch"),

  // Modo Estudo (Always on Top)
  toggleAlwaysOnTop: () => ipcRenderer.invoke("window-toggle-top"),
  isAlwaysOnTop: () => ipcRenderer.invoke("is-always-on-top"),
});

// 2. Lógica de Versões (mantida da versão anterior)
window.addEventListener("DOMContentLoaded", () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector);
    if (element) element.innerText = text;
  };

  for (const type of ["chrome", "node", "electron"]) {
    replaceText(`${type}-version`, process.versions[type]);
  }
});
