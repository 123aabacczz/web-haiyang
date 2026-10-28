// API Configuration and Functions
const API_BASE_URL = 'http://localhost:8080';

const API_ENDPOINTS = {
  // 任务相关
  tasks: `${API_BASE_URL}/api/tasks`,
  acceptTask: (taskId) => `${API_BASE_URL}/api/tasks/${taskId}/accept`,
  updateTaskProgress: (taskId) => `${API_BASE_URL}/api/tasks/${taskId}/progress`,
  completeTask: (taskId) => `${API_BASE_URL}/api/tasks/${taskId}/complete`,
  createTask: `${API_BASE_URL}/api/tasks`,
  userTasks: `${API_BASE_URL}/api/user/tasks/my-tasks`,
  
  // 标签相关
  tags: `${API_BASE_URL}/api/tags`,
  popularTags: `${API_BASE_URL}/api/tags/popular`,
  taskTagStats: `${API_BASE_URL}/api/task_tag_stats`,
  taskTagRelations: `${API_BASE_URL}/api/task-tag-relations`,
  taskTags: (taskId) => `${API_BASE_URL}/api/tasks/${taskId}/tags`,
  
  // 用户-任务中心
  userTaskCenter: (userId) => `${API_BASE_URL}/api/user-task-center/${userId}`,
  
  // 积分相关
  userPoints: {
    all: `${API_BASE_URL}/api/user-points/all`,
    byUserId: (userId) => `${API_BASE_URL}/api/user-points/${userId}`,
    updatePoints: (userId) => `${API_BASE_URL}/api/user-points/${userId}/points`,
    updateTodayPoints: (userId) => `${API_BASE_URL}/api/user-points/${userId}/today-points`,
    updateTotalPoints: (userId) => `${API_BASE_URL}/api/user-points/${userId}/total-points`,
    updateRanking: (userId) => `${API_BASE_URL}/api/user-points/${userId}/ranking`
  },
  
  teamPoints: {
    all: `${API_BASE_URL}/api/team-points/all`,
    byTeamId: (teamId) => `${API_BASE_URL}/api/team-points/${teamId}`,
    updatePoints: (teamId) => `${API_BASE_URL}/api/team-points/${teamId}/points`,
    updateTodayPoints: (teamId) => `${API_BASE_URL}/api/team-points/${teamId}/today-points`,
    updateTotalPoints: (teamId) => `${API_BASE_URL}/api/team-points/${teamId}/total-points`,
    updateRanking: (teamId) => `${API_BASE_URL}/api/team-points/${teamId}/ranking`
  }
};

async function apiRequest(url, options = {}) {
  const headers = { 'Accept': 'application/json' };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const defaultOptions = {
    headers: headers,
    credentials: 'include',
    ...options
  };

  if (defaultOptions.body && typeof defaultOptions.body === 'object' && !(defaultOptions.body instanceof FormData)) {
      defaultOptions.body = JSON.stringify(defaultOptions.body);
  }

  try {
    const response = await fetch(url, defaultOptions);
    const contentType = response.headers.get('content-type');

    if (response.status === 204) {
      return null;
    }

    if (!response.ok) {
      if (response.status === 401 && url.includes('/notifications/')) {
        console.warn('通知接口认证失败，可能会话已过期');
        return 0;
      }

      if (response.status === 401) {
        localStorage.removeItem('userSession');
        localStorage.removeItem('adminSession');

        try {
          showToast('info', '请重新登录');
        } catch (e) {
          console.warn('无法加载toast模块，使用alert代替');
          alert('请重新登录');
        }

        setTimeout(() => {
          const loginPath = window.location.pathname.includes('/admin/')
            ? '../login/login.html'
            : './login/login.html';
          window.location.href = loginPath;
        }, 1500);

        throw new Error('请重新登录');
      }

      let errorMessage = `请求失败: ${response.status}`;
      try {
        const errorResponse = await response.text();
        if (errorResponse) {
          errorMessage = errorResponse;
        }
      } catch (e) {
      }
      throw new Error(errorMessage);
    }

    const textResponse = await response.text();

    try {
      const jsonResponse = JSON.parse(textResponse);

      if (jsonResponse && typeof jsonResponse === 'object') {
        if (!jsonResponse.success && jsonResponse.message) {
          throw new Error(jsonResponse.message);
        }
        if ('data' in jsonResponse) {
          return jsonResponse.data;
        }
        if ('items' in jsonResponse) {
          return jsonResponse;
        }
      }

      return jsonResponse;
    } catch {
      return textResponse;
    }
  } catch (error) {
    console.error('API请求失败:', error);
    throw new Error(error.message || '网络请求失败');
  }
}

// Toast Function
let activeToast = null;
let toastQueue = [];

function showToast(type, msg, duration = 3000, redirectUrl = null) {
  if (activeToast && activeToast.msg === msg) {
    return;
  }

  if (activeToast) {
    toastQueue.push({ type, msg, duration, redirectUrl });
    return;
  }

  let box = document.getElementById('toastBox');
  let ovl = document.getElementById('toastOverlay');

  if (!box) {
    ovl = document.createElement('div');
    ovl.id = 'toastOverlay';
    ovl.style.cssText = `
      position: fixed; inset: 0;
      background: rgba(0,0,0,.55);
      backdrop-filter: blur(4px);
      display: flex; align-items: center;
      justify-content: center; z-index: 9999;
      font-size: 14px; display: none;
    `;

    ovl.innerHTML = `
      <div id="toastBox" style="
        width: 320px;
        background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
        border-radius: 14px; padding: 40px 30px;
        text-align: center; color: #fff;
        box-shadow: 0 0 0 1px rgba(167,132,239,.3),
                    0 0 30px rgba(167,132,239,.3),
                    0 0 60px rgba(167,132,239,.15);
        position: relative;
        animation: popIn .45s ease-out;
      ">
        <i id="toastIcon"></i>
        <div id="toastMsg" style="
          font-size: 18px; font-weight: 600;
          letter-spacing: .5px; margin-top: 12px;
        "></div>
        <div id="toastProgress" style="
          position: absolute; bottom: 0; left: 0;
          height: 4px; border-radius: 0 0 14px 14px;
          background: linear-gradient(90deg, #a78cf9, #d5b8ff);
        "></div>
      </div>
      <style>
        @keyframes popIn {
          0% { transform: scale(.7); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes progress { from { width: 0 } to { width: 100% } }
      </style>
    `;

    document.body.appendChild(ovl);
    box = document.getElementById('toastBox');
  }

  const icon = document.getElementById('toastIcon');
  const msgEl = document.getElementById('toastMsg');
  const progress = document.getElementById('toastProgress');

  icon.className = type === 'success'
    ? 'fas fa-check-circle'
    : 'fas fa-times-circle';
  msgEl.textContent = msg;

  ovl.style.display = 'flex';

  progress.style.animation = 'none';
  setTimeout(() => {
    progress.style.animation = 'progress 3s linear forwards';
  }, 10);

  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => {
    ovl.style.display = 'none';
    activeToast = null;

    if (toastQueue.length > 0) {
      const nextToast = toastQueue.shift();
      showToast(nextToast.type, nextToast.msg, nextToast.duration, nextToast.redirectUrl);
    }

    if (redirectUrl) {
      location.href = redirectUrl;
    }
  }, duration);
}

// 全局变量
let currentPage = 1;
let pageSize = 10;
let totalPages = 1;
let allTasks = [];
let filteredTasks = [];
let activeFilters = {
    status: [],
    type: [],
    priority: [],
};
let sortField = 'created';
let sortAscending = true;
// 全局变量
let activeTagFilters = [];
let allTags = [];
let currentUserId = null;
let userTaskCenterInfo = null;
let userPointsList = [];
let teamPointsList = [];

// 获取当前用户ID
function getCurrentUserId() {
    const userSession = JSON.parse(localStorage.getItem('userSession'));
    const adminSession = JSON.parse(localStorage.getItem('adminSession'));
    const session = userSession || adminSession;
    if (session && session.userId) {
        return parseInt(session.userId);
    }
    return null;
}

// 获取用户-任务中心信息
async function fetchUserTaskCenterInfo() {
    currentUserId = getCurrentUserId();
    if (!currentUserId) {
        showNotification('请先登录', 'error');
        setTimeout(() => {
            window.location.href = '../../login/login.html';
        }, 1500);
        return;
    }
    
    try {
        console.log('Fetching user task center info for userId:', currentUserId);
        const response = await apiRequest(API_ENDPOINTS.userTaskCenter(currentUserId));
        console.log('User task center info response:', response);
        
        if (response) {
            userTaskCenterInfo = response;
            updateUserTaskCenterUI();
        }
    } catch (error) {
        console.error('获取用户任务中心信息失败:', error);
        showNotification('获取用户信息失败: ' + error.message, 'error');
    }
}

// 获取用户积分列表
async function fetchUserPointsList() {
    try {
        console.log('Fetching user points list...');
        const response = await apiRequest(API_ENDPOINTS.userPoints.all);
        console.log('User points list response:', response);
        
        if (response && Array.isArray(response)) {
            userPointsList = response;
            updateUserPointsUI();
        }
    } catch (error) {
        console.error('获取用户积分列表失败:', error);
        showNotification('获取用户积分列表失败: ' + error.message, 'error');
    }
}

// 获取团队积分列表
async function fetchTeamPointsList() {
    try {
        console.log('Fetching team points list...');
        const response = await apiRequest(API_ENDPOINTS.teamPoints.all);
        console.log('Team points list response:', response);
        
        if (response && Array.isArray(response)) {
            teamPointsList = response;
            updateTeamPointsUI();
        }
    } catch (error) {
        console.error('获取团队积分列表失败:', error);
        showNotification('获取团队积分列表失败: ' + error.message, 'error');
    }
}

// 更新用户任务中心UI
function updateUserTaskCenterUI() {
    if (!userTaskCenterInfo) return;
    
    // 更新用户信息（姓名、等级以登录会话为准）
    const goodDayElement = document.querySelector('.good-day');
    const levelElement = document.querySelector('.level .badge');
    const expElement = document.querySelector('.level .exp');
    const session = JSON.parse(localStorage.getItem('userSession') || 'null')
        || JSON.parse(localStorage.getItem('adminSession') || 'null');
    const username = session ? session.username : '用户';
    
    if (goodDayElement) {
        goodDayElement.textContent = `上午好，${username} 👋`;
    }

    const headerNameElement = document.getElementById('header-user-name');
    const headerRankElement = document.getElementById('header-user-rank');
    if (headerNameElement && session && session.username) {
        headerNameElement.textContent = session.username;
    }
    if (headerRankElement) {
        if (session && session.adminLevel) {
            headerRankElement.textContent = '管理员';
        } else if (session && session.userLevel) {
            headerRankElement.textContent = `Lv.${session.userLevel} 用户`;
        } else {
            headerRankElement.textContent = '普通用户';
        }
    }
    
    if (levelElement) {
        const loginLevel = session && (session.userLevel || session.adminLevel);
        const level = loginLevel || userTaskCenterInfo.level;
        levelElement.textContent = `Lv.${level}`;
        levelElement.className = `badge lv${level}`;
    }
    
    if (expElement) {
        expElement.textContent = `${userTaskCenterInfo.experience} / ${userTaskCenterInfo.nextLevelExperience} EXP`;
    }
    
    // 更新核心数据
    const corePointsElement = document.getElementById('core-points');
    const coreAcceptedElement = document.getElementById('core-accepted');
    const coreCompletedElement = document.getElementById('core-completed');
    const todayPointsElement = document.getElementById('today-points');
    
    if (corePointsElement) {
        corePointsElement.textContent = userTaskCenterInfo.points;
    }
    
    if (coreAcceptedElement) {
        coreAcceptedElement.textContent = userTaskCenterInfo.acceptedTasks;
    }
    
    if (coreCompletedElement) {
        coreCompletedElement.textContent = userTaskCenterInfo.completedTasks;
    }
    
    if (todayPointsElement) {
        todayPointsElement.textContent = userTaskCenterInfo.todayPoints;
    }
}

// 更新用户积分UI
function updateUserPointsUI() {
    // 直接更新个人排名列表
    updatePersonalRanking();
}

// 更新团队积分UI
function updateTeamPointsUI() {
    // 直接更新团队排名列表
    updateTeamRanking();
}

// 更新个人排名列表
function updatePersonalRanking() {
    const personalRankingList = document.getElementById('personal-ranking-list');
    if (!personalRankingList) return;
    
    if (userPointsList.length === 0) {
        personalRankingList.innerHTML = '<li class="no-data">暂无个人排名数据</li>';
        return;
    }
    
    // 按排名排序
    const sortedUsers = [...userPointsList].sort((a, b) => a.ranking - b.ranking);
    
    let rankingHTML = '';
    sortedUsers.forEach((item, index) => {
        const rank = item.ranking;
        let rankClass = '';
        let rankIcon = '';
        let specialEffect = '';
        
        // 为前3名添加特殊样式和图标
        if (rank === 1) {
            rankClass = 'rank-gold';
            rankIcon = '<i class="fas fa-crown text-yellow-400 mr-1"></i>';
            specialEffect = '<div class="rank-glow gold-glow"></div>';
        } else if (rank === 2) {
            rankClass = 'rank-silver';
            rankIcon = '<i class="fas fa-medal text-gray-300 mr-1"></i>';
            specialEffect = '<div class="rank-glow silver-glow"></div>';
        } else if (rank === 3) {
            rankClass = 'rank-bronze';
            rankIcon = '<i class="fas fa-medal text-yellow-700 mr-1"></i>';
            specialEffect = '<div class="rank-glow bronze-glow"></div>';
        } else if (rank <= 10) {
            rankClass = 'rank-top-ten';
            rankIcon = '<i class="fas fa-star text-blue-400 mr-1"></i>';
        }
        
        rankingHTML += `
            <li class="ranking-item ${rankClass}">
                ${specialEffect}
                <div class="ranking-content">
                    <span class="rank">${rankIcon}${rank}</span>
                    <span class="name">${item.username || `用户 ${item.userId}`}</span>
                    <span class="points">${item.totalPoints} 积分</span>
                </div>
            </li>
        `;
    });
    
    personalRankingList.innerHTML = rankingHTML;
}

// 更新团队排名列表
function updateTeamRanking() {
    const teamRankingList = document.getElementById('team-ranking-list');
    if (!teamRankingList) return;
    
    if (teamPointsList.length === 0) {
        teamRankingList.innerHTML = '<li class="no-data">暂无团队排名数据</li>';
        return;
    }
    
    // 按排名排序
    const sortedTeams = [...teamPointsList].sort((a, b) => a.ranking - b.ranking);
    
    let rankingHTML = '';
    sortedTeams.forEach((item, index) => {
        const rank = item.ranking;
        let rankClass = '';
        let rankIcon = '';
        let specialEffect = '';
        
        // 为前3名添加特殊样式和图标
        if (rank === 1) {
            rankClass = 'rank-gold';
            rankIcon = '<i class="fas fa-trophy text-yellow-400 mr-1"></i>';
            specialEffect = '<div class="rank-glow gold-glow"></div>';
        } else if (rank === 2) {
            rankClass = 'rank-silver';
            rankIcon = '<i class="fas fa-award text-gray-300 mr-1"></i>';
            specialEffect = '<div class="rank-glow silver-glow"></div>';
        } else if (rank === 3) {
            rankClass = 'rank-bronze';
            rankIcon = '<i class="fas fa-award text-yellow-700 mr-1"></i>';
            specialEffect = '<div class="rank-glow bronze-glow"></div>';
        } else if (rank <= 10) {
            rankClass = 'rank-top-ten';
            rankIcon = '<i class="fas fa-star text-blue-400 mr-1"></i>';
        }
        
        rankingHTML += `
            <li class="ranking-item ${rankClass}">
                ${specialEffect}
                <div class="ranking-content">
                    <span class="rank">${rankIcon}${rank}</span>
                    <span class="name">${item.teamName || `团队 ${item.teamId}`}</span>
                    <span class="points">${item.totalPoints} 积分</span>
                </div>
            </li>
        `;
    });
    
    teamRankingList.innerHTML = rankingHTML;
}

// 新增：获取标签数据
async function fetchTagsFromAPI() {
    try {
        console.log('Fetching tags from API...');
        const response = await apiRequest(API_ENDPOINTS.taskTagStats);
        console.log('Tags API response:', response);

        if (Array.isArray(response)) {
            console.log(`成功获取 ${response.length} 个标签`);
            return response;
        } else {
            console.warn('标签数据格式异常:', response);
            return [];
        }
    } catch (error) {
        console.error('获取标签数据失败:', error);
        // 返回默认标签作为备选
        return getDefaultTags();
    }
}

// 备选：默认标签数据
function getDefaultTags() {
    return [
        { id: 1, tag_name: '前端', visit_count: 12 },
        { id: 2, tag_name: '后端', visit_count: 8 },
        { id: 3, tag_name: '设计', visit_count: 6 },
        { id: 4, tag_name: '文档', visit_count: 5 },
        { id: 5, tag_name: '测试', visit_count: 4 },
        { id: 6, tag_name: '紧急', visit_count: 9 },
        { id: 7, tag_name: '项目', visit_count: 12 },
        { id: 8, tag_name: '等级试炼', visit_count: 9 },
        { id: 9, tag_name: '竞赛', visit_count: 8 },
        { id: 10, tag_name: '分享', visit_count: 8 }
    ];
}

// 新增：更新标签云
async function updateTagCloud() {
    try {
        const tagCloudContainer = document.getElementById('tag-cloud-container');
        const hotTagsContainer = document.getElementById('hot-tags-container');

        if (!tagCloudContainer || !hotTagsContainer) {
            console.warn('标签云容器未找到');
            return;
        }

        // 获取所有标签数据
        const tagsData = await fetchTagsFromAPI();
        allTags = tagsData;

        console.log('所有标签数据:', tagsData);

        // 获取热门标签数据
        const hotTagsData = await fetchHotTags();
        console.log('热门标签数据:', hotTagsData);

        // 更新热门标签容器
        if (!hotTagsData || hotTagsData.length === 0) {
            hotTagsContainer.innerHTML = '<div class="no-tags">暂无热门标签数据</div>';
        } else {
            let hotTagsHTML = '';
            hotTagsData.forEach(tag => {
                const tagName = tag.tagName || tag.tag_name || tag.name || '未知标签';
                const visitCount = tag.visitCount || tag.visit_count || 0;
                const isHot = visitCount >= 10;

                hotTagsHTML += `
                    <span class="task-tag ${isHot ? 'hot' : ''}" 
                          data-tag="${tagName}"
                          data-visit-count="${visitCount}">
                        ${tagName}
                        ${visitCount > 0 ? `<span class="tag-count">${visitCount}</span>` : ''}
                    </span>
                `;
            });
            hotTagsContainer.innerHTML = hotTagsHTML;
        }

        // 更新所有标签容器
        if (!tagsData || tagsData.length === 0) {
            tagCloudContainer.innerHTML = '<div class="no-tags">暂无标签数据</div>';
        } else {
            let tagsHTML = '';
            tagsData.forEach(tag => {
                const tagName = tag.tagName || tag.tag_name || tag.name || '未知标签';
                const visitCount = tag.visitCount || tag.visit_count || 0;
                const isHot = visitCount >= 10;

                tagsHTML += `
                    <span class="task-tag ${isHot ? 'hot' : ''}" 
                          data-tag="${tagName}"
                          data-visit-count="${visitCount}">
                        ${tagName}
                        ${visitCount > 0 ? `<span class="tag-count">${visitCount}</span>` : ''}
                    </span>
                `;
            });
            tagCloudContainer.innerHTML = tagsHTML;
        }

        // 绑定标签点击事件
        bindTagEvents();

    } catch (error) {
        console.error('更新标签云失败:', error);
        const tagCloudContainer = document.getElementById('tag-cloud-container');
        const hotTagsContainer = document.getElementById('hot-tags-container');

        if (tagCloudContainer) {
            tagCloudContainer.innerHTML = '<div class="no-tags">加载标签失败</div>';
        }
        if (hotTagsContainer) {
            hotTagsContainer.innerHTML = '<div class="no-tags">加载热门标签失败</div>';
        }
    }
}

// 新增：获取热门标签（前10个访问次数最多的）
async function fetchHotTags() {
    try {
        console.log('Fetching hot tags from API...');
        const response = await apiRequest(API_ENDPOINTS.taskTagStats);
        console.log('Hot tags API response:', response);

        if (Array.isArray(response)) {
            // 按访问次数降序排序，取前10个
            const hotTags = response
                .sort((a, b) => (b.visitCount || b.visit_count || 0) - (a.visitCount || a.visit_count || 0))
                .slice(0, 10);

            console.log(`成功获取 ${hotTags.length} 个热门标签`);
            return hotTags;
        } else {
            console.warn('热门标签数据格式异常:', response);
            return getDefaultHotTags();
        }
    } catch (error) {
        console.error('获取热门标签数据失败:', error);
        return getDefaultHotTags();
    }
}

// 备选：默认热门标签数据
function getDefaultHotTags() {
    return [
        { id: 7, tag_name: '项目', visit_count: 12 },
        { id: 1, tag_name: '前端', visit_count: 12 },
        { id: 8, tag_name: '等级试炼', visit_count: 9 },
        { id: 6, tag_name: '紧急', visit_count: 9 },
        { id: 2, tag_name: '后端', visit_count: 8 },
        { id: 9, tag_name: '竞赛', visit_count: 8 },
        { id: 10, tag_name: '分享', visit_count: 8 },
        { id: 3, tag_name: '设计', visit_count: 6 },
        { id: 4, tag_name: '文档', visit_count: 5 },
        { id: 5, tag_name: '测试', visit_count: 4 }
    ];
}

// 新增：绑定标签事件
function bindTagEvents() {
    const tagElements = document.querySelectorAll('.task-tag');

    tagElements.forEach(tag => {
        tag.addEventListener('click', function() {
            this.classList.toggle('active');
            const tagName = this.getAttribute('data-tag');

            if (this.classList.contains('active')) {
                // 添加标签筛选
                if (!activeTagFilters.includes(tagName)) {
                    activeTagFilters.push(tagName);
                }
            } else {
                // 移除标签筛选
                const index = activeTagFilters.indexOf(tagName);
                if (index > -1) {
                    activeTagFilters.splice(index, 1);
                }
            }

            console.log('当前激活的标签筛选:', activeTagFilters);

            // 应用筛选
            filterTasks();
            updateFilterInfo();
        });
    });
}

// 新增：从后端API获取任务数据
async function fetchTasksFromAPI() {
    try {
        console.log('Fetching tasks from API...');
        // 修改：移除分页参数，获取所有任务
        const response = await apiRequest(API_ENDPOINTS.tasks);
        console.log('Tasks API response:', response);

        // 处理不同的响应格式
        let tasks = [];
        if (response && response.items) {
            tasks = response.items;
        } else if (Array.isArray(response)) {
            tasks = response;
        } else if (response && response.data) {
            tasks = response.data;
        }

        console.log(`成功获取 ${tasks.length} 个任务`);
        return tasks;
    } catch (error) {
        console.error('获取任务数据失败:', error);
        showNotification('加载任务失败: ' + error.message, 'error');
        return [];
    }
}

// 修复：如果需要分页获取所有数据，添加递归获取函数
async function fetchAllTasks() {
    let allTasks = [];
    let page = 1;
    const size = 100; // 每次请求的数量

    try {
        while (true) {
            const response = await apiRequest(`${API_ENDPOINTS.tasks}?page=${page}&size=${size}`);

            let tasks = [];
            if (response && response.items) {
                tasks = response.items;
            } else if (Array.isArray(response)) {
                tasks = response;
            } else if (response && response.data) {
                tasks = response.data;
            }

            if (!tasks || tasks.length === 0) {
                break; // 没有更多数据
            }

            allTasks = allTasks.concat(tasks);

            // 如果返回的数据少于请求的数量，说明已经是最后一页
            if (tasks.length < size) {
                break;
            }

            page++;
        }

        console.log(`成功获取所有 ${allTasks.length} 个任务`);
        return allTasks;
    } catch (error) {
        console.error('获取所有任务失败:', error);
        showNotification('获取任务数据失败: ' + error.message, 'error');
        return allTasks; // 返回已获取的数据
    }
}

// 修复任务状态映射函数
function mapTaskStatus(status) {
    const statusMap = {
        0: 'not-started', // 待审核 -> 待接受
        1: 'not-started', // 已通过 -> 待接受
        2: 'not-started', // 已拒绝 -> 待接受
        3: 'in-progress', // 进行中
        4: 'completed'    // 已完成
    };
    return statusMap[status] || 'not-started';
}

// 修复优先级映射函数
function mapTaskPriority(priority) {
    const priorityMap = {
        1: 'low',
        2: 'medium',
        3: 'high',
        4: 'critical'
    };
    return priorityMap[priority] || 'medium';
}

// 修复类型映射函数
function mapTaskType(type) {
    const typeMap = {
        'main': 'main-quest',
        'daily': 'daily-quest',
        'bounty': 'bounty',
        'team': 'team'
    };
    return typeMap[type] || 'main-quest';
}

// 修改：任务中心交互功能
document.addEventListener('DOMContentLoaded', async function() {
    // 获取用户任务中心信息
    await fetchUserTaskCenterInfo();
    
    // 获取用户积分列表
    await fetchUserPointsList();
    
    // 获取团队积分列表
    await fetchTeamPointsList();
    
    // 初始化任务数据
    await initTaskData();

    // 初始化其他功能
    initTaskFilters();
    initTaskSearch();
    initTaskSorting();
    initTaskActions();
    // initCreateTaskButton(); // 已替换为initCreateTaskModal
    initCreateTaskModal();
    initRefreshButton();
    initPagination();
    initRankingTabs();

    // 渲染任务列表
    renderTasks();
});

// 初始化排名标签切换
function initRankingTabs() {
    const rankingTabs = document.querySelectorAll('.ranking-tab');
    
    rankingTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const target = this.getAttribute('data-target');
            
            // 移除所有标签的active类
            rankingTabs.forEach(t => t.classList.remove('active'));
            // 添加当前标签的active类
            this.classList.add('active');
            
            // 隐藏所有面板
            document.querySelectorAll('.ranking-panel').forEach(panel => {
                panel.classList.remove('active');
            });
            // 显示目标面板
            document.getElementById(target).classList.add('active');
        });
    });
}

// 初始化创建任务模态框
function initCreateTaskModal() {
    // 关闭按钮
    const closeButtons = document.querySelectorAll('#create-task-modal .modal-close, #cancel-create-task');
    closeButtons.forEach(button => {
        button.addEventListener('click', closeCreateTaskModal);
    });
    
    // 提交按钮
    const submitButton = document.getElementById('submit-create-task');
    if (submitButton) {
        submitButton.addEventListener('click', submitCreateTask);
    }
    
    // 点击模态框外部关闭
    const modal = document.getElementById('create-task-modal');
    if (modal) {
        modal.querySelector('.modal-overlay').addEventListener('click', closeCreateTaskModal);
    }
    
    // 加载负责人列表
    loadAssignees();
}

// 加载负责人列表
async function loadAssignees() {
    try {
        console.log('开始加载负责人列表...');
        
        // 尝试获取所有用户信息
        const users = await fetchAllUsers();
        console.log('获取的用户列表:', users);
        
        const assigneeSelect = document.getElementById('task-assignee');
        console.log('负责人选择框元素:', assigneeSelect);
        
        if (assigneeSelect && Array.isArray(users) && users.length > 0) {
            console.log('用户列表长度:', users.length);
            // 清空现有选项
            assigneeSelect.innerHTML = '<option value="">请选择负责人</option>';
            
            // 添加新选项
            users.forEach((user, index) => {
                console.log('用户', index, ':', user);
                
                // 获取用户ID和用户名
                let userId = user.id || user.userId;
                let username = user.username || user.name;
                
                console.log('用户ID:', userId);
                console.log('用户名:', username);
                
                if (userId && username) {
                    const option = document.createElement('option');
                    option.value = userId;
                    option.textContent = username;
                    assigneeSelect.appendChild(option);
                }
            });
            console.log('负责人列表加载完成');
        } else {
            console.log('用户列表为空或选择框不存在:', users, assigneeSelect);
        }
    } catch (error) {
        console.error('加载负责人列表失败:', error);
    }
}

// 获取所有用户信息
async function fetchAllUsers() {
    try {
        console.log('开始获取所有用户信息...');
        
        // 尝试不同的API端点，优先使用搜索所有用户的API
        const endpoints = [
            'http://localhost:8080/api/admin/users?page=1&size=100', // 优先使用这个端点
            'http://localhost:8080/api/users',
            'http://localhost:8080/api/tasks/assignees'
        ];
        
        for (const endpoint of endpoints) {
            try {
                console.log('尝试API端点:', endpoint);
                const response = await fetch(endpoint, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json'
                    },
                    credentials: 'include',
                    cache: 'no-cache'
                });
                
                if (response.ok) {
                    const text = await response.text();
                    console.log('API响应:', text);
                    const data = JSON.parse(text);
                    
                    // 提取用户列表
                    let users = [];
                    if (data && typeof data === 'object') {
                        if (data.data && Array.isArray(data.data)) {
                            users = data.data;
                        } else if (data.items && Array.isArray(data.items)) {
                            // 处理 PageInfo 格式
                            users = data.items;
                        } else if (Array.isArray(data)) {
                            users = data;
                        }
                    }
                    
                    // 检查用户列表是否包含id和username
                    if (users.length > 0) {
                        // 处理不同格式的用户数据
                        const processedUsers = users.map(user => {
                            if (user.id && user.username) {
                                // 标准格式：{id, username}
                                return user;
                            } else if (user.value) {
                                // 只有value的格式：{value: "92"}
                                return {
                                    id: user.value,
                                    username: user.value // 暂时使用value作为用户名
                                };
                            } else if (user.username) {
                                // 只有username的格式：{username: "user1"}
                                return {
                                    id: user.username,
                                    username: user.username
                                };
                            } else {
                                return null;
                            }
                        }).filter(Boolean);
                        
                        if (processedUsers.length > 0) {
                            console.log('找到有效的用户列表');
                            return processedUsers;
                        }
                    }
                }
            } catch (error) {
                console.warn('API端点失败:', endpoint, error);
            }
        }
        
        // 如果所有API都失败，返回空数组
        return [];
    } catch (error) {
        console.error('获取用户信息失败:', error);
        return [];
    }
}

// 增强的通知功能
function showNotification(message, type = 'info') {
    // 创建更精美的通知元素
    const notification = document.createElement('div');
    notification.className = `notification ${type} animate__animated animate__fadeInRight`;

    const icons = {
        success: '✓',
        error: '✗',
        warning: '⚠',
        info: 'ℹ'
    };

    notification.innerHTML = `
        <div class="notification-icon">${icons[type] || icons.info}</div>
        <div class="notification-content">${message}</div>
        <button class="notification-close"><i class="lucide lucide-x"></i></button>
    `;

    // 添加样式
    notification.style.cssText = `
        position: fixed;
        top: 1.5rem;
        right: 1.5rem;
        background: white;
        color: ${type === 'success' ? '#2b8a3e' : type === 'error' ? '#c92a2a' : type === 'warning' ? '#e67700' : '#364fc7'};
        padding: 1rem 1.25rem;
        border-radius: 0.75rem;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        display: flex;
        align-items: center;
        gap: 0.75rem;
        z-index: 1000;
        border-left: 4px solid ${type === 'success' ? '#2b8a3e' : type === 'error' ? '#c92a2a' : type === 'warning' ? '#e67700' : '#364fc7'};
        max-width: 24rem;
    `;

    // 添加关闭按钮事件
    notification.querySelector('.notification-close').addEventListener('click', function() {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    });

    // 添加到页面
    document.body.appendChild(notification);

    // 自动移除通知
    setTimeout(() => {
        if (notification.parentNode) {
            notification.classList.remove('animate__fadeInRight');
            notification.classList.add('animate__fadeOutRight');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 500);
        }
    }, 4000);
}

// 增强的任务详情查看功能
function viewTaskDetails(taskCard) {
    const taskId = taskCard.querySelector('.task-id').textContent;
    const taskTitle = taskCard.querySelector('.task-title').textContent;

    // 创建模态框
    const modal = document.createElement('div');
    modal.className = 'task-modal animate__animated animate__fadeIn';
    modal.innerHTML = `
        <div class="modal-overlay"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h3>任务详情: ${taskTitle}</h3>
                <button class="modal-close"><i class="lucide lucide-x"></i></button>
            </div>
            <div class="modal-body">
                <div class="task-detail-section">
                    <h4>描述</h4>
                    <p>${taskCard.querySelector('.task-desc').textContent}</p>
                </div>
                <div class="task-detail-section">
                    <h4>详细信息</h4>
                    <div class="detail-grid">
                        ${taskCard.querySelector('.task-details') ? taskCard.querySelector('.task-details').innerHTML : ''}
                        ${taskCard.querySelector('.task-info') ? taskCard.querySelector('.task-info').innerHTML : ''}
                    </div>
                </div>
                <div class="task-detail-section">
                    <h4>奖励</h4>
                    <div class="reward-grid">
                        ${taskCard.querySelector('.task-rewards') ? taskCard.querySelector('.task-rewards').innerHTML : ''}
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-outline" id="close-modal">关闭</button>
                ${taskCard.querySelector('.accept-btn') ? '<button class="btn btn-success" id="accept-from-modal">接受任务</button>' : ''}
            </div>
        </div>
    `;

    // 添加到页面
    document.body.appendChild(modal);

    // 添加关闭事件
    modal.querySelector('.modal-close').addEventListener('click', () => {
        closeModal(modal);
    });

    modal.querySelector('#close-modal').addEventListener('click', () => {
        closeModal(modal);
    });

    // 添加背景点击关闭
    modal.querySelector('.modal-overlay').addEventListener('click', () => {
        closeModal(modal);
    });

    // 添加模态框内接受任务按钮事件
    const acceptBtn = modal.querySelector('#accept-from-modal');
    if (acceptBtn) {
        acceptBtn.addEventListener('click', () => {
            acceptTask(taskCard);
            closeModal(modal);
        });
    }
}

function closeModal(modal) {
    modal.classList.remove('animate__fadeIn');
    modal.classList.add('animate__fadeOut');
    setTimeout(() => {
        if (modal.parentNode) {
            modal.parentNode.removeChild(modal);
        }
    }, 500);
}

// 任务筛选功能
function initTaskFilters() {
    const filterCheckboxes = document.querySelectorAll('.filter-item input[type="checkbox"]');

    filterCheckboxes.forEach(checkbox => {
        // 设置初始状态
        updateFilterInfo();
        checkbox.addEventListener('change', function() {
            filterTasks();
            updateFilterInfo(); // 添加这行
        });
    });

    // 初始化清空筛选按钮
    const clearFiltersBtn = document.getElementById('clear-filters');
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', clearAllFilters);
    }
}

// 添加清空所有筛选函数
function clearAllFilters() {
    // 清空复选框
    document.querySelectorAll('.filter-item input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
    });

    // 清空标签筛选
    document.querySelectorAll('.task-tag.active').forEach(tag => {
        tag.classList.remove('active');
    });
    activeTagFilters = [];

    // 重置全局筛选状态
    activeFilters = {
        status: [],
        type: [],
        priority: [],
        tags: []
    };

    // 重新筛选任务
    filterTasks();
    updateFilterInfo();

    showNotification('已清空所有筛选条件', 'info');
}

// 任务搜索功能
function initTaskSearch() {
    const searchInput = document.getElementById('task-search-input');

    if (searchInput) {
        searchInput.addEventListener('input', debounce(function() {
            const searchTerm = this.value.toLowerCase();
            const taskCards = document.querySelectorAll('.task-card');

            taskCards.forEach(card => {
                const title = card.querySelector('.task-title').textContent.toLowerCase();
                const description = card.querySelector('.task-desc').textContent.toLowerCase();

                if (title.includes(searchTerm) || description.includes(searchTerm)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        }, 300));
    }
}

// 增强排序功能
function initTaskSorting() {
    const sortSelect = document.getElementById('task-sort-select');
    const sortDirectionBtn = document.getElementById('sort-direction');

    let ascending = true;

    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            sortTasks(this.value, ascending);
        });
    }

    if (sortDirectionBtn) {
        sortDirectionBtn.addEventListener('click', function() {
            ascending = !ascending;
            this.innerHTML = ascending ? '<i class="fas fa-arrow-up"></i>' : '<i class="fas fa-arrow-down"></i>';
            sortTasks(sortSelect.value, ascending);
        });
    }
}

// 任务操作按钮
function initTaskActions() {
    // 接受任务按钮
    const acceptButtons = document.querySelectorAll('.accept-btn');

    acceptButtons.forEach(button => {
        button.addEventListener('click', function() {
            const taskCard = this.closest('.task-card');
            if (taskCard) {
                acceptTask(taskCard);
            }
        });
    });

    // 更新进度按钮
    const updateButtons = document.querySelectorAll('.btn-primary');

    updateButtons.forEach(button => {
        if (button.textContent.includes('更新进度')) {
            button.addEventListener('click', function() {
                const taskCard = this.closest('.task-card');
                if (taskCard) {
                    updateTaskProgress(taskCard);
                }
            });
        }
    });

    // 完成任务按钮
    const completeButtons = document.querySelectorAll('.btn-success');

    completeButtons.forEach(button => {
        if (button.textContent.includes('完成')) {
            button.addEventListener('click', function() {
                const taskCard = this.closest('.task-card');
                if (taskCard) {
                    completeTask(taskCard);
                }
            });
        }
    });

    // 添加收藏按钮事件
    const favoriteButtons = document.querySelectorAll('.btn-icon .fa-star');
    favoriteButtons.forEach(button => {
        button.addEventListener('click', function() {
            this.classList.toggle('fas');
            this.classList.toggle('far');
            const isFavorite = this.classList.contains('fas');
            showNotification(isFavorite ? '已收藏任务' : '已取消收藏', 'success');
        });
    });

    // 添加分享按钮事件
    const shareButtons = document.querySelectorAll('.btn-icon .fa-share-alt');
    shareButtons.forEach(button => {
        button.addEventListener('click', function() {
            // 这里可以实现分享功能
            showNotification('分享功能已触发', 'info');
        });
    });
}

// 获取选中的筛选条件
function getSelectedFilters(dataAttribute) {
    const selected = [];
    document.querySelectorAll(`.filter-item input[type="checkbox"]:checked`)
        .forEach(checkbox => {
            selected.push(checkbox.getAttribute(dataAttribute));
        });
    return selected;
}

// 修改排序函数以支持方向
function sortTasks(sortBy, ascending = true) {
    const taskContainer = document.getElementById('task-list-view');
    const taskCards = Array.from(document.querySelectorAll('.task-card'));

    taskCards.sort((a, b) => {
        let comparison = 0;

        switch(sortBy) {
            case 'priority':
                const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
                const aPriority = a.querySelector('.task-priority').classList[1];
                const bPriority = b.querySelector('.task-priority').classList[1];
                comparison = priorityOrder[aPriority] - priorityOrder[bPriority];
                break;

            case 'deadline':
                const aDate = a.querySelector('.deadline') ? new Date(a.querySelector('.deadline').textContent) : new Date(9999, 11, 31);
                const bDate = b.querySelector('.deadline') ? new Date(b.querySelector('.deadline').textContent) : new Date(9999, 11, 31);
                comparison = aDate - bDate;
                break;

            case 'reward':
                const aReward = extractRewardValue(a);
                const bReward = extractRewardValue(b);
                comparison = bReward - aReward;
                break;

            case 'created':
            default:
                const aId = parseInt(a.querySelector('.task-id').textContent.replace('#T-', ''));
                const bId = parseInt(b.querySelector('.task-id').textContent.replace('#T-', ''));
                comparison = aId - bId;
                break;
        }

        return ascending ? comparison : -comparison;
    });

    // 清空容器并重新添加排序后的任务
    taskContainer.innerHTML = '';
    taskCards.forEach(card => {
        taskContainer.appendChild(card);
    });
}

// 从任务卡片中提取奖励数值
function extractRewardValue(taskCard) {
    const rewardElement = taskCard.querySelector('.info-item:nth-child(1)');
    if (!rewardElement) {
        return 0; // 如果元素不存在，返回默认值0
    }

    const rewardText = rewardElement.textContent;
    const match = rewardText.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
}

// 修改：接受任务
async function acceptTask(taskElement, task) {
    try {
        // 调用API接受任务
        const response = await apiRequest(`${API_ENDPOINTS.tasks}/${task.id}/accept`, {
            method: 'POST'
        });

        // 更新UI
        taskElement.setAttribute('data-status', 'in-progress');
        task.status = 'in-progress';

        // 更新任务元素
        task.element = createTaskElement(task);

        // 重新渲染
        renderTasks();

        showNotification('任务已接受！', 'success');
        updateUserStats('进行中', 1);

    } catch (error) {
        showNotification('接受任务失败: ' + error.message, 'error');
    }
}

// 修改：更新任务进度
async function updateTaskProgress(taskElement, task) {
    const newProgress = prompt('请输入新的进度百分比 (0-100):', task.progress);

    if (newProgress !== null && !isNaN(newProgress) && newProgress >= 0 && newProgress <= 100) {
        try {
            // 调用API更新进度
            const response = await apiRequest(`${API_ENDPOINTS.tasks}/${task.id}/progress`, {
                method: 'PUT',
                body: { progress: parseInt(newProgress) }
            });

            task.progress = parseInt(newProgress);
            task.element = createTaskElement(task);
            renderTasks();

            showNotification('任务进度已更新！', 'success');
        } catch (error) {
            showNotification('更新进度失败: ' + error.message, 'error');
        }
    }
}

// 修改：完成任务
async function completeTask(taskElement, task) {
    try {
        // 调用API完成任务
        const response = await apiRequest(`${API_ENDPOINTS.tasks}/${task.id}/complete`, {
            method: 'POST'
        });

        task.status = 'completed';
        task.element = createTaskElement(task);
        renderTasks();

        showNotification('任务已完成！', 'success');
        updateUserStats('进行中', -1);
        updateUserStats('已完成', 1);
        updateUserStats('总积分', task.reward);

    } catch (error) {
        showNotification('完成任务失败: ' + error.message, 'error');
    }
}

// 更新用户统计
function updateUserStats(statType, value) {
    const statItems = document.querySelectorAll('.stat-item');

    statItems.forEach(item => {
        const label = item.querySelector('.stat-label').textContent;
        if (label === statType) {
            const currentValue = parseInt(item.querySelector('.stat-value').textContent);
            item.querySelector('.stat-value').textContent = currentValue + value;
        }
    });

    // 同时更新右侧用户卡片中的积分
    if (statType === '总积分') {
        const userPoints = document.querySelector('.user-stat .stat-value');
        const currentPoints = parseInt(userPoints.textContent);
        userPoints.textContent = currentPoints + value;
    }
}

// 显示创建任务模态框
function showCreateTaskModal() {
    const modal = document.getElementById('create-task-modal');
    if (modal) {
        modal.style.display = 'flex';
        // 初始化标签输入
        initTagInput();
    }
}

// 初始化标签输入
function initTagInput() {
    const tagInput = document.getElementById('task-tags-input');
    const tagsPreview = document.getElementById('task-tags-preview');
    
    if (tagInput && tagsPreview) {
        // 清空现有标签
        tagsPreview.innerHTML = '';
        
        // 监听回车键添加标签
        tagInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && this.value.trim()) {
                e.preventDefault();
                addTag(this.value.trim());
                this.value = '';
            }
        });
    }
}

// 添加标签
function addTag(tagName) {
    const tagsPreview = document.getElementById('task-tags-preview');
    if (!tagsPreview) return;
    
    // 检查标签是否已存在
    const existingTags = tagsPreview.querySelectorAll('.tag-preview');
    for (const tag of existingTags) {
        if (tag.dataset.tag === tagName) {
            return; // 标签已存在，不重复添加
        }
    }
    
    // 创建标签元素
    const tagElement = document.createElement('div');
    tagElement.className = 'tag-preview';
    tagElement.dataset.tag = tagName;
    tagElement.innerHTML = `
        ${tagName}
        <span class="remove-tag" onclick="removeTag(this)">×</span>
    `;
    
    tagsPreview.appendChild(tagElement);
}

// 移除标签
function removeTag(element) {
    const tagElement = element.closest('.tag-preview');
    if (tagElement) {
        tagElement.remove();
    }
}

// 关闭创建任务模态框
function closeCreateTaskModal() {
    const modal = document.getElementById('create-task-modal');
    if (modal) {
        modal.style.display = 'none';
        // 重置表单
        document.getElementById('create-task-form').reset();
        // 清空标签
        document.getElementById('task-tags-preview').innerHTML = '';
    }
}

// 提交创建任务
async function submitCreateTask() {
    const form = document.getElementById('create-task-form');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    // 收集标签
    const tags = [];
    const tagElements = document.querySelectorAll('#task-tags-preview .tag-preview');
    tagElements.forEach(tagElement => {
        tags.push(tagElement.dataset.tag);
    });
    
    // 创建FormData对象
    const formData = new FormData();
    formData.append('title', document.getElementById('task-title').value);
    formData.append('description', document.getElementById('task-description').value);
    formData.append('assigneeId', document.getElementById('task-assignee').value);
    formData.append('priority', document.getElementById('task-priority').value);
    formData.append('tags', tags.join(','));
    formData.append('reward', document.getElementById('task-reward').value);
    formData.append('deadline', document.getElementById('task-deadline').value);
    
    try {
        console.log('开始创建任务，提交的数据:', {
            title: document.getElementById('task-title').value,
            description: document.getElementById('task-description').value,
            assigneeId: document.getElementById('task-assignee').value,
            priority: document.getElementById('task-priority').value,
            tags: tags.join(','),
            reward: document.getElementById('task-reward').value,
            deadline: document.getElementById('task-deadline').value
        });
        
        // 调用API创建任务
        console.log('发送任务创建请求到:', API_ENDPOINTS.createTask);
        const response = await apiRequest(API_ENDPOINTS.createTask, {
            method: 'POST',
            body: formData
        });
        
        console.log('任务创建成功，响应:', response);
        showNotification('任务发布成功！', 'success');
        closeCreateTaskModal();
        
        // 刷新任务列表
        console.log('开始刷新任务列表');
        await initTaskData();
        console.log('任务列表刷新完成');
        
    } catch (error) {
        console.error('任务创建失败:', error);
        showNotification('发布任务失败: ' + error.message, 'error');
    }
}

// 刷新任务列表
function refreshTasks() {
    // 显示加载指示器
    const refreshButton = document.getElementById('refresh-tasks');
    refreshButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

    // 模拟API调用延迟
    setTimeout(() => {
        // 恢复刷新按钮
        refreshButton.innerHTML = '<i class="fas fa-sync-alt"></i>';

        // 显示成功消息
        showNotification('任务列表已刷新！', 'success');
    }, 1000);
}

// 防抖函数
function debounce(func, wait) {
    let timeout;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}

// 添加CSS动画
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }

    .notification {
        font-family: 'Inter', sans-serif;
    }

    .notification-content {
        flex: 1;
    }

    .notification-close {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        font-size: 14px;
    }
`;
document.head.appendChild(style);

// 在 initTaskData 函数中修改任务数据处理部分
async function initTaskData() {
    try {
        console.log('Initializing task data...');

        // 先获取任务数据
        const tasksData = await fetchAllTasks();
        console.log('Raw tasks data:', tasksData);

        if (!tasksData || tasksData.length === 0) {
            console.warn('No tasks data received');
            showNotification('暂无任务数据', 'info');
            allTasks = [];
            filteredTasks = [];
        } else {
            // 处理任务数据
            allTasks = tasksData.map(task => {
                // 处理标签 - 确保正确解析标签数据
                let taskTags = [];
                if (task.tags) {
                    if (typeof task.tags === 'string') {
                        taskTags = task.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
                    } else if (Array.isArray(task.tags)) {
                        taskTags = task.tags;
                    }
                }

                // 处理任务状态映射
                const mappedStatus = mapTaskStatus(task.status);
                const mappedType = mapTaskType(task.type || 'main');
                const mappedPriority = mapTaskPriority(task.priority || 2);

                return {
                    element: null,
                    id: task.id,
                    title: task.title || '无标题',
                    description: task.description || '无描述',
                    status: mappedStatus,
                    type: mappedType,
                    priority: mappedPriority,
                    tags: taskTags,
                    reward: task.reward || 0,
                    deadline: task.end_time,
                    created: task.create_time,
                    progress: task.progress || 0,
                    assignee: task.assignee_name || task.assignee,
                    creator: task.creator_name,
                    rawData: task
                };
            });

            console.log('Processed tasks count:', allTasks.length);
            console.log('Sample task tags:', allTasks[0]?.tags);
            filteredTasks = [...allTasks];
        }

        // 初始化标签云（包含热门标签和所有标签）
        await updateTagCloud();

        // 计算总页数
        totalPages = Math.ceil(filteredTasks.length / pageSize);

        // 初始化任务元素
        initTaskElements();
        renderTasks();

        if (allTasks.length > 0) {
            showNotification(`成功加载 ${allTasks.length} 个任务`, 'success');
        }

    } catch (error) {
        console.error('初始化任务数据失败:', error);
        showNotification('初始化任务数据失败: ' + error.message, 'error');

        // 设置空数据状态
        allTasks = [];
        filteredTasks = [];
        totalPages = 1;

        // 确保标签云被初始化
        await updateTagCloud();
        initTaskElements();
        renderTasks();
    }
}

// 添加缺失的工具函数
function formatDateTime(dateTimeString) {
    if (!dateTimeString) return '-';
    try {
        const date = new Date(dateTimeString);
        return date.toLocaleString('zh-CN');
    } catch (e) {
        return dateTimeString;
    }
}

// 新增：初始化任务元素
function initTaskElements() {
    allTasks.forEach(task => {
        task.element = createTaskElement(task);
    });
}

// 新增：获取任务操作按钮HTML
function getTaskActionsHTML(task) {
    switch(task.status) {
        case 'not-started':
            return `
                <button class="btn btn-sm btn-primary accept-btn">
                    <i class="fas fa-check"></i> 接受任务
                </button>
                <button class="btn btn-sm btn-outline view-details-btn">
                    <i class="fas fa-eye"></i> 查看详情
                </button>
            `;
        case 'in-progress':
            return `
                <button class="btn btn-sm btn-primary update-progress-btn">
                    <i class="fas fa-edit"></i> 更新进度
                </button>
                <button class="btn btn-sm btn-success complete-btn">
                    <i class="fas fa-check"></i> 完成
                </button>
            `;
        case 'completed':
            return `<span class="text-green-600 font-medium"><i class="fas fa-check-circle mr-1"></i>已完成</span>`;
        default:
            return '';
    }
}

function formatDate(dateString) {
    if (!dateString) return '-';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('zh-CN');
    } catch (e) {
        return dateString;
    }
}

// 新增：获取优先级图标
function getPriorityIcon(priority) {
    const icons = {
        'critical': 'exclamation-circle',
        'high': 'arrow-up',
        'medium': 'minus',
        'low': 'arrow-down'
    };
    return icons[priority] || 'minus';
}

// 初始化分页
function initPagination() {
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');
    const pageSizeSelect = document.getElementById('page-size-select');

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderTasks();
                updatePagination();
            }
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                renderTasks();
                updatePagination();
            }
        });
    }

    if (pageSizeSelect) {
        pageSizeSelect.addEventListener('change', function() {
            pageSize = parseInt(this.value);
            currentPage = 1;
            totalPages = Math.ceil(filteredTasks.length / pageSize);
            renderTasks();
            updatePagination();
        });
    }

    updatePagination();
}

// 更新分页控件
function updatePagination() {
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');
    const pagesContainer = document.getElementById('pagination-pages');
    const pageInfo = document.getElementById('page-info');

    // 更新按钮状态
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;

    // 更新页码信息 - 添加任务总数信息
    const startIndex = (currentPage - 1) * pageSize + 1;
    const endIndex = Math.min(currentPage * pageSize, filteredTasks.length);
    pageInfo.textContent = `第 ${currentPage} 页，共 ${totalPages} 页 (${startIndex}-${endIndex} / ${filteredTasks.length} 个任务)`;

    // 生成页码按钮
    pagesContainer.innerHTML = '';

    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // 添加第一页和省略号
    if (startPage > 1) {
        addPageButton(pagesContainer, 1);
        if (startPage > 2) {
            const ellipsis = document.createElement('span');
            ellipsis.className = 'page-item';
            ellipsis.textContent = '...';
            pagesContainer.appendChild(ellipsis);
        }
    }

    // 添加页码按钮
    for (let i = startPage; i <= endPage; i++) {
        addPageButton(pagesContainer, i);
    }

    // 添加最后一页和省略号
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            const ellipsis = document.createElement('span');
            ellipsis.className = 'page-item';
            ellipsis.textContent = '...';
            pagesContainer.appendChild(ellipsis);
        }
        addPageButton(pagesContainer, totalPages);
    }
}

// 添加页码按钮
function addPageButton(container, pageNumber) {
    const pageItem = document.createElement('span');
    pageItem.className = `page-item ${pageNumber === currentPage ? 'active' : ''}`;
    pageItem.textContent = pageNumber;
    pageItem.addEventListener('click', () => {
        currentPage = pageNumber;
        renderTasks();
        updatePagination();
    });
    container.appendChild(pageItem);
}

// 修改：渲染任务列表
function renderTasks() {
    const taskListView = document.getElementById('task-list-view');

    // 清空当前任务列表
    taskListView.innerHTML = '';

    // 计算当前页的任务
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, filteredTasks.length);
    const currentTasks = filteredTasks.slice(startIndex, endIndex);

    console.log(`Rendering tasks: ${currentTasks.length} tasks on page ${currentPage}, total filtered: ${filteredTasks.length}, total all: ${allTasks.length}`);

    // 添加任务到列表
    currentTasks.forEach(task => {
        if (task.element) {
            taskListView.appendChild(task.element);

            // 重新绑定事件
            bindTaskEvents(task.element, task);
        }
    });

    // 如果没有任务，显示提示
    if (currentTasks.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'empty-state';
        emptyMessage.innerHTML = `
            <i class="fas fa-tasks" style="font-size: 3rem; color: #dee2e6; margin-bottom: 1rem;"></i>
            <h3>暂无任务</h3>
            <p>没有找到匹配的任务，请尝试调整筛选条件</p>
        `;
        taskListView.appendChild(emptyMessage);
    }
}

// 新增：绑定任务事件
function bindTaskEvents(taskElement, task) {
    const acceptBtn = taskElement.querySelector('.accept-btn');
    const viewDetailsBtn = taskElement.querySelector('.view-details-btn');
    const updateProgressBtn = taskElement.querySelector('.update-progress-btn');
    const completeBtn = taskElement.querySelector('.complete-btn');

    if (acceptBtn) {
        acceptBtn.addEventListener('click', () => acceptTask(taskElement, task));
    }

    if (viewDetailsBtn) {
        viewDetailsBtn.addEventListener('click', () => viewTaskDetails(taskElement, task));
    }

    if (updateProgressBtn) {
        updateProgressBtn.addEventListener('click', () => updateTaskProgress(taskElement, task));
    }

    if (completeBtn) {
        completeBtn.addEventListener('click', () => completeTask(taskElement, task));
    }

    // 绑定收藏和分享按钮
    initTaskActionsForElement(taskElement);
}

// 更新筛选信息显示
function updateFilterInfo() {
    const filterInfo = document.getElementById('filter-info');
    const activeFilterText = document.getElementById('active-filter-text');
    const selectedTagsContainer = document.getElementById('selected-tags');

    // 计算激活的筛选条件
    const activeStatusFilters = Array.from(document.querySelectorAll('.filter-item input[data-status]:checked'))
        .map(cb => {
            const status = cb.getAttribute('data-status');
            return { type: 'status', value: status, label: getStatusLabel(status) };
        });

    const activeTypeFilters = Array.from(document.querySelectorAll('.filter-item input[data-type]:checked'))
        .map(cb => {
            const type = cb.getAttribute('data-type');
            return { type: 'type', value: type, label: getTypeLabel(type) };
        });

    const activePriorityFilters = Array.from(document.querySelectorAll('.filter-item input[data-priority]:checked'))
        .map(cb => {
            const priority = cb.getAttribute('data-priority');
            return { type: 'priority', value: priority, label: getPriorityLabel(priority) };
        });

    const activeTagFiltersDisplay = activeTagFilters.map(tag => {
        return { type: 'tag', value: tag, label: tag };
    });

    const allActiveFilters = [...activeStatusFilters, ...activeTypeFilters, ...activePriorityFilters, ...activeTagFiltersDisplay];

    // 更新筛选信息文本
    if (allActiveFilters.length === 0) {
        activeFilterText.textContent = '无筛选条件';
        filterInfo.style.display = 'none';
    } else {
        activeFilterText.textContent = allActiveFilters.map(f => f.label).join(', ');
        filterInfo.style.display = 'flex';
    }

    // 更新选中的标签显示
    selectedTagsContainer.innerHTML = '';
    allActiveFilters.forEach(filter => {
        const tagElement = document.createElement('div');
        tagElement.className = 'selected-tag';
        tagElement.innerHTML = `
            ${filter.label}
            <span class="remove-tag" data-type="${filter.type}" data-value="${filter.value}">
                <i class="fas fa-times"></i>
            </span>
        `;
        selectedTagsContainer.appendChild(tagElement);
    });

    // 添加移除标签的事件监听
    document.querySelectorAll('.selected-tag .remove-tag').forEach(btn => {
        btn.addEventListener('click', function() {
            const type = this.getAttribute('data-type');
            const value = this.getAttribute('data-value');

            if (type === 'tag') {
                // 移除标签筛选
                document.querySelectorAll('.tag-cloud .task-tag').forEach(tag => {
                    if (tag.getAttribute('data-tag') === value) {
                        tag.classList.remove('active');
                    }
                });
                const index = activeTagFilters.indexOf(value);
                if (index > -1) {
                    activeTagFilters.splice(index, 1);
                }
            } else {
                // 移除复选框筛选
                document.querySelectorAll(`.filter-item input[data-${type}]`).forEach(cb => {
                    if (cb.getAttribute(`data-${type}`) === value) {
                        cb.checked = false;
                    }
                });
            }

            // 重新筛选任务
            filterTasks();
            updateFilterInfo();
        });
    });
}

// 新增：在任务卡片中显示标签
function createTaskElement(task) {
    const card = document.createElement('div');
    card.className = `task-card ${task.status}`;
    card.setAttribute('data-status', task.status);
    card.dataset.id = task.id;

    const statusLabels = {
        'not-started': '待接受',
        'in-progress': '进行中',
        'completed': '已完成'
    };

    const typeLabels = {
        'main-quest': '主线任务',
        'daily-quest': '日常任务',
        'bounty': '悬赏任务',
        'team': '团队任务'
    };

    const priorityIcons = {
        'critical': 'exclamation-circle',
        'high': 'arrow-up',
        'medium': 'minus',
        'low': 'arrow-down'
    };

    const priorityLabels = {
        'critical': '紧急',
        'high': '高',
        'medium': '中',
        'low': '低'
    };

    // 生成标签HTML
    let tagsHTML = '';
    if (task.tags && task.tags.length > 0) {
        tagsHTML = `
            <div class="task-tags">
                ${task.tags.map(tag => `<span class="task-tag-small">${tag}</span>`).join('')}
            </div>
        `;
    }

    card.innerHTML = `
        <div class="task-card-header">
            <div class="task-meta">
                <span class="task-type ${task.type}">${typeLabels[task.type] || task.type}</span>
                <span class="task-id">#T-${task.id}</span>
            </div>
            <div class="task-priority ${task.priority}">
                <i class="fas fa-${priorityIcons[task.priority]}"></i>
                ${priorityLabels[task.priority]}优先级
            </div>
        </div>
        
        <h3 class="task-title">
            <i class="fas fa-tasks"></i> 
            ${task.title}
        </h3>
        
        <p class="task-desc">${task.description}</p>
        
        ${tagsHTML}
        
        <div class="task-info">
            <div class="info-item">
                <i class="fas fa-gem"></i>
                <span>奖励: ${task.reward || 0}积分</span>
            </div>
            <div class="info-item">
                <i class="fas fa-user"></i>
                <span>负责人: ${task.assignee || '待分配'}</span>
            </div>
            <div class="info-item">
                <i class="fas fa-flag"></i>
                <span>状态: ${statusLabels[task.status]}</span>
            </div>
        </div>
        
        ${task.deadline ? `
        <div class="task-details">
            <div class="detail-item">
                <i class="fas fa-calendar-times"></i>
                <span class="detail-label">截止:</span>
                <span class="detail-value deadline">${formatDate(task.deadline)}</span>
            </div>
        </div>
        ` : ''}
        
        ${task.progress > 0 ? `
        <div class="task-progress">
            <div class="progress-info">
                <span>进度</span>
                <span>${task.progress}%</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${task.progress}%"></div>
            </div>
        </div>
        ` : ''}
        
        <div class="task-actions">
            ${getTaskActionsHTML(task)}
        </div>
    `;
    return card;
}

// 获取状态标签文本
function getStatusLabel(status) {
    const labels = {
        'not-started': '待接受',
        'in-progress': '进行中',
        'review': '待验收',
        'completed': '已完成'
    };
    return labels[status] || status;
}

// 获取类型标签文本
function getTypeLabel(type) {
    const labels = {
        'main-quest': '主线任务',
        'daily-quest': '日常任务',
        'bounty': '悬赏任务',
        'team': '团队任务'
    };
    return labels[type] || type;
}

// 获取优先级标签文本
function getPriorityLabel(priority) {
    const labels = {
        'critical': '紧急',
        'high': '高',
        'medium': '中',
        'low': '低'
    };
    return labels[priority] || priority;
}

// 增强筛选任务函数
function filterTasks() {
    // 获取选中的筛选条件
    const statusFilters = getSelectedFilters('data-status');
    const typeFilters = getSelectedFilters('data-type');
    const priorityFilters = getSelectedFilters('data-priority');

    // 更新全局筛选状态
    activeFilters = {
        status: statusFilters,
        type: typeFilters,
        priority: priorityFilters,
        tags: activeTagFilters
    };

    console.log('应用筛选条件:', activeFilters);
    console.log('激活的标签筛选:', activeTagFilters);

    // 筛选任务
    filteredTasks = allTasks.filter(task => {
        const statusMatch = statusFilters.length === 0 || statusFilters.includes(task.status);
        const typeMatch = typeFilters.length === 0 || typeFilters.includes(task.type);
        const priorityMatch = priorityFilters.length === 0 || priorityFilters.includes(task.priority);

        // 标签筛选逻辑：如果选择了标签，任务必须包含至少一个选中的标签
        let tagMatch = true;
        if (activeTagFilters.length > 0) {
            if (!task.tags || task.tags.length === 0) {
                tagMatch = false; // 任务没有标签，但用户选择了标签筛选
            } else {
                tagMatch = activeTagFilters.some(selectedTag =>
                    task.tags.includes(selectedTag)
                );
            }
            console.log(`任务 "${task.title}" 标签匹配结果:`, tagMatch, '任务标签:', task.tags, '筛选标签:', activeTagFilters);
        }

        const shouldInclude = statusMatch && typeMatch && priorityMatch && tagMatch;
        if (!shouldInclude) {
            console.log(`任务 "${task.title}" 被过滤掉:`, {
                statusMatch, typeMatch, priorityMatch, tagMatch
            });
        }

        return shouldInclude;
    });

    console.log(`筛选后任务数量: ${filteredTasks.length}`);

    // 排序任务
    sortTasks(sortField, sortAscending);

    // 更新分页信息
    totalPages = Math.ceil(filteredTasks.length / pageSize);
    if (currentPage > totalPages && totalPages > 0) {
        currentPage = totalPages;
    } else if (totalPages === 0) {
        currentPage = 1;
    }

    // 渲染任务
    renderTasks();
    updatePagination();
    updateFilterInfo();
}

// 增强发布任务功能
function initCreateTaskButton() {
    const createButton = document.getElementById('create-task-btn');
    const modal = document.getElementById('create-task-modal');
    const cancelButton = document.getElementById('cancel-create-task');
    const submitButton = document.getElementById('submit-create-task');
    const closeButton = modal.querySelector('.modal-close');
    const overlay = modal.querySelector('.modal-overlay');
    const tagsInput = document.getElementById('task-tags-input');
    const tagsPreview = document.getElementById('task-tags-preview');
    let tags = [];

    if (createButton) {
        createButton.addEventListener('click', function() {
            modal.style.display = 'flex';
        });
    }

    // 处理标签输入
    if (tagsInput) {
        tagsInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && this.value.trim()) {
                e.preventDefault();
                const tag = this.value.trim();
                if (!tags.includes(tag)) {
                    tags.push(tag);
                    updateTagsPreview();
                    this.value = '';
                }
            }
        });
    }

    // 更新标签预览
    function updateTagsPreview() {
        if (tagsPreview) {
            tagsPreview.innerHTML = '';
            tags.forEach(tag => {
                const tagElement = document.createElement('span');
                tagElement.className = 'tag';
                tagElement.innerHTML = `${tag} <span class="tag-remove" data-tag="${tag}">&times;</span>`;
                tagsPreview.appendChild(tagElement);
            });

            // 添加标签移除事件
            document.querySelectorAll('.tag-remove').forEach(removeBtn => {
                removeBtn.addEventListener('click', function() {
                    const tagToRemove = this.getAttribute('data-tag');
                    tags = tags.filter(tag => tag !== tagToRemove);
                    updateTagsPreview();
                });
            });
        }
    }

    // 关闭模态框
    function closeModal() {
        modal.style.display = 'none';
        document.getElementById('create-task-form').reset();
        const tagsPreview = document.getElementById('task-tags-preview');
        if (tagsPreview) {
            tagsPreview.innerHTML = '';
        }
    }

    if (cancelButton) {
        cancelButton.addEventListener('click', closeModal);
    }

    if (closeButton) {
        closeButton.addEventListener('click', closeModal);
    }

    if (overlay) {
        overlay.addEventListener('click', closeModal);
    }

    // 提交表单
    if (submitButton) {
        submitButton.addEventListener('click', function() {
            const title = document.getElementById('task-title').value;
            const description = document.getElementById('task-description').value;
            const type = document.getElementById('task-type').value;
            const priority = document.getElementById('task-priority').value;
            const reward = document.getElementById('task-reward').value;
            const deadline = document.getElementById('task-deadline').value;

            if (!title || !description || !type || !priority || !reward) {
                showNotification('请填写所有必填字段', 'error');
                return;
            }

            // 创建新任务
            createNewTask({
                title,
                description,
                type,
                priority,
                reward: parseInt(reward),
                deadline,
                tags
            });

            // 关闭模态框
            closeModal();

            // 显示成功消息
            showNotification('任务发布成功！', 'success');
        });
    }
}

// 创建新任务
function createNewTask(taskData) {
    // 生成任务ID（在实际应用中，这应该由后端生成）
    const taskId = `#T-${1000 + allTasks.length + 1}`;

    // 创建任务元素
    const taskElement = document.createElement('div');
    taskElement.className = `task-card available`;
    taskElement.setAttribute('data-status', 'not-started');

    // 获取类型标签文本
    const typeLabels = {
        'main-quest': '主线任务',
        'daily-quest': '日常任务',
        'bounty': '悬赏任务',
        'team': '团队任务'
    };

    // 获取优先级标签文本和图标
    const priorityData = {
        'critical': { label: '紧急', icon: 'exclamation-circle' },
        'high': { label: '高', icon: 'arrow-up' },
        'medium': { label: '中', icon: 'minus' },
        'low': { label: '低', icon: 'arrow-down' }
    };

    // 构建任务HTML
    taskElement.innerHTML = `
        <div class="task-card-header">
            <div class="task-meta">
                <span class="task-type ${taskData.type}">${typeLabels[taskData.type] || taskData.type}</span>
                <span class="task-id">${taskId}</span>
            </div>
            <div class="task-priority ${taskData.priority}">
                <i class="fas fa-${priorityData[taskData.priority].icon}"></i>
                ${priorityData[taskData.priority].label}优先级
            </div>
        </div>
        <h3 class="task-title"><i class="fas fa-tasks"></i> ${taskData.title}</h3>
        <p class="task-desc">${taskData.description}</p>
        <div class="task-info">
            <div class="info-item"><i class="fas fa-gem"></i><span>奖励: ${taskData.reward}积分</span></div>
            <div class="info-item"><i class="fas fa-history"></i><span>预计耗时: 待评估</span></div>
            <div class="info-item"><i class="fas fa-users"></i><span>需要: 相关人员</span></div>
        </div>
        ${taskData.deadline ? `
        <div class="task-details">
            <div class="detail-item"><i class="fas fa-flag"></i><span class="detail-label">截止:</span><span class="detail-value deadline">${taskData.deadline}</span></div>
        </div>
        ` : ''}
        <div class="task-actions">
            <button class="btn btn-sm btn-primary accept-btn"><i class="fas fa-check"></i> 接受任务</button>
            <button class="btn btn-sm btn-outline view-details-btn"><i class="fas fa-eye"></i> 查看详情</button>
            <div class="action-group">
                <button class="btn btn-sm btn-icon" title="收藏任务">
                    <i class="far fa-star"></i>
                </button>
                <button class="btn btn-sm btn-icon" title="分享任务">
                    <i class="fas fa-share-alt"></i>
                </button>
            </div>
        </div>
    `;

    // 创建任务数据对象
    const newTask = {
        element: taskElement,
        id: taskId,
        title: taskData.title,
        description: taskData.description,
        status: 'not-started',
        type: taskData.type,
        priority: taskData.priority,
        reward: taskData.reward,
        deadline: taskData.deadline,
        created: allTasks.length + 1
    };

    // 添加到任务数组
    allTasks.unshift(newTask);

    // 更新标签云
    updateTagCloud();

    // 重新应用筛选和排序
    filterTasks();

    // 初始化新任务的操作按钮
    const acceptBtn = taskElement.querySelector('.accept-btn');
    if (acceptBtn) {
        acceptBtn.addEventListener('click', function() {
            acceptTask(taskElement);
        });
    }

    const viewDetailsBtn = taskElement.querySelector('.view-details-btn');
    if (viewDetailsBtn) {
        viewDetailsBtn.addEventListener('click', function() {
            viewTaskDetails(taskElement);
        });
    }

    // 初始化收藏和分享按钮
    initTaskActionsForElement(taskElement);
}

// 为单个任务元素初始化操作按钮
function initTaskActionsForElement(taskElement) {
    const favoriteButtons = taskElement.querySelectorAll('.btn-icon .fa-star');
    favoriteButtons.forEach(button => {
        button.addEventListener('click', function() {
            this.classList.toggle('fas');
            this.classList.toggle('far');
            const isFavorite = this.classList.contains('fas');
            showNotification(isFavorite ? '已收藏任务' : '已取消收藏', 'success');
        });
    });

    const shareButtons = taskElement.querySelectorAll('.btn-icon .fa-share-alt');
    shareButtons.forEach(button => {
        button.addEventListener('click', function() {
            showNotification('分享功能已触发', 'info');
        });
    });
}

// 增强刷新功能
function initRefreshButton() {
    const refreshButton = document.getElementById('refresh-tasks');

    if (refreshButton) {
        refreshButton.addEventListener('click', function() {
            // 显示加载状态
            const originalHtml = this.innerHTML;
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            this.disabled = true;

            // 模拟刷新延迟
            setTimeout(() => {
                // 恢复按钮状态
                this.innerHTML = originalHtml;
                this.disabled = false;

                // 重新初始化任务数据
                initTaskData();

                // 重置筛选条件
                clearAllFilters();

                // 显示成功消息
                showNotification('任务列表已刷新！', 'success');
            }, 1000);
        });
    }
}
// 排名Tab切换
document.addEventListener('DOMContentLoaded', function () {
    const tabs = document.querySelectorAll('.ranking-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // 移除所有active
            document.querySelectorAll('.ranking-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.ranking-panel').forEach(p => p.classList.remove('active'));

            // 添加active到当前
            tab.classList.add('active');
            const target = tab.getAttribute('data-target');
            document.getElementById(target).classList.add('active');
        });
    });
});