// 个人中心页面交互功能
import { apiRequest, API_ENDPOINTS } from '../../api-config.js';
import { showToast } from '../../toast.js';

// 全局变量
let currentUser = null;

// 页面加载完成后执行
window.addEventListener('DOMContentLoaded', async () => {
  console.log('=== 个人中心页面加载 ===');
  await checkUserSession();
  await loadPersonalCenterData();
});

// 检查用户会话
async function checkUserSession() {
  try {
    // 读取本地存储的会话信息
    const adminSession = JSON.parse(localStorage.getItem('adminSession'));
    const userSession = JSON.parse(localStorage.getItem('userSession'));
    
    // 优先使用管理员会话
    let session = adminSession || userSession;
    
    if (!session) {
      console.warn('用户未登录');
      showToast('error', '请先登录');
      setTimeout(() => {
        window.location.href = '../../login/login.html';
      }, 1500);
      return null;
    }
    
    // 检查会话是否过期（1小时有效期）
    const sessionExpired = (Date.now() - (session.timestamp || 0)) > 3600000;
    if (sessionExpired) {
      console.warn('会话已过期');
      // 清除过期会话
      localStorage.removeItem('adminSession');
      localStorage.removeItem('userSession');
      showToast('error', '会话已过期，请重新登录');
      setTimeout(() => {
        window.location.href = '../../login/login.html';
      }, 1500);
      return null;
    }
    
    // 更新会话时间戳，延长会话有效期
    session.timestamp = Date.now();
    if (adminSession) {
      localStorage.setItem('adminSession', JSON.stringify(session));
    } else if (userSession) {
      localStorage.setItem('userSession', JSON.stringify(session));
    }
    
    console.log('用户会话信息:', session);
    currentUser = session;
    updateHeaderUserInfo(session);
    return session;
  } catch (error) {
    console.error('检查会话失败:', error);
    // 清除可能损坏的会话数据
    try {
      localStorage.removeItem('adminSession');
      localStorage.removeItem('userSession');
    } catch (e) {
      console.error('清除会话数据失败:', e);
    }
    showToast('error', '会话异常，请重新登录');
    setTimeout(() => {
      window.location.href = '../../login/login.html';
    }, 1500);
    return null;
  }
}

// 加载个人中心数据
async function loadPersonalCenterData() {
  try {
    console.log('=== 开始加载个人中心数据 ===');
    
    // 显示加载状态
    showLoadingState();
    
    // 直接使用fetch调用API
    const response = await fetch(API_ENDPOINTS.personalProfile, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    // 检查响应状态
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    // 解析响应数据
    const responseData = await response.json();
    console.log('API响应数据:', responseData);
    
    // 提取数据
    let personalData;
    if (responseData && responseData.data) {
      personalData = responseData.data;
    } else if (responseData && typeof responseData === 'object') {
      personalData = responseData;
    } else {
      throw new Error('无效的响应格式');
    }
    
    console.log('个人中心数据:', personalData);
    
    // 显示数据
    displayPersonalCenterData(personalData);
    
    showToast('success', '个人中心数据加载成功');
  } catch (error) {
    console.error('加载个人中心数据失败:', error);
    showToast('error', '加载个人中心数据失败: ' + error.message);
    // 显示默认数据
    displayDefaultData();
  } finally {
    // 隐藏加载状态
    hideLoadingState();
  }
}

// 显示加载状态
function showLoadingState() {
  // 基本信息加载状态
  document.getElementById('user-name').textContent = '加载中...';
  document.getElementById('profile-title').textContent = '加载中...';
  document.getElementById('level-badge').textContent = 'Lv.0';
  document.getElementById('level-badge').setAttribute('data-level', '0');
  
  // 统计数据加载状态
  document.getElementById('stat-projects').textContent = '-';
  document.getElementById('stat-documents').textContent = '-';
  document.getElementById('stat-skills').textContent = '-';
  document.getElementById('stat-years').textContent = '-';
  
  // 本周概览加载状态
  document.getElementById('overview-documents').textContent = '-';
  document.getElementById('overview-tasks').textContent = '-';
  document.getElementById('overview-comments').textContent = '-';
  document.getElementById('overview-study-time').textContent = '-';
}

// 隐藏加载状态
function hideLoadingState() {
  // 加载完成后无需特殊处理
}

// 显示个人中心数据
function displayPersonalCenterData(data) {
  // 检查数据是否存在
  if (!data) {
    console.warn('个人中心数据为空');
    displayDefaultData();
    return;
  }
  
  // 显示基本信息
  if (data.profile) {
    const profileLevel = parseInt(data.profile.level, 10) || 1;
    document.getElementById('user-name').textContent = data.profile.username || '用户名';
    document.getElementById('profile-title').textContent = data.profile.title || '暂无职位';
    document.getElementById('level-badge').textContent = `Lv.${profileLevel}`;
    document.getElementById('level-badge').setAttribute('data-level', profileLevel);
    updateAvatarLevel(profileLevel);
    updateProfileBio(data.profile.bio);
    populateEditProfileForm(data.profile);
  }

  updateExperience(data.taskCenter);

  // 显示用户标签
  const tagsContainer = document.querySelector('.profile-tags');
  if (tagsContainer) {
    tagsContainer.innerHTML = '';
    (data.tags || []).forEach(tag => {
      const tagElement = document.createElement('span');
      tagElement.className = 'profile-tag';
      tagElement.textContent = tag.tagName;
      tagsContainer.appendChild(tagElement);
    });
  }
  
  // 显示统计数据
  if (data.statistics) {
    document.getElementById('stat-projects').textContent = data.statistics.projectsCount || 0;
    document.getElementById('stat-documents').textContent = data.statistics.documentsCount || 0;
    document.getElementById('stat-skills').textContent = data.statistics.skillsCount || 0;
    document.getElementById('stat-years').textContent = data.statistics.workYears || 0;
  }
  
  // 显示本周概览
  if (data.overview) {
    document.getElementById('overview-documents').textContent = data.overview.documentsCreated || 0;
    document.getElementById('overview-tasks').textContent = data.overview.tasksInProgress || 0;
    document.getElementById('overview-comments').textContent = data.overview.commentsCount || 0;
    document.getElementById('overview-study-time').textContent = data.overview.studyTimeMinutes || 0;
    
    // 更新趋势
    updateTrendElements(data.overview);
  }
}

// 更新趋势元素
function updateTrendElements(overview) {
  // 文档趋势
  const docTrend = document.querySelector('.overview-card:nth-child(1) .overview-trend');
  if (docTrend) {
    const trend = overview.documentsTrend || 0;
    docTrend.className = `overview-trend ${trend >= 0 ? 'positive' : 'negative'}`;
    docTrend.innerHTML = `<i class="fas ${trend >= 0 ? 'fa-arrow-up' : 'fa-arrow-down'}"></i> ${Math.abs(trend)}%`;
  }
  
  // 任务趋势
  const taskTrend = document.querySelector('.overview-card:nth-child(2) .overview-trend');
  if (taskTrend) {
    const trend = overview.tasksTrend || 0;
    taskTrend.className = `overview-trend ${trend >= 0 ? 'positive' : 'negative'}`;
    taskTrend.innerHTML = `<i class="fas ${trend >= 0 ? 'fa-arrow-up' : 'fa-arrow-down'}"></i> ${Math.abs(trend)}%`;
  }
  
  // 评论趋势
  const commentTrend = document.querySelector('.overview-card:nth-child(3) .overview-trend');
  if (commentTrend) {
    const trend = overview.commentsTrend || 0;
    commentTrend.className = `overview-trend ${trend >= 0 ? 'positive' : 'negative'}`;
    commentTrend.innerHTML = `<i class="fas ${trend >= 0 ? 'fa-arrow-up' : 'fa-arrow-down'}"></i> ${Math.abs(trend)}%`;
  }
  
  // 学习时长趋势
  const studyTrend = document.querySelector('.overview-card:nth-child(4) .overview-trend');
  if (studyTrend) {
    const trend = overview.studyTimeTrend || 0;
    studyTrend.className = `overview-trend ${trend >= 0 ? 'positive' : 'negative'}`;
    studyTrend.innerHTML = `<i class="fas ${trend >= 0 ? 'fa-arrow-up' : 'fa-arrow-down'}"></i> ${Math.abs(trend)}%`;
  }
}

// 显示默认数据
function displayDefaultData() {
  // 基本信息
  document.getElementById('user-name').textContent = '用户名';
  document.getElementById('profile-title').textContent = '暂无职位';
  document.getElementById('level-badge').textContent = 'Lv.1';
  document.getElementById('level-badge').setAttribute('data-level', '1');
  updateAvatarLevel(1);
  updateExperience(null);
  updateProfileBio(null);
  populateEditProfileForm({});
  const tagsContainer = document.querySelector('.profile-tags');
  if (tagsContainer) {
    tagsContainer.innerHTML = '';
  }
  
  // 统计数据
  document.getElementById('stat-projects').textContent = '0';
  document.getElementById('stat-documents').textContent = '0';
  document.getElementById('stat-skills').textContent = '0';
  document.getElementById('stat-years').textContent = '0';
  
  // 本周概览
  document.getElementById('overview-documents').textContent = '0';
  document.getElementById('overview-tasks').textContent = '0';
  document.getElementById('overview-comments').textContent = '0';
  document.getElementById('overview-study-time').textContent = '0';
  
  // 趋势
  const trends = document.querySelectorAll('.overview-trend');
  trends.forEach(trend => {
    trend.className = 'overview-trend positive';
    trend.innerHTML = '<i class="fas fa-arrow-up"></i> 0%';
  });
}

// 同步右上角用户信息
function updateHeaderUserInfo(session) {
  const nameElement = document.getElementById('header-user-name');
  const rankElement = document.getElementById('header-user-rank');

  if (nameElement && session.username) {
    nameElement.textContent = session.username;
  }

  if (rankElement) {
    if (session.adminLevel) {
      rankElement.textContent = '管理员';
    } else if (session.userLevel) {
      rankElement.textContent = `Lv.${session.userLevel} 用户`;
    } else {
      rankElement.textContent = '普通用户';
    }
  }
}

// 更新头像上的等级徽章
function updateAvatarLevel(level) {
  const badge = document.getElementById('avatar-level-badge');
  if (!badge) return;
  badge.textContent = `Lv.${level}`;
  badge.setAttribute('data-level', level);
}

// 更新经验进度
function updateExperience(taskCenter) {
  const experience = Number(taskCenter && taskCenter.experience) || 0;
  const nextLevelExperience = Number(taskCenter && taskCenter.nextLevelExperience) || 0;
  const percent = nextLevelExperience > 0
    ? Math.min(100, Math.round(experience * 100 / nextLevelExperience))
    : 0;

  const fill = document.getElementById('xp-progress-fill');
  const text = document.getElementById('xp-progress-text');
  if (fill) {
    fill.style.width = `${percent}%`;
  }
  if (text) {
    text.textContent = `${experience} / ${nextLevelExperience} XP`;
  }
}

// 更新个人简介
function updateProfileBio(bio) {
  const element = document.getElementById('profile-bio');
  if (element) {
    element.textContent = bio || '暂无简介';
  }
}

// 填充编辑资料表单
function populateEditProfileForm(profile) {
  const nameInput = document.getElementById('profileName');
  const titleInput = document.getElementById('profileTitle');
  const bioInput = document.getElementById('profileBio');

  if (nameInput) nameInput.value = profile.username || '';
  if (titleInput) titleInput.value = profile.title || '';
  if (bioInput) bioInput.value = profile.bio || '';

  const editTagsContainer = document.querySelector('#editProfileModal .tags-container');
  if (editTagsContainer) {
    editTagsContainer.innerHTML = '';
  }
}

// 编辑个人资料
function editProfile() {
  // 这里可以实现编辑个人资料的功能
  showToast('info', '编辑功能开发中');
}

// 绑定事件
function bindEvents() {
  // 编辑按钮点击事件
  const editBtn = document.querySelector('.edit-profile-btn');
  if (editBtn) {
    editBtn.addEventListener('click', editProfile);
  }
}

// 初始化事件绑定
bindEvents();