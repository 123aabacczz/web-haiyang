// 资料库交互功能
import { API_ENDPOINTS, apiRequest } from '../../api-config.js';
import { showToast } from '../../toast.js';

let allMaterials = [];
let filteredMaterials = [];
let currentPage = 1;
const itemsPerPage = 8;
let selectedFile = null;
let currentUser = null;

document.addEventListener('DOMContentLoaded', async function() {
  // 检查用户会话
  currentUser = await checkUserSession();
  await loadMaterials();
  initializeEventListeners();
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
      return null;
    }
    
    console.log('用户会话信息:', session);
    console.log('用户ID:', session.userId || session.id);
    console.log('用户名:', session.username);
    console.log('用户等级:', session.userLevel || session.adminLevel);
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
    return null;
  }
}

async function loadMaterials() {
  const libraryGrid = document.getElementById('library-grid');
  if (!libraryGrid) return;

  try {
    console.log('=== 开始加载资料 ===');
    libraryGrid.innerHTML = `
      <div class="loading">
        <div class="loading-spinner"></div>
        <p>正在加载资料...</p>
      </div>
    `;

    console.log('请求API端点:', API_ENDPOINTS.projectDocs);
    const data = await apiRequest(API_ENDPOINTS.projectDocs);
    
    console.log('资料加载响应:', data);
    
    if (data && data.items && Array.isArray(data.items)) {
      console.log('资料数量:', data.items.length);
      allMaterials = data.items;
      filteredMaterials = data.items;
      renderMaterials();
      updateLibraryStats();
    } else if (data && Array.isArray(data)) {
      // 兼容直接返回数组的情况
      console.log('资料数量:', data.length);
      allMaterials = data;
      filteredMaterials = data;
      renderMaterials();
      updateLibraryStats();
    } else {
      console.log('无资料数据');
      showEmptyState('暂无资料');
    }
  } catch (error) {
    console.error('加载资料失败:', error);
    showToast('error', '加载资料失败: ' + error.message);
    showEmptyState('加载资料失败');
  }
}

function renderMaterials() {
  const libraryGrid = document.getElementById('library-grid');
  if (!libraryGrid) return;

  if (filteredMaterials.length === 0) {
    showEmptyState('没有找到匹配的资料');
    return;
  }

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredMaterials.length);
  const currentMaterials = filteredMaterials.slice(startIndex, endIndex);

  const materialsHTML = currentMaterials.map(material => {
    const iconClass = getFileIcon(material.fileName || material.name || material.originalFilename);
    const fileSize = formatFileSize(material.fileSize);
    const downloadCount = material.downloadCount || 0;
    const uploadTime = formatTimeAgo(material.uploadTime || material.createdAt);

    return `
      <div class="module-card resource-card" data-id="${material.id}" data-type="${material.type}">
        <div class="resource-icon">
          <i class="${iconClass}"></i>
        </div>
        <div class="resource-info">
          <h3 class="module-card-title">${material.title || material.name || material.fileName || material.originalFilename || '未命名文件'}</h3>
          <p class="module-card-content">${material.description || '暂无描述'}</p>
          <div class="item-meta">
            <span>${material.type || '未知'} · ${fileSize}</span>
            <span>下载次数：${downloadCount}</span>
          </div>
        </div>
        <div class="resource-actions">
          <button class="btn btn-outline btn-sm download-btn" data-id="${material.id}">
            <i class="fas fa-download"></i> 下载
          </button>
          <button class="btn btn-outline btn-sm share-btn" data-id="${material.id}">
            <i class="fas fa-share"></i> 分享
          </button>
        </div>
      </div>
    `;
  }).join('');

  libraryGrid.innerHTML = materialsHTML;
  bindMaterialEvents();
}

function showEmptyState(message) {
  const libraryGrid = document.getElementById('library-grid');
  if (!libraryGrid) return;

  libraryGrid.innerHTML = `
    <div class="empty-state">
      <i class="fas fa-folder-open"></i>
      <h3>${message}</h3>
      <p>暂时没有可显示的资料</p>
    </div>
  `;
}

function updateLibraryStats() {
  const libraryStats = document.querySelector('.library-stats');
  if (!libraryStats) return;

  const totalCount = allMaterials.length;
  const typeCounts = allMaterials.reduce((acc, material) => {
    const type = material.type || '其他';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const typeStats = Object.entries(typeCounts)
    .map(([type, count]) => `${type}(${count})`)
    .join(' / ');

  libraryStats.innerHTML = `
    <span>共 ${totalCount} 个资源</span>
    <span>分类：${typeStats || '暂无分类'}</span>
  `;
}

function initializeEventListeners() {
  const librarySearch = document.getElementById('library-search');
  const libraryFilter = document.getElementById('library-filter');
  const librarySort = document.getElementById('library-sort');
  const uploadBtn = document.getElementById('upload-btn');
  const uploadModal = document.getElementById('upload-modal');
  const modalClose = document.querySelectorAll('.modal-close');
  const uploadDropzone = document.getElementById('upload-dropzone');
  const submitUpload = document.getElementById('submit-upload');
  const fileInput = document.getElementById('file-input');

  if (librarySearch) {
    librarySearch.addEventListener('input', handleSearch);
  }

  if (libraryFilter) {
    libraryFilter.addEventListener('change', handleFilter);
  }

  if (librarySort) {
    librarySort.addEventListener('change', handleSort);
  }

  if (uploadBtn && uploadModal) {
    // 根据用户会话状态控制上传按钮
    if (currentUser) {
      uploadBtn.addEventListener('click', () => {
        resetUploadForm();
        uploadModal.style.display = 'flex';
      });
    } else {
      uploadBtn.addEventListener('click', () => {
        showToast('error', '请先登录');
        // 显示登录引导
        setTimeout(() => {
          if (confirm('您需要登录才能上传资料，是否跳转到登录页面？')) {
            window.location.href = '../../login/login.html';
          }
        }, 1000);
      });
      uploadBtn.disabled = true;
      uploadBtn.style.opacity = '0.6';
      uploadBtn.style.cursor = 'not-allowed';
    }
  }

  if (modalClose && uploadModal) {
    modalClose.forEach(btn => {
      btn.addEventListener('click', () => {
        uploadModal.style.display = 'none';
      });
    });

    uploadModal.addEventListener('click', (e) => {
      if (e.target === uploadModal) {
        uploadModal.style.display = 'none';
      }
    });
  }

  if (uploadDropzone) {
    setupFileUpload(uploadDropzone);
  }

  if (submitUpload) {
    submitUpload.addEventListener('click', handleSubmitUpload);
  }

  if (fileInput) {
    fileInput.addEventListener('change', function() {
      if (this.files.length > 0) {
        handleFileSelection(this.files[0]);
      }
    });
  }
}

function handleSearch() {
  const searchTerm = this.value.toLowerCase();
  filteredMaterials = allMaterials.filter(material => {
    const title = (material.title || material.name || material.fileName || material.originalFilename || '').toLowerCase();
    const description = (material.description || '').toLowerCase();
    return title.includes(searchTerm) || description.includes(searchTerm);
  });
  currentPage = 1;
  renderMaterials();
}

function handleFilter() {
  const filterValue = this.value;
  if (filterValue === 'all') {
    filteredMaterials = [...allMaterials];
  } else {
    filteredMaterials = allMaterials.filter(material => {
      const type = (material.type || '').toLowerCase();
      return type.includes(filterValue.toLowerCase());
    });
  }
  currentPage = 1;
  renderMaterials();
}

function handleSort() {
  const sortValue = this.value;
  switch (sortValue) {
    case 'name':
      filteredMaterials.sort((a, b) => {
        const nameA = (a.title || a.name || a.fileName || a.originalFilename || '').toLowerCase();
        const nameB = (b.title || b.name || b.fileName || b.originalFilename || '').toLowerCase();
        return nameA.localeCompare(nameB);
      });
      break;
    case 'size':
      filteredMaterials.sort((a, b) => (a.fileSize || 0) - (b.fileSize || 0));
      break;
    case 'popular':
      filteredMaterials.sort((a, b) => (b.downloadCount || 0) - (a.downloadCount || 0));
      break;
    case 'latest':
    default:
      filteredMaterials.sort((a, b) => {
        const timeA = new Date(a.uploadTime || a.createdAt || 0).getTime();
        const timeB = new Date(b.uploadTime || b.createdAt || 0).getTime();
        return timeB - timeA;
      });
  }
  renderMaterials();
}

function bindMaterialEvents() {
  document.querySelectorAll('.download-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const materialId = this.dataset.id;
      downloadMaterial(materialId);
    });
  });

  document.querySelectorAll('.share-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const materialId = this.dataset.id;
      shareMaterial(materialId);
    });
  });
}

async function downloadMaterial(materialId) {
  try {
    showToast('info', '正在准备下载...');
    const material = allMaterials.find(m => m.id == materialId);
    if (material) {
      const downloadUrl = API_ENDPOINTS.downloadDoc(materialId);
      window.open(downloadUrl, '_blank');
      showToast('success', '开始下载: ' + (material.title || material.name || material.fileName || material.originalFilename));
    }
  } catch (error) {
    console.error('下载失败:', error);
    showToast('error', '下载失败: ' + error.message);
  }
}

function shareMaterial(materialId) {
  const material = allMaterials.find(m => m.id == materialId);
  if (material) {
    const shareUrl = window.location.origin + '/library/' + materialId;
    if (navigator.share) {
      navigator.share({
        title: material.title || material.name || material.fileName || material.originalFilename,
        url: shareUrl
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      showToast('success', '链接已复制到剪贴板');
    }
  }
}

function setupFileUpload(dropzone) {
  dropzone.addEventListener('dragover', function(e) {
    e.preventDefault();
    this.style.borderColor = '#4a6cf7';
    this.style.backgroundColor = '#f8fafc';
  });

  dropzone.addEventListener('dragleave', function() {
    this.style.borderColor = '#e2e8f0';
    this.style.backgroundColor = 'transparent';
  });

  dropzone.addEventListener('drop', function(e) {
    e.preventDefault();
    this.style.borderColor = '#e2e8f0';
    this.style.backgroundColor = 'transparent';

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelection(files[0]);
    }
  });

  const selectBtn = dropzone.querySelector('.btn-link');
  if (selectBtn) {
    selectBtn.addEventListener('click', function() {
      const fileInput = document.getElementById('file-input');
      if (fileInput) {
        fileInput.click();
      }
    });
  }

  dropzone.addEventListener('click', function(e) {
    if (!e.target.closest('.btn-link')) {
      const fileInput = document.getElementById('file-input');
      if (fileInput) {
        fileInput.click();
      }
    }
  });
}

function handleFileSelection(file) {
  selectedFile = file;
  const fileInfo = document.getElementById('file-info');
  if (fileInfo) {
    fileInfo.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px;">
        <i class="fas fa-file ${getFileIconClass(file.name)}"></i>
        <div>
          <div style="font-weight: 500;">${file.name}</div>
          <div style="font-size: 12px; color: #999;">${formatFileSize(file.size)}</div>
        </div>
        <button type="button" style="margin-left: auto; background: none; border: none; color: #dc3545; cursor: pointer;" onclick="clearFileSelection()">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `;
  }
}

function clearFileSelection() {
  selectedFile = null;
  const fileInfo = document.getElementById('file-info');
  const fileInput = document.getElementById('file-input');
  if (fileInfo) {
    fileInfo.innerHTML = '';
  }
  if (fileInput) {
    fileInput.value = '';
  }
}

function resetUploadForm() {
  selectedFile = null;
  const form = document.getElementById('upload-form');
  const fileInfo = document.getElementById('file-info');
  const fileInput = document.getElementById('file-input');
  if (form) {
    form.reset();
  }
  if (fileInfo) {
    fileInfo.innerHTML = '';
  }
  if (fileInput) {
    fileInput.value = '';
  }
}

async function handleSubmitUpload() {
  try {
    // 检查用户会话 - 直接使用全局变量，避免重复检查
    if (!currentUser) {
      showToast('error', '请先登录');
      // 显示登录引导
      setTimeout(() => {
        if (confirm('您需要登录才能上传资料，是否跳转到登录页面？')) {
          window.location.href = '../../login/login.html';
        }
      }, 1000);
      return;
    }

    const name = document.getElementById('material-name').value.trim();
    if (!name) {
      showToast('error', '请输入资料名称');
      return;
    }

    if (!selectedFile) {
      showToast('error', '请选择文件');
      return;
    }

    // 记录上传前的表单数据
    console.log('=== 开始上传资料 ===');
    console.log('当前用户:', currentUser);
    console.log('资料名称:', name);
    console.log('分类:', document.getElementById('material-category').value);
    console.log('类型:', document.getElementById('material-type').value);
    console.log('文件:', selectedFile.name, selectedFile.size, 'bytes');

    showToast('info', '正在上传文件...');
    
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('name', name);
    formData.append('category', document.getElementById('material-category').value);
    formData.append('type', document.getElementById('material-type').value);
    formData.append('description', document.getElementById('material-description').value);
    formData.append('tags', document.getElementById('material-tags').value);
    formData.append('version', document.getElementById('material-version').value);
    formData.append('language', document.getElementById('material-language').value);
    
    // 发送上传请求
    console.log('发送上传请求到:', API_ENDPOINTS.materialUpload);
    
    // 直接使用fetch调用，避免apiRequest的Content-Type设置问题
    const response = await fetch(API_ENDPOINTS.materialUpload, {
      method: 'POST',
      credentials: 'include',
      body: formData
    });

    // 记录响应状态
    console.log('上传响应状态:', response.status, response.statusText);
    
    const responseData = await response.json();
    console.log('上传响应数据:', responseData);
    
    // 检查响应状态
    if (response.ok) {
      showToast('success', '文件上传成功');
      console.log('=== 上传成功 ===');
      const uploadModal = document.getElementById('upload-modal');
      if (uploadModal) {
        uploadModal.style.display = 'none';
      }
      
      // 重新加载资料
      console.log('=== 开始重新加载资料 ===');
      await loadMaterials();
    } else {
      // 处理401错误
      if (response.status === 401) {
        showToast('error', '会话已过期，请重新登录');
        // 清除本地存储
        localStorage.removeItem('adminSession');
        localStorage.removeItem('userSession');
        // 跳转到登录页
        setTimeout(() => {
          window.location.href = '../../login/login.html';
        }, 1500);
        return;
      }
      throw new Error(responseData.message || '上传失败');
    }
  } catch (error) {
    console.error('文件上传失败:', error);
    showToast('error', '文件上传失败: ' + error.message);
  }
}

function getFileIconClass(fileName) {
  if (!fileName) return 'fa-file';
  
  const ext = fileName.split('.').pop().toLowerCase();
  const iconMap = {
    'pdf': 'fa-file-pdf',
    'doc': 'fa-file-word',
    'docx': 'fa-file-word',
    'xls': 'fa-file-excel',
    'xlsx': 'fa-file-excel',
    'ppt': 'fa-file-powerpoint',
    'pptx': 'fa-file-powerpoint',
    'zip': 'fa-file-archive',
    'rar': 'fa-file-archive',
    'mp4': 'fa-video',
    'avi': 'fa-video',
    'mov': 'fa-video',
    'jpg': 'fa-file-image',
    'jpeg': 'fa-file-image',
    'png': 'fa-file-image',
    'gif': 'fa-file-image'
  };
  
  return iconMap[ext] || 'fa-file-alt';
}

function getFileIcon(fileName) {
  if (!fileName) return 'fas fa-file';
  
  const ext = fileName.split('.').pop().toLowerCase();
  const iconMap = {
    'pdf': 'fas fa-file-pdf',
    'doc': 'fas fa-file-word',
    'docx': 'fas fa-file-word',
    'xls': 'fas fa-file-excel',
    'xlsx': 'fas fa-file-excel',
    'ppt': 'fas fa-file-powerpoint',
    'pptx': 'fas fa-file-powerpoint',
    'zip': 'fas fa-file-archive',
    'rar': 'fas fa-file-archive',
    'mp4': 'fas fa-video',
    'avi': 'fas fa-video',
    'mov': 'fas fa-video',
    'jpg': 'fas fa-file-image',
    'jpeg': 'fas fa-file-image',
    'png': 'fas fa-file-image',
    'gif': 'fas fa-file-image'
  };
  
  return iconMap[ext] || 'fas fa-file-alt';
}

function formatFileSize(bytes) {
  if (!bytes) return '未知大小';
  
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(1)}${units[unitIndex]}`;
}

function formatTimeAgo(dateString) {
  if (!dateString) return '未知时间';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return '刚刚';
  if (diffMins < 60) return `${diffMins}分钟前`;
  if (diffHours < 24) return `${diffHours}小时前`;
  if (diffDays < 7) return `${diffDays}天前`;
  return date.toLocaleDateString('zh-CN');
}

// 全局函数，用于清除文件选择
window.clearFileSelection = clearFileSelection;