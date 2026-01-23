# Vestibuline Bootstrap Installer 🦎🚀

Este projeto é um **Bootstrap Installer** (Stub Installer) customizado para o ecossistema Vestibuline. Desenvolvido com **Electron.js**, ele oferece uma experiência de instalação futurista, leve e totalmente inspirada no design system nativo do **macOS Ventura/Sonoma (2024)**.

Ao contrário de instaladores tradicionais (como NSIS puro), esta arquitetura permite o uso de tecnologias web (HTML5/CSS3) para criar interfaces com efeitos de transparência real, animações fluidas e uma UX premium.

---

## 📂 Arquitetura do Projeto

O instalador está organizado de forma modular para facilitar a manutenção e escalabilidade:

```text
installer/
├── main.js                # Orquestrador do Ciclo de Vida e Gerenciamento de Janelas
├── preload.js             # Ponte de Segurança (Context Bridge) entre Main e Renderer
├── package.json           # Dependências e scripts de automação
├── README.md              # Documentação técnica (este arquivo)
├── services/
│   └── install-logic.js   # Lógica principal: Download, Extração e Execução
└── ui/
    ├── index.html         # Estrutura da interface e lógica do Dashboard
    └── global.css         # Design System macOS Moderno e Animações
```

---

## 🛠️ Detalhamento dos Módulos

### 1. `main.js` (Main Process)
Gerencia as capacidades nativas do Electron.
- **Transparência**: Configurado com `transparent: true` e `backgroundColor: '#00000000'` para suportar o efeito Glassmorphism.
- **Border-less**: `frame: false` permite que a UI desenhe seus próprios controles de janela.
- **IPC Handlers**:
    - `close-app`: Encerra o processo.
    - `minimize-app`: Minimiza para a barra de tarefas.
    - `maximize-app`: Alterna entre estado maximizado e normal.
    - `start-install`: Invoca o serviço de instalação assíncrono.

### 2. `preload.js` (Security Bridge)
Implementa o padrão de segurança sugerido pelo Electron.
- Expõe a API `window.installerAPI` para o frontend.
- Garante que o processo de renderização não tenha acesso direto ao Node.js, prevenindo vulnerabilidades.

### 3. `services/install-logic.js` (Core Engine)
A "inteligência" por trás da instalação.
- **Download Inteligente**: Utiliza `axios` com streams para processar arquivos grandes sem sobrecarregar a memória RAM.
- **Progresso Real-time**: Envia eventos IPC de volta para a UI a cada chunk de dados baixado.
- **Extração**: Usa `adm-zip` para descompactar o app principal no diretório `%LocalAppData%/Vestibuline`.
- **Auto-Launch**: Inicia o executável principal automaticamente após a conclusão com `child_process.spawn`.

### 4. `ui/index.html` & `global.css` (Frontend)
- **Estética macOS 2024**: Implementa o efeito *Vibrancy* (blur de 64px, saturação de 190%).
- **Traffic Lights**: Botões de controle funcionais com gradientes radiais reais.
- **Tipografia**: Utiliza a família **SF Pro Display** com pesos de sistema Apple.
- **Tailwind CSS**: Utilizado via Play CDN para agilidade no layout e estilização utilitária.

---

## 🚀 Como Executar e Desenvolver

### Pré-requisitos
- Node.js instalado (v16 ou superior recomendado).
- Acesso à internet (para download de dependências e assets via CDN).

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

## 🔧 Manutenção e Suporte

### Como alterar a URL do App Principal?
No arquivo `services/install-logic.js`, localize a variável `downloadUrl` e substitua pelo link direto do seu novo arquivo `.zip`.

### Como alterar o Mascote?
Substitua a imagem em `../public/Mascote/banners/Camaleão_3.png` ou altere a tag `<img>` no `ui/index.html`.

### Problemas comuns:
- **Janela Branca**: Certifique-se de que `transparent: true` e `frame: false` estão definidos no `main.js`.
- **Erro de Conexão (ENOTFOUND)**: Verifique se a URL de download no `install-logic.js` é válida e está online.
- **Permissões**: O instalador tenta gravar em `process.env.LOCALAPPDATA`. Garanta que o processo tenha privilégios de escrita.

---

## 📦 Dependências Principais
- **electron**: Framework base.
- **axios**: Gerenciamento de requisições HTTP e streams de download.
- **fs-extra**: Operações de sistema de arquivos simplificadas.
- **adm-zip**: Manipulação de arquivos comprimidos.

---

## 👨‍💻 Créditos & Suporte
Desenvolvido com foco em alta performance e design humanizado. 

**Vestibuline Team - 2026**
