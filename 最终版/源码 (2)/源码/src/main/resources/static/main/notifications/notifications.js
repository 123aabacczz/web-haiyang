// notifications.js
import { API_ENDPOINTS, apiRequest } from '../../api-config.js';
import { showToast } from '../../toast.js';

let allNotifications = [];
let filteredNotifications = [];
let currentPage = 1;
const itemsPerPage = 20;
let currentFilter = 'all';
let showReadNotifications = true;

document.addEventListener('DOMContentLoaded', async function() {
  await loadNotifications();
  initEventListeners();
});

async function loadNotifications() {
  try {
    const container = document.getElementById('notifications-list');
    if (container) {
      container.innerHTML = `
        <div class="loading">
          <div class="loading-spinner"></div>
          <p>正在加载通知...</p>
        </div>
      `;
    }

    // 获取今日通知
    const data = await apiRequest(API_ENDPOINTS.notificationsToday);
    
    if (data && Array.isArray(data)) {
      allNotifications = data;
      filteredNotifications = data;
      renderNotifications();
      updateUnreadCount();
    } else {
      showEmptyState('暂无通知');
    }
  } catch (error) {
    console.error('加载通知失败:', error);
    showToast('error', '加载通知失败: ' + error.message);
    showEmptyState('加载通知失败');
  }
}

async function loadNotificationsByType(type) {
  try {
    const container = document.getElementById('notifications-list');
    if (container) {
      container.innerHTML = `
        <div class="loading">
          <div class="loading-spinner"></div>
          <p>正在加载通知...</p>
        </div>
      `;
    }

    const data = await apiRequest(API_ENDPOINTS.notificationsByType(type));
    
    if (data && Array.isArray(data)) {
      allNotifications = data;
      filteredNotifications = data;
      renderNotifications();
      updateUnreadCount();
    } else {
      showEmptyState('暂无通知');
    }
  } catch (error) {
    console.error('加载通知失败:', error);
    showToast('error', '加载通知失败: ' + error.message);
    showEmptyState('加载通知失败');
  }
}

function renderNotifications() {
  const container = document.getElementById('notifications-list');
  if (!container) return;

  // 应用筛选
  let displayNotifications = filteredNotifications;
  
  if (!showReadNotifications) {
    displayNotifications = displayNotifications.filter(n => !n.read);
  }

  if (currentFilter !== 'all') {
    displayNotifications = displayNotifications.filter(n => n.type === currentFilter);
  }

  // 分页
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, displayNotifications.length);
  const currentNotifications = displayNotifications.slice(startIndex, endIndex);

  if (currentNotifications.length === 0) {
    showEmptyState('没有找到匹配的通知');
    return;
  }

  const notificationsHTML = currentNotifications.map(notification => {
    const iconClass = getNotificationIconClass(notification.type);
    const timeAgo = formatTimeAgo(notification.createdAt || notification.timestamp);
    const typeText = getNotificationTypeText(notification.type);

    return `
      <div class="notification-item ${notification.read ? 'read' : 'unread'}" 
           data-id="${notification.id}" 
           data-type="${notification.type}">
        <div class="unread-indicator"></div>
        <div class="notification-icon ${notification.type}">
          <i class="${iconClass}"></i>
        </div>
        <div class="notification-content">
          <div class="notification-title">
            ${notification.title}
            ${!notification.read ? '<span class="notification-badge badge-new">新</span>' : ''}
            <span class="notification-badge badge-type">${typeText}</span>
          </div>
          <div class="notification-text">${notification.content || notification.message}</div>
          <div class="notification-meta">
            <span>${timeAgo}</span>
            <div class="notification-actions">
              ${!notification.read ? `<span class="notification-action mark-as-read" data-id="${notification.id}">标记为已读</span>` : ''}
              <span class="notification-action view-details" data-id="${notification.id}">查看详情</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = notificationsHTML;
  bindNotificationEvents();
}

function showEmptyState(message) {
  const container = document.getElementById('notifications-list');
  if (!container) return;

  container.innerHTML = `
    <div class="empty-state">
      <i class="fas fa-bell-slash"></i>
      <p>${message}</p>
      <button class="btn btn-primary" onclick="location.reload()">刷新页面</button>
    </div>
  `;
}

function bindNotificationEvents() {
  document.querySelectorAll('.mark-as-read').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      const id = this.dataset.id;
      markAsRead(id);
    });
  });

  document.querySelectorAll('.view-details').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      const id = this.dataset.id;
      viewNotificationDetails(id);
    });
  });

  document.querySelectorAll('.notification-item').forEach(item => {
    item.addEventListener('click', function() {
      const id = this.dataset.id;
      viewNotificationDetails(id);
    });
  });
}

async function markAsRead(id) {
  try {
    await apiRequest(API_ENDPOINTS.markNotificationRead(id), {
      method: 'POST'
    });

    // 更新本地状态
    const notification = allNotifications.find(n => n.id == id);
    if (notification) {
      notification.read = true;
      notification.readTime = new Date().toISOString();
    }

    renderNotifications();
    updateUnreadCount();
    showToast('success', '已标记为已读');
  } catch (error) {
    console.error('标记已读失败:', error);
    showToast('error', '标记已读失败: ' + error.message);
  }
}

async function markAllAsRead() {
  try {
    await apiRequest(API_ENDPOINTS.markTodayRead, {
      method: 'POST'
    });

    // 更新本地状态
    allNotifications.forEach(notification => {
      if (!notification.read) {
        notification.read = true;
        notification.readTime = new Date().toISOString();
      }
    });

    renderNotifications();
    updateUnreadCount();
    showToast('success', '所有通知已标记为已读');
  } catch (error) {
    console.error('标记所有已读失败:', error);
    showToast('error', '标记所有已读失败: ' + error.message);
  }
}

function viewNotificationDetails(id) {
  const notification = allNotifications.find(n => n.id == id);
  if (notification) {
    // 标记为已读（如果未读）
    if (!notification.read) {
      markAsRead(id);
    }

    // 显示详情
    const timeAgo = formatTimeAgo(notification.createdAt || notification.timestamp);
    const typeText = getNotificationTypeText(notification.type);

    const modal = document.createElement('div');
    modal.className = 'notification-detail-modal';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>${notification.title}</h3>
          <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <div class="notification-meta-info">
            <span class="badge badge-type">${typeText}</span>
            <span class="time">${timeAgo}</span>
          </div>
          <div class="notification-content-text">
            ${notification.content || notification.message}
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline modal-close-btn">关闭</button>
        </div>
      </div>
    `;

    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    `;

    const modalContent = modal.querySelector('.modal-content');
    modalContent.style.cssText = `
      background: white;
      padding: 20px;
      border-radius: 8px;
      max-width: 600px;
      width: 90%;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    `;

    const modalClose = modal.querySelector('.modal-close');
    const modalCloseBtn = modal.querySelector('.modal-close-btn');

    const closeModal = () => {
      document.body.removeChild(modal);
    };

    modalClose.addEventListener('click', closeModal);
    modalCloseBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });

    document.body.appendChild(modal);
  }
}

function initEventListeners() {
  // 筛选标签点击事件
  document.querySelectorAll('.filter-tab').forEach(tab => {
    tab.addEventListener('click', function() {
      document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
      this.classList.add('active');

      currentFilter = this.getAttribute('data-filter');
      
      if (currentFilter === 'all') {
        loadNotifications();
      } else {
        loadNotificationsByType(currentFilter);
      }
    });
  });

  // 显示已读通知切换
  const showReadCheckbox = document.getElementById('show-read');
  if (showReadCheckbox) {
    showReadCheckbox.addEventListener('change', function() {
      showReadNotifications = this.checked;
      renderNotifications();
    });
  }

  // 标记所有为已读
  const markAllReadBtn = document.getElementById('mark-all-read');
  if (markAllReadBtn) {
    markAllReadBtn.addEventListener('click', markAllAsRead);
  }

  // 刷新通知
  const refreshBtn = document.getElementById('refresh-notifications');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', async function() {
      this.classList.add('rotating');
      try {
        await loadNotifications();
        showToast('success', '刷新成功');
      } catch (error) {
        showToast('error', '刷新失败');
      } finally {
        this.classList.remove('rotating');
      }
    });
  }

  // 加载更多
  const loadMoreBtn = document.querySelector('#load-more button');
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', function() {
      currentPage++;
      renderNotifications();
    });
  }
}

async function updateUnreadCount() {
  try {
    const count = await apiRequest(API_ENDPOINTS.unreadCount);
    const unreadCount = typeof count === 'number' ? count : allNotifications.filter(n => !n.read).length;
    
    document.title = `通知中心 (${unreadCount}) - 知识协作平台`;
    
    // 更新通知徽章
    const badge = document.querySelector('.notification-badge');
    if (badge) {
      badge.textContent = unreadCount || '';
      badge.style.display = unreadCount > 0 ? 'flex' : 'none';
    }
  } catch (error) {
    console.error('获取未读数量失败:', error);
    const unreadCount = allNotifications.filter(n => !n.read).length;
    document.title = `通知中心 (${unreadCount}) - 知识协作平台`;
  }
}

function getNotificationIconClass(type) {
  const iconMap = {
    'system': 'fas fa-cog',
    'task': 'fas fa-tasks',
    'comment': 'fas fa-comment',
    'meeting': 'fas fa-calendar-alt',
    'level_up': 'fas fa-arrow-up',
    'project': 'fas fa-project-diagram',
    'document': 'fas fa-file-alt'
  };
  return iconMap[type] || 'fas fa-bell';
}

function getNotificationTypeText(type) {
  const typeMap = {
    'system': '系统',
    'task': '任务',
    'comment': '评论',
    'meeting': '会议',
    'level_up': '升级',
    'project': '项目',
    'document': '文档'
  };
  return typeMap[type] || '通知';
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