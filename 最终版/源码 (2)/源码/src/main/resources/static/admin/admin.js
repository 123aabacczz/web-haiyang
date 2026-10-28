import { API_BASE_URL, API_ENDPOINTS, apiRequest } from '../api-config.js';

// 全局变量
let currentPage = {
  users: 1,
  materials: 1,
  materialManagement: 1, // 新增
  registrations: 1,
  activities: 1,
  reports: 1,
  meetings: 1,
  announcements: 1,
  tasks: 1,
  taskReview: 1
};

// 添加全局变量
let selectedMaterial = null;
let adminUsers = [];

let currentMaterialFilter = {
  category: '',
  type: '',
  status: 'all'
};

// 添加资料管理筛选条件
let currentMaterialManagementFilter = {
  category: '',
  type: '',
  status: 'approved' // 默认显示已审核的资料
};

let currentStatusFilter = 'pending';
let currentRejectContext = { type: null, id: null };
let notificationSocket = null; // 全局WebSocket实例
let heartbeatInterval = null; // 心跳检测定时器
const SESSION_TIMEOUT = 60 * 60 * 1000; // 1小时超时

// 显示加载指示器
function showLoading() {
  document.getElementById('loading-overlay').classList.add('active');
}

// 隐藏加载指示器
function hideLoading() {
  document.getElementById('loading-overlay').classList.remove('active');
}

// 防止XSS攻击
function escapeHTML(str) {
  return str.replace(/[&<>"']/g,
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[tag] || tag));
}

// 添加角色文本转换函数
function getRoleText(role) {
  const roleMap = {
    'temporary': '临时用户',
    'user': '普通用户',
    'admin': '管理员',
    'level1_admin': '1级管理员—监察者',
    'level2_admin': '2级管理员—执法者',
    'level3_admin': '3级管理员—行政官',
    'level4_admin': '4级管理员—审判官',
    'level5_admin': '5级管理员—裁决官',
  };
  return roleMap[role] || role || '未知';
}

async function checkAdminSession() {
  showLoading();

  // 先检查本地存储中的会话信息
  const adminSession = JSON.parse(localStorage.getItem('adminSession'));
  const sessionExpired = !adminSession || (Date.now() - (adminSession?.timestamp || 0)) > SESSION_TIMEOUT;

  if (!sessionExpired && adminSession?.username) {
    updateAdminUI(adminSession);
    hideLoading();
    return;
  }

  // 如果本地没有会话信息或已过期，再请求服务器验证
  try {
    const res = await apiRequest(API_ENDPOINTS.currentAdmin, {
      credentials: 'include'
    });

    if (res?.success && res.data) {
      // 更新本地存储
      const updatedSession = {
        username: res.data.username,
        adminLevel: res.data.adminLevel,
        timestamp: Date.now()
      };
      localStorage.setItem('adminSession', JSON.stringify(updatedSession));

      // 更新页面显示
      updateAdminUI(updatedSession);
    } else {
      redirectToLogin();
    }
  } catch (error) {
    console.error('检查管理员会话失败:', error);
    localStorage.removeItem('adminSession');
    redirectToLogin();
  } finally {
    hideLoading();
  }
}

function updateAdminUI(session) {
  document.getElementById('admin-name').textContent = session.username;
    const levelText = getAdminLevelText(session.adminLevel);
    document.getElementById('admin-level').textContent = levelText; // 直接显示完整等级文本
  // 添加权限详情点击事件
  const adminLevelElement = document.getElementById('admin-level');
  if (adminLevelElement) {
    adminLevelElement.onclick = () => {
      showAdminPermissionDetail(session.adminLevel);
    };
  }
}

// 修改 checkAdminSession 函数中的重定向逻辑
function redirectToLogin() {
  localStorage.removeItem('adminSession');
  showToast('error', '请先登录管理员账户');
  setTimeout(() => {
    // 使用相对路径确保正确跳转
    const loginPath = window.location.pathname.includes('/admin/')
        ? '../login/login.html'
        : './login/login.html';
    location.href = loginPath;
  }, 1500);
}

// 添加显示权限详情的函数
function showAdminPermissionDetail(level) {
  const modal = document.getElementById('permission-detail-modal');

  if (!modal) {
    console.error('未找到权限详情弹窗元素!');
    return;
  }

  const levelText = getAdminLevelText(level);
  const description = getAdminPermissionDescription(level);

  document.getElementById('permission-level-text').textContent = levelText;
  document.getElementById('permission-level-description').textContent = description;

  // 显示权限图标
  const icons = {
    1: 'fa-search',
    2: 'fa-file-signature',
    3: 'fa-gavel',
    4: 'fa-crown'
  };

  const icon = icons[level] || 'fa-user-shield';
  document.getElementById('permission-icon').className = `fas ${icon}`;

  modal.classList.add('active');
}

// 修改管理员等级文本映射函数
function getAdminLevelText(level) {
  const levels = {
    1: '监察者',
    2: '执法者',
    3: '行政官',
    4: '审判官',
    5: '裁决官'
  };
  return levels[level] || '未知权限';
}

// 添加权限描述映射函数
function getAdminPermissionDescription(level) {
  const descriptions = {
    1: '监察者：负责资料、公告、会议报告等内容的审查和管理。无用户管理和管理员管理权限。',
    2: '执法者：拥有监察者的所有权限，并增加用户注册审核权限。',
    3: '行政官：拥有执法者的所有权限，并增加普通用户管理权限（如用户状态修改、删除等）。',
    4: '审判官：拥有行政官的所有权限，并增加对管理员的管理权限（如添加、删除管理员，分配权限等）。',
    5: '裁决官：拥有审判官的所有权限，并增加系统最高管理权限。'
  };
  return descriptions[level] || '未知权限等级，无法显示详情。';
}

// 辅助函数 - 确保在调用它们之前定义
function getStatusText(status) {
  const statusMap = {
    0: '待审核',
    1: '已通过',
    2: '已拒绝',
    active: '活跃',
    inactive: '禁用',
    pending: '待审核',
    approved: '已通过',
    rejected: '已拒绝'
  };
  return statusMap[status] || status || '未知';
}

function getActivityIcon(type) {
  // 添加空值检查
  if (!type) return 'history';

  const iconMap = {
    CREATE: 'plus-circle',
    UPDATE: 'edit',
    DELETE: 'trash',
    APPROVE: 'check-circle',
    REJECT: 'times-circle',
    LOGIN: 'sign-in-alt',
    LOGOUT: 'sign-out-alt',
    REGISTER: 'user-plus'
  };

  // 默认图标
  return iconMap[type.toUpperCase()] || 'history';
}

function renderRecentActivities(activities) {
  const container = document.getElementById('recent-activities');
  if (!Array.isArray(activities) || activities.length === 0) {
    container.innerHTML = '<div class="empty-state"><i class="fas fa-inbox"></i><p>暂无系统活动</p></div>';
    return;
  }

  container.innerHTML = activities.map(activity => `
    <div class="activity-item">
      <div class="activity-icon ${activity.type}">
        <i class="fas fa-${getActivityIcon(activity.type)}"></i>
      </div>
      <div class="activity-content">
        <div class="activity-title">${escapeHTML(activity.description)}</div>
        <div class="activity-time">${new Date(activity.timestamp).toLocaleString()}</div>
      </div>
    </div>
  `).join('');
}

// 工具函数
function debounce(fn, delay) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(this, args), delay);
  };
}

// 添加优先级文本转换函数
function getPriorityText(priority) {
  const priorityMap = {
    1: '低',
    2: '中',
    3: '高'
  };
  return priorityMap[priority] || '未知';
}

// 格式化日期函数
function formatDate(dateString) {
  if (!dateString) return '未知';
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// 打开任务审核模态框
async function openTaskReviewModal(taskId) {
  showLoading();
  try {
    const task = await apiRequest(API_ENDPOINTS.adminTaskDetail(taskId));

    // 确保模态框元素存在
    const modal = document.getElementById('task-review-modal');
    if (!modal) {
      console.error('任务审核模态框未找到');
      showToast('error', '系统错误：审核模态框未找到');
      return;
    }

    // 更新模态框内容
    const titleElement = modal.querySelector('#review-task-title');
    const descriptionElement = modal.querySelector('#review-task-description');
    const assigneeElement = modal.querySelector('#review-task-assignee');
    const priorityElement = modal.querySelector('#review-task-priority');
    const createTimeElement = modal.querySelector('#review-task-create-time');

    if (titleElement) titleElement.textContent = task.title || '无标题';
    if (descriptionElement) descriptionElement.textContent = task.description || '无描述';
    if (assigneeElement) assigneeElement.textContent = task.assigneeName || '未分配';
    if (priorityElement) priorityElement.textContent = getPriorityText(task.priority);
    if (createTimeElement) createTimeElement.textContent = task.createTime ? formatDate(task.createTime) : '未知';

    // 存储当前审核的任务ID
    modal.dataset.taskId = taskId;
    modal.classList.add('active');
  } catch (error) {
    console.error('加载任务详情失败:', error);
    showToast('error', '加载任务详情失败: ' + (error.message || '未知错误'));
  } finally {
    hideLoading();
  }
}

// 审核任务
async function reviewTask(isApprove) {
  const modal = document.getElementById('task-review-modal');
  if (!modal) {
    showToast('error', '系统错误：审核模态框未找到');
    return;
  }

  const taskId = modal.dataset.taskId;
  const comment = document.getElementById('review-comment')?.value || '';
  const status = isApprove ? 1 : 2; // 1通过，2拒绝

  if (!taskId) {
    showToast('error', '未找到任务ID');
    return;
  }

  showLoading();
  try {
    const result = await apiRequest(API_ENDPOINTS.adminTaskReview(taskId), {
      method: 'POST',
      body: {
        status: status,
        reviewComment: comment
      }
    });

    // 处理不同的响应格式
    let success = false;
    let message = '';

    if (result && typeof result === 'object') {
      if ('success' in result) {
        success = result.success;
        message = result.message;
      } else if ('id' in result) {
        success = true;
        message = isApprove ? '任务已通过' : '任务已拒绝';
      }
    } else if (typeof result === 'string') {
      success = result.includes('成功') || result.includes('通过') || result.includes('拒绝');
      message = result;
    }

    if (success) {
      showToast('success', message);
      modal.classList.remove('active');
      // 清空审核意见
      if (document.getElementById('review-comment')) {
        document.getElementById('review-comment').value = '';
      }
      loadTaskReview(currentPage.taskReview);
      loadTasks(); // 添加这行
    } else {
      showToast('error', message || '审核任务失败');
    }
  } catch (error) {
    console.error('审核任务失败:', error);
    showToast('error', error.message || '审核任务失败');
  } finally {
    hideLoading();
  }
}

// 显示Toast通知
function showToast(type, message, duration = 3000) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <div class="toast-icon">
      <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'times' : 'info'}-circle"></i>
    </div>
    <div class="toast-message">${escapeHTML(message)}</div>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('show');
  }, 10);

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

function showSkeleton(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = 'block';
}

function hideSkeleton(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = 'none';
}

// 页面数据加载
function loadPageData(pageId) {
  switch(pageId) {
    case 'dashboard':
      loadDashboard();
      loadActivityHistory();
      break;
    case 'user-management':
      loadUsers();
      break;
    case 'material-review':
      loadMaterials();
      break;
    case 'registration-review':
      loadRegistrations();
      break;
    case 'permission-management':
      loadPermissions();
      break;
    case 'audit-log':
      loadAuditLogs(currentPage.activities || 1);
      break;
    case 'report-management':
      loadReports();
      break;
    case 'meeting-management':
      loadMeetings();
      break;
    case 'announcement-management':
      loadAnnouncements();
      break;
    case 'material-management': // 新增
      loadMaterialManagement();
      break;
    case 'task-management':
      loadTasks();
      break;
    case 'task-review':
      loadTaskReview();
      break;
  }
}

// 修改 loadTasks 函数，删除重复的代码
async function loadTasks(status = '', priority = '', keyword = '', page = 1) {
  showSkeleton('task-skeleton');
  currentPage.tasks = page;

  try {
    const params = new URLSearchParams({
      page,
      size: 10,
      ...(status && { status }),
      ...(priority && { priority }),
      ...(keyword && { keyword })
    });

    const response = await apiRequest(`${API_ENDPOINTS.adminTasks}?${params}`);

    // 检查响应结构并提取数据
    let taskData;
    if (response && response.data) {
      // 如果响应包含 data 字段（ApiResponse 结构）
      taskData = response.data;
    } else if (response && response.items !== undefined) {
      // 如果响应直接包含分页数据
      taskData = response;
    } else {
      // 其他情况，使用空数据
      taskData = { items: [], total: 0 };
    }

    renderTasksTable(taskData.items || []);
    renderPagination('task-pagination', taskData.total || 0, 10, page, p => loadTasks(status, priority, keyword, p));
    hideSkeleton('task-skeleton');
  } catch (error) {
    console.error('加载任务失败:', error);
    hideSkeleton('task-skeleton');
    showToast('error', '加载任务数据失败');
  }
}

function renderTasksTable(tasks) {
  const tbody = document.querySelector('#task-table tbody');
  if (!tasks || tasks.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="empty-state">
          <i class="fas fa-inbox"></i>
          <p>暂无任务数据</p>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = tasks.map(task => `
    <tr>
      <td>${task.id}</td>
      <td>${escapeHTML(task.title)}</td>
      <td>${escapeHTML(task.assigneeName || '未分配')}</td>
      <td><span class="priority-badge priority-${task.priority}">${getPriorityText(task.priority)}</span></td>
      <td><span class="status-badge status-${task.status}">${getTaskStatusText(task.status)}</span></td>
      <td>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${task.progress || 0}%"></div>
          <span class="progress-text">${task.progress || 0}%</span>
        </div>
      </td>
      <td>${task.createTime ? formatDate(task.createTime) : '未知'}</td>
      <td>
        <div class="action-btns">
          <button class="btn btn-sm btn-outline btn-view-task" data-id="${task.id}">查看</button>
          <button class="btn btn-sm btn-primary btn-edit-task" data-id="${task.id}">编辑</button>
          <button class="btn btn-sm btn-danger btn-delete-task" data-id="${task.id}">删除</button>
        </div>
      </td>
    </tr>
  `).join('');
}

// 添加任务审核相关函数
async function loadTaskReview(page = 1) {
  showSkeleton('task-review-skeleton');
  currentPage.taskReview = page;

  try {
    const response = await apiRequest(`${API_ENDPOINTS.adminTasksPending}?page=${page}&size=10`);

    // 检查响应结构并提取数据
    let taskData;
    if (response && response.data) {
      taskData = response.data;
    } else if (response && response.items !== undefined) {
      taskData = response;
    } else {
      taskData = { items: [], total: 0 };
    }

    renderTaskReviewTable(taskData.items || []);
    renderPagination('task-review-pagination', taskData.total || 0, 10, page, loadTaskReview);
    hideSkeleton('task-review-skeleton');
  } catch (error) {
    console.error('加载待审核任务失败:', error);
    hideSkeleton('task-review-skeleton');
    showToast('error', '加载待审核任务失败');
  }
}

function renderTaskReviewTable(tasks) {
  const tbody = document.querySelector('#task-review-table tbody');
  if (!tasks || tasks.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="empty-state">
          <i class="fas fa-inbox"></i>
          <p>暂无待审核任务</p>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = tasks.map(task => `
    <tr>
      <td>${task.id}</td>
      <td>${escapeHTML(task.title)}</td>
      <td>${escapeHTML(task.assigneeName || '未分配')}</td>
      <td><span class="priority-badge priority-${task.priority}">${getPriorityText(task.priority)}</span></td>
      <td>${task.createTime ? formatDate(task.createTime) : '未知'}</td>
      <td>
        <button class="btn btn-sm btn-outline btn-review-task" data-id="${task.id}">审核</button>
      </td>
    </tr>
  `).join('');
}

// 添加辅助函数
function getTaskStatusText(status) {
  const statusMap = {
    0: '待审核',
    1: '已通过',
    2: '已拒绝',
    3: '进行中',
    4: '已完成'
  };
  return statusMap[status] || '未知';
}

// 报告管理功能
async function loadReports(status = 'all', page = 1) {
  showSkeleton('report-skeleton');
  currentPage.reports = page;
  try {
    // 使用正确的管理员接口
    const endpoint = status === 'pending'
        ? `${API_BASE_URL}/api/admin/home-info/reports/pending`
        : `${API_BASE_URL}/api/admin/home-info/reports`;

    const reports = await apiRequest(endpoint);
    renderReportsTable(reports);
    hideSkeleton('report-skeleton');
  } catch (error) {
    hideSkeleton('report-skeleton');
    showToast('error', '加载报告数据失败: ' + error.message);
  }
}

function renderReportsTable(reports) {
  const tbody = document.querySelector('#report-table tbody');
  if (!Array.isArray(reports) || reports.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="empty-state">
          <i class="fas fa-inbox"></i>
          <p>暂无报告数据</p>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = reports.map(report => `
    <tr>
      <td>${report.id}</td>
      <td>${escapeHTML(report.title || '无标题')}</td>
      <td>${escapeHTML(report.submitter || '未知')}</td>
      <td>${report.createdAt ? new Date(report.createdAt).toLocaleDateString() : '未知'}</td>
      <td><span class="status-badge status-${report.status}">${getStatusText(report.status)}</span></td>
      <td>
        <div class="action-btns">
          <button class="btn btn-sm btn-outline" onclick="viewReport(${report.id})">
            <i class="fas fa-eye"></i> 查看
          </button>
          ${report.status === 0 ? `
            <button class="btn btn-sm btn-success approve-report" data-id="${report.id}">通过</button>
            <button class="btn btn-sm btn-danger reject-report" data-id="${report.id}">拒绝</button>
          ` : ''}
        </div>
      </td>
    </tr>
  `).join('');
}

// 会议管理功能
async function loadMeetings(status = 'all', page = 1) {
  showSkeleton('meeting-skeleton');
  currentPage.meetings = page;
  try {
    const endpoint = status === 'pending'
        ? `${API_BASE_URL}/api/admin/home-info/meetings/pending`
        : `${API_BASE_URL}/api/admin/home-info/meetings`;
    const meetings = await apiRequest(endpoint);
    renderMeetingsTable(meetings);
    hideSkeleton('meeting-skeleton');
  } catch (error) {
    hideSkeleton('meeting-skeleton');
    showToast('error', '加载会议数据失败');
  }
}

function renderMeetingsTable(meetings) {
  const tbody = document.querySelector('#meeting-table tbody');
  if (!Array.isArray(meetings) || meetings.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="empty-state">
          <i class="fas fa-inbox"></i>
          <p>暂无会议数据</p>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = meetings.map(meeting => `
    <tr>
      <td>${meeting.id}</td>
      <td>${escapeHTML(meeting.title || '无主题')}</td>
      <td>${escapeHTML(meeting.organizer || '未知')}</td>
      <td>${meeting.meetingTime ? new Date(meeting.meetingTime).toLocaleString() : '未知'}</td>
      <td><span class="status-badge status-${meeting.status}">${getStatusText(meeting.status)}</span></td>
      <td>
        <div class="action-btns">
          <button class="btn btn-sm btn-outline" onclick="viewMeeting(${meeting.id})">
            <i class="fas fa-eye"></i> 查看
          </button>
          ${meeting.status === 0 ? `
            <button class="btn btn-sm btn-success approve-meeting" data-id="${meeting.id}">通过</button>
            <button class="btn btn-sm btn-danger reject-meeting" data-id="${meeting.id}">拒绝</button>
          ` : ''}
        </div>
      </td>
    </tr>
  `).join('');
}

// 公告管理功能
async function loadAnnouncements(page = 1) {
  showSkeleton('announcement-skeleton');
  currentPage.announcements = page;

  try {
    const response = await apiRequest(
      `${API_BASE_URL}/api/admin/home-info/announcements?page=${page}&size=10`
    );

    // 修复：正确处理分页数据结构
    const announcements = response.items || response.content || response;
    const totalItems = response.totalItems || response.total || 0;

    renderAnnouncementsTable(announcements);

    // 渲染分页控件
    renderPagination(
      'announcement-pagination',
      totalItems,
      10,
      page,
      p => loadAnnouncements(p)
    );

    hideSkeleton('announcement-skeleton');
  } catch (error) {
    console.error('加载公告失败:', error);
    hideSkeleton('announcement-skeleton');
    showToast('error', '加载公告数据失败: ' + error.message);
  }
}

function renderAnnouncementsTable(announcements) {
  const tbody = document.querySelector('#announcement-table tbody');
  if (!Array.isArray(announcements) || announcements.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="empty-state">
          <i class="fas fa-inbox"></i>
          <p>暂无公告数据</p>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = announcements.map(announcement => `
    <tr>
      <td>${announcement.id}</td>
      <td>${escapeHTML(announcement.title)}</td>
      <td>${escapeHTML(announcement.content.substring(0, 50) + (announcement.content.length > 50 ? '...' : ''))}</td>
      <td>${escapeHTML(announcement.publisher)}</td> <!-- 确保字段名正确 -->
      <td>${announcement.publishTime ? new Date(announcement.publishTime).toLocaleString() : '未知'}</td>
      <td>
        <div class="action-btns">
          <button class="btn btn-sm btn-primary btn-edit-announcement" data-id="${announcement.id}">编辑</button>
          <button class="btn btn-sm btn-danger btn-delete-announcement" data-id="${announcement.id}">删除</button>
        </div>
      </td>
    </tr>
  `).join('');
}

// ✅ 修复后的 loadDashboard 函数
async function loadDashboard() {
  try {
    const days = document.getElementById('date-range-select')?.value || 30;

    console.log('开始加载仪表盘数据...');
    console.log('Chart.js 状态:', typeof Chart !== 'undefined' ? '已加载' : '未加载');
    
    // 等待DOM完全加载
    if (document.readyState === 'loading') {
      await new Promise(resolve => {
        document.addEventListener('DOMContentLoaded', resolve);
      });
    }

    console.log('DOM 加载状态:', document.readyState);
    console.log('Canvas 元素:', document.getElementById('stats-chart'));

    const [stats, activities] = await Promise.all([
      apiRequest(`${API_ENDPOINTS.dashboardStats}?days=${days}`),
      apiRequest(API_ENDPOINTS.adminDashboardRecentActivities(5))
    ]);

    console.log('API 响应数据:', stats);
    console.log('Chart 数据:', stats.chartData);

    document.getElementById('total-users').textContent = stats.totalUsers || 0;
    document.getElementById('pending-materials').textContent = stats.pendingMaterials || 0;
    document.getElementById('new-users').textContent = stats.newUsers || 0;
    document.getElementById('pending-issues').textContent = stats.pendingIssues || 0;

    renderRecentActivities(Array.isArray(activities) ? activities : []);

    // ✅ 修复：添加 Chart.js 可用性检查和Canvas元素检查
    if (typeof Chart !== 'undefined') {
      console.log('开始渲染图表...');
      renderChart(stats.chartData);
    } else {
      console.warn('Chart.js 未加载，跳过图表渲染');
      // 尝试重新加载Chart.js
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.8/dist/chart.umd.min.js';
      script.onload = () => {
        console.log('Chart.js 重新加载成功');
        renderChart(stats.chartData);
      };
      script.onerror = () => {
        console.error('Chart.js 加载失败');
      };
      document.head.appendChild(script);
    }
  } catch (error) {
    console.error('加载仪表盘失败:', error);
    showToast('error', '加载仪表盘数据失败: ' + error.message);
  }
}

// ✅ 唯一的 renderChart 函数定义
function renderChart(chartData) {
  const ctx = document.getElementById('stats-chart');
  if (!ctx) {
    console.error('Canvas 元素未找到');
    return;
  }

  console.log('Canvas 元素找到:', ctx);
  console.log('Chart 数据:', chartData);

  // ✅ 使用更健壮的实例存储方式
  const chartId = 'adminDashboardChart';

  // 销毁现有图表实例
  if (window[chartId]) {
    window[chartId].destroy();
    window[chartId] = null;
  }

  // 确保chartData存在且格式正确
  const safeChartData = chartData || {};
  const labels = safeChartData.labels || ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
  const newUsersData = safeChartData.newUsers || [0, 0, 0, 0, 0, 0, 0];
  const activeUsersData = safeChartData.activeUsers || [0, 0, 0, 0, 0, 0, 0];

  console.log('使用的标签:', labels);
  console.log('新用户数据:', newUsersData);
  console.log('活跃用户数据:', activeUsersData);

  // ✅ 使用标准方式创建图表
  try {
    window[chartId] = new Chart(ctx.getContext('2d'), {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: '新用户',
            data: newUsersData,
            borderColor: '#4c6ef5',
            backgroundColor: 'rgba(76, 110, 245, 0.1)',
            tension: 0.4,
            fill: true
          },
          {
            label: '活跃用户',
            data: activeUsersData,
            borderColor: '#40c057',
            backgroundColor: 'rgba(64, 192, 87, 0.1)',
            tension: 0.4,
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top'
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
    console.log('图表渲染成功');
  } catch (error) {
    console.error('图表渲染失败:', error);
  }
}

// 用户管理
async function loadUsers(page = 1, keyword = '') {
  showSkeleton('user-skeleton');
  currentPage.users = page;

  try {
    const params = new URLSearchParams({
      page,
      size: 10,
      ...(keyword && { keyword })
    });

    const data = await apiRequest(`${API_ENDPOINTS.allUsers}?${params}`);

    if (data && data.items) {
      renderUsersTable(data.items);
      renderPagination('users-pagination', data.total || 0, 10, page, p => loadUsers(p, keyword));
    } else {
      // 处理空数据情况
      renderUsersTable([]);
    }
  } catch (error) {
    console.error('加载用户失败:', error);
    showToast('error', '加载用户数据失败: ' + error.message);
    // 显示空状态而不是完全失败
    renderUsersTable([]);
  } finally {
    hideSkeleton('user-skeleton');
  }
}

// 修改 renderUsersTable 函数
function renderUsersTable(users) {
  const tbody = document.querySelector('#users-table tbody');
  if (!users || users.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="empty-state">
          <i class="fas fa-inbox"></i>
          <p>暂无用户数据</p>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = users.map(user => `
    <tr>
      <td>${user.id}</td>
      <td>
        <div style="display: flex; align-items: center; gap: 8px;">
          <div class="user-avatar" style="width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #4c6ef5, #3b5bdb); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px;">
            ${(user.username || '').charAt(0).toUpperCase()}
          </div>
          <span>${escapeHTML(user.username)}</span>
        </div>
      </td>
      <td>${escapeHTML(getRoleText(user.role))}</td>
      <td>
        ${user.role === 'admin' ?
          `Lv.${user.adminLevel || 1} 管理员` :
          `Lv.${user.userLevel || 1}`}
      </td>
      <td>${escapeHTML(user.email)}</td>
      <td>
        <span class="status-badge status-${user.status || 'pending'}">${getStatusText(user.status)}</span>
      </td>
      <td>${user.registrationDate ? new Date(user.registrationDate).toLocaleDateString() : '未知'}</td>
      <td>
        <div class="action-btns">
          <button class="btn btn-sm btn-primary btn-edit" data-id="${user.id}">编辑</button>
          <button class="btn btn-sm btn-warning btn-status" data-id="${user.id}" data-status="${user.status}">状态</button>
          <button class="btn btn-sm btn-danger btn-delete" data-id="${user.id}">删除</button>
          <button class="btn btn-sm btn-success btn-assign-permission" data-id="${user.id}" data-username="${escapeHTML(user.username)}">分配权限</button>
        </div>
      </td>
    </tr>
  `).join('');
}

// 修改 loadUserForEdit 函数
async function loadUserForEdit(userId) {
  showLoading();
  try {
    const user = await apiRequest(`${API_ENDPOINTS.allUsers}/${userId}`);

    document.getElementById('user-form-id').value = user.id;
    document.getElementById('user-form-username').value = user.username;
    document.getElementById('user-form-email').value = user.email;
    document.getElementById('user-form-role').value = user.role;
    document.getElementById('user-form-secret').value = user.secret || '';
    document.getElementById('secret-field').style.display = 'block';

    // 管理员等级处理
    if (user.role === 'admin') {
      document.getElementById('admin-level-field').style.display = 'block';
      document.getElementById('admin-level-select').value = user.adminLevel || 1;
      document.getElementById('user-level-field').style.display = 'none';
    } else {
      document.getElementById('admin-level-field').style.display = 'none';
      document.getElementById('user-level-field').style.display = 'block';
      document.getElementById('user-level-input').value = user.userLevel || 1;
    }

    document.getElementById('password-fields').style.display = 'none';
    document.getElementById('user-modal').classList.add('active');
  } catch (error) {
    showToast('error', '加载用户信息失败');
  } finally {
    hideLoading();
  }
}

// 添加角色选择变化事件处理
document.getElementById('user-form-role').addEventListener('change', function() {
  const role = this.value;
  const adminLevelField = document.getElementById('admin-level-field');
  const userLevelField = document.getElementById('user-level-field');

  adminLevelField.style.display = role === 'admin' ? 'block' : 'none';
  userLevelField.style.display = role === 'user' ? 'block' : 'none';
});

// 资料审核
async function loadMaterials(status = 'all', page = 1) {
  showSkeleton('material-skeleton');
  currentPage.materials = page;

  const statusMap = { all: null, pending: 0, approved: 1, rejected: 2 };
  const statusCode = statusMap[status];

  try {
    const params = new URLSearchParams({
      page,
      size: 10,
      ...(statusCode !== null && { status: statusCode }),
      ...(currentMaterialFilter.category && { category: currentMaterialFilter.category }),
      ...(currentMaterialFilter.type && { type: currentMaterialFilter.type })
    });

    const data = await apiRequest(`${API_ENDPOINTS.materials}?${params}`);
    renderMaterialsTable(data.items || []);
    renderPagination('material-pagination', data.total || 0, 10, page, p => loadMaterials(status, p));
    hideSkeleton('material-skeleton');
  } catch (error) {
    console.error('加载资料失败:', error);
    hideSkeleton('material-skeleton');
    showToast('error', '加载资料数据失败');
  }
}

function renderMaterialsTable(materials) {
  const tbody = document.querySelector('#material-table tbody');
  if (!materials || materials.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="empty-state"> <!-- 增加列数 -->
          <i class="fas fa-inbox"></i>
          <p>暂无资料数据</p>
        </td>
      </tr>
    `;
    return;
  }

   tbody.innerHTML = materials.map(material => `
      <tr>
        <td>${material.id}</td>
        <td>${escapeHTML(material.name)}</td>
        <td>${escapeHTML(material.originalFilename || material.name)}</td>  <!-- 新增原始文件名列 -->
        <td>
          <div style="display: flex; align-items: center; gap: 8px;">
            <div class="user-avatar" style="width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #fab005, #f59f00); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px;">
              ${(material.uploaderName || 'U').charAt(0).toUpperCase()}
            </div>
            <span>${escapeHTML(material.uploaderName || '未知用户')}</span>
          </div>
        </td>
      <td>${material.uploadTime ? new Date(material.uploadTime).toLocaleDateString() : '未知'}</td>
      <td>${escapeHTML(material.category || '未知')}</td>
      <td><span class="status-badge status-${material.status}">${getStatusText(material.status)}</span></td>
      <td>
        <div class="action-btns">
          <button class="btn btn-sm btn-outline" onclick="viewMaterial(${material.id})">
            <i class="fas fa-eye"></i>
          </button>
          ${material.status === 0 ? `
            <button class="btn btn-sm btn-success approve-material" data-id="${material.id}">通过</button>
            <button class="btn btn-sm btn-danger reject-material" data-id="${material.id}">拒绝</button>
          ` : ''}
        </div>
      </td>
    </tr>
  `).join('');
}

// 注册审核
async function loadRegistrations(page = 1) {
  showSkeleton('registration-skeleton');
  currentPage.registrations = page;

  try {
    const params = new URLSearchParams({ page, size: 10 });
    const data = await apiRequest(`${API_ENDPOINTS.pendingUsers}?${params}`);
    renderRegistrationsTable(data.items || []);
    renderPagination('registration-pagination', data.total || 0, 10, page, p => loadRegistrations(p));
    hideSkeleton('registration-skeleton');
  } catch (error) {
    console.error('加载注册审核失败:', error);
    hideSkeleton('registration-skeleton');
    showToast('error', '加载注册审核数据失败');
  }
}

function renderRegistrationsTable(users) {
  const tbody = document.querySelector('#registration-table tbody');
  if (!users || users.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="empty-state">
          <i class="fas fa-inbox"></i>
          <p>暂无待审核用户</p>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = users.map(user => `
    <tr>
      <td>${user.id}</td>
      <td>${escapeHTML(user.username)}</td>
      <td>${escapeHTML(user.email)}</td>
      <td>${user.registrationDate ? new Date(user.registrationDate).toLocaleDateString() : '未知'}</td>
      <td><span class="status-badge status-pending">待审核</span></td>
      <td>
        <button class="btn btn-sm btn-success approve-btn" data-id="${user.id}">通过</button>
        <button class="btn btn-sm btn-danger reject-btn" data-id="${user.id}">拒绝</button>
      </td>
    </tr>
  `).join('');
}

// 权限管理
async function loadPermissions() {
  try {
    const permissions = await apiRequest(API_ENDPOINTS.permissions);
    const container = document.getElementById('permission-list');
    if (!Array.isArray(permissions) || permissions.length === 0) {
      container.innerHTML = '<div class="empty-state"><i class="fas fa-inbox"></i><p>暂无权限数据</p></div>';
      return;
    }

    container.innerHTML = permissions.map(p => `
      <div class="permission-card">
        <div class="permission-header">
          <i class="fas fa-shield-alt" style="color: var(--primary);"></i>
          <div style="font-weight: 600;">${escapeHTML(p.name)}</div>
        </div>
        <div class="permission-description">${escapeHTML(p.description)}</div>
        <div class="action-btns">
          <button class="btn btn-sm btn-outline edit-permission" data-id="${p.id}">编辑</button>
          <button class="btn btn-sm btn-outline delete-permission" data-id="${p.id}">删除</button>
        </div>
      </div>
    `).join('');
  } catch (error) {
    showToast('error', '加载权限数据失败');
  }
}

// 操作历史
async function loadActivityHistory(startDate, endDate, page = 1) {
  try {
    const params = new URLSearchParams({
      page: page,
      size: 20,
      ...(startDate && { start: startDate }),
      ...(endDate && { end: endDate })
    });

    const data = await apiRequest(`${API_ENDPOINTS.adminDashboardActivityLogs}?${params}`);
    // 过滤未来时间
    const now = new Date();
    data.items = (data.items || []).filter(item => new Date(item.timestamp) <= now);

    const container = document.getElementById('activity-history-container');
    if (!data.items || data.items.length === 0) {
      container.innerHTML = '<div class="empty-state"><i class="fas fa-inbox"></i><p>暂无操作历史</p></div>';
      return;
    }

    container.innerHTML = data.items.map(activity => `
      <div class="activity-item">
        <div class="activity-icon ${activity.type}">
          <i class="fas fa-${getActivityIcon(activity.type)}"></i>
        </div>
        <div class="activity-content">
          <div class="activity-title">${escapeHTML(activity.description)}</div>
          <div class="activity-details">
            <span>操作人: ${escapeHTML(activity.operator)}</span>
            <span>时间: ${new Date(activity.timestamp).toLocaleString()}</span>
          </div>
        </div>
      </div>
    `).join('');
  } catch (error) {
    showToast('error', '加载操作历史失败: ' + error.message);
  }
}

// 事件处理
function setupSearch() {
  const searchInput = document.getElementById('user-search-input');
  searchInput?.addEventListener('input', debounce((e) => {
    loadUsers(1, e.target.value);
  }, 300));
}

function setupMaterialTabs() {
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      e.target.classList.add('active');

      const status = e.target.dataset.status;
      currentStatusFilter = status;
      loadMaterials(status);
    });
  });
}

function setupPagination() {
  // 用户分页
  document.getElementById('users-pagination')?.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON') {
      const page = parseInt(e.target.dataset.page);
      if (!isNaN(page)) loadUsers(page);
    }
  });

  // 资料分页
  document.getElementById('material-pagination')?.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON') {
      const page = parseInt(e.target.dataset.page);
      if (!isNaN(page)) loadMaterials(currentStatusFilter, page);
    }
  });

  // 注册分页
  document.getElementById('registration-pagination')?.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON') {
      const page = parseInt(e.target.dataset.page);
      if (!isNaN(page)) loadRegistrations(page);
    }
  });
}

// 事件处理改为委托模式
function setupEventDelegation() {
  document.addEventListener('click', (e) => {
    // 用户状态更新
    if (e.target.matches('.btn-status')) {
      const userId = e.target.dataset.id;
      const currentStatus = e.target.dataset.status;
      openStatusModal(userId, currentStatus);
    }

    // 删除活动日志
    if (e.target.matches('.btn-delete-activity') || e.target.closest('.btn-delete-activity')) {
      const activityId = e.target.dataset.id || e.target.closest('.btn-delete-activity').dataset.id;
      deleteActivityLog(activityId);
    }

    if (e.target.matches('.btn-view-task')) {
      const taskId = e.target.dataset.id;
      viewTask(taskId);
    }

    if (e.target.hasAttribute('data-dismiss')) {
        const modalId = e.target.getAttribute('data-dismiss');
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
        }
    }

    // 在事件委托中添加任务相关事件处理
    if (e.target.matches('.btn-review-task')) {
      const taskId = e.target.dataset.id;
      openTaskReviewModal(taskId);
    }

        // 从资料库选择附件
        if (e.target.matches('#select-from-material')) {
            openMaterialSelectModal();
        }

        // 确认选择资料
        if (e.target.matches('#confirm-material-select')) {
            confirmMaterialSelection();
        }

        // 移除已选资料
        if (e.target.matches('#remove-material')) {
            removeSelectedMaterial();
        }

    // 在setupEventDelegation函数中添加
    if (e.target.matches('#add-task-btn')) {
        openTaskModal(false);
    }

    if (e.target.matches('.btn-edit-task')) {
      const taskId = e.target.dataset.id;
      openEditTaskModal(taskId); // 改为调用专门的编辑函数
    }

    if (e.target.matches('.btn-delete-task')) {
      const taskId = e.target.dataset.id;
      deleteTask(taskId);
    }

    // 添加资料按钮
    if (e.target.matches('#add-material-btn')) {
        document.getElementById('add-material-modal').classList.add('active');
    }

    // 保存资料按钮
    if (e.target.matches('#save-material-btn')) {
        uploadMaterial();
    }

    // 移除文件按钮
    if (e.target.matches('#remove-file')) {
        resetFileInput();
    }

    // 删除用户
    if (e.target.matches('.btn-delete')) {
      const userId = e.target.dataset.id;
      confirmDeleteUser(userId);
    }

    // 编辑用户
    if (e.target.matches('.btn-edit')) {
      const userId = e.target.dataset.id;
      loadUserForEdit(userId);
    }

    // 分配权限
    if (e.target.matches('.btn-assign-permission')) {
      const userId = e.target.dataset.id;
      const username = e.target.dataset.username;
      openPermissionAssignModal(userId, username);
    }

    // 审核用户注册
    if (e.target.matches('.approve-btn')) {
      approveUserRegistration(e.target.dataset.id);
    }

    if (e.target.matches('.reject-btn')) {
      currentRejectContext = { type: 'registration', id: e.target.dataset.id };
      document.getElementById('reject-modal').classList.add('active');
    }

    // 资料审核
    if (e.target.matches('.approve-material')) {
      approveMaterial(e.target.dataset.id);
    }

    if (e.target.matches('.reject-material')) {
      currentRejectContext = { type: 'material', id: e.target.dataset.id };
      document.getElementById('reject-modal').classList.add('active');
    }

    // 权限管理
    if (e.target.matches('.edit-permission')) {
      editPermission(parseInt(e.target.dataset.id));
    }

    if (e.target.matches('.delete-permission')) {
      deletePermission(parseInt(e.target.dataset.id));
    }

    // 报告审核
    if (e.target.matches('.approve-report')) {
      approveReport(e.target.dataset.id);
    }
    if (e.target.matches('.reject-report')) {
      currentRejectContext = { type: 'report', id: e.target.dataset.id };
      document.getElementById('reject-modal').classList.add('active');
    }

    // 会议审核
    if (e.target.matches('.approve-meeting')) {
      approveMeeting(e.target.dataset.id);
    }
    if (e.target.matches('.reject-meeting')) {
      currentRejectContext = { type: 'meeting', id: e.target.dataset.id };
      document.getElementById('reject-modal').classList.add('active');
    }

    // 公告管理
    if (e.target.matches('.btn-edit-announcement')) {
      loadAnnouncementForEdit(e.target.dataset.id);
    }
    if (e.target.matches('.btn-delete-announcement')) {
      deleteAnnouncement(e.target.dataset.id);
    }

    // 资料管理删除按钮
    if (e.target.matches('.delete-material-management') || e.target.closest('.delete-material-management')) {
      const materialId = e.target.dataset.id || e.target.closest('.delete-material-management').dataset.id;
      deleteMaterialManagement(materialId);
    }
  });

  // 资料选择搜索
      document.getElementById('material-select-search')?.addEventListener('input', debounce((e) => {
          loadMaterialsForSelect(1, e.target.value);
      }, 300));
}

// 修改添加任务按钮的事件处理，确保标题正确
document.getElementById('add-task-btn')?.addEventListener('click', () => {
  document.getElementById('task-modal-title').textContent = '添加任务';
  document.getElementById('task-id').value = '';
  document.getElementById('task-form').reset();
  selectedMaterial = null;
  document.getElementById('selected-material-info').style.display = 'none';
  document.getElementById('task-priority').value = '2';

  // 加载管理员列表
  loadAdminUsers().then(() => {
    document.getElementById('task-modal').classList.add('active');
  });
});

// 保存任务按钮事件
document.getElementById('save-task-btn')?.addEventListener('click', saveTask);

// 审核任务按钮事件
document.getElementById('approve-task-btn')?.addEventListener('click', () => {
  reviewTask(true);
});

document.getElementById('reject-task-btn')?.addEventListener('click', () => {
  reviewTask(false);
});

// 筛选事件
document.getElementById('status-filter')?.addEventListener('change', (e) => {
  const status = e.target.value;
  const priority = document.getElementById('priority-filter').value;
  const keyword = document.getElementById('task-search-input').value;
  loadTasks(status, priority, keyword);
});

document.getElementById('priority-filter')?.addEventListener('change', (e) => {
  const priority = e.target.value;
  const status = document.getElementById('status-filter').value;
  const keyword = document.getElementById('task-search-input').value;
  loadTasks(status, priority, keyword);
});

document.getElementById('task-search-input')?.addEventListener('input', debounce((e) => {
  const keyword = e.target.value;
  const status = document.getElementById('status-filter').value;
  const priority = document.getElementById('priority-filter').value;
  loadTasks(status, priority, keyword);
}, 300));

// 设置资料管理搜索功能
function setupMaterialManagementSearch() {
  const searchInput = document.getElementById('material-management-search-input');
  searchInput?.addEventListener('input', debounce((e) => {
    // 这里需要后端支持按名称搜索，或者在前端进行筛选
    // 暂时先重新加载所有数据
    loadMaterialManagement(currentMaterialManagementFilter.status);
  }, 300));
}

// 打开状态模态框
function openStatusModal(userId, currentStatus) {
  document.getElementById('status-select').value = currentStatus;
  document.getElementById('status-modal').classList.add('active');
  document.getElementById('reason-field').style.display = 'none';

  document.getElementById('confirm-status-change').onclick = () => {
    const newStatus = document.getElementById('status-select').value;
    updateUserStatus(userId, newStatus);
    document.getElementById('status-modal').classList.remove('active');
  };
}

// 确认删除用户
function confirmDeleteUser(userId) {
  if (confirm('确定删除该用户？此操作不可恢复！')) {
    deleteUser(userId);
  }
}

// 确认拒绝操作
document.getElementById('confirm-reject')?.addEventListener('click', () => {
  const reason = document.getElementById('reject-reason').value;
  if (!reason) {
    showToast('error', '请输入拒绝原因');
    return;
  }

  if (currentRejectContext.type === 'registration') {
    rejectUserRegistration(currentRejectContext.id, reason);
  } else if (currentRejectContext.type === 'material') {
    rejectMaterial(currentRejectContext.id, reason);
  } else if (currentRejectContext.type === 'report') {
    rejectReport(currentRejectContext.id, reason);
  } else if (currentRejectContext.type === 'meeting') {
    rejectMeeting(currentRejectContext.id, reason);
  }

  document.getElementById('reject-modal').classList.remove('active');
  document.getElementById('reject-reason').value = '';
});

// 添加权限
document.getElementById('save-permission-btn')?.addEventListener('click', () => {
  const name = document.getElementById('permission-name').value;
  const description = document.getElementById('permission-description').value;

  if (!name || !description) {
    showToast('error', '请填写完整信息');
    return;
  }

  apiRequest(`${API_BASE_URL}/api/admin/permissions`, {
    method: 'POST',
    body: { name, description, moduleId: 1 } // 将moduleId放入请求体
  })
    .then(() => {
      showToast('success', '权限已添加');
      loadPermissions();
      document.getElementById('permission-modal').classList.remove('active');
      document.getElementById('permission-form').reset();
    })
    .catch(err => showToast('error', err.message));
});

// 操作API
async function updateUserStatus(userId, status) {
  showLoading();
  try {
    const result = await apiRequest(
      `${API_BASE_URL}/api/admin/users/${userId}/status?status=${status}`,
      { method: 'PUT' }
    );

    // 处理文本响应
    if (typeof result === 'string') {
      showToast('success', result);
    }
    // 处理JSON响应
    else if (result && result.message) {
      showToast('success', result.message);
    }

    loadUsers(currentPage.users);
  } catch (error) {
    showToast('error', error.message || '更新用户状态失败');
  } finally {
    hideLoading();
  }
}

// 打开编辑用户弹窗时
function openEditUserModal(user) {
  document.getElementById('user-modal-title').textContent = '编辑用户信息';
  document.getElementById('user-form-id').value = user.id;
  document.getElementById('user-form-username').value = user.username;
  document.getElementById('user-form-email').value = user.email;

  // ✅ 关键修复：设置角色下拉框的值
  document.getElementById('user-form-role').value = user.role;

  document.getElementById('user-modal').classList.add('active');
}

async function deleteUser(userId) {
  showLoading();
  try {
    const result = await apiRequest(API_ENDPOINTS.adminUserDetail(userId), {
      method: 'DELETE'
    });

    // 处理不同类型的响应
    let message = '';
    if (typeof result === 'string') {
      message = result;
    } else if (result && result.message) {
      message = result.message;
    }

    showToast('success', message || '用户已删除');
    loadUsers(currentPage.users);
  } catch (error) {
    showToast('error', error.message || '删除用户失败');
  } finally {
    hideLoading();
  }
}

async function approveUserRegistration(userId) {
  showLoading();
  try {
    await apiRequest(API_ENDPOINTS.approveUser, {
      method: 'POST',
      body: { userId }
    });
    showToast('success', '用户注册已通过');
    loadRegistrations(currentPage.registrations);

    // 确保调用徽章刷新
    setTimeout(refreshNotificationBadge, 500); // 添加延迟确保数据更新
    // 创建系统通知
    apiRequest(API_ENDPOINTS.notificationRegister, {
      method: 'POST',
      body: { message: `新用户注册已通过审核` }
    });
  } catch (error) {
    showToast('error', error.message || '审核操作失败');
  } finally {
    hideLoading();
  }
  refreshNotificationBadge();
}

async function rejectUserRegistration(userId, reason) {
  showLoading();
  try {
    await apiRequest(API_ENDPOINTS.rejectUser, {
      method: 'POST',
      body: { userId, reason }
    });
    showToast('success', '用户注册已拒绝');
    loadRegistrations(currentPage.registrations);
  } catch (error) {
    showToast('error', error.message || '拒绝操作失败');
  } finally {
    hideLoading();
  }
  refreshNotificationBadge();
}

async function approveMaterial(materialId) {
  showLoading();
  try {
    await apiRequest(API_ENDPOINTS.adminMaterialApprove(materialId), {
      method: 'POST'
    });
    showToast('success', '资料已通过审核');
    loadMaterials(currentStatusFilter, currentPage.materials);
  } catch (error) {
    showToast('error', error.message || '审核资料失败');
  } finally {
    hideLoading();
  }
  refreshNotificationBadge(); // ✅ 新增
}

// WebSocket连接
function setupNotificationWebSocket() {
  // 关闭现有连接
  if (notificationSocket) {
    notificationSocket.close();
    notificationSocket = null;
  }

  // 清除心跳检测
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }

  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = new URL(API_BASE_URL).host;

  // ✅ 修复：直接使用API_ENDPOINTS.wsNotifications()返回的URL
  const wsUrl = API_ENDPOINTS.wsNotifications();

  notificationSocket = new WebSocket(wsUrl);

  notificationSocket.onopen = () => {
    console.log('✅ WebSocket 连接成功');
    notificationSocket.send('subscribe');

    // 开始心跳检测
    heartbeatInterval = setInterval(() => {
      if (notificationSocket.readyState === WebSocket.OPEN) {
        notificationSocket.send('ping');
      }
    }, 30000); // 每30秒发送一次心跳
  };

  notificationSocket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      switch(data.type) {
        case 'badge-update':
          updateNotificationBadge(data.count || 0);
          break;
        case 'new-notification':
          document.getElementById('notification-count').classList.add('pulse');
          if (document.getElementById('notification-panel').style.display === 'block') {
            loadNotifications();
          }
          break;
        case 'new-activity-log':
          if (document.getElementById('audit-log').classList.contains('active')) {
            loadAuditLogs(currentPage.activities || 1);
          }
          break;
        case 'pong':
          // 心跳响应，不做处理
          break;
      }
    } catch (error) {
      console.error('解析 WebSocket 消息失败:', error, event.data);
    }
  };

  notificationSocket.onerror = (error) => {
    console.error('WebSocket 错误:', error);
    // 对于WebSocket错误，不立即重连，等待用户操作
    updateNotificationBadge(0);
  };

  notificationSocket.onclose = (event) => {
    console.log(`WebSocket 连接关闭，代码: ${event.code}, 原因: ${event.reason}`);
    // 清除心跳检测
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
      heartbeatInterval = null;
    }

    // 只有在正常关闭或临时故障时才重连
    if (event.code !== 1000 && event.code !== 1001) {
      // 10秒后尝试重新连接
      setTimeout(setupNotificationWebSocket, 10000);
    }
  };
}

// 添加会话验证函数
function validateAdminSession() {
  const adminSession = JSON.parse(localStorage.getItem('adminSession'));
  if (!adminSession) {
    return false;
  }

  // 检查会话是否过期（1小时）
  const isExpired = (Date.now() - (adminSession.timestamp || 0)) > (60 * 60 * 1000);
  if (isExpired) {
    localStorage.removeItem('adminSession');
    return false;
  }

  return true;
}

// 提取徽章更新逻辑
function updateNotificationBadge(count) {
  const badge = document.getElementById('notification-count');
  if (!badge) return;

  badge.textContent = count;

  if (count > 0) {
    badge.style.display = 'flex';
    badge.style.background = '#ff4757'; // 红色
    badge.classList.add('pulse');
    setTimeout(() => badge.classList.remove('pulse'), 1000);
  } else {
    badge.style.background = '#64748b'; // 灰色
    badge.classList.remove('pulse');
  }
}

// 修改刷新徽章方法
function refreshNotificationBadge() {
  apiRequest(API_ENDPOINTS.unreadCount)
      .then(count => {
        updateNotificationBadge(count);
      })
      .catch(error => {
        console.warn('获取未读数失败，使用默认值:', error);
        updateNotificationBadge(0); // 使用默认值而不是显示错误
      });
}

async function rejectMaterial(materialId, reason) {
  showLoading();
  try {
    await apiRequest(API_ENDPOINTS.adminMaterialReject(materialId), {
      method: 'POST',
      body: { reason }
    });
    showToast('success', '资料已拒绝');
    loadMaterials(currentStatusFilter, currentPage.materials);
  } catch (error) {
    showToast('error', error.message || '拒绝资料失败');
  } finally {
    hideLoading();
  }
}

async function editPermission(id) {
  showLoading();
  try {
    const permissions = await apiRequest(`${API_BASE_URL}/api/admin/permissions`);
    const permission = permissions.find(p => p.id === id);

    if (!permission) {
      showToast('error', '权限不存在');
      return;
    }

    document.getElementById('permission-name').value = permission.name;
    document.getElementById('permission-description').value = permission.description;

    // 修改模态框标题和保存按钮
    document.querySelector('#permission-modal h3').innerHTML = '<i class="fas fa-edit"></i> 编辑权限';
    document.getElementById('save-permission-btn').onclick = () => updatePermission(id);

    document.getElementById('permission-modal').classList.add('active');
  } catch (error) {
    showToast('error', '加载权限信息失败');
  } finally {
    hideLoading();
  }
}

async function updatePermission(id) {
  const name = document.getElementById('permission-name').value;
  const description = document.getElementById('permission-description').value;

  if (!name || !description) {
    showToast('error', '请填写完整信息');
    return;
  }

  showLoading();
  try {
    await apiRequest(`${API_BASE_URL}/api/admin/permissions/${id}`, {
      method: 'PUT',
      body: { name, description }
    });

    showToast('success', '权限已更新');
    loadPermissions();
    document.getElementById('permission-modal').classList.remove('active');
    document.getElementById('permission-form').reset();

    // 恢复原始状态
    document.querySelector('#permission-modal h3').innerHTML = '<i class="fas fa-plus"></i> 添加权限';
    document.getElementById('save-permission-btn').onclick = null;
  } catch (err) {
    showToast('error', err.message);
  } finally {
    hideLoading();
  }
}

async function deletePermission(id) {
  if (!confirm('确定删除此权限？关联的用户权限也将被移除！')) {
    return;
  }

  showLoading();
  try {
    await apiRequest(`${API_BASE_URL}/api/admin/permissions/${id}`, {
      method: 'DELETE'
    });

    showToast('success', '权限已删除');
    loadPermissions();
  } catch (err) {
    showToast('error', err.message);
  } finally {
    hideLoading();
  }
}

// 表单提交
document.getElementById('save-user-btn')?.addEventListener('click', async () => {
  const form = document.getElementById('user-form');
  const formData = new FormData(form);

  const userId = document.getElementById('user-form-id').value;
  const url = userId
      ? `${API_BASE_URL}/api/admin/users/${userId}`
      : `${API_BASE_URL}/api/admin/users`;
  const method = userId ? 'PUT' : 'POST';

  // 直接获取表单元素的值
  const username = document.getElementById('user-form-username').value;
  const email = document.getElementById('user-form-email').value;
  const password = document.getElementById('user-form-password').value;
  const confirmPassword = document.getElementById('user-form-confirm-password').value;
  const secret = document.getElementById('user-form-secret').value;
  const role = document.getElementById('user-form-role').value;

  // 获取管理员等级（如果是管理员角色）
  const adminLevel = role === 'admin'
    ? parseInt(document.getElementById('admin-level-select').value)
    : null;

   const userLevel = role === 'user'
    ? parseInt(document.getElementById('user-level-input').value)
    : null;

  // 密码检查
  if (!userId && password !== confirmPassword) {
    showToast('error', '两次输入的密码不一致');
    return;
  }

  // 如果是添加用户且未填写暗号
  if (!userId && !secret) {
    showToast('error', '安全暗号不能为空');
    return;
  }

  // 修复：构建正确的数据对象
 const data = {
    username,
    email,
    role,
    adminLevel,
    userLevel, // 添加用户等级
    secret,
    ...(userId ? {} : { password })
  };

  showLoading();
   try {
      const response = await apiRequest(url, {
        method,
        body: data
      });

      // 处理纯文本响应
      let successMessage = '';
      if (typeof response === 'string') {
        successMessage = response;
      } else if (response && response.message) {
        successMessage = response.message;
      } else {
        successMessage = '操作成功';
      }

      showToast('success', successMessage);

      form.reset();
      document.getElementById('user-modal').classList.remove('active');
      loadUsers();
    } catch (error) {
      showToast('error', error.message);
    } finally {
      hideLoading();
    }
});

// 导出功能
document.getElementById('export-btn')?.addEventListener('click', () => {
  window.open(`${API_BASE_URL}/api/admin/registrations/export`, '_blank');
});

// 资料预览
window.viewMaterial = async id => {
    showLoading();
    try {
        const response = await apiRequest(API_ENDPOINTS.adminMaterialPreview(id));
        const previewContent = document.getElementById('preview-content');

        previewContent.innerHTML = ''; // 清空之前的内容

        // 添加文件信息
        const fileInfo = document.createElement('div');
        fileInfo.innerHTML = `
            <div style="margin-bottom: 15px; padding: 10px; background: #f8f9fa; border-radius: 5px;">
                <h4>文件信息</h4>
                <p><strong>名称:</strong> ${escapeHTML(response.material.name)}</p>
                <p><strong>原始文件名:</strong> ${escapeHTML(response.material.originalFilename || response.material.name)}</p>
                <p><strong>类型:</strong> ${escapeHTML(response.material.type)}</p>
                <p><strong>大小:</strong> ${formatFileSize(response.material.fileSize)}</p>
                <p><strong>上传时间:</strong> ${new Date(response.material.uploadTime).toLocaleString()}</p>
            </div>
        `;

        previewContent.appendChild(fileInfo);

        if (response.contentType === 'text') {
            // 文本文件预览
            const pre = document.createElement('pre');
            pre.style.cssText = 'padding: 20px; background: #f8f9fa; border-radius: 5px; overflow: auto;';
            pre.textContent = response.content;
            previewContent.appendChild(pre);
        } else if (response.contentType === 'image') {
            // 图片预览
            const img = document.createElement('img');
            img.src = response.previewUrl;
            img.style.maxWidth = '100%';
            img.style.maxHeight = '500px';
            previewContent.appendChild(img);
        } else if (response.contentType === 'pdf') {
            // PDF预览
            const iframe = document.createElement('iframe');
            iframe.src = response.previewUrl;
            iframe.style.width = '100%';
            iframe.style.height = '600px';
            iframe.style.border = 'none';
            previewContent.appendChild(iframe);
        } else if (response.contentType === 'unsupported') {
            // 不支持预览的文件类型
            previewContent.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-file"></i>
                    <p>${response.message || '不支持预览此类型文件'}</p>
                    <a href="${API_BASE_URL}/api/admin/materials/${id}/download"
                       class="btn btn-primary" download>
                        <i class="fas fa-download"></i> 下载文件
                    </a>
                </div>
            `;
        } else {
            // 错误情况
            previewContent.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>${response.content || '加载预览失败'}</p>
                </div>
            `;
        }
        document.getElementById('preview-modal').classList.add('active');
    } catch (error) {
        console.error('预览失败:', error);
        showToast('error', '加载资料预览失败');
    } finally {
        hideLoading();
    }
};

// 加载管理员用户列表
async function loadAdminUsers() {
    try {
        const response = await apiRequest(API_ENDPOINTS.adminTaskAssignees);
        let adminUsersData = [];

        // 处理不同的响应格式
        if (response && response.success && Array.isArray(response.data)) {
            adminUsersData = response.data;
        } else if (Array.isArray(response)) {
            adminUsersData = response;
        } else {
            console.warn('无法解析的管理员列表响应格式:', response);
            adminUsersData = [];
        }

        adminUsers = adminUsersData;

        const assigneeSelect = document.getElementById('task-assignee');
        if (assigneeSelect) {
            // 清空现有选项
            assigneeSelect.innerHTML = '<option value="">选择负责人</option>';

            // 添加管理员选项
            adminUsers.forEach(user => {
                const option = document.createElement('option');
                option.value = user.id;
                option.textContent = `${user.username} (${getAdminLevelText(user.adminLevel)})`;
                assigneeSelect.appendChild(option);
            });

            console.log("管理员列表加载完成:", adminUsers); // 调试用
        }
    } catch (error) {
        console.error('加载管理员列表失败:', error);
        // 显示错误状态
        const assigneeSelect = document.getElementById('task-assignee');
        if (assigneeSelect) {
            assigneeSelect.innerHTML = '<option value="" disabled>加载管理员列表失败</option>';
        }
    }
}

// 填充负责人下拉框
function populateAssigneeDropdown(users) {
    const assigneeSelect = document.getElementById('task-assignee');
    assigneeSelect.innerHTML = '<option value="">选择负责人</option>';

    users.forEach(user => {
        const option = document.createElement('option');
        option.value = user.id;
        option.textContent = `${user.username} (${getAdminLevelText(user.adminLevel)})`;
        assigneeSelect.appendChild(option);
    });
}

// 打开资料选择模态框
function openMaterialSelectModal() {
    document.getElementById('material-select-modal').classList.add('active');
    loadMaterialsForSelect(1);
}

// 加载资料选择列表
async function loadMaterialsForSelect(page = 1, keyword = '') {
    try {
        const params = new URLSearchParams({
            page,
            size: 10,
            status: 1, // 只显示已审核的
            ...(keyword && { keyword })
        });

        const data = await apiRequest(`${API_ENDPOINTS.materials}?${params}`);
        renderMaterialSelectTable(data.items || []);
        renderPagination('material-select-pagination', data.total || 0, 10, page, (p) => loadMaterialsForSelect(p, keyword));
    } catch (error) {
        console.error('加载资料列表失败:', error);
        showToast('error', '加载资料列表失败');
    }
}

// 渲染资料选择表格
function renderMaterialSelectTable(materials) {
    const tbody = document.querySelector('#material-select-table tbody');
    if (!materials || materials.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty-state">暂无资料</td></tr>';
        return;
    }

    tbody.innerHTML = materials.map(material => `
        <tr>
            <td>
                <input type="radio" name="selected-material" value="${material.id}"
                    data-url="${material.url}" data-name="${escapeHTML(material.name)}">
            </td>
            <td>${material.id}</td>
            <td>${escapeHTML(material.name)}</td>
            <td>${escapeHTML(material.type || '未知')}</td>
            <td>${material.uploadTime ? new Date(material.uploadTime).toLocaleDateString() : '未知'}</td>
        </tr>
    `).join('');
}

// 确认选择资料
function confirmMaterialSelection() {
    const selected = document.querySelector('input[name="selected-material"]:checked');
    if (!selected) {
        showToast('error', '请选择一份资料');
        return;
    }

    selectedMaterial = {
        id: selected.value,
        url: selected.dataset.url,
        name: selected.dataset.name
    };

    // 更新UI显示已选资料
    document.getElementById('selected-material-name').textContent = selectedMaterial.name;
    document.getElementById('selected-material-info').style.display = 'block';

    // 关闭模态框
    document.getElementById('material-select-modal').classList.remove('active');
}

// 移除已选资料
function removeSelectedMaterial() {
    selectedMaterial = null;
    document.getElementById('selected-material-info').style.display = 'none';
}


async function markNotificationRead(id) {
  try {
    await apiRequest(API_ENDPOINTS.markNotificationRead(id), { method: 'POST' });
    const item = document.querySelector(`.notification-item[data-id="${id}"]`);
    if (item) {
      item.classList.remove('unread');
      item.classList.add('read');
      item.querySelector('.mark-read')?.remove();
      refreshNotificationBadge();
    }
  } catch (error) {
    showToast('error', '标记已读失败');
  }
}

// 添加审计日志加载函数
async function loadAuditLogs(page = 1) {
  showSkeleton('audit-log-skeleton');
  currentPage.activities = page;
  try {
    const start = document.getElementById('audit-start-date')?.value;
    const end   = document.getElementById('audit-end-date')?.value;
    const params = new URLSearchParams({
      page, size: 10,
      ...(start && { start }),
      ...(end   && { end })
    });
    /* 关键修正：使用 /api/admin/activity/activity-logs */
    const data = await apiRequest(`${API_BASE_URL}/api/admin/activity/activity-logs?${params}`);
    renderAuditLogs(data.items || []);
    renderPagination('audit-log-pagination', data.total || 0, 10, page, p => loadAuditLogs(p));
    hideSkeleton('audit-log-skeleton');
  } catch (error) {
    hideSkeleton('audit-log-skeleton');
    showToast('error', '加载审计日志失败');
  }
}

// 添加审计日志渲染函数
function renderAuditLogs(logs) {
  const container = document.getElementById('audit-log-container');
  if (!Array.isArray(logs) || logs.length === 0) {
    container.innerHTML = '<div class="empty-state"><i class="fas fa-inbox"></i><p>暂无操作历史</p></div>';
    return;
  }

  container.innerHTML = logs.map(log => `
    <div class="activity-item">
      <div class="activity-icon ${log.actionType.toLowerCase()}">
        <i class="fas fa-${getActivityIcon(log.actionType)}"></i>
      </div>
      <div class="activity-content">
        <div class="activity-title">${escapeHTML(log.description)}</div>
        <div class="activity-details">
          <span>操作人: ${escapeHTML(log.operator || '系统')}</span>
          <span>时间: ${new Date(log.actionTime).toLocaleString()}</span>
        </div>
      </div>
      <div class="activity-actions">
        <button class="btn btn-sm btn-danger btn-delete-activity" data-id="${log.id}">
          <i class="fas fa-trash"></i> 删除
        </button>
      </div>
    </div>
  `).join('');
}

document.getElementById('notification-icon').addEventListener('click', () => {
  const panel = document.getElementById('notification-panel');
  panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
  if (panel.style.display === 'block') loadNotifications();
});

document.getElementById('mark-read-btn').addEventListener('click', () => {
  apiRequest(`${API_BASE_URL}/api/notifications/today/read-all`, { method: 'POST' })
    .then(() => {
      document.getElementById('notification-list').innerHTML = '<li>暂无新消息</li>';
      refreshNotificationBadge(); // 刷新徽章状态
    });
});

// admin.js - 添加会话管理中间件
function setupSessionMiddleware() {
  // 定期检查会话状态
  setInterval(() => {
    if (!validateAdminSession()) {
      redirectToLogin();
    }
  }, 60000); // 每分钟检查一次

  // 在页面可见性变化时检查会话
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && !validateAdminSession()) {
      redirectToLogin();
    }
  });
}

// 页面切换
document.addEventListener('DOMContentLoaded', () => {
  // 首先验证会话
  if (!validateAdminSession()) {
    redirectToLogin();
    return;
  }

  // 检查会话是否已过期
  const adminSession = JSON.parse(localStorage.getItem('adminSession'));
  if (isSessionExpired(adminSession)) {
    localStorage.removeItem('adminSession');
    redirectToLogin();
    return;
  }

  // 会话管理中间件
  const sessionMiddleware = setInterval(() => {
    const adminSession = JSON.parse(localStorage.getItem('adminSession'));
    if (!adminSession || !adminSession.username) {
      clearInterval(sessionMiddleware);
      redirectToLogin();
    }
  }, 60000); // 每分钟检查一次会话

  // 设置会话中间件
  setupSessionMiddleware();

  // 导航切换
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = e.currentTarget.dataset.target;

      // 确保目标页面存在
      const targetPage = document.getElementById(target);
      if (!targetPage) {
        console.error(`Target page not found: ${target}`);
        return;
      }

      // 更新导航状态
      document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
      e.currentTarget.classList.add('active');

      // 切换页面
      document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
      targetPage.classList.add('active');

      // 加载对应页面数据
      loadPageData(target);
    });
  });

  // 模态框控制
  const modals = document.querySelectorAll('.modal');
  const openModal = (id) => document.getElementById(id).classList.add('active');
  const closeModal = () => modals.forEach(m => m.classList.remove('active'));

  // ✅ 修复：添加用户按钮功能 - 确保正确打开模态框
  document.getElementById('add-user-btn')?.addEventListener('click', () => {
    document.getElementById('user-modal-title').textContent = '用户信息登记';
    document.getElementById('password-fields').style.display = 'flex';

    // 重置表单
    const form = document.getElementById('user-form');
    form.reset();
    document.getElementById('user-form-id').value = '';

    document.getElementById('user-modal').classList.add('active');
  });

  document.getElementById('add-permission-btn')?.addEventListener('click', () => {
    openModal('permission-modal');
  });

  // 修改关闭按钮事件处理
  document.querySelectorAll('.modal-close').forEach(btn => {
      btn.addEventListener('click', function() {
          // 关闭最近的模态框
          const modal = this.closest('.modal');
          if (modal) {
              modal.classList.remove('active');
          }
      });
  });

  // 修改取消按钮事件处理
  document.querySelectorAll('.btn-outline-secondary.modal-close').forEach(btn => {
      btn.addEventListener('click', function() {
          // 关闭最近的模态框
          const modal = this.closest('.modal');
          if (modal) {
              modal.classList.remove('active');
          }
      });
  });

  // 点击弹窗外部关闭
  document.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal')) {
          e.target.classList.remove('active');
      }
  });

  // 日期筛选
  document.getElementById('date-range-select')?.addEventListener('change', () => loadDashboard());
  document.getElementById('filter-history')?.addEventListener('click', () => {
    const start = document.getElementById('history-start-date').value;
    const end = document.getElementById('history-end-date').value;
    loadActivityHistory(start, end);
  });

  // 状态选择变化
  document.getElementById('status-select')?.addEventListener('change', function() {
    if (this.value === 'inactive') {
      document.getElementById('reason-field').style.display = 'block';
    } else {
      document.getElementById('reason-field').style.display = 'none';
    }
  });

  // 添加权限等级点击事件（全局委托）
  document.addEventListener('click', (e) => {
    if (e.target.id === 'admin-level') {
      const adminSession = JSON.parse(localStorage.getItem('adminSession'));
      if (adminSession) {
        showAdminPermissionDetail(adminSession.adminLevel);
      }
    }
  });

  // 添加审计日志筛选
    document.getElementById('filter-audit')?.addEventListener('click', () => {
      loadAuditLogs(1);
    });

  // 添加卡片悬停效果
  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-8px)';
      card.style.boxShadow = '0 20px 40px -10px rgba(76, 110, 245, 0.3)';
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(0)';
      card.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
    });
  });

  // 添加表格行悬停效果
  document.querySelectorAll('#users-table tbody tr').forEach(row => {
    row.addEventListener('mouseenter', () => {
      row.style.backgroundColor = '#f1f5ff';
      row.style.boxShadow = '0 5px 15px -5px rgba(76, 110, 245, 0.2)';
    });

    row.addEventListener('mouseleave', () => {
      row.style.backgroundColor = '';
      row.style.boxShadow = '';
    });
  });

  // 添加按钮光效
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('mouseenter', () => {
      btn.style.boxShadow = '0 8px 20px rgba(76, 110, 245, 0.3)';
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.boxShadow = '';
    });

    // 添加点击效果
    btn.addEventListener('click', function() {
      this.style.transform = 'translateY(1px)';
      setTimeout(() => {
        this.style.transform = '';
      }, 150);
    });
  });

  // 新增：按钮点击动画效果
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('mousedown', () => {
      btn.style.transform = 'translateY(2px)';
    });

    btn.addEventListener('mouseup', () => {
      btn.style.transform = 'translateY(0)';
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translateY(0)';
    });
  });

  // 新增：模态框关闭按钮悬停效果
  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('mouseenter', () => {
      btn.style.transform = 'rotate(90deg)';
      btn.style.backgroundColor = '#f1f5f9';
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'rotate(0)';
      btn.style.backgroundColor = '';
    });
  });

  // 新增：表格行点击效果
  document.querySelectorAll('tbody tr').forEach(row => {
    row.addEventListener('click', (e) => {
      if (!e.target.closest('button')) {
        row.classList.toggle('selected');
      }
    });
  });

  // ==== 修复：退出按钮确认 ====
  const adminLogoutButton = document.getElementById('admin-logout');
  if (adminLogoutButton) {
    adminLogoutButton.addEventListener('click', (e) => {
      if (!confirm('确定要退出系统吗？')) {
        e.preventDefault();
      }
    });
  }

  // 添加公告按钮
  document.getElementById('add-announcement-btn')?.addEventListener('click', () => {
    document.getElementById('announcement-modal-title').textContent = '添加公告';
    document.getElementById('announcement-id').value = '';
    document.getElementById('announcement-title').value = '';
    document.getElementById('announcement-content').value = '';
    document.getElementById('announcement-modal').classList.add('active');
  });

    // 添加资料选择模态框关闭事件
    document.querySelector('[data-dismiss="material-select-modal"]')?.addEventListener('click', () => {
        document.getElementById('material-select-modal').classList.remove('active');
    });

  // 保存公告
  document.getElementById('save-announcement-btn')?.addEventListener('click', saveAnnouncement);

  // 初始化
  checkAdminSession();
  
  // 确保DOM完全加载后再执行
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      loadDashboard();
      setupSearch();
      setupMaterialTabs();
      setupPagination();
      refreshNotificationBadge();
      setupNotificationWebSocket(); // ✅ 新增WebSocket
      setupEventDelegation(); // ✅ 新增事件委托
      setupMaterialFilter();
      // 资料管理搜索初始化
      setupMaterialManagementSearch();
      setupFileUpload();
      setupMaterialManagementFilter();
      setupNavGroups();
    });
  } else {
    loadDashboard();
    setupSearch();
    setupMaterialTabs();
    setupPagination();
    refreshNotificationBadge();
    setupNotificationWebSocket(); // ✅ 新增WebSocket
    setupEventDelegation(); // ✅ 新增事件委托
    setupMaterialFilter();
    // 资料管理搜索初始化
    setupMaterialManagementSearch();
    setupFileUpload();
    setupMaterialManagementFilter();
    setupNavGroups();
  }
});

// 打开权限分配弹窗
async function openPermissionAssignModal(userId, username) {
  try {
    const [permissions, userPermissions] = await Promise.all([
      apiRequest(`${API_BASE_URL}/api/admin/permissions`),
      apiRequest(`${API_BASE_URL}/api/admin/permissions/user/${userId}`)
    ]);

    document.getElementById('assign-username').textContent = escapeHTML(username);
    const container = document.getElementById('permission-list-container');
    container.innerHTML = permissions.map(p => `
      <div class="permission-card">
        <label style="display: flex; align-items: center;">
          <input class="permission-checkbox" type="checkbox" value="${p.id}"
            ${userPermissions.some(up => up.id === p.id) ? 'checked' : ''}>
          <span style="margin-left: 8px; font-weight: 600;">${escapeHTML(p.name)}</span>
        </label>
        <div class="permission-description">${escapeHTML(p.description)}</div>
      </div>
    `).join('');

    document.getElementById('assign-permission-modal').classList.add('active');
    document.getElementById('save-assign-btn').onclick = () => saveUserPermissions(userId);
  } catch (error) {
    showToast('error', '加载权限失败');
  }
}

// 保存用户权限
async function saveUserPermissions(userId) {
  const checkboxes = document.querySelectorAll('#permission-list-container input[type="checkbox"]:checked');
  const permissionIds = Array.from(checkboxes).map(cb => parseInt(cb.value));

  try {
    // 先清空旧权限
    await apiRequest(`${API_BASE_URL}/api/admin/users/${userId}/permissions`, { method: 'DELETE' });

    // 再批量添加新权限
    for (const pid of permissionIds) {
      await apiRequest(`${API_BASE_URL}/api/admin/permissions/assign?userId=${userId}&permissionId=${pid}`, { method: 'POST' });
    }

    showToast('success', '权限已更新');
    document.getElementById('assign-permission-modal').classList.remove('active');
  } catch (error) {
    showToast('error', '保存权限失败');
  }
}

// ✅ 新增：renderPagination 函数
function renderPagination(containerId, total, pageSize, currentPage, onPageChange) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const totalPages = Math.ceil(total / pageSize) || 1;
  if (totalPages <= 1) {
    container.innerHTML = '';
    return;
  }

  const pageInfoId = containerId.replace('-pagination', '-page-info');
  container.innerHTML = `
    <button ${currentPage === 1 ? 'disabled' : ''} data-page="${currentPage - 1}">
      <i class="fas fa-chevron-left"></i>
    </button>
    <span id="${pageInfoId}">${currentPage} / ${totalPages}</span>
    <button ${currentPage === totalPages ? 'disabled' : ''} data-page="${currentPage + 1}">
      <i class="fas fa-chevron-right"></i>
    </button>
  `;

  container.onclick = (e) => {
    const page = parseInt(e.target.dataset.page);
    if (!isNaN(page) && page !== currentPage) {
      onPageChange(page);
    }
  };
}

// 添加退出功能
document.getElementById('admin-logout')?.addEventListener('click', async (e) => {
  e.preventDefault();

  // 关闭WebSocket连接
  if (notificationSocket) {
    notificationSocket.close();
    notificationSocket = null;
  }

  // 清除心跳检测
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }

  try {
    await apiRequest(API_ENDPOINTS.adminLogout, {
      method: 'POST',
      credentials: 'include'
    });
  } catch (error) {
    console.log('退出请求失败，继续清理本地会话');
  }

  // 清除本地存储
  localStorage.removeItem('adminSession');

  showToast('success', '您已安全退出');
  setTimeout(() => {
    location.href = '../login/login.html';
  }, 1500);
});

// 检查会话是否过期
function isSessionExpired(session) {
  if (!session || !session.timestamp) return true;

  // 检查会话是否超过1分钟 (60,000毫秒)
  const currentTime = Date.now();
  return (currentTime - session.timestamp) > 60000;
}

// 报告审核API
async function approveReport(id) {
  showLoading();
  try {
    await apiRequest(`${API_BASE_URL}/api/admin/home-info/reports/${id}/review?status=1`, { method: 'PUT' });
    showToast('success', '报告已通过审核');
    loadReports(currentStatusFilter, currentPage.reports);
  } finally { hideLoading(); }
  refreshNotificationBadge();
}

async function rejectReport(id, reason) {
  showLoading();
  try {
    await apiRequest(`${API_BASE_URL}/api/admin/home-info/reports/${id}/review`, {
      method: 'PUT',
      body: { status: 2, comment: reason }
    });
    showToast('success', '报告已拒绝');
    loadReports(currentStatusFilter, currentPage.reports);
  } finally { hideLoading(); }
}

// 会议审核API
async function approveMeeting(id) {
  showLoading();
  try {
    await apiRequest(`${API_BASE_URL}/api/admin/home-info/meetings/${id}/review?status=1`, { method: 'PUT' });
    showToast('success', '会议已通过审核');
    loadMeetings(currentStatusFilter, currentPage.meetings);
  } finally { hideLoading(); }
  refreshNotificationBadge();
}

async function rejectMeeting(id, reason) {
  showLoading();
  try {
    await apiRequest(`${API_BASE_URL}/api/admin/home-info/meetings/${id}/review`, {
      method: 'PUT',
      body: { status: 2, comment: reason }
    });
    showToast('success', '会议已拒绝');
    loadMeetings(currentStatusFilter, currentPage.meetings);
  } finally { hideLoading(); }
}

// 公告管理API
async function loadAnnouncementForEdit(id) {
  showLoading();
  try {
    const announcement = await apiRequest(`${API_BASE_URL}/api/admin/home-info/announcements/${id}`);
    document.getElementById('announcement-modal-title').textContent = '编辑公告';
    document.getElementById('announcement-id').value = announcement.id;
    document.getElementById('announcement-title').value = announcement.title;
    document.getElementById('announcement-publisher').value = announcement.publisher; // 设置发布人
    document.getElementById('announcement-content').value = announcement.content;
    document.getElementById('announcement-modal').classList.add('active');
  } catch (error) {
    showToast('error', '加载公告信息失败');
  } finally {
    hideLoading();
  }
}

async function saveAnnouncement() {
  const id = document.getElementById('announcement-id').value;
  const title = document.getElementById('announcement-title').value;
  const publisher = document.getElementById('announcement-publisher').value; // 获取发布人
  const content = document.getElementById('announcement-content').value;

  if (!title || !publisher || !content) {
    showToast('error', '请填写完整信息');
    return;
  }

  showLoading();
  try {
    const method = id ? 'PUT' : 'POST';
    const url = id ?
      `${API_BASE_URL}/api/admin/home-info/announcements/${id}` :
      `${API_BASE_URL}/api/admin/home-info/announcements`;

    const data = { title, publisher, content, status: 1, important: 0 };

    await apiRequest(url, {
      method,
      body: data
    });

    showToast('success', id ? '公告已更新' : '公告已创建');
    document.getElementById('announcement-modal').classList.remove('active');
    loadAnnouncements(currentPage.announcements);
  } catch (error) {
    showToast('error', error.message || '保存公告失败');
  } finally {
    hideLoading();
  }
}

async function deleteAnnouncement(id) {
  if (!confirm('确定删除此公告？此操作不可恢复！')) {
    return;
  }

  showLoading();
  try {
    await apiRequest(`${API_BASE_URL}/api/admin/home-info/announcements/${id}`, {
      method: 'DELETE'
    });
    showToast('success', '公告已删除');
    loadAnnouncements(currentPage.announcements);
  } catch (error) {
    showToast('error', error.message || '删除公告失败');
  } finally {
    hideLoading();
  }
}

// 角色选择变化时显示/隐藏管理员等级字段
document.getElementById('user-form-role').addEventListener('change', function() {
  const levelField = document.getElementById('admin-level-field');
  levelField.style.display = this.value === 'admin' ? 'block' : 'none';
});

// 设置筛选按钮事件
function setupMaterialFilter() {
  // 打开筛选模态框
  document.getElementById('material-filter-btn')?.addEventListener('click', () => {
    document.getElementById('material-filter-modal').classList.add('active');
  });

  // 应用筛选
  document.getElementById('apply-filter-btn')?.addEventListener('click', () => {
    currentMaterialFilter.category = document.getElementById('material-category').value;
    currentMaterialFilter.type = document.getElementById('material-type').value;
    loadMaterials(currentStatusFilter, currentPage.materials);
    document.getElementById('material-filter-modal').classList.remove('active');
  });

  // 重置筛选
  document.getElementById('reset-filter-btn')?.addEventListener('click', () => {
    document.getElementById('material-category').value = '';
    document.getElementById('material-type').value = '';
    currentMaterialFilter.category = '';
    currentMaterialFilter.type = '';
    loadMaterials(currentStatusFilter, currentPage.materials);
    document.getElementById('material-filter-modal').classList.remove('active');
  });
}

// 修改 uploadMaterial 函数，使用直接的fetch调用
async function uploadMaterial() {
    const name = document.getElementById('material-name').value.trim();
    const category = document.getElementById('material-category-add').value;
    const type = document.getElementById('material-type-add').value;
    const description = document.getElementById('material-description').value.trim();
    const fileInput = document.getElementById('material-file');
    const file = fileInput.files[0];
    const tags = document.getElementById('material-tags').value;
    const version = document.getElementById('material-version').value;
    const language = document.getElementById('material-language').value;
    const adminSession = JSON.parse(localStorage.getItem('adminSession'));

    // 验证必填字段
    if (!name) {
        showToast('error', '请输入资料名称');
        return;
    }
    if (!category) {
        showToast('error', '请选择资料类别');
        return;
    }
    if (!type) {
        showToast('error', '请选择资料格式');
        return;
    }
    if (!file) {
        showToast('error', '请选择要上传的文件');
        return;
    }

    // 验证文件大小（10MB限制）
    if (file.size > 10 * 1024 * 1024) {
        showToast('error', '文件大小不能超过10MB');
        return;
    }

    // 初始化 FormData
    const formData = new FormData();
    formData.append('name', name);
    formData.append('category', category);
    formData.append('type', type);
    // 添加uploaderName
    if (adminSession && adminSession.username) {
        formData.append('uploaderName', adminSession.username);
    }
    if (description) formData.append('description', description);
    formData.append('file', file);

    // 添加可选字段
    if (tags) formData.append('tags', tags);
    if (version) formData.append('version', version);
    if (language) formData.append('language', language);

    showLoading();
    try {
        // 直接使用fetch调用，避免apiRequest的Content-Type设置问题
        const response = await fetch(`${API_BASE_URL}/api/admin/materials/upload`, {
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
            if (typeof responseData === 'string') {
                showToast('success', responseData);
            } else if (responseData && responseData.message) {
                showToast('success', responseData.message);
            } else {
                showToast('success', '资料上传成功');
            }

            document.getElementById('add-material-modal').classList.remove('active');
            resetMaterialForm();
            loadMaterialManagement(currentMaterialManagementFilter.status);
        } else {
            // 处理401错误
            if (response.status === 401) {
                showToast('error', '会话已过期，请重新登录');
                // 清除本地存储
                localStorage.removeItem('adminSession');
                localStorage.removeItem('userSession');
                // 跳转到登录页
                setTimeout(() => {
                    location.href = '../login/login.html';
                }, 1500);
                return;
            }
            throw new Error(responseData.message || '上传失败');
        }
    } catch (error) {
        console.error('上传错误:', error);
        // 处理特定的认证错误
        if (error.message.includes('authentication') || error.message.includes('登录')) {
            showToast('error', '会话已过期，请重新登录');
            setTimeout(() => {
                location.href = '../login/login.html';
            }, 1500);
        } else {
            showToast('error', error.message || '上传失败，请检查网络连接');
        }
    } finally {
        hideLoading();
    }
}

// 重置资料表单
function resetMaterialForm() {
    document.getElementById('add-material-form').reset();
    resetFileInput();
}

// 重置文件输入
function resetFileInput() {
    document.getElementById('material-file').value = '';
    document.getElementById('file-preview').style.display = 'none';
    document.getElementById('file-upload-area').style.display = 'block';
}

// 文件上传区域交互
function setupFileUpload() {
    const fileInput = document.getElementById('material-file');
    const fileUploadArea = document.getElementById('file-upload-area');
    const filePreview = document.getElementById('file-preview');
    const fileName = document.querySelector('.file-name');
    const fileSize = document.querySelector('.file-size');

    // 点击上传区域触发文件选择
    fileUploadArea.addEventListener('click', () => {
        fileInput.click();
    });

    // 拖放功能
    fileUploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        fileUploadArea.classList.add('dragover');
    });

    fileUploadArea.addEventListener('dragleave', () => {
        fileUploadArea.classList.remove('dragover');
    });

    fileUploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        fileUploadArea.classList.remove('dragover');

        if (e.dataTransfer.files.length) {
            fileInput.files = e.dataTransfer.files;
            handleFileSelection();
        }
    });

    // 文件选择变化
    fileInput.addEventListener('change', handleFileSelection);

    function handleFileSelection() {
        if (fileInput.files.length) {
            const file = fileInput.files[0];
            const fileSizeFormatted = formatFileSize(file.size);

            fileName.textContent = file.name;
            fileSize.textContent = fileSizeFormatted;

            fileUploadArea.style.display = 'none';
            filePreview.style.display = 'block';
        }
    }
}

// 格式化文件大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}


// 加载资料管理数据
async function loadMaterialManagement(status = 'approved', page = 1) {
    showSkeleton('material-management-skeleton');
    currentPage.materialManagement = page;

    const statusMap = { all: null, pending: 0, approved: 1, rejected: 2 };
    const statusCode = statusMap[status] !== undefined ? statusMap[status] : 1;

    try {
        const params = new URLSearchParams({
            page,
            size: 10,
            ...(statusCode !== null && { status: statusCode }),
            ...(currentMaterialManagementFilter.category && { category: currentMaterialManagementFilter.category }),
            ...(currentMaterialManagementFilter.type && { type: currentMaterialManagementFilter.type })
        });

        const data = await apiRequest(`${API_ENDPOINTS.materials}?${params}`);
        renderMaterialManagementTable(data.items || []);
        renderPagination('material-management-pagination', data.total || 0, 10, page, p => loadMaterialManagement(status, p));
        hideSkeleton('material-management-skeleton');
    } catch (error) {
        console.error('加载资料管理数据失败:', error);
        hideSkeleton('material-management-skeleton');
        showToast('error', '加载资料数据失败');
    }
}

// 删除资料功能
async function deleteMaterialManagement(materialId) {
  if (!confirm('确定删除此资料？此操作不可恢复！')) {
    return;
  }

  showLoading();
  try {
    await apiRequest(`${API_BASE_URL}/api/admin/materials/${materialId}`, {
      method: 'DELETE'
    });
    showToast('success', '资料已删除');
    loadMaterialManagement(currentMaterialManagementFilter.status, currentPage.materialManagement);
  } catch (error) {
    showToast('error', error.message || '删除资料失败');
  } finally {
    hideLoading();
  }
}

// 设置资料管理筛选功能
function setupMaterialManagementFilter() {
    // 打开筛选模态框
    document.getElementById('material-management-filter-btn')?.addEventListener('click', () => {
        document.getElementById('material-management-filter-modal').classList.add('active');
    });

    // 应用筛选
    document.getElementById('material-management-apply-filter-btn')?.addEventListener('click', () => {
        currentMaterialManagementFilter.category = document.getElementById('material-management-category').value;
        currentMaterialManagementFilter.type = document.getElementById('material-management-type').value;
        currentMaterialManagementFilter.status = document.getElementById('material-management-status').value;

        loadMaterialManagement(currentMaterialManagementFilter.status, 1);
        document.getElementById('material-management-filter-modal').classList.remove('active');
    });

    // 重置筛选
    document.getElementById('material-management-reset-filter-btn')?.addEventListener('click', () => {
        document.getElementById('material-management-category').value = '';
        document.getElementById('material-management-type').value = '';
        document.getElementById('material-management-status').value = 'approved';

        currentMaterialManagementFilter.category = '';
        currentMaterialManagementFilter.type = '';
        currentMaterialManagementFilter.status = 'approved';

        loadMaterialManagement('approved', 1);
        document.getElementById('material-management-filter-modal').classList.remove('active');
    });
}

// 保存任务
async function saveTask() {
  const id = document.getElementById('task-id').value;
  const title = document.getElementById('task-title').value.trim();
  const description = document.getElementById('task-description').value.trim();
  const assigneeId = document.getElementById('task-assignee').value;
  const priority = document.getElementById('task-priority').value;

  if (!title || !assigneeId || !priority) {
    showToast('error', '请填写必填字段');
    return;
  }

  showLoading();
  try {
    const url = id ? `${API_BASE_URL}/api/admin/tasks/${id}` : `${API_BASE_URL}/api/admin/tasks`;
    const method = id ? 'PUT' : 'POST';

    let body;
    let headers = {};

    if (id) {
      // 编辑任务 - 使用JSON
      body = JSON.stringify({
        title,
        description,
        assigneeId: parseInt(assigneeId),
        priority: parseInt(priority)
      });
      headers['Content-Type'] = 'application/json';
    } else {
      // 创建任务 - 使用FormData
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('assigneeId', assigneeId);
      formData.append('priority', priority);

      const attachmentFile = document.getElementById('task-attachment').files[0];
      if (selectedMaterial) {
        formData.append('materialId', selectedMaterial.id);
      } else if (attachmentFile) {
        formData.append('attachment', attachmentFile);
      }

      body = formData;
    }

    const result = await apiRequest(url, {
      method,
      body,
      headers: Object.keys(headers).length > 0 ? headers : undefined
    });

    // 处理不同的响应格式
    let success = false;
    let message = '';

    if (result && typeof result === 'object') {
      if ('success' in result) {
        success = result.success;
        message = result.message;
      } else if ('id' in result) {
        success = true;
        message = id ? '任务更新成功' : '任务创建成功';
      }
    } else if (typeof result === 'string' && result.includes('成功')) {
      success = true;
      message = result;
    }

    if (success) {
      showToast('success', message);
      document.getElementById('task-modal').classList.remove('active');
      resetTaskForm();
      loadTasks();
    } else {
      showToast('error', message || '保存任务失败');
    }
  } catch (error) {
    console.error('保存任务失败:', error);
    showToast('error', error.message || '保存任务失败');
  } finally {
    hideLoading();
  }
}

// 重置任务表单
function resetTaskForm() {
  document.getElementById('task-form').reset();
  selectedMaterial = null;
  document.getElementById('selected-material-info').style.display = 'none';
}

// 打开任务模态框
function openTaskModal(isEdit = false, taskId = null) {
  loadAdminUsers().then(() => {
    document.getElementById('task-modal-title').textContent = isEdit ? '编辑任务' : '添加任务';

    // 重置表单
    document.getElementById('task-id').value = taskId || '';
    document.getElementById('task-form').reset();
    selectedMaterial = null;
    document.getElementById('selected-material-info').style.display = 'none';

    if (isEdit && taskId) {
      loadTaskForEdit(taskId);
    } else {
      // 设置默认值
      document.getElementById('task-priority').value = '2';
      document.getElementById('task-modal').classList.add('active');
    }
  });
}

// 加载任务数据用于编辑
async function loadTaskForEdit(taskId) {
  showLoading();
  try {
    const task = await apiRequest(API_ENDPOINTS.adminTaskDetail(taskId));

    document.getElementById('task-id').value = task.id;
    document.getElementById('task-title').value = task.title || '';
    document.getElementById('task-description').value = task.description || '';
    document.getElementById('task-priority').value = task.priority || '2';

    // 设置负责人选项 - 确保在加载管理员列表后设置选中值
    await loadAdminUsers();
    // 添加延迟确保下拉框已渲染
    setTimeout(() => {
      const taskAssignee = document.getElementById('task-assignee');
      if (taskAssignee && task.assigneeId) {
        taskAssignee.value = task.assigneeId.toString();
      }
    }, 100);

    // 处理附件信息
    if (task.materialId) {
      try {
        const material = await apiRequest(`${API_BASE_URL}/api/admin/materials/${task.materialId}`);
        selectedMaterial = {
          id: task.materialId,
          name: material.name,
          url: material.path
        };
        document.getElementById('selected-material-name').textContent = selectedMaterial.name;
        document.getElementById('selected-material-info').style.display = 'block';
      } catch (error) {
        console.error('加载附件信息失败:', error);
        // 即使失败也显示基本信息
        document.getElementById('selected-material-name').textContent = `资料ID: ${task.materialId}`;
        document.getElementById('selected-material-info').style.display = 'block';
      }
    } else if (task.attachmentUrl) {
      // 处理直接上传的附件
      const fileName = task.attachmentUrl.split('/').pop();
      selectedMaterial = {
        id: null,
        name: fileName,
        url: task.attachmentUrl
      };
      document.getElementById('selected-material-name').textContent = fileName;
      document.getElementById('selected-material-info').style.display = 'block';
    } else {
      document.getElementById('selected-material-info').style.display = 'none';
    }

    document.getElementById('task-modal').classList.add('active');
  } catch (error) {
    console.error('加载任务数据失败:', error);
    showToast('error', '加载任务数据失败');
  } finally {
    hideLoading();
  }
}

// 修复编辑按钮事件绑定
document.addEventListener('click', function(e) {
    // 编辑任务按钮
    if (e.target.closest('.btn-edit-task')) {
        const taskId = e.target.closest('.btn-edit-task').dataset.id;
        openEditTaskModal(taskId);
    }
});

async function deleteTask(taskId) {
  if (!confirm('确定删除此任务？此操作不可恢复！')) {
    return;
  }

  showLoading();
  try {
    await apiRequest(`${API_BASE_URL}/api/admin/tasks/${taskId}`, {
      method: 'DELETE'
    });

    showToast('success', '任务已删除');
    loadTasks(); // 重新加载任务列表
  } catch (error) {
    showToast('error', error.message || '删除任务失败');
  } finally {
    hideLoading();
  }
}

// 修改打开编辑任务模态框函数
async function openEditTaskModal(taskId) {
  showLoading();
  try {
    const task = await apiRequest(API_ENDPOINTS.adminTaskDetail(taskId));

    console.log("任务详情响应:", task); // 调试用

    // 设置模态框标题
    document.getElementById('task-modal-title').textContent = '编辑任务';
    document.getElementById('task-id').value = task.id;

    // 填充表单数据
    document.getElementById('task-title').value = task.title || '';
    document.getElementById('task-description').value = task.description || '';
    document.getElementById('task-priority').value = task.priority || '2';

    // 加载管理员列表并设置负责人 - 修复时序问题
    await loadAdminUsers();

    // 确保下拉框已渲染后再设置值
    const assigneeSelect = document.getElementById('task-assignee');
    if (assigneeSelect && task.assigneeId) {
      // 直接设置值，不需要setTimeout
      assigneeSelect.value = task.assigneeId.toString();
    }

    // 处理附件信息
    document.getElementById('selected-material-info').style.display = 'none';

    if (task.materialId) {
      try {
        const material = await apiRequest(`${API_BASE_URL}/api/admin/materials/${task.materialId}`);
        selectedMaterial = {
          id: task.materialId,
          name: material.name,
          url: material.path
        };
        document.getElementById('selected-material-name').textContent = selectedMaterial.name;
        document.getElementById('selected-material-info').style.display = 'block';
      } catch (error) {
        console.error('加载附件信息失败:', error);
        // 即使失败也显示基本信息
        document.getElementById('selected-material-name').textContent = `资料ID: ${task.materialId}`;
        document.getElementById('selected-material-info').style.display = 'block';
      }
    } else if (task.attachmentUrl) {
      // 处理直接上传的附件
      const fileName = task.attachmentUrl.split('/').pop();
      selectedMaterial = {
        id: null,
        name: fileName,
        url: task.attachmentUrl
      };
      document.getElementById('selected-material-name').textContent = fileName;
      document.getElementById('selected-material-info').style.display = 'block';
    }

    // 打开模态框
    document.getElementById('task-modal').classList.add('active');
  } catch (error) {
    console.error('加载任务数据失败:', error);
    showToast('error', '加载任务数据失败');
  } finally {
    hideLoading();
  }
}

// 加载负责人选项
async function loadAssignees() {
    try {
        const response = await fetch('/api/tasks/assignees');
        const result = await response.json();

        if (result.code === 200) {
            const assigneeSelect = document.getElementById('task-assignee');
            // 清空现有选项（保留第一个选项）
            while (assigneeSelect.options.length > 1) {
                assigneeSelect.remove(1);
            }

            // 添加管理员选项
            result.data.forEach(admin => {
                const option = document.createElement('option');
                option.value = admin.id;
                option.textContent = admin.username;
                assigneeSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('加载负责人列表失败:', error);
    }
}

// 获取资料信息
async function getMaterialInfo(materialId) {
    try {
        const response = await fetch(`/api/materials/${materialId}`);
        const result = await response.json();
        return result.data;
    } catch (error) {
        console.error('获取资料信息失败:', error);
        return { name: '未知资料' };
    }
}

// 添加批量操作功能
function setupBatchOperations() {
    // 全选/全不选
    document.getElementById('select-all').addEventListener('change', function(e) {
        const checkboxes = document.querySelectorAll('.material-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = e.target.checked;
        });
    });

    // 批量审核
    document.getElementById('batch-approve-btn').addEventListener('click', function() {
        const selectedIds = getSelectedMaterialIds();
        if (selectedIds.length === 0) {
            showToast('error', '请选择要审核的资料');
            return;
        }

        batchApproveMaterials(selectedIds);
    });

    // 批量删除
    document.getElementById('batch-delete-btn').addEventListener('click', function() {
        const selectedIds = getSelectedMaterialIds();
        if (selectedIds.length === 0) {
            showToast('error', '请选择要删除的资料');
            return;
        }

        if (confirm(`确定要删除选中的 ${selectedIds.length} 个资料吗？此操作不可恢复！`)) {
            batchDeleteMaterials(selectedIds);
        }
    });
}

// 获取选中的资料ID
function getSelectedMaterialIds() {
    const checkboxes = document.querySelectorAll('.material-checkbox:checked');
    return Array.from(checkboxes).map(checkbox => checkbox.value);
}

// 批量审核资料
async function batchApproveMaterials(ids) {
    showLoading();
    try {
        const response = await apiRequest(`${API_BASE_URL}/api/admin/materials/batch/approve`, {
            method: 'POST',
            body: { ids }
        });

        showToast('success', response.message || '批量审核成功');
        loadMaterialManagement(currentMaterialManagementFilter.status);
    } catch (error) {
        showToast('error', error.message || '批量审核失败');
    } finally {
        hideLoading();
    }
}

// 批量删除资料
async function batchDeleteMaterials(ids) {
    showLoading();
    try {
        const response = await apiRequest(`${API_BASE_URL}/api/admin/materials/batch`, {
            method: 'DELETE',
            body: { ids }
        });

        showToast('success', response.message || '批量删除成功');
        loadMaterialManagement(currentMaterialManagementFilter.status);
    } catch (error) {
        showToast('error', error.message || '批量删除失败');
    } finally {
        hideLoading();
    }
}

// 在资料表格中添加复选框
function renderMaterialManagementTable(materials) {
    const tbody = document.querySelector('#material-management-table tbody');
    if (!materials || materials.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="10" class="empty-state"> <!-- 增加列数 -->
                    <i class="fas fa-inbox"></i>
                    <p>暂无资料数据</p>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = materials.map(material => `
        <tr>
            <td>
                <input type="checkbox" class="material-checkbox" value="${material.id}">
            </td>
            <td>${material.id}</td>
            <td>${escapeHTML(material.name)}</td>
            <td>${escapeHTML(material.originalFilename || material.name)}</td>  <!-- 新增原始文件名列 -->
            <td>${escapeHTML(material.uploaderName || '未知用户')}</td>
            <td>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <div class="user-avatar" style="width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #fab005, #f59f00); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px;">
                        ${(material.uploaderName || 'U').charAt(0).toUpperCase()}
                    </div>
                    <span>${escapeHTML(material.uploaderName || `用户 ${material.uploaderId}`)}</span>
                </div>
            </td>
            <td>${material.uploadTime ? new Date(material.uploadTime).toLocaleDateString() : '未知'}</td>
            <td>${escapeHTML(material.type || '未知')}</td>
            <td>${escapeHTML(material.category || '未知')}</td>
            <td><span class="status-badge status-${material.status}">${getStatusText(material.status)}</span></td>
            <td>
                <div class="action-btns">
                    <button class="btn btn-sm btn-outline" onclick="viewMaterial(${material.id})">
                        <i class="fas fa-eye"></i> 查看
                    </button>
                    <button class="btn btn-sm btn-danger delete-material-management" data-id="${material.id}">
                        <i class="fas fa-trash"></i> 删除
                    </button>
                    ${material.status === 0 ? `
                        <button class="btn btn-sm btn-success approve-material" data-id="${material.id}">通过</button>
                        <button class="btn btn-sm btn-warning reject-material" data-id="${material.id}">拒绝</button>
                    ` : ''}
                </div>
            </td>
        </tr>
    `).join('');
}

// 查看任务详情
async function viewTask(taskId) {
  showLoading();
  try {
    const task = await apiRequest(API_ENDPOINTS.adminTaskDetail(taskId));

    // 创建查看模态框内容
    const modalContent = `
      <div class="task-detail-view">
        <h3>${escapeHTML(task.title)}</h3>
        <div class="detail-section">
          <label>描述:</label>
          <p>${escapeHTML(task.description || '无描述')}</p>
        </div>
        <div class="detail-section">
          <label>负责人:</label>
          <p>${escapeHTML(task.assigneeName || '未分配')}</p>
        </div>
        <div class="detail-section">
          <label>优先级:</label>
          <p><span class="priority-badge priority-${task.priority}">${getPriorityText(task.priority)}</span></p>
        </div>
        <div class="detail-section">
          <label>状态:</label>
          <p><span class="status-badge status-${task.status}">${getTaskStatusText(task.status)}</span></p>
        </div>
        <div class="detail-section">
          <label>进度:</label>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${task.progress || 0}%"></div>
            <span class="progress-text">${task.progress || 0}%</span>
          </div>
        </div>
        <div class="detail-section">
          <label>创建时间:</label>
          <p>${task.createTime ? formatDate(task.createTime) : '未知'}</p>
        </div>
        ${task.reviewComment ? `
        <div class="detail-section">
          <label>审核意见:</label>
          <p>${escapeHTML(task.reviewComment)}</p>
        </div>
        ` : ''}
      </div>
    `;

    // 显示模态框
    showCustomModal('任务详情', modalContent);
  } catch (error) {
    showToast('error', '加载任务详情失败');
  } finally {
    hideLoading();
  }
}

// 显示自定义内容模态框
function showCustomModal(title, content) {
  // 创建或获取模态框
  let modal = document.getElementById('custom-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'custom-modal';
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content" style="max-width: 600px;">
        <div class="modal-header">
          <h3></h3>
          <span class="modal-close">&times;</span>
        </div>
        <div class="modal-body"></div>
        <div class="modal-footer">
          <button class="btn btn-outline-secondary modal-close">关闭</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    // 添加关闭事件
    modal.querySelectorAll('.modal-close').forEach(btn => {
      btn.addEventListener('click', () => {
        modal.classList.remove('active');
      });
    });
  }

  // 设置内容和显示
  modal.querySelector('.modal-header h3').textContent = title;
  modal.querySelector('.modal-body').innerHTML = content;
  modal.classList.add('active');
}

// 添加删除活动日志的函数
async function deleteActivityLog(activityId) {
  if (!confirm('确定要删除此活动记录吗？相关的通知也将被删除，此操作不可恢复！')) return;
  showLoading();
  try {
    /* 关键修正：使用 /api/admin/activity/${activityId} */
    await apiRequest(`${API_BASE_URL}/api/admin/dashboard/logs/${activityId}`, { method: 'DELETE' });
    showToast('success', '活动记录已删除');
    loadAuditLogs(currentPage.activities);
  } finally { hideLoading(); }
}

// 导航分组切换功能
function setupNavGroups() {
  document.querySelectorAll('.group-toggle').forEach(toggle => {
    toggle.addEventListener('click', function(e) {
      e.stopPropagation();
      const groupName = this.dataset.group;
      const group = document.querySelector(`.nav-group.${groupName}`);
      const isExpanded = group.classList.contains('expanded');

      // 切换展开状态
      if (isExpanded) {
        group.classList.remove('expanded');
        this.classList.remove('rotated');
      } else {
        group.classList.add('expanded');
        this.classList.add('rotated');
      }
    });
  });

  // 点击分组标题也可以切换
  document.querySelectorAll('.nav-group-header').forEach(header => {
    header.addEventListener('click', function() {
      const toggle = this.querySelector('.group-toggle');
      if (toggle) {
        toggle.click();
      }
    });
  });

  // 初始状态：展开所有分组
  document.querySelectorAll('.nav-group').forEach(group => {
    group.classList.add('expanded');
  });
  document.querySelectorAll('.group-toggle').forEach(toggle => {
    toggle.classList.add('rotated');
  });
}

async function loadNotifications() {
  try {
    const list = await apiRequest(`${API_BASE_URL}/api/notifications/today`);
    const ul = document.getElementById('notification-list');

    if (!Array.isArray(list)) {
      throw new Error('无效的通知数据格式');
    }

    ul.innerHTML = list.length > 0
        ? list.map(n => `
          <li data-id="${n.id}" class="notification-item ${n.read ? 'read' : 'unread'}">
            <div class="notification-content">
              <div>${escapeHTML(n.message)}</div>
              <small>${new Date(n.createdAt).toLocaleString()}</small>
            </div>
            ${!n.read ? `<button class="btn btn-sm btn-outline mark-read" data-id="${n.id}">标记已读</button>` : ''}
          </li>
        `).join('')
        : '<li class="empty-notification">暂无新消息</li>';

    // 添加事件监听
    document.querySelectorAll('.mark-read').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = e.target.dataset.id;
        markNotificationRead(id);
      });
    });
  } catch (error) {
    console.warn('加载通知失败:', error);
    const ul = document.getElementById('notification-list');
    ul.innerHTML = '<li class="empty-notification">加载通知失败</li>';
  }
}