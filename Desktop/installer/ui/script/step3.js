let currentProgress = 0;
let isInstalling = true;

function updateProgress(percentage, message) {
  currentProgress = percentage;
  document.getElementById("progressFill").style.width = percentage + "%";
  document.getElementById("progressPercentage").textContent = percentage;

  if (message) {
    document.getElementById("statusMessage").textContent = message;
  }
}

function completeStep(stepNumber) {
  const step = document.getElementById("step" + stepNumber);
  if (step) {
    step.style.opacity = "1";
    const dot = step.querySelector("span:first-child");
    if (dot) {
      dot.style.background = "var(--apple-green)";
      dot.style.animation = "none";
    }
  }

  // Ativar próximo passo
  if (stepNumber < 3) {
    const nextStep = document.getElementById("step" + (stepNumber + 1));
    if (nextStep) {
      nextStep.style.opacity = "1";
    }
  }
}

function simulateInstallation() {
  // Simular progresso de instalação
  let stages = [
    { percentage: 33, message: "Preparando arquivos...", stepComplete: 1 },
    { percentage: 66, message: "Copiando arquivos...", stepComplete: 2 },
    { percentage: 100, message: "Finalizando instalação...", stepComplete: 3 },
  ];

  let currentStage = 0;

  const interval = setInterval(() => {
    if (currentProgress < 100) {
      currentProgress += Math.random() * 15;
      if (currentProgress > stages[currentStage].percentage) {
        currentProgress = stages[currentStage].percentage;
        completeStep(stages[currentStage].stepComplete);
        currentStage++;
      }
      updateProgress(
        Math.floor(currentProgress),
        stages[currentStage - 1].message,
      );
    } else {
      clearInterval(interval);
      finishInstalation();
    }
  }, 500);
}

function finishInstalation() {
  isInstalling = false;
  updateProgress(100, "Instalação concluída com sucesso!");

  // Mostrar sucesso
  const step3 = document.getElementById("step3");
  if (step3) {
    step3.innerHTML =
      '<span style="display: flex; align-items: center; gap: 8px;"><span style="width: 8px; height: 8px; background: var(--apple-green); border-radius: 50%;"></span><span>Instalação concluída!</span></span>';
  }

  // Mostrar botões
  document.getElementById("backButton").style.display = "block";
  document.getElementById("finishButton").style.display = "block";
}

function goBack() {
  console.log("Voltando para step2.html");
  window.location.href = "step2.html";
}

function finishInstallation() {
  console.log("Instalação finalizada");

  if (window.installerAPI && window.installerAPI.closeApp) {
    window.installerAPI.closeApp();
  } else {
    window.close();
  }
}

// Ativar animações ao carregar
window.addEventListener("load", function () {
  setTimeout(() => {
    const items = document.querySelectorAll(".fade-item");
    items.forEach((item) => {
      item.classList.remove("fade-item");
    });

    // Iniciar simulação de instalação
    simulateInstallation();
  }, 100);
});

// Prevenir arrastar a janela no content
document.querySelector(".modern-window").style.webkitAppRegion = "drag";
document
  .querySelectorAll("button, input, label, .traffic-dot")
  .forEach((el) => {
    el.style.webkitAppRegion = "no-drag";
  });
