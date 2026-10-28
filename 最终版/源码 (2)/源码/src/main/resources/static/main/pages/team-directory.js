// team-directory.js - 修复版本
import { apiRequest, API_ENDPOINTS } from '../../api-config.js';
import { showToast as toast } from '../../toast.js';

let currentPage = 1;
const pageSize = 20;
let currentKeyword = '';
let currentTeamId = null;
let isLoading = false;

// 获取用户所在团队
async function fetchMyTeams() {
  try {
    const teams = await apiRequest(API_ENDPOINTS.myTeams);
    return teams;
  } catch (error) {
    console.error('获取团队列表失败:', error);
    toast('获取团队列表失败', 'error');
    return [];
  }
}

// 添加团队选择器
async function renderTeamSelector() {
  const teams = await fetchMyTeams();
  const selector = document.getElementById('team-selector');
  const searchBox = document.getElementById('search-box');
  const noTeamMessage = document.getElementById('no-team-message');

  if (teams.length === 0) {
    selector.innerHTML = '<option value="">暂无团队，请先创建或加入团队</option>';
    searchBox.style.display = 'none';
    noTeamMessage.style.display = 'block';
    document.getElementById('member-grid').innerHTML = '<div class="empty-state"><i class="fas fa-users"></i><p>暂无团队，请先创建或加入团队</p></div>';
    return;
  }

  let options = '<option value="">选择团队...</option>';
  teams.forEach(team => {
    options += `<option value="${team.id}">${team.name}</option>`;
  });

  selector.innerHTML = options;
  searchBox.style.display = 'block';
  noTeamMessage.style.display = 'none';

  // 默认选择第一个团队
  if (teams.length > 0) {
    currentTeamId = teams[0].id;
    selector.value = currentTeamId;
    await loadMembers();
  }
}

// 获取团队成员数据
async function fetchTeamMembers(teamId, keyword = '', page = 1) {
  if (!teamId) {
    return { members: [], totalCount: 0, totalPages: 0 };
  }

  try {
    const params = new URLSearchParams({
      keyword,
      page: page.toString(),
      size: pageSize.toString()
    });

    const url = `${API_ENDPOINTS.teamMembers(teamId)}?${params}`;
    const response = await apiRequest(url);
    return response || { members: [], totalCount: 0, totalPages: 0 };
  } catch (error) {
    console.error('获取团队成员失败:', error);
    toast('获取团队成员失败', 'error');
    return { members: [], totalCount: 0, totalPages: 0 };
  }
}

// 渲染成员列表 - 修复版本
function renderMembers(response) {
  const box = document.getElementById('member-grid');
  const members = response.members || [];

  if (currentPage === 1) {
    box.innerHTML = '';
  }

  if (members.length === 0 && currentPage === 1) {
    box.innerHTML = '<div class="empty-state"><i class="fas fa-users"></i><p>暂无团队成员数据</p></div>';
    return;
  }

  members.forEach(member => {
    // 确保用户信息存在，处理可能的null值
    const user = member.user || {};
    const username = user.username || '未命名用户';
    const email = user.email || '未设置邮箱';
    const contactInfo = user.contactInfo || '未设置联系方式';
    const position = user.position || '未设置职位';
    const avatar = user.avatar || '/static/images/default-avatar.jpg';
    const role = member.role || '成员';

    box.insertAdjacentHTML('beforeend', `
      <div class="member-card">
        <div class="member-avatar">
          <img src="${avatar}" alt="${username}" onerror="this.src='/static/images/default-avatar.jpg'">
        </div>
        <h3>${username}</h3>
        <p class="member-position">${position}</p>
        <p class="member-role">${role}</p>
        <div class="member-contact"><i class="fas fa-envelope"></i> ${email}</div>
        <div class="member-contact"><i class="fas fa-phone"></i> ${contactInfo}</div>
        <div class="member-actions">
          <button class="btn btn-outline btn-sm" onclick="sendMessage(${user.id || 0})"><i class="fas fa-comment"></i> 发消息</button>
          <button class="btn btn-outline btn-sm" onclick="viewMemberDetail(${member.id})"><i class="fas fa-eye"></i> 查看详情</button>
        </div>
      </div>
    `);
  });

  // 更新分页信息
  window.totalPages = response.totalPages || 1;
}

// 查看成员详情
// 查看成员详情
async function viewMemberDetail(userId) {
  if (!currentTeamId) {
    toast('请先选择团队', 'error');
    return;
  }

  try {
    const member = await apiRequest(API_ENDPOINTS.memberDetail(currentTeamId, userId));
    if (member && member.user) { // 添加更严格的检查
      openMemberDetailModal(member);
    } else {
      toast('成员不存在或已被移除', 'error');
    }
  } catch (error) {
    console.error('获取成员详情失败:', error);
    toast('获取成员详情失败', 'error');
  }
}

// 发送消息
function sendMessage(userId) {
  // 实际应用中这里会打开聊天窗口
}

// 搜索处理
function handleSearch() {
  const keyword = document.getElementById('member-search').value;
  currentKeyword = keyword;
  currentPage = 1;
  loadMembers();
}

// 加载更多成员
async function loadMoreMembers() {
  if (isLoading) return;

  if (currentPage >= window.totalPages) {
    return;
  }

  isLoading = true;
  currentPage++;
  const response = await fetchTeamMembers(currentTeamId, currentKeyword, currentPage);

  if (response.members && response.members.length > 0) {
    renderMembers(response);
  } else {
    currentPage--;
    toast('没有更多成员了', 'info');
  }

  isLoading = false;
}

// 修改加载成员的函数
async function loadMembers() {
  if (!currentTeamId) {
    document.getElementById('member-grid').innerHTML = '<div class="empty-state"><i class="fas fa-users"></i><p>请先选择团队</p></div>';
    return;
  }

  const memberGrid = document.getElementById('member-grid');
  memberGrid.innerHTML = '<div class="skeleton-container"><div class="skeleton" style="width:100%;height:200px;border-radius:var(--radius)"></div></div>';

  const response = await fetchTeamMembers(currentTeamId, currentKeyword, currentPage);
  renderMembers(response);
}

// 打开成员详情模态框 - 更新版本
function openMemberDetailModal(member) {

  // 添加null检查
  if (!member) {
    toast('成员信息加载失败', 'error');
    return;
  }

  const user = member.user || {};
  const username = user.username || '未命名用户';
  const email = user.email || '未设置邮箱';
  const contactInfo = user.contactInfo || '未设置联系方式';
  const position = user.position || '未设置职位';
  const avatar = user.avatar || '/static/images/default-avatar.jpg';
  const role = member.role || '成员';
  const joinDate = member.joinedAt ? new Date(member.joinedAt).toLocaleDateString() : '未知';
  const userId = user.id || 0;

  // 更新模态框内容
  document.getElementById('detail-avatar').src = avatar;
  document.getElementById('detail-username').textContent = username;
  document.getElementById('detail-role').textContent = role;
  document.getElementById('detail-position').textContent = position;
  document.getElementById('detail-email').textContent = email;
  document.getElementById('detail-contact').textContent = contactInfo;
  document.getElementById('detail-join-date').textContent = joinDate;

  // 更新发送消息按钮的事件
  const sendMessageBtn = document.getElementById('detail-send-message-btn');
  sendMessageBtn.onclick = () => sendMessage(userId);

  // 显示模态框
  document.getElementById('member-detail-modal').style.display = 'flex';

  // 添加动画类
  setTimeout(() => {
    document.getElementById('member-detail-modal').classList.add('active');
  }, 10);
}

// 关闭模态框
function closeModal() {
  const modal = document.getElementById('member-detail-modal');
  if (modal) {
    modal.classList.remove('active');
    setTimeout(() => {
      modal.style.display = 'none';
    }, 300); // 等待动画完成
  }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  renderTeamSelector();

  document.getElementById('team-selector').addEventListener('change', (e) => {
    currentTeamId = e.target.value;
    currentPage = 1;
    loadMembers();
  });

  const searchInput = document.getElementById('member-search');
  let searchTimeout;
  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(handleSearch, 500);
  });

  // 添加无限滚动
  window.addEventListener('scroll', () => {
    if (isLoading) return;

    const scrollHeight = document.documentElement.scrollHeight;
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    const clientHeight = document.documentElement.clientHeight;

    if (scrollTop + clientHeight >= scrollHeight - 100) {
      loadMoreMembers();
    }
  });
});

// 全局函数声明
window.viewMemberDetail = viewMemberDetail;
window.sendMessage = sendMessage;
window.openMemberDetailModal = openMemberDetailModal;
window.closeModal = closeModal;