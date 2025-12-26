# 📱 Guia de Build - Apps Nativos Android e iOS

## 🎯 Pré-requisitos

### Para Android:
- ✅ **Android Studio** instalado
- ✅ **Java JDK 17** ou superior
- ✅ **Android SDK** (API 33+)
- ✅ **Gradle** (incluído no Android Studio)

### Para iOS (apenas macOS):
- ✅ **Xcode 14+** instalado
- ✅ **CocoaPods** instalado (`sudo gem install cocoapods`)
- ✅ **Conta Apple Developer** (para distribuição)

---

## 🚀 Comandos Disponíveis

```bash
# Sincronizar código web com apps nativos
npm run cap:sync

# Adicionar plataforma Android
npm run cap:add:android

# Adicionar plataforma iOS
npm run cap:add:ios

# Abrir projeto Android no Android Studio
npm run cap:android

# Abrir projeto iOS no Xcode
npm run cap:ios
```

---

## 📦 Build Android (APK)

### 1. Adicionar Plataforma Android

```bash
npm run cap:add:android
```

Isso cria a pasta `android/` com todo o projeto Android.

---

### 2. Configurar Permissões

Editar `android/app/src/main/AndroidManifest.xml`:

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    
    <!-- Permissões -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    
    <!-- Features -->
    <uses-feature android:name="android.hardware.camera" android:required="false" />
    <uses-feature android:name="android.hardware.location.gps" android:required="false" />
    
    <application>
        <!-- ... -->
    </application>
</manifest>
```

---

### 3. Build do Projeto Web

```bash
npm run build
```

---

### 4. Sincronizar com Android

```bash
npx cap sync android
```

---

### 5. Abrir no Android Studio

```bash
npm run cap:android
```

Ou manualmente:
```bash
cd android
./gradlew assembleDebug
```

---

### 6. Gerar APK Debug

No Android Studio:
1. **Build → Build Bundle(s) / APK(s) → Build APK(s)**
2. Aguardar build completar
3. APK estará em: `android/app/build/outputs/apk/debug/app-debug.apk`

Ou via linha de comando:
```bash
cd android
./gradlew assembleDebug
```

---

### 7. Gerar APK Release (Produção)

#### a) Criar Keystore:

```bash
keytool -genkey -v -keystore voula-release-key.keystore -alias voula -keyalg RSA -keysize 2048 -validity 10000
```

**Importante:** Guardar senha e alias em local seguro!

#### b) Configurar Signing:

Editar `android/app/build.gradle`:

```gradle
android {
    ...
    signingConfigs {
        release {
            storeFile file('voula-release-key.keystore')
            storePassword 'SUA_SENHA'
            keyAlias 'voula'
            keyPassword 'SUA_SENHA'
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

#### c) Build Release:

```bash
cd android
./gradlew assembleRelease
```

APK estará em: `android/app/build/outputs/apk/release/app-release.apk`

---

### 8. Testar APK em Dispositivo

```bash
# Via ADB
adb install android/app/build/outputs/apk/debug/app-debug.apk

# Ou arrastar APK para o dispositivo e instalar manualmente
```

---

## 🍎 Build iOS (IPA)

### 1. Adicionar Plataforma iOS

```bash
npm run cap:add:ios
```

Isso cria a pasta `ios/` com todo o projeto iOS.

---

### 2. Instalar CocoaPods

```bash
cd ios/App
pod install
```

---

### 3. Configurar Permissões

Editar `ios/App/App/Info.plist`:

```xml
<dict>
    <!-- Permissões -->
    <key>NSLocationWhenInUseUsageDescription</key>
    <string>Vou Lá precisa da sua localização para mostrar os melhores rolês perto de você.</string>
    
    <key>NSLocationAlwaysUsageDescription</key>
    <string>Vou Lá usa sua localização para notificações de eventos próximos.</string>
    
    <key>NSCameraUsageDescription</key>
    <string>Vou Lá precisa acessar sua câmera para você tirar fotos e compartilhar momentos.</string>
    
    <key>NSPhotoLibraryUsageDescription</key>
    <string>Vou Lá precisa acessar suas fotos para você compartilhar imagens.</string>
    
    <key>NSPhotoLibraryAddUsageDescription</key>
    <string>Vou Lá precisa salvar fotos na sua galeria.</string>
    
    <!-- ... -->
</dict>
```

---

### 4. Build do Projeto Web

```bash
npm run build
```

---

### 5. Sincronizar com iOS

```bash
npx cap sync ios
```

---

### 6. Abrir no Xcode

```bash
npm run cap:ios
```

Ou manualmente:
```bash
open ios/App/App.xcworkspace
```

---

### 7. Configurar Signing & Capabilities

No Xcode:
1. Selecionar projeto "App" no navegador
2. Aba "Signing & Capabilities"
3. Selecionar seu **Team** (Apple Developer Account)
4. Xcode gerará automaticamente o **Bundle Identifier**

---

### 8. Build para Dispositivo

1. Conectar iPhone via USB
2. Selecionar dispositivo no topo do Xcode
3. **Product → Build** (⌘B)
4. **Product → Run** (⌘R) para instalar e rodar

---

### 9. Gerar IPA para TestFlight

1. **Product → Archive**
2. Aguardar archive completar
3. Na janela "Organizer":
   - Selecionar archive
   - Clicar "Distribute App"
   - Escolher "App Store Connect"
   - Seguir wizard
4. Upload para TestFlight
5. Convidar beta testers

---

## 🎨 Ícones e Splash Screens

### Gerar Automaticamente:

```bash
npm install @capacitor/assets --save-dev
```

Criar:
- `resources/icon.png` (1024x1024px)
- `resources/splash.png` (2732x2732px)

Gerar:
```bash
npx capacitor-assets generate --iconBackgroundColor '#0E1121' --splashBackgroundColor '#0E1121'
```

Isso gera automaticamente todos os tamanhos necessários para Android e iOS.

---

## 🔧 Troubleshooting

### Android:

**Erro: SDK not found**
```bash
# Definir ANDROID_HOME
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
```

**Erro: Gradle build failed**
```bash
cd android
./gradlew clean
./gradlew build
```

**Erro: Permission denied**
```bash
chmod +x android/gradlew
```

---

### iOS:

**Erro: CocoaPods not found**
```bash
sudo gem install cocoapods
pod setup
```

**Erro: Signing failed**
- Verificar que tem conta Apple Developer ativa
- Verificar que Team está selecionado no Xcode
- Tentar "Automatically manage signing"

**Erro: Build failed**
```bash
cd ios/App
pod deintegrate
pod install
```

---

## 📊 Checklist de Build

### Antes de Gerar Build:

- [ ] `npm run build` executado sem erros
- [ ] Todas as variáveis de ambiente configuradas
- [ ] Ícones e splash screens gerados
- [ ] Permissões configuradas (AndroidManifest.xml / Info.plist)
- [ ] Versão atualizada em `capacitor.config.ts`

### Android:
- [ ] Keystore criado (para release)
- [ ] Signing configurado
- [ ] APK testado em dispositivo real

### iOS:
- [ ] CocoaPods instalado
- [ ] Signing & Capabilities configurado
- [ ] Testado em dispositivo real
- [ ] Archive criado com sucesso

---

## 🚀 Próximos Passos

Após gerar builds:

1. **Testar em Dispositivos Reais:**
   - Android: Instalar APK
   - iOS: Distribuir via TestFlight

2. **Preparar para Publicação:**
   - Screenshots (mínimo 2, máximo 8)
   - Descrição do app
   - Política de privacidade
   - Classificação de conteúdo

3. **Publicar:**
   - Google Play Console
   - Apple App Store Connect

---

## 📞 Recursos

- **Capacitor Docs:** https://capacitorjs.com/docs
- **Android Studio:** https://developer.android.com/studio
- **Xcode:** https://developer.apple.com/xcode/

---

*Última atualização: 26 de dezembro de 2024*
