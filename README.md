# 📚 Portafolio Académico

Portafolio académico personal desplegable en **GitHub Pages**.

## 🚀 Cómo desplegar en GitHub Pages

### Paso 1 — Crear repositorio
1. Ve a [github.com](https://github.com) e inicia sesión
2. Clic en **"New repository"**
3. Nombre: `portafolio` (o el que quieras)
4. Marca **Public**
5. Clic en **"Create repository"**

### Paso 2 — Subir los archivos
1. En tu nuevo repositorio, clic en **"uploading an existing file"**
2. Arrastra **todos** los archivos y carpetas de esta carpeta:
   - `index.html`
   - `css/` (carpeta completa)
   - `js/` (carpeta completa)
   - `pages/` (carpeta completa)
   - `.nojekyll`
3. Clic en **"Commit changes"**

### Paso 3 — Activar GitHub Pages
1. Ve a **Settings** del repositorio
2. En el menú izquierdo: **Pages**
3. En "Branch": selecciona **main** y carpeta **/ (root)**
4. Clic **Save**
5. Espera 1-2 minutos y tu portafolio estará en:
   `https://TU-USUARIO.github.io/portafolio/`

---

## 🔐 Acceso de administrador

- En cualquier página, verás un **candado 🔒** en la esquina inferior derecha
- Solo tú sabes las credenciales — no las compartas
- Al iniciar sesión, aparecen los botones de editar y subir trabajos
- La sesión dura mientras el navegador esté abierto

## 📁 Estructura

```
portafolio/
├── index.html          ← Página de inicio
├── css/style.css       ← Estilos
├── js/app.js           ← Lógica compartida
├── pages/
│   ├── perfil.html     ← Tu perfil personal
│   ├── curso.html      ← Curso y docente
│   ├── trabajos.html   ← Galería de trabajos
│   └── subir.html      ← Subir trabajos (solo admin)
└── .nojekyll
```

## ⚠️ Nota sobre almacenamiento

Los datos y archivos se guardan en `localStorage` del navegador.
Esto significa que los trabajos visibles dependen del dispositivo donde se subieron.
Para un portafolio permanente, sube los archivos desde el mismo equipo donde lo configures.
