# Vestibuline Mobile 📱

Este diretório contém a camada mobile do projeto **Vestibuline**, utilizando **Capacitor** para transformar a aplicação web (Next.js) em um aplicativo nativo para Android e iOS.

## 🚀 O que foi feito?

Realizamos a integração completa entre o repositório front-end e o projeto mobile. Os principais marcos foram:

1.  **Estrutura Capacitor**: Inicialização do Capacitor na pasta `/Mobile`, separada do front-end para manter a organização.
2.  **Configuração de Ponte**: Configuração do `capacitor.config.json` para apontar para os builds do Next.js.
3.  **Sistema de Live Reload**: Implementação de uma configuração de servidor remoto que permite testar alterações no código do VS Code diretamente no emulador/celular em tempo real, sem precisar de builds constantes.
4.  **Ajustes de Infraestrutura Android**: 
    - Correção de permissões e pastas de assets.
    - Customização do script de build (`build.gradle`) para que o arquivo final seja gerado como `Vestibuline.apk`.
5.  **Otimização Next.js**: Ajustes no `next.config.ts` para suportar exportação estática, barras invertidas em rotas e imagens não otimizadas (essencial para mobile).

---

## 🛠️ Pré-requisitos

Antes de começar, certifique-se de ter instalado:
- [Node.js](https://nodejs.org/)
- [Android Studio](https://developer.android.com/studio) (para Android)
- [CocoaPods](https://cocoapods.org/) (apenas se for testar iOS no Mac)

---

## 💻 Fluxo de Desenvolvimento (Teste em Tempo Real)

Para visualizar as alterações enquanto você programa:

1.  **Inicie o Front-end**:
    No terminal da pasta `/front`, verifique seu IP (atualmente configurado como `26.185.1.30`) e rode:
    ```bash
    npm run dev
    ```

2.  **Sincronize o Mobile**:
    No terminal da pasta `/Mobile`, rode:
    ```bash
    npx cap sync android
    ```

3.  **Abra e Rode**:
    Abra o Android Studio com `npx cap open android` e clique no botão **Play**. O app carregará o conteúdo diretamente do seu servidor local.

---

## 📦 Como Gerar o APK Final (`Vestibuline.apk`)

Para gerar a versão de instalação para o celular:

1.  **Build do Front**:
    Na pasta `/front`, garanta que `output: 'export'` esteja ativo no `next.config.ts` e rode:
    ```bash
    npm run build
    ```

2.  **Sincronização**:
    Na pasta `/Mobile`:
    ```bash
    npx cap sync android
    ```

3.  **Build no Android Studio**:
    - Abra o Android Studio.
    - Vá em **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
    - Ao finalizar, o arquivo estará em `android/app/build/outputs/apk/debug/Vestibuline.apk`.

---

## ⚠️ Observações Importantes

-   **APIs e Auth**: Em modo de exportação estática (`output: export`), o Next.js não suporta rotas `/api` internas. Para o APK final funcionar, suas APIs devem estar hospedadas em um servidor online.
-   **Safe Area**: O código do header foi ajustado para respeitar os "notchs" e áreas seguras de smartphones modernos.
-   **Configuração de Nome**: O nome do pacote é `com.vestibuline.app` e o nome visível do app é `Vestibuline`.

---

## 📜 Comandos Úteis

| Comando | Descrição |
| :--- | :--- |
| `npx cap sync` | Sincroniza plugins e arquivos web com as pastas nativas |
| `npx cap open android` | Abre o projeto no Android Studio |
| `npx cap open ios` | Abre o projeto no Xcode (Exige Mac) |
| `npx cap copy` | Copia apenas os arquivos web (mais rápido que o sync) |
