import { API_ENDPOINTS, apiRequest } from '../api-config.js';
import { showToast } from '../toast.js';

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = (document.getElementById('username').value || '').trim();
    const password = document.getElementById('password').value || '';
    const email    = (document.getElementById('email').value || '').trim();

    if (!username || !password || !email) {
      showToast('error', '用户名、密码或邮箱不能为空');
      return;
    }

    // 在 login.js 中修改登录成功处理
    try {
        const res = await apiRequest(API_ENDPOINTS.login, {
            method: 'POST',
            body: { username, password, email },
            credentials: 'include'
        });

        // 保存用户会话信息，包括用户等级
        localStorage.setItem('userSession', JSON.stringify({
            username: res.user?.username || username,
            userId: res.user?.id || 1, // 使用固定用户ID作为默认值
            userLevel: res.user?.userLevel || 1, // 从响应中获取用户等级
            timestamp: Date.now()
        }));

    // 记录设备信息（新增）
    try {
        // 获取设备信息
        const deviceInfo = await getDeviceInfo();
        const locationInfo = await getLocationInfo();

        // 确保IP地址有效
        if (deviceInfo.ip === "unknown" || deviceInfo.ip === "未知IP") {
          // 再次尝试获取IP
          deviceInfo.ip = await getIPAddress();
        }

        const res = await apiRequest(API_ENDPOINTS.login, {
          method: 'POST',
          body: {
            username,
            password,
            email,
            deviceId: deviceInfo.deviceId,
            deviceName: deviceInfo.deviceName,
            browser: deviceInfo.browser,
            os: deviceInfo.os,
            ipAddress: deviceInfo.ip,   // 使用修正后的IP
          },
          credentials: 'include'
        });

    } catch (deviceError) {
        console.warn("记录设备信息失败:", deviceError);
        // 不阻止正常登录流程
    }
        showToast('success', '登录成功！正在为您跳转至首页...');
        setTimeout(() => (location.href = '../main/main.html'), 1500);
    } catch (err) {
        showToast('error', err.message || '登录失败');
    }
  });

  /* 管理员登录 */
  document.querySelector('.admin-login-btn')?.addEventListener('click', async () => {
    const username = (document.getElementById('username').value || '').trim();
    const password = document.getElementById('password').value || '';

    if (!username || !password) {
      showToast('error', '用户名和密码不能为空');
      return;
    }

    try {
      const res = await apiRequest(API_ENDPOINTS.adminLogin, {
        method: 'POST',
        body: { username, password },
        credentials: 'include'
      });

     // 保存管理员会话信息到本地存储
     localStorage.setItem('adminSession', JSON.stringify({
       username: res.data?.username,
       adminLevel: res.data?.adminLevel,
       timestamp: Date.now() // 添加时间戳
     }));

      showToast('success','管理员登录成功！正在进入管理后台...');
      setTimeout(() => (location.href = '../admin/admin.html'), 1500);
    } catch (err) {
      showToast('error', err.message || '管理员登录失败');
    }
  });

  /* 密码显隐 */
  document.querySelector('.password-toggle')?.addEventListener('click', (e) => {
    const icon = e.currentTarget.querySelector('i');
    const pwd  = document.getElementById('password');
    pwd.type   = pwd.type === 'password' ? 'text' : 'password';
    icon.classList.toggle('fa-eye-slash');
    icon.classList.toggle('fa-eye');
  });
});

// 获取设备信息
async function getDeviceInfo() {
    const userAgent = navigator.userAgent;
    let browser = "未知浏览器";
    let os = "未知系统";

    // 检测浏览器
    if (userAgent.includes("Chrome")) browser = "Chrome";
    else if (userAgent.includes("Firefox")) browser = "Firefox";
    else if (userAgent.includes("Safari")) browser = "Safari";
    else if (userAgent.includes("Edge")) browser = "Edge";

    // 检测操作系统
    if (userAgent.includes("Windows")) os = "Windows";
    else if (userAgent.includes("Mac")) os = "Mac OS";
    else if (userAgent.includes("Linux")) os = "Linux";
    else if (userAgent.includes("Android")) os = "Android";
    else if (userAgent.includes("iOS")) os = "iOS";

    // 生成设备ID（基于用户代理和屏幕信息的哈希）
    const deviceString = `${userAgent}-${screen.width}-${screen.height}-${navigator.language}`;
    const deviceId = await hashString(deviceString);

    return {
        deviceId,
        deviceName: `${os} - ${browser}`,  // 示例：Windows - Chrome
        browser,    // 示例：Chrome
        os,         // 示例：Windows
        ip: await getIPAddress()
    };
}

// 简单哈希函数
async function hashString(str) {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 16);
}

// 获取IP地址
async function getIPAddress() {
    try {
        // 使用更可靠的IP查询服务
        const response = await fetch('https://api64.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch (error) {
        console.warn("主IP查询服务失败，尝试备用服务:", error);

        // 备用方案1
        try {
            const backupResponse = await fetch('https://ipapi.co/json/');
            const backupData = await backupResponse.json();
            return backupData.ip;
        } catch (backupError) {
            console.warn("备用IP查询服务也失败:", backupError);

            // 备用方案2
            try {
                const lastResort = await fetch('https://jsonip.com');
                const lastResortData = await lastResort.json();
                return lastResortData.ip;
            } catch (finalError) {
                console.error("所有IP查询服务均失败:", finalError);
                return "unknown"; // 返回unknown而不是"未知IP"
            }
        }
    }
}

// 高精度定位（高德 IP 定位）
async function getLocationInfo() {
  try {
    // 先获取真实IP
    const realIp = await getIPAddress();

    // 使用真实IP查询位置
    const url = `https://restapi.amap.com/v3/ip?key=26fd6d1811bdc31b1081855f82a8d2a7&ip=${realIp}`;
    const ipRes = await fetch(url);
    const ipData = await ipRes.json();

    if (ipData.status === '1') {
      const province = ipData.province;
      const city = ipData.city;
      const district = ipData.district;

      // 过滤无效数据
      const parts = [];
      if (province && province !== '[]' && province !== 'null') parts.add(province);
      if (city && city !== '[]' && city !== 'null') parts.add(city);
      if (district && district !== '[]' && district !== 'null') parts.add(district);

      if (parts.length > 0) return parts.join(' · ');
    }
  } catch (e) {
    console.warn('高德定位失败', e);
  }

  // 降级：使用客户端IP信息
  try {
    const tbRes = await fetch('https://ipapi.co/json/');
    const tbData = await tbRes.json();

    const parts = [];
    if (tbData.country && tbData.country !== 'XX') parts.push(tbData.country);
    if (tbData.region && tbData.region !== 'XX') parts.push(tbData.region);
    if (tbData.city && tbData.city !== 'XX') parts.push(tbData.city);
    if (tbData.org) parts.push(tbData.org);

    if (parts.length > 0) return parts.join(' · ');
  } catch (e) {
    console.warn('IPAPI 降级失败', e);
  }

  return '未知位置';
}