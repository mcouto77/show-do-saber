# Show do Saber — Tutor Inteligente com IA

Aplicativo web (PWA) de apoio aos estudos para alunos do 1º ao 9º ano do Ensino Fundamental.
O aluno escolhe o ano, a matéria e o assunto e conversa com um tutor de IA que explica,
resume, dá dicas, mostra exemplos e cria exercícios com 4 alternativas.

## Características

- Uso individual, **sem login, sem cadastro e sem perfil**.
- **Sem banco de dados e sem persistência**: a sessão existe apenas na memória e é
  descartada ao atualizar ou fechar o aplicativo.
- O único dado guardado localmente é a preferência de tema claro/escuro.
- Chamada de IA feita **somente no servidor** — a chave nunca vai para o navegador.
- Tema claro/escuro, fonte grande, alto contraste e leitura em voz alta (Web Speech API).
- Instalável como PWA (manifest, service worker e ícones).

## Rodar localmente

```bash
npm install
npm run dev      # http://localhost:8080
npm run build    # build de produção
npm run preview  # pré-visualizar o build
```

## Configurar a chave de IA

A chave fica **apenas no servidor**, em variável de ambiente:

1. Copie `.env.example` para `.env`.
2. Preencha `LOVABLE_API_KEY` com a chave do Lovable AI Gateway
   (na Lovable, a chave é provisionada automaticamente em Project Settings → Secrets).
3. Reinicie o servidor.

Sem a chave, o app continua abrindo normalmente e o tutor exibe uma mensagem amigável.

## Estrutura

- `src/routes/index.tsx` — fluxo completo (início → ano → matéria → assunto → tutor).
- `src/routes/instalar.tsx` — instruções de instalação do PWA.
- `src/lib/tutor.functions.ts` — funções de servidor que falam com a IA.
- `src/lib/subjects.ts` — matérias e sugestões de assunto.
- `src/hooks/use-theme.tsx`, `src/hooks/use-speech.tsx` — tema/acessibilidade e voz.

## Privacidade

O app não pede acesso a contatos, fotos, localização, câmera, microfone ou arquivos.
Nenhum histórico de estudo é armazenado. O tutor é um apoio para revisar em casa e
não substitui o professor nem a escola.

## Android (APK)

A versão Android usa Capacitor e abre o endereço oficial seguro
`https://showdosaber.lovable.app`. A chave do Tutor IA permanece exclusivamente no
servidor e nunca é incluída no APK.

Requisitos para compilar localmente: Node.js 22+, Android Studio 2025.2.1+ e Android
SDK. Depois de instalar as dependências, execute:

```bash
npm run android:sync
npm run android:assets
```

Abra a pasta `android/` no Android Studio ou execute `npm run android:apk`. O APK de
teste será criado em `android/app/build/outputs/apk/debug/app-debug.apk`.
