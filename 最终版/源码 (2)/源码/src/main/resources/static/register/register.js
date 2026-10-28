import { API_ENDPOINTS, apiRequest } from '../api-config.js';
import { showToast } from '../toast.js';

document.addEventListener('DOMContentLoaded', () => {
  const form            = document.getElementById('registerForm');
  const username        = document.getElementById('username');
  const email           = document.getElementById('email');
  const password        = document.getElementById('password');
  const confirmPassword = document.getElementById('confirmPassword');
  const secret          = document.getElementById('secret');
  const secretError = document.getElementById('secretError');

  const usernameError = document.getElementById('usernameError');
  const emailError    = document.getElementById('emailError');
  const passwordError = document.getElementById('passwordError');
  const confirmPasswordError = document.getElementById('confirmPasswordError');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
        [usernameError, emailError, passwordError, confirmPasswordError]
        .forEach(el => el.textContent = '');
    //modalManager.hide('some-modal');

    const uVal = (username.value || '').trim();
    const eVal = (email.value || '').trim();
    const pVal = (password.value || '').trim();
    const cVal = (confirmPassword.value || '').trim();
    const sVal = (secret.value || '').trim();

    let valid = true;
    if (uVal.length < 3)        { usernameError.textContent = '用户名至少3个字符'; valid = false; }
    if (!eVal.includes('@'))    { emailError.textContent = '请输入有效邮箱'; valid = false; }
    if (pVal.length < 6)        { passwordError.textContent = '密码至少6位'; valid = false; }
    if (pVal !== cVal)          { confirmPasswordError.textContent = '两次密码不一致'; valid = false; }

    if (!valid) {
      document.getElementById('regHint').style.display = 'inline';
      return;
    }

    try {
      const res = await apiRequest(API_ENDPOINTS.register, {
        method: 'POST',
          body: { username: uVal, email: eVal, password: pVal, secret: sVal }
      });

      // 修正：使用Toast的统一跳转逻辑
      showToast(
        'success',
        '注册申请已提交！管理员审核中，请耐心等待',
        3000,
        '../login/login.html'  // 添加重定向URL参数
      );
    } catch (err) {
          let userMessage = '注册失败';
          const serverError = err.message.toLowerCase();

          if (serverError.includes('email')) userMessage = '该邮箱已注册';
          else if (serverError.includes('username')) userMessage = '用户名已被使用';
          else if (serverError.includes('phone')) userMessage = '手机号格式错误'; // 新增
          else if (serverError.includes('500')) userMessage = '系统繁忙，请稍后重试';

          showToast('error', userMessage);
      }
  });

  /* 密码显隐 */
  document.querySelectorAll('.password-toggle').forEach(toggle =>
    toggle.addEventListener('click', () => {
      const input = toggle.previousElementSibling;
      const icon  = toggle.querySelector('i');
      input.type  = input.type === 'password' ? 'text' : 'password';
      icon.classList.toggle('fa-eye-slash');
      icon.classList.toggle('fa-eye');
    })
  );
});