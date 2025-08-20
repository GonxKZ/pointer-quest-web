# 🚀 Despliegue de Pointer Quest Web

## 📋 Requisitos Previos

### 1. Node.js y npm
```bash
# Verificar instalación
node --version  # Debe ser 16+
npm --version   # Debe ser 8+
```

### 2. Rust y wasm-pack (para WebAssembly)
```bash
# Instalar Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Instalar wasm-pack
cargo install wasm-pack

# Verificar instalación
rustc --version
wasm-pack --version
```

## 🛠️ Construcción del Proyecto

### 1. Instalar dependencias
```bash
cd pointer-quest-web
npm install
```

### 2. Compilar motor WebAssembly
```bash
npm run build:wasm
```

### 3. Construir aplicación web
```bash
npm run build
```

### 4. Construir todo (WebAssembly + React)
```bash
npm run build:all
```

## 🌐 Opciones de Despliegue

### 1. **Vercel** (Recomendado)
```bash
# Instalar Vercel CLI
npm i -g vercel

# Desplegar
vercel

# Configurar opciones
# - Framework: React
# - Root Directory: pointer-quest-web
# - Build Command: npm run build:all
# - Output Directory: build
```

### 2. **Netlify**
```bash
# Instalar Netlify CLI
npm i -g netlify-cli

# Desplegar
netlify deploy --prod --dir=build

# Configurar build settings:
# - Base directory: pointer-quest-web
# - Build command: npm run build:all
# - Publish directory: build
```

### 3. **GitHub Pages**
```bash
# Instalar gh-pages
npm install gh-pages --save-dev

# Agregar scripts a package.json
{
  "scripts": {
    "deploy": "gh-pages -d build"
  }
}

# Desplegar
npm run build:all
npm run deploy
```

### 4. **Docker**
```dockerfile
# Dockerfile
FROM node:16-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build:all

FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```bash
# Construir y ejecutar
docker build -t pointer-quest .
docker run -p 80:80 pointer-quest
```

## ⚙️ Configuración de Producción

### 1. Variables de Entorno
```bash
# Copiar archivo de ejemplo
cp .env.example .env.local

# Configurar variables
REACT_APP_API_URL=https://api.pointerquest.com
REACT_APP_ENABLE_WASM=true
REACT_APP_ENABLE_3D=true
REACT_APP_DEBUG_MODE=false
```

### 2. Optimizaciones de Build
```bash
# Build de producción optimizado
NODE_ENV=production npm run build:all

# Con análisis de bundle
npm install webpack-bundle-analyzer
npx webpack-bundle-analyzer build/static/js/*.js
```

### 3. Configuración de CDN
```javascript
// En vercel.json o netlify.toml
{
  "headers": [
    {
      "source": "/static/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    },
    {
      "source": "/src/wasm/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=86400" }
      ]
    }
  ]
}
```

## 📊 Monitoreo y Analytics

### 1. Google Analytics
```javascript
// En src/index.tsx
import ReactGA from 'react-ga4';

ReactGA.initialize('YOUR_GA_ID');
ReactGA.send('pageview');
```

### 2. Error Tracking
```javascript
// En src/index.tsx
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: 'YOUR_SENTRY_DSN',
  environment: process.env.NODE_ENV,
});
```

## 🔧 Solución de Problemas

### WebAssembly no carga
```bash
# Verificar que los archivos existan
ls -la src/wasm/

# Reconstruir WebAssembly
rm -rf src/wasm/
npm run build:wasm
```

### Three.js no funciona
```bash
# Verificar dependencias
npm list three @react-three/fiber

# Limpiar node_modules
rm -rf node_modules package-lock.json
npm install
```

### Problemas de rendimiento
```bash
# Medir performance
npm install web-vitals
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';
```

## 🚀 CI/CD con GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'

    - name: Setup Rust
      uses: actions-rust-lang/setup-rust-toolchain@v1
      with:
        toolchain: stable

    - name: Install wasm-pack
      run: cargo install wasm-pack

    - name: Install dependencies
      run: npm ci

    - name: Build WebAssembly
      run: npm run build:wasm

    - name: Build React App
      run: npm run build

    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v25
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
        vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

## 🎯 Próximos Pasos

1. **Configurar dominio personalizado**
2. **Implementar PWA**
3. **Agregar sistema de usuarios**
4. **Implementar gamificación avanzada**
5. **Agregar más lecciones**
6. **Optimizar para móviles**

---

**🎉 ¡Pointer Quest Web está listo para conquistar el mundo!**
