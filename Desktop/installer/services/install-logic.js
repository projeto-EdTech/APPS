const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const AdmZip = require("adm-zip");
const { spawn } = require("child_process");
const { app } = require("electron");

async function startInstallation(window) {
  const sendStatus = (status, progress) => {
    window.webContents.send("install-progress", { status, progress });
  };

  try {
    const appData =
      process.env.LOCALAPPDATA ||
      path.join(process.env.HOME, "AppData", "Local");
    const installPath = path.join(appData, "Vestibuline");
    const tempPath = path.join(appData, "VestibulineTemp");
    const zipPath = path.join(tempPath, "app_package.zip");

    // URL Fictícia - Substitua pela URL real do seu bucket/servidor
    const downloadUrl = "https://cdn.vestibuline.com/desktop/latest.zip";

    // 1. Preparação
    sendStatus("Iniciando motores de busca...", 5);
    await fs.ensureDir(installPath);
    await fs.ensureDir(tempPath);

    // 2. Download
    sendStatus("Baixando pacote de dados...", 15);
    const response = await axios({
      method: "get",
      url: downloadUrl,
      responseType: "stream",
    });

    const totalLength = parseInt(response.headers["content-length"], 10);
    let downloadedLength = 0;

    const writer = fs.createWriteStream(zipPath);
    response.data.pipe(writer);

    response.data.on("data", (chunk) => {
      downloadedLength += chunk.length;
      if (totalLength) {
        const progress = 15 + Math.round((downloadedLength / totalLength) * 60);
        sendStatus("Baixando...", progress);
      }
    });

    await new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });

    // 3. Extração
    sendStatus("Extraindo arquivos neurais...", 80);
    const zip = new AdmZip(zipPath);
    zip.extractAllTo(installPath, true);

    // Limpeza
    await fs.remove(tempPath);

    // 4. Finalização e Launch
    sendStatus("Sistema configurado. Decolando!", 95);

    // Caminho do executável do app principal (dentro da pasta instalada)
    const exePath = path.join(installPath, "Vestibuline.exe");

    // Spawn o app principal em processo independente
    if (process.platform === "win32") {
      spawn(exePath, [], {
        detached: true,
        stdio: "ignore",
      }).unref();
    }

    sendStatus("Concluído!", 100);

    // Espera um pouco para o usuário ver o 100% e fecha o instalador
    setTimeout(() => {
      app.quit();
    }, 2000);
  } catch (err) {
    console.error(err);
    throw new Error("Erro Crítico no Sistema: " + err.message);
  }
}

module.exports = { startInstallation };
