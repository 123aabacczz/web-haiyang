/* ========== Toast 提示 ========== */
export function toast(msg, type = 'info', duration = 2000) {
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.textContent = msg;
  Object.assign(el.style, {
    position: 'fixed',
    top: '20px',
    right: '20px',
    padding: '8px 14px',
    borderRadius: 'var(--radius)',
    background: type === 'success' ? 'var(--success-color)' :
                type === 'error'   ? 'var(--danger-color)'  :
                                     'var(--primary-color)',
    color: '#fff',
    zIndex: 9999,
    transition: 'opacity .3s'
  });
  document.body.appendChild(el);
  requestAnimationFrame(() => el.style.opacity = 1);
  setTimeout(() => {
    el.style.opacity = 0;
    el.addEventListener('transitionend', () => el.remove());
  }, duration);
}

/* ========== 通用弹窗 ========== */
export function openModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  modal.style.display = 'block';
  modal.addEventListener('click', e => {
    if (e.target === modal) closeModal(id);
  });
}
export function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.style.display = 'none';
}

/* ========== 自动挂载到 window（便于 onclick 调用） ========== */
window.openModal = openModal;
window.closeModal = closeModal;