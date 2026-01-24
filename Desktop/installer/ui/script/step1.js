// Função para voltar
function goBack() {
  console.log("Voltando para página anterior");
  window.location.href = "index.html";
}

// Função para próximo passo
function nextStep() {
  const installType = document.querySelector(
    'input[name="installType"]:checked',
  ).value;
  window.location.href = "step2.html";
}

// Ativar animações ao carregar
window.addEventListener("load", function () {
  // Carregar nome do usuário
  loadUserName();

  setTimeout(() => {
    const items = document.querySelectorAll(".fade-item");
    items.forEach((item) => {
      item.classList.remove("fade-item");
    });
  }, 100);
});

// Prevenir arrastar a janela no content
document.querySelector(".modern-window").style.webkitAppRegion = "drag";
document
  .querySelectorAll("button, input, label, .traffic-dot")
  .forEach((el) => {
    el.style.webkitAppRegion = "no-drag";
  });
