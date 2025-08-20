# 🎯 Pointer Quest Web

Una aplicación web educativa interactiva para aprender punteros en C++ con visualizaciones 3D y motor de animaciones WebAssembly.

![Pointer Quest Web](https://img.shields.io/badge/React-18.2.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-4.9.5-blue)
![Three.js](https://img.shields.io/badge/Three.js-r150-green)
![Rust](https://img.shields.io/badge/Rust-1.72-orange)
![WebAssembly](https://img.shields.io/badge/WebAssembly-1.0-purple)

## 🌟 Características Principales

### 🎮 **Interfaz Moderna y Responsive**
- Diseño moderno con gradientes y efectos visuales
- Completamente responsive para desktop y móvil
- Modo oscuro con tema educativo
- Animaciones suaves y transiciones

### 🧠 **Visualización 3D Interactiva**
- **Three.js + React Three Fiber** para renderizado 3D
- **Visualización de memoria en tiempo real** (Stack, Heap, Global)
- **Punteros animados** con efectos visuales
- **Vista isométrica 3D** para mejor comprensión espacial
- **Controles de cámara** para explorar la memoria

### ⚡ **Motor WebAssembly (Rust)**
- **Motor de animaciones de alto rendimiento** en Rust/WebAssembly
- **Procesamiento de memoria optimizado** para miles de elementos
- **Renderizado canvas acelerado** para visualizaciones complejas
- **API JavaScript binding** para integración perfecta

### 📚 **Sistema de Lecciones Completo**
- **120 lecciones** organizadas por dificultad
- **Código interactivo** con syntax highlighting
- **Ejemplos prácticos** con explicaciones detalladas
- **Sistema de progreso** y logros
- **Código C++ real** con ejemplos ejecutables

### 🎯 **Conceptos Cubiertos**
- **Punteros básicos** (`T*`, `&`, `*`)
- **Puntero nulo** (`nullptr`) y seguridad
- **Punteros colgantes** (dangling pointers)
- **Gestión de memoria** (`new`/`delete`, `new[]`/`delete[]`)
- **Smart pointers** (`unique_ptr`, `shared_ptr`, `weak_ptr`)
- **RAII** y manejo de recursos
- **Patrones de diseño** con punteros
- **Debugging** y detección de errores

## 🚀 Instalación y Uso

### Prerrequisitos
- Node.js 16+
- npm o yarn
- Rust 1.70+ (para compilar WebAssembly)
- wasm-pack (para build de WebAssembly)

### Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/yourusername/pointer-quest-web.git
cd pointer-quest-web
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Compilar motor WebAssembly (opcional)**
```bash
cd pointer-quest-wasm
wasm-pack build --target web
cd ..
```

4. **Iniciar servidor de desarrollo**
```bash
npm start
```

5. **Abrir navegador**
```
http://localhost:3000
```

## 🏗️ Arquitectura

### Frontend (React + TypeScript)
```
src/
├── components/          # Componentes React
│   ├── Navbar.tsx      # Barra de navegación
│   ├── LessonList.tsx  # Lista de lecciones
│   ├── LessonView.tsx  # Vista individual de lección
│   ├── CodeEditor.tsx  # Editor de código con highlighting
│   ├── MemoryVisualizer.tsx # Visualizador de memoria
│   ├── ErrorModal.tsx  # Modal de errores
│   └── LoadingSpinner.tsx
├── 3d/                 # Componentes 3D
│   └── MemoryVisualizer3D.tsx
├── context/            # Context API
│   └── AppContext.tsx  # Estado global
├── types/              # Definiciones TypeScript
│   └── index.ts
├── pages/              # Páginas principales
└── hooks/              # Custom hooks
```

### WebAssembly (Rust)
```
pointer-quest-wasm/
├── src/
│   └── lib.rs          # Motor de animaciones
├── Cargo.toml          # Dependencias Rust
└── pkg/                # Output compilado
```

## 🎨 Tecnologías

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Three.js** - 3D graphics
- **React Three Fiber** - React renderer for Three.js
- **@react-three/drei** - Useful helpers for React Three Fiber
- **styled-components** - CSS-in-JS
- **React Router** - Client-side routing

### Backend (WebAssembly)
- **Rust 1.72** - Systems programming language
- **wasm-bindgen** - Rust/WebAssembly bindings
- **web-sys** - Web APIs bindings
- **js-sys** - JavaScript types in Rust

### Build Tools
- **Create React App** - React app generator
- **wasm-pack** - Rust to WebAssembly compiler
- **TypeScript Compiler** - Type checking

## 🎮 Controles 3D

### Cámara
- **Mouse izquierdo + drag**: Rotar vista
- **Mouse wheel**: Zoom in/out
- **Mouse derecho + drag**: Pan

### Interacción
- **Click en elementos**: Información detallada
- **Hover**: Highlight de elementos
- **Teclas WASD**: Navegación alternativa

## 📱 Responsive Design

La aplicación está diseñada para funcionar en:
- **Desktop** (1920x1080+)
- **Laptop** (1366x768+)
- **Tablet** (768x1024)
- **Mobile** (360x640+)

## 🎯 Roadmap

### Fase 1 ✅ Completada
- [x] Setup React + TypeScript
- [x] Sistema básico de lecciones
- [x] Visualización 3D con Three.js
- [x] Motor WebAssembly en Rust
- [x] UI moderna y responsive

### Fase 2 🚧 En Desarrollo
- [ ] Más lecciones (21-120)
- [ ] Sistema de progreso persistente
- [ ] Tests unitarios
- [ ] PWA (Progressive Web App)

### Fase 3 📋 Planificada
- [ ] Multiplayer educativo
- [ ] VR/AR support
- [ ] Integración con editores online
- [ ] Gamification avanzada

## 🤝 Contribuir

1. Fork el proyecto
2. Crear feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver archivo [LICENSE](LICENSE) para detalles.

## 🙏 Agradecimientos

- **Three.js** por la librería de gráficos 3D
- **React** por el framework de UI
- **Rust** por el lenguaje de sistemas
- **WebAssembly** por la portabilidad

---

**⭐ ¡Si te gusta este proyecto, dale una estrella!**

**📚 Aprende punteros de forma divertida y visual**

Hecho con ❤️ por el equipo de Pointer Quest