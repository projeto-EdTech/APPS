const installBtn = document.getElementById('installBtn');
const installBtnText = document.getElementById('installBtnText');
const title = document.getElementById('title');
const tipsSection = document.getElementById('tipsSection');
const footerStatus = document.getElementById('footerStatus');

// Função de próximo
async function startInstallation() {
  console.log('Navegando para step1.html');
  window.location.href = 'step1.html';
}

// Ativar animações ao carregar
window.addEventListener('load', function() {
  setTimeout(() => {
    const items = document.querySelectorAll('.fade-item');
    items.forEach(item => {
      item.classList.remove('fade-item');
    });
  }, 100);
});

// Prevenir arrastar a janela no content
document.querySelector('.modern-window').style.webkitAppRegion = 'drag';
document.querySelectorAll('button, .traffic-dot').forEach(el => {
  el.style.webkitAppRegion = 'no-drag';
});