# Vestibuline Bootstrap Installer 🦎🚀

Este projeto é um **Bootstrap Installer** (Stub Installer) customizado para o ecossistema Vestibuline. Desenvolvido com **Electron.js**, ele oferece uma experiência de instalação moderna, dividida em etapas (Wizard), leve e totalmente inspirada no design system nativo do **macOS Ventura/Sonoma (2024)**.

Ao contrário de instaladores tradicionais, esta arquitetura utiliza tecnologias web (HTML5/CSS3) para criar interfaces com efeitos de transparência real, animações fluidas e vídeos integrados.

---

## 📂 Arquitetura do Projeto

O instalador está organizado de forma modular em passos (`steps`) para facilitar a navegação do usuário e manutenção do código:

```text
installer/
├── main.js                 # Orquestrador, IPC e Lógica de Sistema (Powershell)
├── preload.js              # Ponte de Segurança (Context Bridge)
├── package.json            # Dependências e scripts
├── README.md               # Documentação técnica
├── services/
│   └── install-logic.js    # Lógica de Download/Extração (Backend)
└── ui/
    ├── global.css          # Design System Base
    ├── index.html          # Splash/Loading inicial
    ├── step1.html          # Opções de Instalação (Escopo)
    ├── step2.html          # Seleção de Diretório e Checagem de Disco
    ├── step3.html          # Progresso e Conclusão (com Animações)
    ├── script/             # Lógica de Frontend separada por passo
    │   ├── index.js
    │   ├── step1.js
    │   ├── step2.js
    │   └── step3.js
    └── style/              # Estilos específicos por passo
        ├── index.css
        ├── step1.css
        ├── step2.css
        └── step3.css
```

---

## 🛠️ Detalhamento dos Módulos

### 1. `main.js` (Main Process)
Gerencia as capacidades nativas e sistema de arquivos.
- **Janela**: Configurada para 850x650px com transparência e sem bordas (`frame: false`). Obs: O conteúdo interno utiliza `600x560px`.
- **Verificação de Disco**: Implementação robusta e **assíncrona** usando PowerShell e WMI (`Win32_LogicalDisk`), evitando congelamentos da interface durante a consulta de espaço. Utiliza codificação Base64 para máxima compatibilidade.
- **IPC Handlers**:
    - Gerenciamento de Janela: `close-app`, `minimize-app`, `maximize-app`.
    - Dialogo de Sistema: `select-folder` para escolha de diretório.
    - Lógica de Instalação: Handlers `start-install` (Real) e `start-installation` (Placeholder para UI).
    - Hardware: `get-disk-space` para validação de armazenamento disponível.

### 2. `preload.js` (Security Bridge)
Isola o contexto entre o renderizador e o Node.js.
- Expõe a API segura `window.installerAPI`.
- Métodos disponíveis: `startInstall`, `onProgress`, `selectFolder`, `getDiskSpace`, `startInstallation`, entre outros.

### 3. Interface do Usuário (`ui/`)
Uma experiência de instalação em etapas:
- **Step 1**: Definição de escopo de usuário.
- **Step 2**: 
  - Seleção de diretório de destino.
  - Exibição de espaço livre vs necessário (Cálculo real via PowerShell).
- **Step 3**: 
  - Feedback visual de instalação.
  - **Integração de Vídeo MP4** do mascote para engajamento visual.
  - Footer fixo glassmorphic com controles de navegação.

### 4. `services/install-logic.js` (Core Engine)
Módulo backend (disponível, mas desacoplado da UI de simulação atual) preparado para realizar:
- Download via Streams (`axios`).
- Extração de ZIP (`adm-zip`).
- Manipulação de diretórios (`fs-extra`).

---

## 🚀 Como Executar e Desenvolver

### Pré-requisitos
- Node.js instalado (v16+ recomendado).
- Ambiente Windows (para funcionalidade correta dos comandos PowerShell).

### Instalação
1. Navegue até a pasta:
   ```bash
   cd Desktop/installer
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```

### Executar em modo Desenvolvimento
```bash
npm start
```

---

## 🔧 Notas de Manutenção

### Assets e Mídia
- As animações do mascote ficam em `../public/Mascote/Animações/`. O instalador suporta arquivos `.mp4` para maior fluidez e qualidade visual.

### Performance
A chamada de verificação de disco foi otimizada para usar `execAsync` e comandos Base64 encoded no PowerShell. Isso garante:
1.  **Não bloqueio da UI**: A janela não congela enquanto o disco é lido.
2.  **Robustez**: Evita erros de sintaxe por caracteres especiais.
3.  **Compatibilidade**: Força `CultureInfo Invariant` para tratar números decimais corretamente independente do idioma do SO.

---

## 📦 Dependências Principais
- **electron**: Framework base.
- **axios**: Gerenciamento de requisições HTTP e streams.
- **fs-extra**: Operações de sistema de arquivos simplificadas.
- **adm-zip**: Manipulação de arquivos comprimidos.

---

**Vestibuline Team - 2026**
