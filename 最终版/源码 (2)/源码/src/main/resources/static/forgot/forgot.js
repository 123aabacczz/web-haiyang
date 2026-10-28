import { API_ENDPOINTS, apiRequest } from '../api-config.js';
import { showToast } from '../toast.js';

document.addEventListener('DOMContentLoaded', () => {
  const forgotForm = document.getElementById('forgotForm');
  const emailErr   = document.getElementById('emailErr');

  forgotForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    emailErr.textContent = '';

    const email       = document.getElementById('email').value.trim();
    const secret      = document.getElementById('secret').value.trim();
    const newPassword = document.getElementById('newPassword').value.trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      emailErr.textContent = '请输入有效的邮箱地址';
      return;
    }
    if (newPassword.length < 6) {
      showToast('error', '新密码至少6位');
      return;
    }

    const btn = forgotForm.querySelector('button[type="submit"]');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 处理中...';
    btn.disabled  = true;

    try {
      const res = await apiRequest(API_ENDPOINTS.forgotPassword, {
        method: 'POST',
        body: { email, secret, newPassword }
      });
      showToast('success', '密码已更新！请使用新密码登录');
      forgotForm.reset();
    } catch (err) {
      showToast('error', err.message || '密码重置失败');
    } finally {
      btn.innerHTML = '立即重置';
      btn.disabled  = false;
    }
  });
});