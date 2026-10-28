// api-config.js

export const API_BASE_URL = 'http://localhost:8080';

export const API_ENDPOINTS = {
  // 认证相关
  login: `${API_BASE_URL}/api/login`,
  register: `${API_BASE_URL}/api/register`,
  forgotPassword: `${API_BASE_URL}/api/forgot-password`,
  userLogout: `${API_BASE_URL}/api/logout`,
  currentUser: `${API_BASE_URL}/api/current-user`,
  
  // 管理员相关
  adminLogout: `${API_BASE_URL}/api/admin/logout`,
  adminLogin: `${API_BASE_URL}/api/admin/login`,
  currentAdmin: `${API_BASE_URL}/api/admin/current-admin`,
  approveUser: `${API_BASE_URL}/api/admin/approve-user`,
  rejectUser: `${API_BASE_URL}/api/admin/reject-user`,
  allUsers: `${API_BASE_URL}/api/admin/users`,
  activityLogs: `${API_BASE_URL}/api/activity/activity-logs`,
  dashboardStats: `${API_BASE_URL}/api/admin/dashboard-stats`,
  recentActivities: `${API_BASE_URL}/api/admin/recent-activities`,
  permissions: `${API_BASE_URL}/api/admin/permissions`,
  materials: `${API_BASE_URL}/api/admin/materials`,
  notifications: `${API_BASE_URL}/api/admin/notifications`,
  pendingMaterials: `${API_BASE_URL}/api/admin/materials/pending`,
  pendingUsers: `${API_BASE_URL}/api/admin/pending-users`,
  materialUpload: `${API_BASE_URL}/api/admin/materials/upload`,
  
  // 通知相关
  notificationsToday: `${API_BASE_URL}/api/notifications/today`,
  markNotificationRead: (id) => `${API_BASE_URL}/api/notifications/${id}/read`,
  markTodayRead: `${API_BASE_URL}/api/notifications/today/read-all`,
  notificationsByType: (type) => `${API_BASE_URL}/api/notifications/${type}`,
  unreadCount: `${API_BASE_URL}/api/notifications/unread-count`,
  userLevelUps: `${API_BASE_URL}/api/notifications/level-ups`,
  
  // 首页数据
  importantAnnouncements: `${API_BASE_URL}/api/home-info/announcements/important`,
  latestAnnouncements: (count) => `${API_BASE_URL}/api/home-info/announcements/latest?count=${count}`,
  recentMeetings: `${API_BASE_URL}/api/home-info/meetings/recent`,
  recentTasks: `${API_BASE_URL}/api/tasks/recent`,
  
  // 项目文档
  projectDocs: `${API_BASE_URL}/api/admin/materials/public`,
  downloadDoc: (id) => `${API_BASE_URL}/api/admin/materials/${id}/download`,
  projectDocsLarge: `${API_BASE_URL}/api/admin/materials/public?size=10000`,
  
  // 视频相关
  videos: `${API_BASE_URL}/api/videos`,
  
  // 个人中心
  personalProfile: `${API_BASE_URL}/api/personal-center/profile`,
  
  // 管理员任务相关
  adminTasks: `${API_BASE_URL}/api/admin/tasks`,
  adminTaskDetail: (id) => `${API_BASE_URL}/api/admin/tasks/${id}`,
  adminTaskReview: (id) => `${API_BASE_URL}/api/admin/tasks/${id}/review`,
  adminTasksPending: `${API_BASE_URL}/api/admin/tasks/pending`,
  adminTaskAssignees: `${API_BASE_URL}/api/tasks/assignees`,
  
  // 管理员材料相关
  adminMaterialApprove: (id) => `${API_BASE_URL}/api/admin/materials/${id}/approve`,
  adminMaterialReject: (id) => `${API_BASE_URL}/api/admin/materials/${id}/reject`,
  adminMaterialPreview: (id) => `${API_BASE_URL}/api/admin/materials/${id}/preview`,
  
  // 管理员仪表板相关
  adminDashboardRecentActivities: (limit) => `${API_BASE_URL}/api/admin/dashboard/recent-activities?limit=${limit}`,
  adminDashboardActivityLogs: `${API_BASE_URL}/api/admin/dashboard/activity-logs`,
  
  // 管理员用户相关
  adminUserDetail: (id) => `${API_BASE_URL}/api/admin/users/${id}`,
  
  // 通知相关
  notificationRegister: `${API_BASE_URL}/api/notifications/REGISTER`,
  markNotificationRead: (id) => `${API_BASE_URL}/api/notifications/${id}/read`,
  
  // 报告相关
  reportManagement: {
    all: `${API_BASE_URL}/api/admin/home-info/reports`,
    pending: `${API_BASE_URL}/api/admin/home-info/reports/pending`,
    approve: (id) => `${API_BASE_URL}/api/admin/home-info/reports/${id}/review`,
    reject: (id) => `${API_BASE_URL}/api/admin/home-info/reports/${id}/review`
  },
  reportMetrics: `${API_BASE_URL}/api/reports/metrics`,
  reportCharts: `${API_BASE_URL}/api/reports/charts`,
  userReports: `${API_BASE_URL}/api/reports/my-reports`,
  createReport: `${API_BASE_URL}/api/reports`,
  getReport: (id) => `${API_BASE_URL}/api/reports/${id}`,
  
  // 项目相关
  myProjects: `${API_BASE_URL}/api/projects/my-projects`,
  
  // 用户相关
  userSettings: (userId) => `${API_BASE_URL}/api/user/${userId}/settings`,
  updateProfile: (userId) => `${API_BASE_URL}/api/user/${userId}/profile`,
  updatePassword: (userId) => `${API_BASE_URL}/api/user/${userId}/password`,
  updateNotificationSettings: (userId) => `${API_BASE_URL}/api/user/${userId}/notifications`,
  userDevices: (userId) => `${API_BASE_URL}/api/user/${userId}/devices`,
  loginHistory: (userId) => `${API_BASE_URL}/api/user/${userId}/login-history`,
  logoutDevice: (userId, deviceId) => `${API_BASE_URL}/api/user/${userId}/devices/${deviceId}`,
  exportData: (userId) => `${API_BASE_URL}/api/user/${userId}/export`,
  
  // 公告相关
  markAnnouncementRead: (id) => `${API_BASE_URL}/api/announcements/${id}/read`,
  
  // 日程相关
  schedules: `${API_BASE_URL}/api/schedules`,
  upcomingSchedules: (limit) => `${API_BASE_URL}/api/schedules/upcoming?limit=${limit}`,
  
  // 任务相关
  tasks: `${API_BASE_URL}/api/tasks`,
  acceptTask: (taskId) => `${API_BASE_URL}/api/tasks/${taskId}/accept`,
  updateTaskProgress: (taskId) => `${API_BASE_URL}/api/tasks/${taskId}/progress`,
  completeTask: (taskId) => `${API_BASE_URL}/api/tasks/${taskId}/complete`,
  createTask: `${API_BASE_URL}/api/tasks`,
  userTasks: `${API_BASE_URL}/api/user/tasks/my-tasks`,
  
  // 快速创建
  quickCreate: {
    document: `${API_BASE_URL}/api/quick-create/documents`,
    project: `${API_BASE_URL}/api/quick-create/projects`,
    invite: `${API_BASE_URL}/api/quick-create/invites`,
    report: `${API_BASE_URL}/api/quick-create/reports`
  },
  
  // 标签相关
  tags: `${API_BASE_URL}/api/tags`,
  popularTags: `${API_BASE_URL}/api/tags/popular`,
  taskTagStats: `${API_BASE_URL}/api/task_tag_stats`,
  taskTagRelations: `${API_BASE_URL}/api/task-tag-relations`,
  taskTags: (taskId) => `${API_BASE_URL}/api/tasks/${taskId}/tags`,
  
  // WebSocket
  wsNotifications: () => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = new URL(API_BASE_URL).host;
    return `${protocol}//${host}/ws/notifications`;
  },
  
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
  },

  // 组织架构相关
  organizationStructure: `${API_BASE_URL}/api/organization/structure`,
  organizationDetails: (orgId) => `${API_BASE_URL}/api/organization/structure/${orgId}`,
  organizationMembers: (orgId) => `${API_BASE_URL}/api/organization-members/org/${orgId}`,
  
  // 团队相关
  myTeams: `${API_BASE_URL}/api/teams/my-teams`,
  teamDetail: (teamId) => `${API_BASE_URL}/api/teams/${teamId}`,
  teamDetails: (teamId) => `${API_BASE_URL}/api/team-details/team/${teamId}`,
  teamMembers: (teamId) => `${API_BASE_URL}/api/teams/${teamId}/members`,
  memberDetail: (teamId, memberId) => `${API_BASE_URL}/api/teams/${teamId}/members/${memberId}`,
  teamActivities: (teamId) => `${API_BASE_URL}/api/team-activities/team/${teamId}`,
  teamSettings: (teamId) => `${API_BASE_URL}/api/team-settings/team/${teamId}`,
  createTeam: `${API_BASE_URL}/api/teams`,
  joinTeam: `${API_BASE_URL}/api/teams/join`,
  disbandTeam: (teamId) => `${API_BASE_URL}/api/teams/${teamId}`,
  joinableTeams: `${API_BASE_URL}/api/teams/joinable`
};

export async function apiRequest(url, options = {}) {
  // 根据body类型设置默认头
  let headers = { 'Accept': 'application/json' };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const defaultOptions = {
    headers: headers,
    credentials: 'include', // 确保默认包含credentials
    ...options
  };

  if (defaultOptions.body && typeof defaultOptions.body === 'object' && !(defaultOptions.body instanceof FormData)) {
      defaultOptions.body = JSON.stringify(defaultOptions.body);
  }

    try {
        const response = await fetch(url, defaultOptions);
        const contentType = response.headers.get('content-type');

        // 处理204 No Content等空响应
        if (response.status === 204) {
            return null;
        }

        // 在错误处理部分添加401特殊处理
        if (!response.ok) {
            // 处理401未授权错误 - 针对通知接口的特殊处理
            if (response.status === 401 && url.includes('/notifications/')) {
                console.warn('通知接口认证失败，可能会话已过期');
                return 0; // 返回默认值而不是抛出错误
            }

            // 处理其他401错误
            if (response.status === 401) {
                // 清除本地存储
                localStorage.removeItem('userSession');
                localStorage.removeItem('adminSession');

                // 显示提示信息
                try {
                    const { showToast } = await import('./toast.js');
                    showToast('info', '请重新登录');
                } catch (e) {
                    console.warn('无法加载toast模块，使用alert代替');
                    alert('请重新登录');
                }

                // 使用正确的路径跳转到登录页（绝对路径，避免相对路径解析成不存在的 /main/login/login.html）
                setTimeout(() => {
                    window.location.href = '/login/login.html';
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
                // 忽略解析错误
            }
            throw new Error(errorMessage);
        }

    // 先获取文本内容
    const textResponse = await response.text();

try {
  const jsonResponse = JSON.parse(textResponse);

  // 如果是 ApiResponse 结构，提取 data 字段
    if (jsonResponse && typeof jsonResponse === 'object') {
        // 如果是错误响应，抛出错误
        if (!jsonResponse.success && jsonResponse.message) {
            throw new Error(jsonResponse.message);
        }
        if ('data' in jsonResponse) {
          return jsonResponse.data; // 直接返回 data 字段
        }
        // 如果没有data字段但包含items字段（分页响应）
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


