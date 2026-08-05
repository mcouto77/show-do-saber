# Show do Saber — APK Android

Esta versão Android abre o sistema oficial publicado em
`https://showdosaber.lovable.app` dentro de um aplicativo próprio.

## O que já está configurado

- Nome: **Show do Saber — Tutor Inteligente com IA**
- Identificador Android: `com.mcouto.showdosaber`
- Android mínimo: Android 7 (API 24)
- Android de destino: Android 16 (API 36)
- Ícone e tela de abertura próprios
- Tela amigável quando não houver conexão
- Permissão exclusiva de internet
- Nenhuma chave de IA incluída no APK

## Gerar automaticamente pelo GitHub

O fluxo `.github/workflows/android-apk.yml` compila um APK de teste ao receber a
branch `agent/android-apk`. Ao final, o arquivo fica disponível na execução do
GitHub Actions com o nome **Show-do-Saber-Android-APK**.

## Gerar no Windows com Android Studio

Requisitos:

1. Node.js 22 ou mais recente.
2. Android Studio 2025.2.1 ou mais recente.
3. Android SDK API 36.

Comandos no PowerShell, dentro da pasta do projeto:

```powershell
npm install
npm run android:sync
npm run android:assets
npx cap open android
```

No Android Studio, escolha **Build → Build APK(s)**. Para instalar no celular sem
publicar na Play Store, use o APK de teste.

## Observação

Este primeiro APK é destinado a testes diretos no celular. Para publicar na Google
Play, será necessário gerar e guardar uma chave de assinatura privada e produzir um
arquivo AAB de lançamento.
