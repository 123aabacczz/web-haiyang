// learning-area.js
import { API_BASE_URL, API_ENDPOINTS } from '../../api-config.js';
document.addEventListener('DOMContentLoaded', function() {
  // 加载用户信息
  loadUserInfo();
  
  // 从API加载资料数据
  loadMaterials();
  
  // 加载视频列表
  loadVideos();
  
  // 加载学习统计数据的调用已移至 displayUserInfo 函数中
  
  // 绑定视频上传表单提交事件
  document.getElementById('video-upload-form').addEventListener('submit', function(e) {
    e.preventDefault();
    uploadVideo();
  });
  
  // 绑定模态框关闭事件
  document.querySelector('.close').addEventListener('click', function() {
    document.getElementById('video-modal').style.display = 'none';
  });
  
  // 点击模态框外部关闭
  window.addEventListener('click', function(e) {
    const modal = document.getElementById('video-modal');
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });
});

// 从API加载资料数据
async function loadMaterials() {
  try {
    console.log('开始加载资料数据...');
    // 使用绝对路径指向后端服务的端口 8080
    const response = await fetch(API_ENDPOINTS.projectDocsLarge);
    console.log('API响应状态:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API错误: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('API返回数据:', data);
    
    const materials = data.items || data.list || [];
    console.log('资料列表:', materials);
    console.log('资料数量:', materials.length);
    
    if (materials.length === 0) {
      showError('暂无资料数据');
      renderEmptyState();
    } else {
      // 渲染资料卡片
      renderMaterials(materials);
    }
  } catch (error) {
    console.error('加载资料失败:', error);
    showError('加载资料失败，请稍后重试');
    renderEmptyState();
  }
}

// 渲染空状态
function renderEmptyState() {
  const gridContainer = document.querySelector('.learning-grid');
  gridContainer.innerHTML = `
    <div class="empty-state">
      <i class="fas fa-folder-open fa-4x"></i>
      <h3>暂无资料</h3>
      <p>当前没有可用的学习资料</p>
    </div>
  `;
  
  // 添加空状态样式
  const emptyState = document.querySelector('.empty-state');
  emptyState.style.cssText = `
    grid-column: 1 / -1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px;
    text-align: center;
    background: #f8f9fa;
    border-radius: 8px;
    color: #6c757d;
  `;
}

// 加载学习统计数据
function loadLearningStats(userInfo) {
  try {
    // 使用用户信息中的统计数据，如果没有则使用默认值
    const stats = {
      monthlyHours: userInfo.studyHours || userInfo.monthlyHours || 24,
      completedCourses: userInfo.coursesLearned || userInfo.completedCourses || 3,
      badges: userInfo.badges || 8
    };
    
    // 更新统计卡片
    const statCards = document.querySelectorAll('.stat-card');
    if (statCards.length >= 3) {
      statCards[0].querySelector('.stat-number').textContent = stats.monthlyHours;
      statCards[1].querySelector('.stat-number').textContent = stats.completedCourses;
      statCards[2].querySelector('.stat-number').textContent = stats.badges;
    }
  } catch (error) {
    console.error('Error loading stats:', error);
  }
}

// 渲染资料卡片
function renderMaterials(materials) {
  console.log('开始渲染资料卡片，资料数量:', materials.length);
  
  const gridContainer = document.querySelector('.learning-grid');
  console.log('找到学习区网格容器:', gridContainer);
  
  if (!gridContainer) {
    console.error('未找到 .learning-grid 元素');
    showError('页面结构错误，未找到资料容器');
    return;
  }
  
  gridContainer.innerHTML = '';
  
  materials.forEach((material, index) => {
    console.log(`渲染第 ${index + 1} 个资料:`, material.name);
    const card = createMaterialCard(material, index);
    gridContainer.appendChild(card);
  });
  
  console.log('资料卡片渲染完成');
  
  // 添加点击事件
  addMaterialClickEvents();
}

// 创建资料卡片
function createMaterialCard(material, index) {
  const card = document.createElement('div');
  card.className = 'module-card course-card';
  card.setAttribute('data-material-id', material.id);
  
  // 根据资料类型设置图标
  const icon = getMaterialIcon(material.type);
  
  // 设置状态
  const status = getMaterialStatus(material.status);
  
  card.innerHTML = `
    <div class="course-banner">
      <i class="${icon}"></i>
    </div>
    <div class="module-card-header">
      <h3 class="module-card-title">
        <i class="${icon}"></i> ${material.name}
      </h3>
      <span class="badge ${status.class}">${status.text}</span>
    </div>
    <div class="module-card-content">
      <p>${material.description || '暂无描述'}</p>
      <div class="material-details">
        <div class="detail-item">
          <span class="detail-label">类型：</span>
          <span class="detail-value">${material.type || '未知'}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">分类：</span>
          <span class="detail-value">${material.category || '未分类'}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">上传者：</span>
          <span class="detail-value">${material.uploaderName || '未知'}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">上传时间：</span>
          <span class="detail-value">${material.uploadTime ? new Date(material.uploadTime).toLocaleString() : '未知时间'}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">文件大小：</span>
          <span class="detail-value">${formatFileSize(material.fileSize)}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">下载次数：</span>
          <span class="detail-value">${material.downloadCount || 0}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">查看次数：</span>
          <span class="detail-value">${material.viewCount || 0}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">标签：</span>
          <span class="detail-value">${material.tags || '无'}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">版本：</span>
          <span class="detail-value">${material.version || '1.0'}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">语言：</span>
          <span class="detail-value">${material.language || '中文'}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">推荐：</span>
          <span class="detail-value">${material.isFeatured ? '是' : '否'}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">原始文件名：</span>
          <span class="detail-value">${material.originalFilename || '未知'}</span>
        </div>
      </div>
      <div class="course-progress">
        <div class="course-progress-bar" style="width: 0%"></div>
      </div>
    </div>
  `;
  
  // 样式已在 CSS 文件中定义，不再需要内联样式
  
  return card;
}

// 获取资料图标
function getMaterialIcon(type) {
  const iconMap = {
    'video': 'fas fa-video',
    'document': 'fas fa-file-alt',
    'image': 'fas fa-image',
    'audio': 'fas fa-music',
    'pdf': 'fas fa-file-pdf',
    'zip': 'fas fa-file-archive'
  };
  return iconMap[type] || 'fas fa-file';
}

// 获取资料状态
function getMaterialStatus(status) {
  const statusMap = {
    0: { class: 'badge-warning', text: '待审核' },
    1: { class: 'badge-success', text: '已发布' },
    2: { class: 'badge-danger', text: '已拒绝' }
  };
  return statusMap[status] || { class: 'badge-secondary', text: '未知' };
}

// 格式化文件大小
function formatFileSize(size) {
  if (!size) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let currentSize = size;
  let unitIndex = 0;
  
  while (currentSize >= 1024 && unitIndex < units.length - 1) {
    currentSize /= 1024;
    unitIndex++;
  }
  
  return `${currentSize.toFixed(2)} ${units[unitIndex]}`;
}

// 添加资料点击事件
function addMaterialClickEvents() {
  const cards = document.querySelectorAll('.course-card');
  cards.forEach(card => {
    card.addEventListener('click', function() {
      const materialId = this.getAttribute('data-material-id');
      if (materialId) {
        viewMaterial(materialId);
      }
    });
  });
}

// 查看资料
function viewMaterial(materialId) {
  // 跳转到资料预览页面或打开模态框
  window.open(`/api/admin/materials/${materialId}/preview`, '_blank');
}

// 显示错误信息
function showError(message) {
  const errorElement = document.createElement('div');
  errorElement.className = 'error-message';
  errorElement.textContent = message;
  errorElement.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #f8d7da;
    color: #721c24;
    padding: 15px;
    border-radius: 4px;
    z-index: 1000;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  `;
  
  document.body.appendChild(errorElement);
  
  setTimeout(() => {
    errorElement.remove();
  }, 3000);
}

// 加载用户信息
function loadUserInfo() {
  try {
    console.log('开始加载用户信息...');
    
    // 从本地存储中获取用户会话信息，与登录逻辑保持一致
    const adminSessionStr = localStorage.getItem('adminSession');
    const userSessionStr = localStorage.getItem('userSession');
    
    // 优先使用管理员会话
    let session;
    if (adminSessionStr) {
      session = JSON.parse(adminSessionStr);
      console.log('从本地存储中获取管理员会话信息:', session);
    } else if (userSessionStr) {
      session = JSON.parse(userSessionStr);
      console.log('从本地存储中获取用户会话信息:', session);
    }
    
    // 检查会话是否过期
    const sessionExpired = !session || (Date.now() - (session.timestamp || 0)) > 3600000;
    
    if (sessionExpired) {
      console.warn('会话已过期或不存在，使用默认用户信息');
      displayUserInfo({
        name: '访客用户',
        role: '普通用户',
        studyHours: 0,
        coursesLearned: 0,
        badges: 0
      });
      return;
    }
    
    // 构建用户信息对象
    const userInfo = {
      id: session.userId || session.id,
      name: session.username || session.name || '未知用户',
      role: session.role || (adminSessionStr ? '管理员' : '普通用户'),
      studyHours: session.studyHours || session.study_time || 0,
      coursesLearned: session.coursesLearned || session.completed_courses || 0,
      badges: session.badges || session.awards || 0
    };
    
    // 显示用户信息
    displayUserInfo(userInfo);
  } catch (error) {
    console.error('加载用户信息失败:', error);
    // 使用默认用户信息
    displayUserInfo({
      name: '访客用户',
      role: '普通用户',
      studyHours: 0,
      coursesLearned: 0,
      badges: 0
    });
  }
}

// 显示用户信息
function displayUserInfo(userInfo) {
  const userNameElement = document.querySelector('.user-name');
  const userRoleElement = document.querySelector('.user-role');
  const userStatValues = document.querySelectorAll('.user-stat-value');
  
  // 确保用户信息包含 ID
  if (userInfo.id) {
    console.log('用户ID:', userInfo.id);
    // 可以在这里根据用户 ID 执行其他操作，例如获取用户的详细信息
  }
  
  if (userNameElement) {
    userNameElement.textContent = userInfo.name;
  }
  
  if (userRoleElement) {
    userRoleElement.textContent = userInfo.role;
  }
  
  if (userStatValues.length >= 3) {
    userStatValues[0].textContent = userInfo.studyHours;
    userStatValues[1].textContent = userInfo.coursesLearned;
    userStatValues[2].textContent = userInfo.badges;
  }
  
  // 调用学习统计数据加载函数，使用相同的用户信息
  loadLearningStats(userInfo);
  
  // 可以在这里添加更多与用户 ID 相关的逻辑
}

// 上传视频
async function uploadVideo() {
  const form = document.getElementById('video-upload-form');
  const formData = new FormData(form);
  
  try {
    console.log('开始上传视频...');
    const response = await fetch(API_ENDPOINTS.videos, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`上传失败: ${response.status} - ${errorText}`);
    }
    
    const video = await response.json();
    console.log('视频上传成功:', video);
    showError('视频上传成功！');
    
    // 重置表单
    form.reset();
    
    // 重新加载视频列表
    loadVideos();
  } catch (error) {
    console.error('上传视频失败:', error);
    showError('上传视频失败，请稍后重试');
  }
}

// 加载视频列表
async function loadVideos() {
  try {
    console.log('开始加载视频列表...');
    const response = await fetch(API_ENDPOINTS.videos);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`加载视频失败: ${response.status} - ${errorText}`);
    }
    
    const videos = await response.json();
    console.log('视频列表:', videos);
    
    renderVideos(videos);
  } catch (error) {
    console.error('加载视频列表失败:', error);
    showError('加载视频列表失败，请稍后重试');
  }
}

// 渲染视频列表
function renderVideos(videos) {
  const videoGrid = document.getElementById('video-grid');
  if (!videoGrid) return;
  
  videoGrid.innerHTML = '';
  
  if (videos.length === 0) {
    videoGrid.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-video fa-4x"></i>
        <h3>暂无视频</h3>
        <p>当前没有可用的视频资源</p>
      </div>
    `;
    
    const emptyState = videoGrid.querySelector('.empty-state');
    emptyState.style.cssText = `
      grid-column: 1 / -1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px;
      text-align: center;
      background: #f8f9fa;
      border-radius: 8px;
      color: #6c757d;
    `;
    return;
  }
  
  videos.forEach(video => {
    const videoCard = createVideoCard(video);
    videoGrid.appendChild(videoCard);
  });
}

// 创建视频卡片
function createVideoCard(video) {
  const card = document.createElement('div');
  card.className = 'video-card';
  card.setAttribute('data-video-id', video.id);
  
  card.innerHTML = `
    <div class="video-thumbnail">
      <i class="fas fa-play-circle"></i>
    </div>
    <div class="video-card-content">
      <h4 class="video-card-title">${video.title}</h4>
      <p class="video-card-description">${video.description || '暂无描述'}</p>
      <div class="video-card-meta">
        <span>${formatDuration(video.duration)}</span>
        <span>${new Date(video.createdAt).toLocaleDateString()}</span>
      </div>
    </div>
  `;
  
  // 添加点击事件
  card.addEventListener('click', function() {
    playVideo(video);
  });
  
  return card;
}

// 播放视频
function playVideo(video) {
  const modal = document.getElementById('video-modal');
  const videoPlayer = document.getElementById('video-player');
  const videoTitle = document.getElementById('modal-video-title');
  const videoDescription = document.getElementById('modal-video-description');
  
  videoTitle.textContent = video.title;
  videoDescription.textContent = video.description || '暂无描述';
  videoPlayer.src = `${API_BASE_URL}${video.filePath}`;
  
  modal.style.display = 'block';
}

// 格式化视频时长
function formatDuration(seconds) {
  if (!seconds) return '00:00';
  
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}