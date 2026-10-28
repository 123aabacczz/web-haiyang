// settings.js
import { apiRequest, API_ENDPOINTS } from '../../api-config.js';
import { showToast } from '../../toast.js';

let CURRENT_USER_ID = null;

async function fetchCurrentUser() {
  try {
    // 尝试从sessionStorage获取
    const userSession = sessionStorage.getItem('user');
    if (userSession) {
      try {
        const userData = JSON.parse(userSession);
        if (userData && userData.id) {
          CURRENT_USER_ID = userData.id;
          console.log('从sessionStorage获取用户ID:', CURRENT_USER_ID);
          return; // 直接返回，不再调用API
        }
      } catch (e) {
        console.error('解析sessionStorage失败', e);
        sessionStorage.removeItem('user');
      }
    }

    // 从API获取
    const response = await apiRequest(API_ENDPOINTS.currentUser);
    if (response && response.id) {
      CURRENT_USER_ID = response.id;
      sessionStorage.setItem('user', JSON.stringify(response));
    }
  } catch (error) {
    console.error('获取用户失败:', error);
    showToast('请重新登录', 'error');
    setTimeout(() => {
      window.location.href = '../../login/login.html';
    }, 2000);
  }
}

function validatePasswordStrength(password) {
  if (password.length < 8) {
    return { valid: false, message: '密码长度至少8位' };
  }
  if (!password.match(/[A-Z]/)) {
    return { valid: false, message: '密码必须包含大写字母' };
  }
  if (!password.match(/[a-z]/)) {
    return { valid: false, message: '密码必须包含小写字母' };
  }
  if (!password.match(/\d/)) {
    return { valid: false, message: '密码必须包含数字' };
  }
  return { valid: true, message: '密码强度足够' };
}

// 模态框功能
function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.style.display = 'block';
    // 将body的overflow设置为hidden，防止滚动
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
  }
}

// 点击模态框外部关闭
window.addEventListener('click', function(event) {
  if (event.target.classList.contains('modal')) {
    closeModal(event.target.id);
  }
});

// 为关闭按钮添加事件委托
document.addEventListener('DOMContentLoaded', function() {
  document.addEventListener('click', function(event) {
    if (event.target.classList.contains('close')) {
      const modal = event.target.closest('.modal');
      closeModal(modal.id);
    }
  });
});

// 更新个人信息
async function updateUserProfile(userId, profileData) {
  try {
    await apiRequest(API_ENDPOINTS.updateProfile(userId), {
      method: 'PUT',
      body: profileData
    });
    console.log('个人信息更新成功');
  } catch (error) {
    console.error('更新个人信息失败:', error);
  }
}

// 更新密码
async function updateUserPassword(userId, passwordData) {
  try {
    await apiRequest(API_ENDPOINTS.updatePassword(userId), {
      method: 'PUT',
      body: passwordData
    });
    console.log('密码更新成功');
  } catch (error) {
    console.error('更新密码失败:', error);
  }
}

// 更新通知设置
async function updateUserNotifications(userId, notificationData) {
  try {
    await apiRequest(API_ENDPOINTS.updateNotificationSettings(userId), {
      method: 'PUT',
      body: notificationData
    });
    console.log('通知设置更新成功');
  } catch (error) {
    console.error('更新通知设置失败:', error);
  }
}

// 获取用户设备
async function fetchUserDevices() {
  try {
    return await apiRequest(API_ENDPOINTS.userDevices(CURRENT_USER_ID));
  } catch (error) {
    console.error('获取用户设备失败:', error);
    showToast('获取用户设备失败', 'error');
    return [];
  }
}

// 退出设备
async function logoutDevice(deviceId) {
  try {
    await apiRequest(API_ENDPOINTS.logoutDevice(CURRENT_USER_ID, deviceId), {
      method: 'DELETE'
    });
    showToast('设备已退出登录', 'success');
    return true;
  } catch (error) {
    console.error('退出设备失败:', error);
    showToast('退出设备失败', 'error');
    return false;
  }
}

// 获取登录历史
async function fetchLoginHistory(page = 1, size = 10) {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString()  // 确保使用正确的参数名
    });

    const url = `${API_ENDPOINTS.loginHistory(CURRENT_USER_ID)}?${params}`;
    return await apiRequest(url);
  } catch (error) {
    console.error('获取登录历史失败:', error);
    showToast('获取登录历史失败', 'error');
    return [];
  }
}

// 导出个人数据
async function exportUserData(options) {
  try {
    const exportId = await apiRequest(API_ENDPOINTS.exportData(CURRENT_USER_ID), {
      method: 'POST',
      body: options
    });

    showToast('导出请求已提交，处理完成后将通知您', 'success');
    return exportId;
  } catch (error) {
    console.error('导出数据失败:', error);
    showToast('导出数据失败', 'error');
    return null;
  }
}

// 填充设置表单
function populateSettingsForm(settings) {
  // 填充个人信息
  if (settings.profile) {
    document.getElementById('name').value = settings.profile.name || '';
    document.getElementById('position').value = settings.profile.position || '';
    document.getElementById('contact').value = settings.profile.contact || '';
  }

  // 填充通知设置
  if (settings.notifications) {
    document.getElementById('email-notifications').checked = settings.notifications.email || false;
    document.getElementById('desktop-notifications').checked = settings.notifications.desktop || false;
  }
}

// 处理个人信息更新
async function handleProfileUpdate(e) {
  e.preventDefault();

  const profileData = {
    name: document.getElementById('name').value,
    position: document.getElementById('position').value,
    contact: document.getElementById('contact').value
  };

  const success = await updateProfile(profileData);
  if (success) {
    closeModal('profile-modal');
  }
}

// 处理通知设置更新
async function handleNotificationsUpdate(e) {
  e.preventDefault();

  const notificationSettings = {
    email: document.getElementById('email-notifications').checked,
    desktop: document.getElementById('desktop-notifications').checked
  };

  const success = await updateNotificationSettings(notificationSettings);
  if (success) {
    showToast('通知设置已保存', 'success');
  }
}

// settings.js 中添加忘记密码功能
async function handleForgotPassword() {
  const email = prompt('请输入您的注册邮箱:');
  if (!email) return;

  try {
    const secret = prompt('请输入您设置的安全暗号:');
    if (!secret) return;

    const newPassword = prompt('请输入新密码:');
    if (!newPassword) return;

    // 验证密码强度
    const strengthCheck = validatePasswordStrength(newPassword);
    if (!strengthCheck.valid) {
      showToast(strengthCheck.message, 'error');
      return;
    }

    // 完成密码重置
    await apiRequest('/api/forgot-password', {
      method: 'POST',
      body: JSON.stringify({
        email,
        secret,
        newPassword
      })
    });

    showToast('密码重置成功，请使用新密码登录', 'success');
    // 重定向到登录页
    setTimeout(() => {
      window.location.href = '../../login/login.html';
    }, 2000);
  } catch (error) {
    showToast('密码重置失败: ' + error.message, 'error');
  }
}

// 在适当的地方添加忘记密码按钮事件监听
document.addEventListener('DOMContentLoaded', function() {
  const forgotPasswordBtn = document.getElementById('forgot-password-btn');
  if (forgotPasswordBtn) {
    forgotPasswordBtn.addEventListener('click', handleForgotPassword);
  }
});

// 处理数据导出
async function handleDataExport(e) {
  e.preventDefault();

  const exportOptions = {
    format: document.getElementById('export-format').value,
    dateRange: document.getElementById('date-range').value,
    includeFiles: document.getElementById('include-files').checked,
    includeActivity: document.getElementById('include-activity').checked
  };

  // 如果是自定义日期范围
  if (exportOptions.dateRange === 'custom') {
    exportOptions.startDate = document.getElementById('start-date').value;
    exportOptions.endDate = document.getElementById('end-date').value;
  }

  const exportId = await exportUserData(exportOptions);
  if (exportId) {
    closeModal('export-data-modal');
  }
}

// 加载设备列表
async function loadDevices() {
  const devices = await fetchUserDevices();
  renderDevices(devices);
}

// 渲染设备列表
function renderDevices(devices) {
  const devicesList = document.getElementById('devices-list');
  devicesList.innerHTML = '';

  if (devices.length === 0) {
    devicesList.innerHTML = '<div class="empty-state"><i class="fas fa-laptop"></i><p>没有找到设备信息</p></div>';
    return;
  }

  devices.forEach(device => {
  const name = (device.deviceName && device.deviceName !== 'null')
    ? device.deviceName
    : `${device.os} · ${device.browser}`;
    const deviceElement = document.createElement('div');
    deviceElement.className = 'device-item';
    deviceElement.innerHTML = `
      <div class="device-info">
        <h4>${device.deviceName}</h4>
        <p>最后活动时间: ${formatDateTime(device.lastActivity)}</p>
        <p>位置: ${device.location || '未知'}</p>
      </div>
    `;
    devicesList.appendChild(deviceElement);
  });
}

// 处理退出设备
async function handleLogoutDevice(deviceId) {
  if (!deviceId) {
    showToast('设备ID缺失，无法退出', 'error');
    return;
  }
  const confirmed = confirm('确定要退出此设备吗？');
  if (!confirmed) return;

  const success = await logoutDevice(deviceId);
  if (success) {
    loadDevices();
  }
}

// 加载登录历史
async function loadLoginHistory() {
  const history = await fetchLoginHistory();
  console.log('登录历史数据:', history);

  if (history && history.items && history.items.length > 0) {
    renderLoginHistory(history.items);
  } else {
    renderLoginHistory([]);
  }
}

// 渲染登录历史
function renderLoginHistory(history) {
  const historyList = document.getElementById('login-history-list');
  historyList.innerHTML = '';

  if (history.length === 0) {
    historyList.innerHTML = '<div class="empty-state"><i class="fas fa-history"></i><p>没有登录历史记录</p></div>';
    return;
  }

  history.forEach(record => {
    const recordElement = document.createElement('div');
    recordElement.className = 'device-item';
    recordElement.innerHTML = `
      <div class="device-info">
        <h4>${record.browser} · ${record.os}</h4>
        <p>登录时间: ${record.loginTime ? formatDateTime(record.loginTime) : '未知时间'}</p>
        <p>位置: ${record.location || '未知'} · ${record.status}</p>
      </div>
    `;
    historyList.appendChild(recordElement);
  });
}

// 格式化日期时间
function formatDateTime(dateTimeString) {
  if (!dateTimeString) return '未知时间';
  const date = new Date(dateTimeString);
  if (isNaN(date.getTime())) return '未知时间';
  return date.toLocaleString('zh-CN');
}

// 日期范围选择器逻辑
function setupDateRangeSelector() {
  const dateRange = document.getElementById('date-range');
  const customDateRange = document.getElementById('custom-date-range');

  if (dateRange && customDateRange) {
    dateRange.addEventListener('change', function() {
      customDateRange.style.display = this.value === 'custom' ? 'block' : 'none';
    });
  }
}

document.addEventListener('DOMContentLoaded', function() {
  // 从sessionStorage获取用户信息，使用'user'作为键名
  const userSession = sessionStorage.getItem('user');
  if (userSession) {
    try {
      const userData = JSON.parse(userSession);
      CURRENT_USER_ID = userData.id;
      console.log('获取到用户ID:', CURRENT_USER_ID);

      // 初始化设置页面
      initSettingsPage();
      setupDateRangeSelector();
    } catch (e) {
      console.error('解析用户会话失败:', e);
      // 如果解析失败，尝试获取当前用户
      fetchCurrentUser();
    }
  } else {
    // 如果没有存储的用户信息，尝试从API获取当前用户
    fetchCurrentUser();
  }

  const passwordForm = document.getElementById('password-form');
    if (passwordForm) {
      passwordForm.addEventListener('submit', handlePasswordUpdate);
    }

  // 为所有打开模态框的按钮绑定事件
  document.querySelectorAll('.modal-open-btn').forEach(button => {
    button.addEventListener('click', function() {
      const targetModalId = this.getAttribute('data-target');
      openModal(targetModalId);
    });
  });

  // 为所有关闭按钮绑定事件
  document.querySelectorAll('.modal .close').forEach(closeBtn => {
    closeBtn.addEventListener('click', function() {
      const modal = this.closest('.modal');
      closeModal(modal.id);
    });
  });

  // 添加到全局对象以便HTML中的onclick调用（如果需要）
  window.handleLogoutDevice = handleLogoutDevice;
});

/* ====== 设置页“修改密码”提交 ====== */
async function handlePasswordUpdate(e) {
  e.preventDefault();

  // 先获取当前用户信息，确保使用最新的用户ID
  let currentUser;
  try {
    currentUser = await apiRequest(API_ENDPOINTS.currentUser);
    if (!currentUser || !currentUser.id) {
      showToast('无法获取用户信息，请重新登录', 'error');
      setTimeout(() => {
        window.location.href = '../login/login.html';
      }, 2000);
      return;
    }
  } catch (error) {
    console.error('获取当前用户失败:', error);
    showToast('获取用户信息失败，请重新登录', 'error');
    setTimeout(() => {
      window.location.href = '../login/login.html';
    }, 2000);
    return;
  }

  const oldPwd = document.getElementById('current-password').value.trim();
  const newPwd = document.getElementById('new-password').value.trim();
  const confirmPwd = document.getElementById('confirm-password').value.trim();

  if (!oldPwd || !newPwd || !confirmPwd) {
    showToast('请完整填写', 'error'); return;
  }
  if (newPwd !== confirmPwd) {
    showToast('两次新密码不一致', 'error'); return;
  }
  const chk = validatePasswordStrength(newPwd);
  if (!chk.valid) { showToast(chk.message, 'error'); return; }
  try {
    // 使用从API获取的最新用户ID
    await apiRequest(API_ENDPOINTS.updatePassword(currentUser.id), {
      method: 'PUT',
      body: JSON.stringify({ currentPassword: oldPwd, newPassword: newPwd })
    });
    showToast('密码已更新，请重新登录', 'success');
    sessionStorage.removeItem('user');
    setTimeout(() => (window.location.href = '../../login/login.html'), 1500);
  } catch (err) {
    showToast(err.message || '修改失败', 'error');
  }
}
// 添加获取当前用户的函数
async function fetchUserSettings() {
  if (!CURRENT_USER_ID) {
    console.error('用户ID未设置，无法获取设置');
    return null;
  }

  try {
    const settings = await apiRequest(API_ENDPOINTS.userSettings(CURRENT_USER_ID));
    console.log('用户设置:', settings);
    return settings;
  } catch (error) {
    console.error('获取用户设置失败:', error);
    return null;
  }
}

// 添加缺失的函数定义
async function updateProfile(profileData) {
  if (!CURRENT_USER_ID) {
    showToast('用户未登录', 'error');
    return false;
  }

  try {
    await apiRequest(API_ENDPOINTS.updateProfile(CURRENT_USER_ID), {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
    showToast('个人信息更新成功', 'success');
    return true;
  } catch (error) {
    console.error('更新个人信息失败:', error);
    showToast('更新个人信息失败', 'error');
    return false;
  }
}

// 添加本地活动记录函数
function saveLocalActivity(activity) {
  try {
    let activities = JSON.parse(localStorage.getItem('userActivities') || '[]');
    activities.push(activity);
    localStorage.setItem('userActivities', JSON.stringify(activities));
  } catch (error) {
    console.error('保存本地活动记录失败:', error);
  }
}

async function updateNotificationSettings(notificationSettings) {
  if (!CURRENT_USER_ID) {
    showToast('用户未登录', 'error');
    return false;
  }

  try {
    await apiRequest(API_ENDPOINTS.updateNotificationSettings(CURRENT_USER_ID), {
      method: 'PUT',
      body: JSON.stringify(notificationSettings)
    });
    return true;
  } catch (error) {
    console.error('更新通知设置失败:', error);
    return false;
  }
}

// 修改初始化函数，确保DOM完全加载
async function initSettingsPage() {
  // 等待DOM完全加载
  if (document.readyState === 'loading') {
    await new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve));
  }

  // 加载用户设置
  const settings = await fetchUserSettings();
  if (settings) {
    populateSettingsForm(settings);
  }

  // 为表单添加提交处理（确保元素存在）
  const profileForm = document.getElementById('profile-form');
  const notificationsForm = document.getElementById('notifications-form');
  const exportForm = document.getElementById('export-form');

  if (profileForm) profileForm.addEventListener('submit', handleProfileUpdate);
  if (notificationsForm) notificationsForm.addEventListener('submit', handleNotificationsUpdate);
  if (exportForm) exportForm.addEventListener('submit', handleDataExport);

  // 加载设备列表
  loadDevices();

  // 加载登录历史
  loadLoginHistory();
}

// 将函数挂载到全局对象
window.openModal = openModal;
window.closeModal = closeModal;