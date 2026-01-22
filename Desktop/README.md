# Vestibuline Desktop 🦎💻

Este diretório contém a infraestrutura **Desktop Profissional** do ecossistema **Vestibuline**. O software foi desenvolvido utilizando **Electron** e está configurado com uma arquitetura modular e segura para proporcionar uma experiência nativa de elite no Windows.

---

## 🛠️ Estrutura do Projeto (Arquitetura Organizada)

Desktop/
├── src/                        # Código fonte do software
│   ├── main.js                 # Ponto de Entrada (Processo Principal)
│   ├── services/               # Integração com o Sistema Operacional
│   │   └── notifications.js    # Módulo modular de Notificações Nativas
│   ├── preload/                # Camada de Segurança (Context Bridge)
│   │   └── preload.js          # Ponte segura entre a Web e as APIs do SO
│   └── ui/                     # Componentes Visuais Nativos (Fallback/Status)
│       ├── splash.html         # Splash Screen (Tailwind + Animations)
│       └── offline.html        # Página Offline Inteligente com Smart Retry
├── public/                     # Ativos estáticos (Ícones, Mascote, Logos)
│   └── favicon.ico             # Ícone oficial do sistema
├── .env                        # Variáveis de ambiente e URLs de conexão
├── package.json                # Dependências, Scripts de Empacotamento e Build
└── README.md                   # Este guia

---

## ✨ Features e Explicações Técnicas

### 1. Iniciação e Experiência Visual
*   **Splash Screen Premium (`src/ui/splash.html`)**: Exibida instantaneamente ao abrir o app para evitar o "white flash" do Electron. Utiliza Tailwind CSS e animações Apple-style para uma primeira impressão premium.
*   **Janela Frameless & Transparente**: Removemos a barra de título nativa para um visual limpo e moderno. Os botões de controle do Windows (WCO) flutuam sobre o conteúdo com fundo transparente.
*   **Barra de Título Compacta (30px)**: A altura da barra superior foi otimizada para apenas 30px, maximizando o espaço útil para o conteúdo de estudo.
*   **Zona de Arraste Injetada (`main.js`)**: O arraste da janela funciona dinamicamente via CSS injetado no topo da aplicação.
*   **Efeito Mica (Windows 11)**: Utiliza o material nativo do Windows 11 para um visual translúcido e premium que se adapta ao papel de parede do usuário.

### 2. Navegação e Redes (Deep Linking)
*   **Custom Protocol (`vestibuline://`)**: Registrado no Windows para lidar com callbacks do NextJS (autenticação, redirecionamentos e rotas específicas).
*   **Smart Fallback & Offline (`src/ui/offline.html`)**: Se a conexão falhar, o app redireciona para uma página offline que captura a rota anterior e permite o "Tentar Novamente" com redirecionamento automático quando a conexão retorna.

### 3. Persistência e Integração Nativa
*   **Window State Keeper**: O software recorda exatamente o último tamanho e posição da janela escolhidos pelo usuário.
*   **System Tray (Bandeja)**: Ao fechar, o app minimiza para a bandeja do sistema (perto do relógio). O encerramento total é feito via menu de contexto do tray.
*   **Electron Store**: Gerencia configurações locais persistentes (como preferências de tema) usando a versão estável `8.1.0`.
*   **Notificações Nativas (`src/services/notifications.js`)**: Módulo isolado responsável por disparar alertas reais do Windows com o branding oficial do Vestibuline.

### 4. Segurança
*   **Context Isolation & Sandboxing**: O front-end não possui acesso direto ao Node.js. Toda interação é mediada pela `window.electronAPI` no `preload/preload.js`.
*   **Tratamento de Links Externos**: URLs externas são abertas obrigatoriamente no navegador padrão do usuário, mantendo o ambiente do app seguro.

### 5. Silent Start & Performance (Instant Launch) ⚡
*   **Background Boot**: O app pode ser configurado para iniciar junto com o Windows de forma oculta (`--hidden`). Isso permite que o software já esteja "quente" na memória.
*   **Instant Wake**: Quando o usuário clica no ícone, o processo em background é ativado instantaneamente, eliminando esperas por Splash Screens.
*   **Auto-Launch API**: Disponível via `window.electronAPI.setAutoLaunch(true/false)`.

### 6. Estudo Ativo e Autenticação Robusta 📌
*   **Modo Sempre no Topo (Always on Top)**: Funcionalidade "Modo Estudo" que mantém o Vestibuline acima de outras janelas, ideal para acompanhar aulas externas.
*   **Login Estabilizado (PKCE & Lax Cookies)**: Sistema de autenticação blindado contra erros de "State Missing" através do suporte a PKCE e políticas de cookies otimizadas para o fluxo Browser -> App.

---

## 🚀 Como Executar

### Desenvolvimento

1.  **Front-end**: Certifique-se de que o NextJS está rodando na pasta `/front`.
2.  **Configuração**: Verifique se o `ELECTRON_START_URL` no seu `.env` está correto.
3.  **Execução**:
    ```bash
    npm install             # Instalar dependências
    npm run dev             # Iniciar em modo desenvolvimento
    ```

### Distribuição (Instalador .exe)
Para gerar o executável final com instalador NSIS:
```bash
npm run build
```

---

## 🔍 Resolução de Problemas (Troubleshooting)

| Problema | Onde olhar / Causa Provável |
| :--- | :--- |
| **"Store is not a constructor"** | Erro de versão do `electron-store`. Use `8.1.0`. |
| **Página de Conexão Falhou** | Verifique se a URL no `.env` está acessível. O arquivo está em `src/ui/offline.html`. |
| **Notificações sem nome/ícone** | Verifique se o `app.name` em `main.js` e o caminho do ícone em `services/notifications.js` estão corretos. |
| **Caminhos de Arquivos (Erro 404)** | Após a reorganização, verifique no `main.js` se os caminhos para `ui/`, `preload/` e `services/` estão usando `path.join`. |

---

**Vestibuline** - *Transformando a educação através de software de alta qualidade.*
