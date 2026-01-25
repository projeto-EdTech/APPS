// Função para voltar
function goBack() {
  console.log("Voltando para step1.html");
  window.location.href = "step1.html";
}

// Função para atualizar espaço em disco
function updateDiskSpace(path) {
  if (!path) return;

  // Extrair a letra da unidade (ex: C de C:\Users\...)
  const driveLetter = path.charAt(0);

  console.log("Obtendo espaço em disco para:", driveLetter);

  if (
    window.installerAPI &&
    typeof window.installerAPI.getDiskSpace === "function"
  ) {
    window.installerAPI
      .getDiskSpace(driveLetter)
      .then((result) => {
        if (result.success) {
          const freeGB = result.freeGB;
          const totalGB = result.totalGB;

          console.log(`Espaço obtido: ${freeGB}GB livre de ${totalGB}GB`);

          // Atualizar o elemento de espaço disponível
          const availableElement = document.querySelector(
            ".storage-info .storage-item:nth-child(2) .storage-value",
          );
          if (availableElement) {
            availableElement.textContent = freeGB.toFixed(1) + " GB";
          }
        } else {
          console.error("Erro ao obter espaço:", result.error);
        }
      })
      .catch((err) => {
        console.error("Erro ao chamar getDiskSpace:", err);
      });
  }
}

// Função para procurar pasta
function browseFolders() {
  console.log("Abrindo seletor de pastas");

  // Chamar a API do Electron
  if (
    window.installerAPI &&
    typeof window.installerAPI.selectFolder === "function"
  ) {
    window.installerAPI
      .selectFolder()
      .then((folderPath) => {
        if (folderPath) {
          document.getElementById("destinationPath").value = folderPath;
          console.log("Pasta selecionada:", folderPath);
          // Atualizar espaço em disco da pasta selecionada
          updateDiskSpace(folderPath);
        }
      })
      .catch((err) => {
        console.error("Erro ao selecionar pasta:", err);
        alert("Erro ao selecionar pasta: " + err);
      });
  } else {
    console.error("API de seleção de pasta não disponível");
    alert(
      "API de seleção de pasta não disponível. Por favor, configure o preload.js",
    );
  }
}

// Função para instalar
function installApp() {
  const destinationPath = document.getElementById("destinationPath").value;
  console.log("Iniciando instalação em:", destinationPath);

  if (!destinationPath) {
    alert("Por favor, selecione uma pasta de destino");
    return;
  }

  // Chamar a API do Electron
  if (
    window.installerAPI &&
    typeof window.installerAPI.startInstallation === "function"
  ) {
    window.installerAPI
      .startInstallation(destinationPath)
      .then(() => {
        console.log("Instalação iniciada");
        window.location.href = "step3.html";
      })
      .catch((err) => {
        console.error("Erro ao iniciar instalação:", err);
        alert("Erro ao iniciar a instalação: " + err);
      });
  } else {
    console.warn(
      "API de instalação não disponível, redirecionando para step3.html",
    );
    window.location.href = "step3.html";
  }
}

// Ativar animações ao carregar
window.addEventListener("load", function () {
  setTimeout(() => {
    const items = document.querySelectorAll(".fade-item");
    items.forEach((item) => {
      item.classList.remove("fade-item");
    });

    // Obter espaço em disco ao carregar a página (padrão C:)
    updateDiskSpace("C:\\");
  }, 100);
});

// Prevenir arrastar a janela no content
document.querySelector(".modern-window").style.webkitAppRegion = "drag";
document
  .querySelectorAll("button, input, label, .traffic-dot")
  .forEach((el) => {
    el.style.webkitAppRegion = "no-drag";
  });
