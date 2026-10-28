// 添加变量声明
let activeToast = null;
let toastQueue = [];

export function showToast(type, msg, duration = 3000, redirectUrl = null) {
  if (activeToast && activeToast.msg === msg) {
    return;
  }

  // 如果有toast正在显示，将新toast加入队列
  if (activeToast) {
    toastQueue.push({ type, msg, duration, redirectUrl });
    return;
  }

  let box = document.getElementById('toastBox');
  let ovl = document.getElementById('toastOverlay');

  // 首次渲染
  if (!box) {
    ovl = document.createElement('div');
    ovl.id = 'toastOverlay';
    ovl.style.cssText = `
      position: fixed; inset: 0;
      background: rgba(0,0,0,.55);
      backdrop-filter: blur(4px);
      display: flex; align-items: center;
      justify-content: center; z-index: 9999;
      font-size: 14px; display: none;
    `;

    ovl.innerHTML = `
      <div id="toastBox" style="
        width: 320px;
        background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
        border-radius: 14px; padding: 40px 30px;
        text-align: center; color: #fff;
        box-shadow: 0 0 0 1px rgba(167,132,239,.3),
                    0 0 30px rgba(167,132,239,.3),
                    0 0 60px rgba(167,132,239,.15);
        position: relative;
        animation: popIn .45s ease-out;
      ">
        <i id="toastIcon"></i>
        <div id="toastMsg" style="
          font-size: 18px; font-weight: 600;
          letter-spacing: .5px; margin-top: 12px;
        "></div>
        <div id="toastProgress" style="
          position: absolute; bottom: 0; left: 0;
          height: 4px; border-radius: 0 0 14px 14px;
          background: linear-gradient(90deg, #a78cf9, #d5b8ff);
        "></div>
      </div>
      <style>
        @keyframes popIn {
          0% { transform: scale(.7); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes progress { from { width: 0 } to { width: 100% } }
      </style>
    `;

    document.body.appendChild(ovl);
    box = document.getElementById('toastBox');
  }

  // 设置内容
  const icon = document.getElementById('toastIcon');
  const msgEl = document.getElementById('toastMsg');
  const progress = document.getElementById('toastProgress');

  icon.className = type === 'success'
    ? 'fas fa-check-circle'
    : 'fas fa-times-circle';
  msgEl.textContent = msg;

  // 显示Toast
  ovl.style.display = 'flex';

  // 重置进度条动画
  progress.style.animation = 'none';
  setTimeout(() => {
    progress.style.animation = 'progress 3s linear forwards';
  }, 10);

  // 设置关闭定时器
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => {
    ovl.style.display = 'none';
    activeToast = null;

    // 显示队列中的下一个toast
    if (toastQueue.length > 0) {
      const nextToast = toastQueue.shift();
      showToast(nextToast.type, nextToast.msg, nextToast.duration, nextToast.redirectUrl);
    }

    if (redirectUrl) {
      location.href = redirectUrl;
    }
  }, duration);
}

// 添加清除所有toast的函数
export function clearAllToasts() {
  toastQueue = [];
  const ovl = document.getElementById('toastOverlay');
  if (ovl) {
    ovl.style.display = 'none';
  }
  activeToast = null;
  clearTimeout(window.__toastTimer);
}
