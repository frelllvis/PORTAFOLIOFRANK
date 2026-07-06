/* ══════════════════════════════════════
   app.js  —  lógica compartida del portafolio
   ══════════════════════════════════════ */

const USER = '72416666feqc';
const PASS = '72416666feqcGGG';

/* ── Estado de sesión ── */
function isAdmin() { return sessionStorage.getItem('admin') === 'yes'; }
function setAdmin(v) {
  if (v) sessionStorage.setItem('admin', 'yes');
  else    sessionStorage.removeItem('admin');
}

/* ── Aplicar clase admin al body ── */
function applyAdminBody() {
  if (isAdmin()) document.body.classList.add('admin');
  else           document.body.classList.remove('admin');
}

/* ── Renderizar botón candado ── */
function renderLock() {
  const old = document.getElementById('lock-btn');
  if (old) old.remove();
  const btn = document.createElement('button');
  btn.id = 'lock-btn';
  btn.title = isAdmin() ? 'Cerrar sesión de administrador' : 'Acceso administrador';
  btn.innerHTML = isAdmin() ? '🔓' : '🔒';
  if (isAdmin()) btn.classList.add('logged-in');
  btn.addEventListener('click', () => {
    if (isAdmin()) {
      if (confirm('¿Cerrar sesión de administrador?')) {
        setAdmin(false);
        applyAdminBody();
        renderLock();
        showProtectedElements();
      }
    } else {
      openLoginModal();
    }
  });
  document.body.appendChild(btn);
}

/* ── Modal de login ── */
function openLoginModal() {
  let overlay = document.getElementById('login-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'login-overlay';
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal-box">
        <button class="modal-close" onclick="closeLoginModal()">×</button>
        <h3>Acceso Admin</h3>
        <p style="color:var(--muted);font-size:.82rem;margin-bottom:1rem;">
          Solo el administrador puede editar este portafolio.
        </p>
        <p class="modal-error" id="login-error">Usuario o contraseña incorrectos.</p>
        <input type="text" id="login-user" placeholder="Usuario" autocomplete="username"/>
        <input type="password" id="login-pass" placeholder="Contraseña" autocomplete="current-password"/>
        <button class="modal-btn" onclick="doLogin()">Entrar</button>
      </div>`;
    overlay.addEventListener('click', e => { if (e.target === overlay) closeLoginModal(); });
    document.body.appendChild(overlay);
  }
  document.getElementById('login-user').value = '';
  document.getElementById('login-pass').value = '';
  document.getElementById('login-error').style.display = 'none';
  requestAnimationFrame(() => overlay.classList.add('open'));
  document.getElementById('login-user').focus();

  // Enter key
  overlay.querySelectorAll('input').forEach(inp => {
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
  });
}

function closeLoginModal() {
  const o = document.getElementById('login-overlay');
  if (o) { o.classList.remove('open'); }
}

function doLogin() {
  const u = document.getElementById('login-user').value.trim();
  const p = document.getElementById('login-pass').value;
  if (u === USER && p === PASS) {
    setAdmin(true);
    applyAdminBody();
    closeLoginModal();
    renderLock();
    showProtectedElements();
    // Si hay callback post-login
    if (typeof window.onAdminLogin === 'function') window.onAdminLogin();
  } else {
    document.getElementById('login-error').style.display = 'block';
  }
}

function showProtectedElements() {
  // Mostrar/ocultar el btn de subir en nav
  document.querySelectorAll('.admin-only').forEach(el => {
    el.style.display = isAdmin() ? '' : 'none';
  });
}

/* ── Tipos de archivo ── */
function getFileType(name) {
  if (!name) return 'otro';
  const ext = name.split('.').pop().toLowerCase();
  if (ext === 'pdf') return 'pdf';
  if (['r', 'rmd', 'rscript'].includes(ext)) return 'r';
  if (['xlsx', 'xls', 'csv'].includes(ext)) return 'excel';
  if (['doc', 'docx'].includes(ext)) return 'word';
  return 'otro';
}

function getTypeLabel(t) {
  return {pdf:'PDF', r:'R / RStudio', excel:'Excel / CSV', word:'Word', otro:'Otro'}[t] || t;
}

function getTypeEmoji(t) {
  return {pdf:'📄', r:'📊', excel:'📗', word:'📝', otro:'📁'}[t] || '📁';
}

/* ── Construir tarjeta de trabajo ── */
function buildCard(t, admin) {
  const type = t.type || getFileType(t.fileName);
  const date = t.date ? new Date(t.date).toLocaleDateString('es-PE', {day:'2-digit',month:'short',year:'numeric'}) : '';
  const adminBtns = admin ? `
    <button class="btn-sm delete" onclick="deleteWork('${t.id}')">Eliminar</button>
  ` : '';
  const viewBtn = t.fileData ? `
    <button class="btn-view" onclick="viewWork('${t.id}')">Ver ${getTypeEmoji(type)}</button>
  ` : '';
  const dlBtn = t.fileData ? `
    <button class="btn-sm" onclick="downloadWork('${t.id}')">Descargar</button>
  ` : '';
  return `
    <div class="work-card" id="card-${t.id}">
      <div style="display:flex;align-items:center;gap:.5rem;">
        <span class="card-type type-${type}">${getTypeLabel(type)}</span>
      </div>
      <div class="card-title">${escHtml(t.title)}</div>
      <div class="card-desc">${escHtml(t.description || '')}</div>
      <div class="card-date">${date}${t.fileName ? ' · '+escHtml(t.fileName) : ''}</div>
      <div class="card-actions">${viewBtn}${dlBtn}${adminBtns}</div>
    </div>`;
}

/* ── Viewer de archivos ── */
function viewWork(id) {
  const works = getWorks();
  const t = works.find(w => w.id === id);
  if (!t || !t.fileData) return;

  let overlay = document.getElementById('viewer-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'viewer-overlay';
    overlay.className = 'viewer-overlay';
    overlay.innerHTML = `
      <div class="viewer-toolbar">
        <span class="viewer-title" id="viewer-title"></span>
        <button class="viewer-close" onclick="closeViewer()">×</button>
      </div>
      <div id="viewer-body" style="flex:1;display:flex;overflow:hidden;"></div>`;
    document.body.appendChild(overlay);
  }

  document.getElementById('viewer-title').textContent = t.title + (t.fileName ? ' — ' + t.fileName : '');
  const body = document.getElementById('viewer-body');
  const type = t.type || getFileType(t.fileName);

  if (type === 'pdf') {
    body.innerHTML = `<iframe class="viewer-frame" src="${t.fileData}"></iframe>`;
  } else {
    body.innerHTML = `
      <div class="viewer-nopreview">
        <div style="font-size:3rem">${getTypeEmoji(type)}</div>
        <p style="color:var(--text);font-weight:600">${escHtml(t.title)}</p>
        <p style="color:var(--muted);font-size:.9rem">
          Este tipo de archivo (${getTypeLabel(type)}) no puede previsualizarse en el navegador.
        </p>
        <button class="btn-primary" onclick="downloadWork('${t.id}')">Descargar archivo</button>
      </div>`;
  }
  requestAnimationFrame(() => overlay.classList.add('open'));
}

function closeViewer() {
  const o = document.getElementById('viewer-overlay');
  if (o) o.classList.remove('open');
}

function downloadWork(id) {
  const works = getWorks();
  const t = works.find(w => w.id === id);
  if (!t || !t.fileData) return;
  const a = document.createElement('a');
  a.href = t.fileData;
  a.download = t.fileName || t.title;
  a.click();
}

function deleteWork(id) {
  if (!confirm('¿Eliminar este trabajo?')) return;
  const works = getWorks().filter(w => w.id !== id);
  saveWorks(works);
  const card = document.getElementById('card-' + id);
  if (card) card.remove();
  if (typeof window.afterDelete === 'function') window.afterDelete();
}

/* ── Storage helpers ── */
function getWorks() { return JSON.parse(localStorage.getItem('trabajos') || '[]'); }
function saveWorks(arr) { localStorage.setItem('trabajos', JSON.stringify(arr)); }
function getPerfil() { return JSON.parse(localStorage.getItem('perfil') || '{}'); }
function getCurso()  { return JSON.parse(localStorage.getItem('curso')  || '{}'); }

/* ── Escape HTML ── */
function escHtml(s) {
  return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/* ── Toggle menú hamburger ── */
function toggleMenu() {
  document.querySelector('.nav-links').classList.toggle('open');
}

/* ── Init al cargar ── */
document.addEventListener('DOMContentLoaded', () => {
  applyAdminBody();
  renderLock();
  showProtectedElements();

  // Marcar enlace activo en nav
  const path = location.pathname.split('/').pop();
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.classList.remove('active');
    if (a.getAttribute('href').endsWith(path)) a.classList.add('active');
  });

  // Esc cierra modales
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeLoginModal();
      closeViewer();
    }
  });
});
