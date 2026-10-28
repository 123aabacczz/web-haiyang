// project-docs.js
import { apiRequest, API_ENDPOINTS } from '../../api-config.js';
import { showToast } from '../../toast.js';

let currentPage = 1;
const pageSize = 12;
let currentKeyword = '';
let currentCategory = '';
let currentType = '';
let currentSort = 'uploadTime';
let categories = [];
let types = [];

// 移除或修改会话检查函数，使其只检查普通用户会话而不是管理员会话
async function checkUserSession() {
    try {
        const userSession = JSON.parse(localStorage.getItem('userSession'));
        const sessionExpired = !userSession || (Date.now() - (userSession?.timestamp || 0)) > 3600000;

        if (sessionExpired) {
            localStorage.removeItem('userSession');
            showToast('info', '请重新登录');
            setTimeout(() => {
                window.location.href = '../../login/login.html';
            }, 1500);
            return false;
        }
        return true;
    } catch (error) {
        console.error('会话检查失败:', error);
        localStorage.removeItem('userSession');
        showToast('info', '请重新登录');
        setTimeout(() => {
            window.location.href = '../../login/login.html';
        }, 1500);
        return false;
    }
}

// 获取项目文档
// project-docs.js - 修改fetchProjectDocs函数
async function fetchProjectDocs(keyword = '', category = '', type = '', sort = 'uploadTime', page = 1, retryCount = 0) {
  try {
    const params = new URLSearchParams({
      keyword: keyword || '',
      sort: sort,
      page: page.toString(),
      size: pageSize.toString()
    });

    // 只有当有值时才添加category和type参数
    if (category) params.append('category', category);
    if (type) params.append('type', type);

    const url = `${API_ENDPOINTS.projectDocs}?${params}`;
    const response = await apiRequest(url);

    // 确保返回的数据结构正确
    if (response && response.items) {
      return response;
    } else {
      return {
        items: Array.isArray(response) ? response : [],
        currentPage: page,
        pageSize: pageSize,
        total: Array.isArray(response) ? response.length : 0
      };
    }
  } catch (error) {
    console.error('获取项目文档失败:', error);
    showToast('error', '获取项目文档失败');
    return {
      items: [],
      currentPage: 1,
      pageSize: pageSize,
      total: 0
    };
  }
}

// 获取分类和类型选项
async function fetchFilterOptions() {
  try {
    // 获取分类
    const categoriesResponse = await apiRequest(`${API_ENDPOINTS.materials}/categories`);
    if (categoriesResponse && Array.isArray(categoriesResponse)) {
      categories = categoriesResponse;

      const categoryFilter = document.getElementById('category-filter');
      categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.name;
        option.textContent = category.name;
        categoryFilter.appendChild(option);
      });
    }

    // 获取类型
    const typesResponse = await apiRequest(`${API_ENDPOINTS.materials}/types`);
    if (typesResponse && Array.isArray(typesResponse)) {
      types = typesResponse;

      const typeFilter = document.getElementById('type-filter');
      types.forEach(type => {
        const option = document.createElement('option');
        option.value = type.name;
        option.textContent = type.name;
        typeFilter.appendChild(option);
      });
    }
  } catch (error) {
    console.error('获取筛选选项失败:', error);
  }
}

// 下载文档
async function downloadDocument(id, title) {
  try {
    // 直接使用GET方法下载文件，后端会自动增加下载计数
    const downloadUrl = API_ENDPOINTS.downloadDoc(id);
    window.open(downloadUrl, '_blank');

    showToast('success', `已开始下载: ${title}`);
  } catch (error) {
    console.error('下载文档失败:', error);
    showToast('error', '下载文档失败');
  }
}

// 分享文档
function shareDocument(id, title) {
  if (navigator.share) {
    navigator.share({
      title: title,
      text: '查看这个项目文档',
      url: window.location.origin + '/document/' + id
    }).catch(error => {
      console.log('分享失败:', error);
    });
  } else {
    // 复制链接到剪贴板
    const url = window.location.origin + '/document/' + id;
    navigator.clipboard.writeText(url).then(() => {
      showToast('success', '链接已复制到剪贴板');
    }).catch(err => {
      console.error('复制失败:', err);
    });
  }
}

// 渲染文档列表
function renderDocs(docs) {
  const grid = document.getElementById('doc-grid');
  grid.innerHTML = '';

  if (docs.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-file"></i>
        <p>暂无项目文档</p>
        <p class="empty-hint">尝试调整筛选条件或上传新文档</p>
      </div>
    `;
    return;
  }

  docs.forEach(doc => {
    const iconClass = getFileIconClass(doc.type);
    const fileSize = formatFileSize(doc.fileSize);
    const uploadTime = formatDate(doc.uploadTime);

    // 处理标签
    let tagsHtml = '';
    if (doc.tags) {
      const tagList = doc.tags.split(',').filter(tag => tag.trim() !== '');
      tagsHtml = tagList.map(tag =>
        `<span class="tag">${tag.trim()}</span>`
      ).join('');
    }

    grid.insertAdjacentHTML('beforeend', `
      <div class="resource-card">
        <div class="resource-card-header">
          <div class="resource-icon"><i class="${iconClass}"></i></div>
          <div class="resource-info">
            <h3>${doc.name}</h3>
            <div class="resource-meta">
              <span class="meta-item"><i class="fas fa-folder"></i> ${doc.category}</span>
              <span class="meta-item"><i class="fas fa-clock"></i> ${uploadTime}</span>
              <span class="meta-item"><i class="fas fa-database"></i> ${fileSize}</span>
            </div>
          </div>
        </div>

        ${doc.description ? `<div class="resource-description">${doc.description}</div>` : ''}

        ${tagsHtml ? `<div class="resource-tags">${tagsHtml}</div>` : ''}

        <div class="resource-actions">
          <div class="resource-stats">
            <span class="stat"><i class="fas fa-eye"></i> ${doc.viewCount || 0}</span>
            <span class="stat"><i class="fas fa-download"></i> ${doc.downloadCount || 0}</span>
          </div>
          <div class="action-buttons">
            <button class="btn btn-outline btn-sm" onclick="downloadDocument(${doc.id}, '${doc.name.replace(/'/g, "\\'")}')">
              <i class="fas fa-download"></i> 下载
            </button>
            <button class="btn btn-outline btn-sm" onclick="shareDocument(${doc.id}, '${doc.name.replace(/'/g, "\\'")}')">
              <i class="fas fa-share"></i> 分享
            </button>
          </div>
        </div>
      </div>
    `);
  });
}

// 根据文件类型获取图标类
function getFileIconClass(fileType) {
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
    'txt': 'fas fa-file-alt',
    'md': 'fas fa-file-alt',
    'html': 'fas fa-file-code',
    'css': 'fas fa-file-code',
    'js': 'fas fa-file-code',
    'java': 'fas fa-file-code',
    'py': 'fas fa-file-code',
    'xml': 'fas fa-file-code',
    'json': 'fas fa-file-code',
    'jpg': 'fas fa-file-image',
    'jpeg': 'fas fa-file-image',
    'png': 'fas fa-file-image',
    'gif': 'fas fa-file-image',
    'bmp': 'fas fa-file-image'
  };

  return iconMap[fileType?.toLowerCase()] || 'fas fa-file';
}

// 格式化文件大小
function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 格式化日期
function formatDate(dateString) {
  if (!dateString) return '未知日期';

  // 处理多种日期格式
  let date;
  if (typeof dateString === 'string' && dateString.includes('T')) {
    date = new Date(dateString);
  } else if (typeof dateString === 'string') {
    // 处理数据库格式的日期字符串
    date = new Date(dateString.replace(' ', 'T'));
  } else {
    date = new Date(dateString);
  }

  if (isNaN(date.getTime())) {
    return '无效日期';
  }

  // 显示相对时间（如果是最近7天内）
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    return '昨天';
  } else if (diffDays < 7) {
    return `${diffDays}天前`;
  } else {
    return date.toLocaleDateString('zh-CN');
  }
}

// 搜索处理
function handleSearch() {
  currentKeyword = document.getElementById('doc-search').value;
  currentPage = 1;
  loadDocs();
}

// 筛选处理
function handleFilter() {
  currentCategory = document.getElementById('category-filter').value;
  currentType = document.getElementById('type-filter').value;
  currentSort = document.getElementById('sort-select').value;
  currentPage = 1;
  loadDocs();
}

// 重置筛选
function resetFilters() {
  document.getElementById('doc-search').value = '';
  document.getElementById('category-filter').value = '';
  document.getElementById('type-filter').value = '';
  document.getElementById('sort-select').value = 'uploadTime';

  currentKeyword = '';
  currentCategory = '';
  currentType = '';
  currentSort = 'uploadTime';
  currentPage = 1;

  loadDocs();
}

// 加载文档
async function loadDocs() {

    console.log('加载文档参数:', {
        keyword: currentKeyword,
        category: currentCategory,
        type: currentType,
        sort: currentSort,
        page: currentPage
    });

    const grid = document.getElementById('doc-grid');
    if (!grid) return;

    // 检查会话
    const hasValidSession = await checkUserSession();
    if (!hasValidSession) {
        return;
    }

    // 保存原始内容以便错误时恢复
    const originalContent = grid.innerHTML;
    grid.innerHTML = `
      <div class="skeleton-container">
        <div class="skeleton-item"><div class="skeleton" style="width:100%;height:180px;border-radius:var(--radius)"></div></div>
        <div class="skeleton-item"><div class="skeleton" style="width:100%;height:180px;border-radius:var(--radius)"></div></div>
        <div class="skeleton-item"><div class="skeleton" style="width:100%;height:180px;border-radius:var(--radius)"></div></div>
      </div>
    `;

    try {
        const result = await fetchProjectDocs(
          currentKeyword,
          currentCategory,
          currentType,
          currentSort,
          currentPage
        );

        // 确保result存在且有items属性
        const docs = (result && result.items) ? result.items : [];

        renderDocs(docs);

        // 添加分页控件
        renderPagination(result);
    } catch (error) {
        console.error('加载文档失败:', error);
        grid.innerHTML = originalContent; // 恢复原始内容
        showToast('error', '加载失败，请重试');
    }
}

// 添加分页功能
function renderPagination(result) {
  const paginationContainer = document.getElementById('pagination-container');
  if (!paginationContainer) return;

  const totalPages = Math.ceil(result.total / result.pageSize);
  if (totalPages <= 1) {
    paginationContainer.innerHTML = '';
    return;
  }

  paginationContainer.innerHTML = `
    <button class="btn btn-outline btn-sm ${result.currentPage === 1 ? 'disabled' : ''}"
            onclick="changePage(${result.currentPage - 1})">
      <i class="fas fa-chevron-left"></i> 上一页
    </button>
    <span>第 ${result.currentPage} 页 / 共 ${totalPages} 页 (共 ${result.total} 条记录)</span>
    <button class="btn btn-outline btn-sm ${result.currentPage === totalPages ? 'disabled' : ''}"
            onclick="changePage(${result.currentPage + 1})">
      下一页 <i class="fas fa-chevron-right"></i>
    </button>
  `;
}

function changePage(page) {
  if (page < 1) return;
  currentPage = page;
  loadDocs();
  // 滚动到顶部
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 全局函数声明，以便HTML中的onclick可以调用
window.downloadDocument = downloadDocument;
window.shareDocument = shareDocument;
window.changePage = changePage;

document.addEventListener('DOMContentLoaded', async () => {
  // 先获取筛选选项
  await fetchFilterOptions();

  // 然后加载文档
  loadDocs();

  // 添加搜索事件监听
  const searchInput = document.getElementById('doc-search');
  let searchTimeout;
  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(handleSearch, 500);
  });

  // 添加筛选事件监听
  document.getElementById('category-filter').addEventListener('change', handleFilter);
  document.getElementById('type-filter').addEventListener('change', handleFilter);
  document.getElementById('sort-select').addEventListener('change', handleFilter);

  // 添加重置按钮事件
  document.getElementById('reset-filters').addEventListener('click', resetFilters);
});