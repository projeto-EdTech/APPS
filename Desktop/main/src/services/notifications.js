const { Notification } = require("electron");
const path = require("path");

/**
 * Envia uma notificação nativa para o sistema operacional.
 * @param {string} title - Título da notificação.
 * @param {string} body - Mensagem da notificação.
 * @param {string} iconPath - Caminho para o ícone (opcional).
 */
function showNotification(title, body, iconPath = null) {
  const defaultIcon = path.join(__dirname, "../../public/favicon.ico");

  const notification = new Notification({
    title: title || "Vestibuline",
    body: body,
    icon: iconPath || defaultIcon,
    silent: false, // Toca o som padrão do sistema
  });

  notification.show();

  notification.on("click", () => {
    // Aqui você pode adicionar lógica para focar na janela do app ao clicar na notificação
    console.log("Notificação clicada");
  });
}

module.exports = { showNotification };
