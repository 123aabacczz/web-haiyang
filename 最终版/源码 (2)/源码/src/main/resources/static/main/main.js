// main.js (位于根目录)
import { apiRequest, API_ENDPOINTS } from '../api-config.js';
import { showToast } from '../toast.js';

if (window.dayjs) {
  dayjs.extend(window.dayjs_plugin_relativeTime);
}

function redirectToLogin() {
  showToast('info', '请先登录');
  setTimeout(() => {
    window.location.href = '../login/login.html';
  }, 1500);
}

// 主题切换功能
document.addEventListener('DOMContentLoaded', function() {

 // 检查用户会话
  checkUserSession().then(isValid => {
    console.log("用户会话验证结果:", isValid);
    if (!isValid) {
      return;
    }

    // 更新用户信息
    updateUserInfoFromSession();

    // 加载个人档案弹窗数据
    loadProfileModalData();

    // 加载统计数据
    loadStatsData();

    // 加载会议数据
    loadMeetingsData();

    // 加载公告数据
    loadAnnouncementsData();
  });

  // 导航下拉菜单
  const navDropdowns = document.querySelectorAll('.nav-dropdown');
  const navDropdownContents = document.querySelectorAll('.nav-dropdown-content');
  
  // 关闭所有下拉菜单
  function closeAllDropdowns() {
    navDropdownContents.forEach(content => {
      content.style.display = 'none';
    });
  }
  
  // 为每个下拉菜单添加点击事件
  navDropdowns.forEach(dropdown => {
    const btn = dropdown.querySelector('.nav-dropdown-btn');
    const content = dropdown.querySelector('.nav-dropdown-content');
    
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      // 切换当前下拉菜单的显示状态
      const isOpen = content.style.display === 'flex';
      closeAllDropdowns();
      if (!isOpen) {
        content.style.display = 'flex';
      }
    });
    
    // 为下拉菜单中的链接添加点击事件
    const links = content.querySelectorAll('.nav-link');
    links.forEach(link => {
      link.addEventListener('click', function() {
        closeAllDropdowns();
      });
    });
  });
  
  // 点击页面其他地方关闭所有下拉菜单
  document.addEventListener('click', function() {
    closeAllDropdowns();
  });

  // 快速创建下拉菜单
  const quickCreateBtn = document.getElementById('quick-create-btn');
  const quickCreateMenu = document.getElementById('quick-create-menu');

  if (quickCreateBtn && quickCreateMenu) {
    quickCreateBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      quickCreateMenu.style.display = quickCreateMenu.style.display === 'flex' ? 'none' : 'flex';
    });

    // 点击菜单项
    const dropdownItems = quickCreateMenu.querySelectorAll('.dropdown-item');
    dropdownItems.forEach(item => {
      item.addEventListener('click', function() {
        const action = this.getAttribute('data-action');
        handleQuickCreate(action);
        quickCreateMenu.style.display = 'none';
      });
    });

    // 点击外部关闭菜单
    document.addEventListener('click', function(e) {
      if (!quickCreateBtn.contains(e.target) && !quickCreateMenu.contains(e.target)) {
        quickCreateMenu.style.display = 'none';
      }
    });
  }

  // 查看日程按钮
  const viewScheduleBtn = document.getElementById('view-schedule-btn');
  if (viewScheduleBtn) {
    viewScheduleBtn.addEventListener('click', function() {
      showToast('正在跳转到日程中心...', 'info');
      // 实际项目中这里会进行页面跳转
      setTimeout(() => {
        window.location.href = 'schedule-center/schedule-center.html';
      }, 1000);
    });
  }

  // 浮动操作按钮
  const mainFab = document.getElementById('main-fab');
  const fabActions = document.querySelector('.fab-actions');

  if (mainFab && fabActions) {
    mainFab.addEventListener('click', function() {
      this.classList.toggle('active');
      fabActions.classList.toggle('active');
    });

    // 浮动按钮操作
    const fabButtons = fabActions.querySelectorAll('.fab');
    fabButtons.forEach(button => {
      button.addEventListener('click', function() {
        const action = this.getAttribute('data-action');
        handleFabAction(action);
        mainFab.classList.remove('active');
        fabActions.classList.remove('active');
      });
    });
  }

  // 快速访问项
  const quickItems = document.querySelectorAll('.quick-item');
  quickItems.forEach(item => {
    item.addEventListener('click', function() {
      const target = this.getAttribute('data-target');
      navigateToQuickAccess(target);
    });
  });

  renderPopNotifications();
    document.getElementById('mark-all-read-btn')?.addEventListener('click', () => {
      saveNotes(debugData.map(n => ({ ...n, read: true })));
      renderPopNotifications();
    });

  // 通知按钮
  const notificationsBtn = document.getElementById('notifications-btn');
  if (notificationsBtn) {
    notificationsBtn.addEventListener('click', function() {
      openModal('notifications-modal');
    });
  }

  // 用户信息按钮
  const userInfoBtn = document.getElementById('user-info-btn');
  if (userInfoBtn) {
    userInfoBtn.addEventListener('click', function() {
      openModal('user-modal');
    });
  }

  // 搜索框功能
  const globalSearch = document.getElementById('global-search');
  if (globalSearch) {
    globalSearch.addEventListener('focus', function() {
      openModal('search-modal');
      this.blur(); // 移除焦点，避免重复触发
    });
  }

  // 模态框关闭功能
  const modalCloseButtons = document.querySelectorAll('.modal-close');
  modalCloseButtons.forEach(button => {
    button.addEventListener('click', function() {
      closeModals();
    });
  });

  // 点击模态框外部关闭
  const modals = document.querySelectorAll('.modal');
  modals.forEach(modal => {
    modal.addEventListener('click', function(e) {
      if (e.target === this) {
        closeModals();
      }
    });
  });

  // ESC键关闭模态框
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      closeModals();
    }
  });

   // 添加登出功能
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', userLogout);
    }

});

// 处理快速创建操作
async function handleQuickCreate(action) {

  const userSession = JSON.parse(localStorage.getItem('userSession'));
  const userId = userSession ? userSession.userId : null;

  if (!userId) {
    showToast('error', '用户未登录或会话已过期');
    return;
  }

  switch(action) {
    case 'new-doc':
      openModal('modal-new-doc');
      break;
    case 'new-project':
      openModal('modal-new-project');
      break;
    case 'invite-member':
      openModal('modal-invite-member');
      break;
    case 'generate-report':
      openModal('modal-generate-report');
      break;
    default:
      showToast('error', '未知操作');
  }
}

// 添加用户会话验证函数
// project-docs.js - 修改会话检查
async function checkUserSession() {
    try {
        // 检查管理员会话
        const adminSession = JSON.parse(localStorage.getItem('adminSession'));
        const userSession = JSON.parse(localStorage.getItem('userSession'));

        // 优先使用管理员会话
        const session = adminSession || userSession;
        const sessionExpired = !session || (Date.now() - (session.timestamp || 0)) > 3600000;

        if (sessionExpired) {
            localStorage.removeItem('adminSession');
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
        localStorage.removeItem('adminSession');
        localStorage.removeItem('userSession');
        showToast('info', '请重新登录');
        setTimeout(() => {
            window.location.href = '../../login/login.html';
        }, 1500);
        return false;
    }
}

// 用户登出函数
async function userLogout() {
  try {
    await apiRequest(API_ENDPOINTS.userLogout, {
      method: 'POST',
      credentials: 'include'
    });
  } catch (error) {
    console.log('退出请求失败，继续清理本地会话');
  }

  // 清除本地存储
  localStorage.removeItem('userSession');
  localStorage.removeItem('token');

  // 清除当前用户ID
  document.getElementById('current-user-id').value = '';

  showToast('success', '您已安全退出');
  setTimeout(() => {
    location.href = '../login/login.html';
  }, 1500);
}

// 处理浮动按钮操作
function handleFabAction(action) {
  switch(action) {
    case 'new-doc':
      showToast('通过浮动按钮新建文档', 'success');
      break;
    case 'new-task':
      showToast('通过浮动按钮新建任务', 'success');
      break;
    case 'new-meeting':
      showToast('通过浮动按钮安排会议', 'success');
      break;
    default:
      showToast('未知操作', 'error');
  }
}

// 导航到快速访问区域
function navigateToQuickAccess(target) {
  switch(target) {
    case 'library':        location.href = 'pages/project-docs.html'; break;
    case 'member-center':  location.href = 'pages/team-directory.html'; break;
    case 'data-reports':   location.href = 'pages/data-reports.html'; break;
    case 'settings':       location.href = 'pages/settings.html'; break;
    default:
      showToast('目标页面不存在', 'error');
  }
}

// 加载会议数据
async function loadMeetingsData() {
  const meetingsContainer = document.getElementById('upcoming-meetings');
  if (!meetingsContainer) return;

  try {
    console.log("正在请求会议数据...");
    const response = await fetch(API_ENDPOINTS.recentMeetings, {
      credentials: 'include'
    });

    console.log("API响应状态:", response.status);

    if (!response.ok) {
      throw new Error(`HTTP错误: ${response.status}`);
    }

    const data = await response.json();
    console.log("API返回数据:", JSON.stringify(data, null, 2));

    meetingsContainer.innerHTML = '';

    // 修改这里：直接从data.data获取会议列表
    let meetings = [];
    if (data && data.data) {
      meetings = data.data; // API返回格式为 {data: [...]}
    } else if (Array.isArray(data)) {
      meetings = data; // 备用格式：直接返回数组
    }

    if (!meetings || meetings.length === 0) {
      meetingsContainer.innerHTML = '<div class="empty-state">暂无会议安排</div>';
      return;
    }

    // 过滤出未来的会议
    const now = new Date();
    const upcomingMeetings = meetings.filter(meeting => {
      if (!meeting.meeting_time) return false;
      const meetingTime = new Date(meeting.meeting_time);
      return meetingTime > now;
    });

    if (upcomingMeetings.length === 0) {
      meetingsContainer.innerHTML = '<div class="empty-state">暂无即将召开的会议</div>';
      return;
    }

    // 按时间排序
    upcomingMeetings.sort((a, b) => {
      const timeA = a.meeting_time ? new Date(a.meeting_time).getTime() : 0;
      const timeB = b.meeting_time ? new Date(b.meeting_time).getTime() : 0;
      return timeA - timeB;
    });

    // 只显示最近3个会议
    const recentMeetings = upcomingMeetings.slice(0, 5);

    recentMeetings.forEach(meeting => {
      const meetingElement = document.createElement('div');
      meetingElement.className = 'meeting-item';

      // 格式化时间
      const meetingTime = new Date(meeting.meeting_time);
      const formattedTime = formatMeetingTime(meetingTime);

      meetingElement.innerHTML = `
        <div class="meeting-time">${formattedTime}</div>
        <div class="meeting-title">${meeting.title || '未命名会议'}</div>
        <div class="meeting-desc">${meeting.content || '暂无详细描述'}</div>
      `;

      meetingsContainer.appendChild(meetingElement);
    });
  } catch (error) {
    console.error('加载会议数据失败:', error);
    meetingsContainer.innerHTML = '<div class="empty-state">加载会议数据失败: ' + error.message + '</div>';
  }
}

// 辅助函数：格式化会议时间
function formatMeetingTime(dateString) {
  if (!dateString) return "时间未定";

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "时间格式错误";

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return `今天 ${date.toLocaleTimeString('zh-CN', {hour: '2-digit', minute: '2-digit'})}`;
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return `明天 ${date.toLocaleTimeString('zh-CN', {hour: '2-digit', minute: '2-digit'})}`;
    } else {
      return date.toLocaleString('zh-CN', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  } catch (e) {
    console.error("日期解析错误:", e);
    return "时间解析错误";
  }
}

// 加载统计数据（动态）
async function loadStatsData() {
  try {
    const data = await apiRequest(API_ENDPOINTS.dashboardStats);
    
    if (data) {
      // 更新统计卡片
      const statDocuments = document.getElementById('stat-documents');
      const statProjects = document.getElementById('stat-projects');
      const statMembers = document.getElementById('stat-members');
      const statTasks = document.getElementById('stat-tasks');

      if (statDocuments) {
        statDocuments.textContent = data.documents || data.uncompletedDocuments || 0;
      }
      if (statProjects) {
        statProjects.textContent = data.projects || data.inProgressProjects || 0;
      }
      if (statMembers) {
        statMembers.textContent = data.members || data.memberChanges || 0;
      }
      if (statTasks) {
        statTasks.textContent = data.tasks || data.pendingTasks || 0;
      }

      // 更新欢迎信息
      const welcomeCard = document.querySelector('.welcome-card');
      if (welcomeCard) {
        const welcomeTitle = welcomeCard.querySelector('h2');
        const welcomeDesc = welcomeCard.querySelector('p');
        
        if (welcomeTitle && data.username) {
          welcomeTitle.textContent = `早上好，${data.username}！`;
        }
        if (welcomeDesc) {
          const today = new Date();
          const dateString = today.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
          const weekday = today.toLocaleDateString('zh-CN', { weekday: 'long' });
          welcomeDesc.textContent = `今天是${dateString}，${weekday}。您今天有${data.todayMeetings || 0}个会议，${data.unreadAnnouncements || 0}条未读公告。`;
        }
      }
    }
  } catch (error) {
    console.error('加载统计数据失败:', error);
    // 如果API调用失败，保持默认值或显示错误
    const statElements = ['stat-documents', 'stat-projects', 'stat-members', 'stat-tasks'];
    statElements.forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        element.textContent = '-';
      }
    });
  }
}

// 加载公告数据（动态）
async function loadAnnouncementsData() {
  const announcementsContainer = document.getElementById('recent-announcements');
  if (!announcementsContainer) return;

  try {
    const data = await apiRequest(API_ENDPOINTS.latestAnnouncements(5)); // 获取最新5条

    announcementsContainer.innerHTML = '';

    if (!data || !Array.isArray(data) || data.length === 0) {
      announcementsContainer.innerHTML = '<div class="empty-state">暂无最新公告</div>';
      return;
    }

    data.forEach(announcement => {
      const announcementElement = document.createElement('div');
      announcementElement.className = 'announcement-item';

      const timeAgo = formatTimeAgo(announcement.publishTime || announcement.createdAt);

      announcementElement.innerHTML = `
        <div class="announcement-title">${announcement.title}</div>
        <div class="announcement-desc">${announcement.content}</div>
        <div class="meeting-time">${timeAgo}</div>
      `;

      announcementsContainer.appendChild(announcementElement);
    });
  } catch (error) {
    console.error('加载公告失败:', error);
    announcementsContainer.innerHTML = '<div class="empty-state">加载公告失败</div>';
  }
}

// 工具函数：格式化时间为“几分钟前”
function formatTimeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return '刚刚';
  if (diffMins < 60) return `${diffMins} 分钟前`;
  if (diffHours < 24) return `${diffHours} 小时前`;
  if (diffDays < 7) return `${diffDays} 天前`;
  return date.toLocaleDateString('zh-CN');
}

// 打开模态框
function openModal(modalId) {
  // 先关闭所有模态框
  closeModals();

  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; // 防止背景滚动
  }
}

// 关闭所有模态框
function closeModals() {
  const modals = document.querySelectorAll('.modal');
  modals.forEach(modal => {
    modal.classList.remove('active');
  });
  document.body.style.overflow = ''; // 恢复背景滚动
}

// 全局搜索功能
document.addEventListener('DOMContentLoaded', function() {
  const globalSearch = document.getElementById('global-search');
  if (globalSearch) {
    globalSearch.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        const searchTerm = this.value.trim();
        if (searchTerm) {
          showToast(`搜索: ${searchTerm}`, 'info');
          this.value = '';
        }
      }
    });
  }

  // 搜索模态框中的搜索功能
  const searchModalInput = document.querySelector('.search-modal-input');
  if (searchModalInput) {
    searchModalInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        const searchTerm = this.value.trim();
        if (searchTerm) {
          showToast(`搜索: ${searchTerm}`, 'info');
          closeModals();
        }
      }
    });
  }
});

// 备用CDN检测
window.addEventListener('load', function() {
  if (typeof FullCalendar === 'undefined') {
    console.warn('FullCalendar 未加载，使用备用CDN');
  }

  if (typeof dayjs === 'undefined') {
    console.warn('dayjs 未加载，使用备用CDN');
  }

  if (typeof Chart === 'undefined') {
    console.warn('Chart.js 未加载，使用备用CDN');
  }
});
/* ---------- 1.  通知弹窗（铃铛图标） ---------- */

/* ---------- 0. 通用工具（前置） ---------- */
const STORE_KEY = 'notifications_debug';
const iconMap = t => ({ task: 'fa-tasks', system: 'fa-cog', comment: 'fa-comment' }[t]);
const getNotes = () => JSON.parse(localStorage.getItem(STORE_KEY)) || debugData;
const saveNotes = arr => localStorage.setItem(STORE_KEY, JSON.stringify(arr));

/* ---------- 1. 调试：每次刷新重置 ---------- */
const debugData = [
  { id: 'd1', type: 'task',    title: '新任务分配', msg: '修复登录页面 BUG',            time: Date.now() - 1e5, read: false },
  { id: 'd2', type: 'system',  title: '系统维护',   msg: '本周六凌晨 2:00-4:00 系统升级', time: Date.now() - 5e5, read: false },
  { id: 'd3', type: 'comment', title: '新评论',     msg: '王博士在项目讨论中 @ 了你',   time: Date.now() - 8e5, read: true  }
];
localStorage.setItem(STORE_KEY, JSON.stringify(debugData));

/* ---------- 2. 渲染函数 ---------- */
function renderPopNotifications() {
  const container = document.getElementById('notifications-pop-list');
  const empty     = document.getElementById('notifications-empty');
  const badge     = document.querySelector('.notification-badge');
  if (!container) return;

  const notes  = getNotes();
  const unread = notes.filter(n => !n.read);

  badge && (badge.textContent = unread.length || '');
  badge && (badge.style.display = unread.length ? 'flex' : 'none');
  empty && (empty.style.display = unread.length ? 'none' : 'flex');

  container.innerHTML = '';
  unread.forEach(n => {
    const li = document.createElement('li');
    li.innerHTML = `
      <div class="icon-wrap ${n.type}">
        <i class="fas ${iconMap(n.type)}"></i>
      </div>
      <div class="content">
        <div class="title">${n.title}</div>
        <div class="msg">${n.msg}</div>
        <div class="time">${window.dayjs ? window.dayjs(n.time).fromNow() : '刚刚'}</div>
      </div>
      <div class="unread-dot"></div>
    `;
    li.addEventListener('click', () => {
      n.read = true;
      saveNotes(notes);
      renderPopNotifications();
    });
    container.appendChild(li);
  });
}

function markRead(id) {
  const notes = getNotes();
  const note  = notes.find(n => n.id === id);
  if (note) note.read = true;
  saveNotes(notes);
  renderPopNotifications();
}

function markAllRead() {
  saveNotes(getNotes().map(n => ({ ...n, read: true })));
  renderPopNotifications();
}

/* ---------- 2. 搜索弹窗 ---------- */
function renderSearchSuggestions() {
  const recentTags = document.querySelector('.search-tags');
  if (!recentTags) return;
  const recents = JSON.parse(localStorage.getItem('search-recents') || '[]');
  recentTags.innerHTML = recents.map(t => `<span class="search-tag">${t}</span>`).join('');
}

function addSearchHistory(term) {
  if (!term) return;
  const recents = JSON.parse(localStorage.getItem('search-recents') || '[]');
  const next    = [term, ...recents.filter(t => t !== term)].slice(0, 6);
  localStorage.setItem('search-recents', JSON.stringify(next));
  renderSearchSuggestions();
}

/* ---------- 3. 用户弹窗 ---------- */
function renderUserStats() {
  const stats = { project: 12, task: 87, doc: 24 };
  document.querySelectorAll('.user-stats .stat-value').forEach((el, idx) => {
    const keys = ['project', 'task', 'doc'];
    el.textContent = stats[keys[idx]];
  });
}

/* ---------- 4. 初始化 ---------- */
document.addEventListener('DOMContentLoaded', () => {
  /* 通知 */
  if (!localStorage.getItem(STORE_KEY)) saveNotes(defaultNotifications);
  renderPopNotifications();
  document.getElementById('mark-all-read-btn')?.addEventListener('click', markAllRead);

  /* 搜索 */
  renderSearchSuggestions();
  document.querySelector('.search-modal-input')?.addEventListener('keypress', e => {
    if (e.key === 'Enter') {
      const term = e.target.value.trim();
      if (term) {
        addSearchHistory(term);
        showToast(`正在搜索：${term}`, 'info');
        e.target.value = '';
        closeModals();
      }
    }
  });
  document.addEventListener('click', e => {
    if (e.target.classList.contains('search-tag')) {
      const term = e.target.textContent;
      document.querySelector('.search-modal-input').value = term;
    }
  });

  /* 用户 */
  renderUserStats();
});


/* =====================================================
 *  快速创建  4 个模态框统一绑定
 * =====================================================*/
const quickCreateMap = {
  'new-doc':     '#modal-new-doc',
  'new-project': '#modal-new-project',
  'invite-member':'#modal-invite-member',
  'generate-report':'#modal-generate-report'
};

// 统一给“确认”按钮加事件
document.addEventListener('DOMContentLoaded',()=>{

 // 1. 新建文档
 document.getElementById('confirm-new-doc')?.addEventListener('click', async () => {
   const title = document.getElementById('doc-title').value.trim();
   const template = document.getElementById('doc-template').value;
   const projectId = document.getElementById('doc-project-id').value;
   const category = document.getElementById('doc-category').value;
   const language = document.getElementById('doc-language').value;
   const description = document.getElementById('doc-description').value;
   const tags = document.getElementById('doc-tags').value;
   const version = document.getElementById('doc-version').value;
   const originalFilename = document.getElementById('doc-original-filename').value;
   const userId = parseInt(document.getElementById('current-user-id').value);

   if (!title || !template || !category) {
     showToast('请填写必填字段', 'error');
     return;
   }

   try {
     const response = await apiRequest(API_ENDPOINTS.quickCreate.document, {
       method: 'POST',
       body: {
         title: title,
         template: template,
         projectId: projectId || null,
         category: category,
         language: language,
         description: description,
         tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
         version: version,
         originalFilename: originalFilename,
         creatorId: userId
       }
     });

     showToast(`文档《${title}》创建成功`, 'success');
     closeModals();
     // 清空表单
     document.getElementById('doc-title').value = '';
     document.getElementById('doc-template').selectedIndex = 0;
     document.getElementById('doc-project-id').value = '';
     document.getElementById('doc-category').selectedIndex = 0;
     document.getElementById('doc-language').selectedIndex = 0;
     document.getElementById('doc-description').value = '';
     document.getElementById('doc-tags').value = '';
     document.getElementById('doc-version').value = 'v1.0.0';
     document.getElementById('doc-original-filename').value = '';
   } catch (error) {
     showToast('文档创建失败: ' + error.message, 'error');
   }
 });

 // 2. 新建项目
 document.getElementById('confirm-new-project')?.addEventListener('click', async () => {
   const name = document.getElementById('project-name').value.trim();
   const type = document.getElementById('project-type').value;
   const status = document.getElementById('project-status').value;
   const userId = parseInt(document.getElementById('current-user-id').value);

   if (!name || !type) {
     showToast('请输入项目名称并选择类型', 'error');
     return;
   }

   try {
     const response = await apiRequest(API_ENDPOINTS.quickCreate.project, {
       method: 'POST',
       body: {
         name: name,
         type: type,
         status: status,
         creatorId: userId
       }
     });

     showToast(`项目"${name}"已创建`, 'success');
     closeModals();
     // 清空表单
     document.getElementById('project-name').value = '';
     document.getElementById('project-type').selectedIndex = 0;
     document.getElementById('project-status').selectedIndex = 0;
   } catch (error) {
     showToast('项目创建失败: ' + error.message, 'error');
   }
 });

 // 3. 邀请成员
 document.getElementById('confirm-invite')?.addEventListener('click', async () => {
   const raw = document.getElementById('invite-input').value.trim();
   const role = document.getElementById('invite-role').value;
   const expiry = document.getElementById('invite-expiry').value;
   const userId = parseInt(document.getElementById('current-user-id').value);

   if (!raw) {
     showToast('请输入邮箱或手机号', 'error');
     return;
   }

   const contacts = raw.split(/[,，\s]+/).map(s => s.trim()).filter(Boolean);

   try {
     const response = await apiRequest(API_ENDPOINTS.quickCreate.invite, {
       method: 'POST',
       body: {
         contacts: contacts,
         role: role,
         expiryDays: parseInt(expiry),
         inviterId: userId
       }
     });

     showToast(`已发送 ${contacts.length} 份邀请`, 'success');
     closeModals();
     document.getElementById('invite-input').value = '';
   } catch (error) {
     showToast('发送邀请失败: ' + error.message, 'error');
   }
 });

 // 4. 生成报告
 document.getElementById('confirm-generate')?.addEventListener('click', async () => {
   const title = document.getElementById('report-title').value.trim();
   const type = document.getElementById('report-type').value;
   const start = document.getElementById('report-start').value;
   const end = document.getElementById('report-end').value;
   const description = document.getElementById('report-description').value;
   const userId = parseInt(document.getElementById('current-user-id').value);

   if (!title || !start || !end) {
     showToast('请填写必填字段', 'error');
     return;
   }

   try {
     const response = await apiRequest(API_ENDPOINTS.quickCreate.report, {
       method: 'POST',
       body: {
         title: title,
         type: type,
         startDate: start,
         endDate: end,
         description: description,
         creatorId: userId
       }
     });

     showToast(`${type} 报告生成中，请稍候…`, 'info');
     closeModals();

     // 模拟异步生成过程
     setTimeout(() => {
       showToast('报告已生成，正在下载…', 'success');
       // 实际项目中这里可以触发下载
     }, 3000);
   } catch (error) {
     showToast('报告生成失败: ' + error.message, 'error');
   }
 });

  /* 自动给“取消”按钮绑关闭 */
  document.querySelectorAll('.modal-close-btn').forEach(btn=>{
    btn.addEventListener('click',closeModals);
  });
});

// 更新用户信息时包含等级显示
function updateUserInfoFromSession() {
    const userSession = JSON.parse(localStorage.getItem('userSession'));
    const adminSession = JSON.parse(localStorage.getItem('adminSession'));
    
    // 优先使用管理员会话
    const session = adminSession || userSession;
    
    if (session) {
        // 更新右上角用户信息
        const userNameElement = document.getElementById('header-user-name');
        const userRankElement = document.getElementById('header-user-rank');

        if (userNameElement && session.username) {
            userNameElement.textContent = session.username;
        }

        if (userRankElement) {
            if (adminSession) {
                userRankElement.textContent = '管理员';
            } else if (session.userLevel) {
                userRankElement.textContent = `Lv.${session.userLevel} 用户`;
            } else {
                userRankElement.textContent = '普通用户';
            }
        }

        // 更新欢迎语中的用户名
        const welcomeElement = document.querySelector('.welcome-card h2');
        if (welcomeElement && session.username) {
            welcomeElement.textContent = `早上好，${session.username}！`;
        }
    } else {
        // 如果没有会话，显示默认值
        const userNameElement = document.getElementById('header-user-name');
        const userRankElement = document.getElementById('header-user-rank');
        
        if (userNameElement) {
            userNameElement.textContent = '游客';
        }
        
        if (userRankElement) {
            userRankElement.textContent = '未登录';
        }
    }
}

// 加载个人档案弹窗数据（姓名、等级、经验均来自后端真实数据）
async function loadProfileModalData() {
    try {
        const data = await apiRequest(API_ENDPOINTS.personalProfile, { method: 'GET' });
        renderProfileModal(data || {});
    } catch (error) {
        console.warn('加载个人档案失败，使用登录会话兜底:', error);
        renderProfileModalFromSession();
    }
}

// 读取本地登录会话
function getStoredSession() {
    try {
        return JSON.parse(localStorage.getItem('adminSession') || 'null')
            || JSON.parse(localStorage.getItem('userSession') || 'null');
    } catch (e) {
        return null;
    }
}

// 接口不可用时，用登录会话兜底
function renderProfileModalFromSession() {
    const session = getStoredSession();
    if (!session) return;

    renderProfileModal({
        profile: {
            username: session.username,
            title: session.adminLevel ? '管理员' : '暂无职位',
            level: session.userLevel || session.adminLevel || 1
        },
        taskCenter: {
            experience: 0,
            nextLevelExperience: 0
        }
    });
}

// 渲染个人档案弹窗
function renderProfileModal(data) {
    const profile = data.profile || {};
    const taskCenter = data.taskCenter || {};
    const session = getStoredSession();
    const level = parseInt(profile.level, 10) || 1;
    const experience = Number(taskCenter.experience) || 0;
    const nextLevelExperience = Number(taskCenter.nextLevelExperience) || 0;
    const percent = nextLevelExperience > 0
        ? Math.min(100, Math.round(experience * 100 / nextLevelExperience))
        : 0;

    setProfileModalText('profile-modal-name', profile.username || (session && session.username) || '未命名用户');
    setProfileModalText('profile-modal-title', profile.title || '暂无职位');
    setProfileModalText('profile-modal-level', `Lv.${level}`);
    setProfileModalText('profile-modal-exp', experience);
    setProfileModalText('profile-modal-next-exp', nextLevelExperience);
    setProfileModalText('profile-modal-exp-percent', `${percent}%`);

    const expFill = document.getElementById('profile-modal-exp-fill');
    if (expFill) {
        expFill.style.width = `${percent}%`;
    }

    renderProfileLevelList(level);
}

// 高亮当前等级
function renderProfileLevelList(level) {
    const list = document.getElementById('profile-level-list');
    if (!list) return;

    let matched = false;
    list.querySelectorAll('li[data-level]').forEach(item => {
        const itemLevel = parseInt(item.dataset.level, 10);
        const badge = item.querySelector('.badge');
        const isCurrent = itemLevel === level;
        if (badge) {
            badge.classList.toggle('current', isCurrent);
        }
        if (isCurrent) {
            matched = true;
        }
    });

    const dynamicRow = list.querySelector('li[data-dynamic-current]');
    if (dynamicRow) {
        dynamicRow.remove();
    }

    if (!matched) {
        const item = document.createElement('li');
        item.setAttribute('data-dynamic-current', 'true');
        item.innerHTML = `<span class="badge current">Lv.${level}</span> 当前等级`;
        list.insertBefore(item, list.firstChild);
    }
}

function setProfileModalText(id, text) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = text;
    }
}