import { API_ENDPOINTS, apiRequest } from '../../api-config.js';
import { showToast } from '../../toast.js';

// 全局变量
let allAnnouncements = [];
let filteredAnnouncements = [];
let currentPage = 1;
const itemsPerPage = 6;
let currentUser = null;

// DOM元素
const announcementsContainer = document.getElementById('announcements-container');
const paginationContainer = document.getElementById('pagination-container');
const searchInput = document.getElementById('announcement-search');
const clearSearchBtn = document.getElementById('clear-announcement-search');
const priorityFilter = document.getElementById('priority-filter');
const publisherFilter = document.getElementById('publisher-filter');
const timeFilter = document.getElementById('time-filter');
const userInfoElement = document.getElementById('userInfo');
const modal = document.getElementById('announcement-modal');
const modalClose = document.getElementById('modal-close');
const modalMarkRead = document.getElementById('modal-mark-read');

// 初始化函数
async function init() {
    // 检查用户登录状态
    await checkLoginStatus();

    // 加载公告数据
    await loadAnnouncements();

    // 设置事件监听器
    setupEventListeners();
}

// 检查用户登录状态
async function checkLoginStatus() {
    try {
        const userSession = localStorage.getItem('userSession');
        if (!userSession) {
            showToast('error', '请先登录', 2000, '/login/login.html');
            return;
        }

        const userData = JSON.parse(userSession);
        currentUser = userData;

        // 显示用户信息
        userInfoElement.textContent = `欢迎，${userData.username || userData.email}`;

    } catch (error) {
        console.error('检查登录状态失败:', error);
        showToast('error', '登录状态异常，请重新登录', 2000, '/login/login.html');
    }
}

// 加载公告数据
async function loadAnnouncements() {
    try {
        announcementsContainer.innerHTML = `
            <div class="loading">
                <div class="loading-spinner"></div>
            </div>
        `;

        // 直接获取列表而非分页结构
        const data = await apiRequest(`${API_ENDPOINTS.latestAnnouncements(100)}`);

        if (data && Array.isArray(data)) {
            allAnnouncements = data;
            // 提取发布者列表
            const publishers = [...new Set(allAnnouncements.map(a => a.publisher))];
            populatePublisherFilter(publishers);
            filterAndRenderAnnouncements();
        } else {
            showEmptyState('暂无公告');
        }
    } catch (error) {
        console.error('加载公告失败:', error);
        showToast('error', '加载公告失败: ' + error.message);
        showEmptyState('加载公告失败');
    }
}

// 填充发布者筛选器
function populatePublisherFilter(publishers) {
    // 清空现有选项（保留"全部发布者"）
    while (publisherFilter.options.length > 1) {
        publisherFilter.remove(1);
    }

    // 添加发布者选项
    publishers.forEach(publisher => {
        const option = document.createElement('option');
        option.value = publisher;
        option.textContent = publisher;
        publisherFilter.appendChild(option);
    });
}

// 筛选和渲染公告
function filterAndRenderAnnouncements() {
    // 获取筛选条件
    const priorityValue = priorityFilter.value;
    const publisherValue = publisherFilter.value;
    const timeValue = timeFilter.value;
    const searchTerm = searchInput.value.toLowerCase();

    // 筛选公告
    filteredAnnouncements = allAnnouncements.filter(announcement => {
        // 优先级筛选
        if (priorityValue !== 'all' && announcement.status != priorityValue) {
            return false;
        }

        // 发布者筛选
        if (publisherValue !== 'all' && announcement.publisher !== publisherValue) {
            return false;
        }

        // 时间筛选
        if (timeValue !== 'all') {
            const announcementTime = new Date(announcement.publishTime || announcement.createdAt);
            const now = new Date();

            if (timeValue === 'today') {
                const isToday = announcementTime.toDateString() === now.toDateString();
                if (!isToday) return false;
            } else if (timeValue === 'week') {
                const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                if (announcementTime < oneWeekAgo) return false;
            } else if (timeValue === 'month') {
                const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                if (announcementTime < oneMonthAgo) return false;
            }
        }

        // 搜索筛选
        if (searchTerm) {
            const titleMatch = announcement.title.toLowerCase().includes(searchTerm);
            const contentMatch = announcement.content.toLowerCase().includes(searchTerm);
            if (!titleMatch && !contentMatch) return false;
        }

        return true;
    });

    // 渲染公告和分页
    renderAnnouncements();
    renderPagination();
}

// 渲染公告列表
function renderAnnouncements() {
    if (filteredAnnouncements.length === 0) {
        showEmptyState('没有找到匹配的公告');
        return;
    }

    // 计算当前页的数据
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, filteredAnnouncements.length);
    const currentAnnouncements = filteredAnnouncements.slice(startIndex, endIndex);

    // 生成HTML
    const announcementsHTML = currentAnnouncements.map(announcement => {
        const timeAgo = formatTimeAgo(announcement.publishTime || announcement.createdAt);
        const priorityClass = getPriorityClass(announcement.status);
        const priorityText = getPriorityText(announcement.status);

        return `
            <div class="card" data-id="${announcement.id}" data-priority="${announcement.status}"
                 data-publisher="${announcement.publisher}" data-time="${timeAgo}">
                <div class="card-header">
                    <div>
                        <h3 class="card-title">${announcement.title}</h3>
                        <div class="meta-item">
                            <i class="fas fa-user"></i>
                            <span>${announcement.publisher}</span>
                        </div>
                    </div>
                    <span class="card-badge ${priorityClass}">${priorityText}</span>
                </div>

                <div class="card-meta">
                    <div class="meta-item">
                        <i class="fas fa-clock"></i>
                        <span>${timeAgo}</span>
                    </div>
                </div>

                <div class="card-content">
                    <p>${announcement.content}</p>
                </div>

                <div class="card-footer">
                    <div class="card-actions">
                        <button class="btn btn-outline mark-read-btn" data-id="${announcement.id}">
                            <i class="fas fa-check"></i>标记已读
                        </button>
                        <button class="btn btn-primary view-detail-btn" data-id="${announcement.id}">
                            <i class="fas fa-eye"></i>查看详情
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    announcementsContainer.innerHTML = announcementsHTML;

    // 添加事件监听器
    document.querySelectorAll('.view-detail-btn').forEach(btn => {
        btn.addEventListener('click', () => openAnnouncementDetail(btn.dataset.id));
    });

    document.querySelectorAll('.mark-read-btn').forEach(btn => {
        btn.addEventListener('click', () => markAsRead(btn.dataset.id));
    });
}

// 渲染分页控件
function renderPagination() {
    const totalPages = Math.ceil(filteredAnnouncements.length / itemsPerPage);

    if (totalPages <= 1) {
        paginationContainer.innerHTML = '';
        return;
    }

    let paginationHTML = '';

    // 上一页按钮
    paginationHTML += `
        <button class="pagination-item ${currentPage === 1 ? 'disabled' : ''}"
                ${currentPage === 1 ? 'disabled' : ''} data-page="${currentPage - 1}">
            <i class="fas fa-chevron-left"></i>
        </button>
    `;

    // 页码按钮
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <button class="pagination-item ${i === currentPage ? 'active' : ''}" data-page="${i}">
                ${i}
            </button>
        `;
    }

    // 下一页按钮
    paginationHTML += `
        <button class="pagination-item ${currentPage === totalPages ? 'disabled' : ''}"
                ${currentPage === totalPages ? 'disabled' : ''} data-page="${currentPage + 1}">
            <i class="fas fa-chevron-right"></i>
        </button>
    `;

    paginationContainer.innerHTML = paginationHTML;

    // 添加分页事件监听器
    paginationContainer.querySelectorAll('.pagination-item:not(.disabled)').forEach(item => {
        item.addEventListener('click', () => {
            currentPage = parseInt(item.dataset.page);
            renderAnnouncements();
            renderPagination();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });
}

// 显示空状态
function showEmptyState(message) {
    announcementsContainer.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-bell-slash"></i>
            <h3>${message}</h3>
            <p>暂时没有公告内容或筛选条件过于严格</p>
            <button class="btn btn-primary" id="reset-filters">重置筛选条件</button>
        </div>
    `;

    document.getElementById('reset-filters').addEventListener('click', resetFilters);
}

// 重置筛选条件
function resetFilters() {
    priorityFilter.value = 'all';
    publisherFilter.value = 'all';
    timeFilter.value = 'month';
    searchInput.value = '';
    clearSearchBtn.style.display = 'none';
    currentPage = 1;
    filterAndRenderAnnouncements();
}

// 打开公告详情
function openAnnouncementDetail(id) {
    const announcement = allAnnouncements.find(a => a.id == id);
    if (!announcement) return;

    const timeAgo = formatTimeAgo(announcement.publishTime || announcement.createdAt);
    const priorityClass = getPriorityClass(announcement.status);
    const priorityText = getPriorityText(announcement.status);

    // 填充模态框内容
    document.getElementById('modal-title').textContent = announcement.title;
    document.getElementById('modal-publisher').textContent = `发布者: ${announcement.publisher}`;
    document.getElementById('modal-time').textContent = `发布时间: ${timeAgo}`;

    const modalPriority = document.getElementById('modal-priority');
    modalPriority.textContent = priorityText;
    modalPriority.className = `card-badge ${priorityClass}`;

    document.getElementById('modal-content').innerHTML = `
        <p>${announcement.content}</p>
    `;

    // 设置标记已读按钮的数据ID
    modalMarkRead.dataset.id = id;

    // 显示模态框
    modal.style.display = 'flex';
}

// 标记公告为已读
function markAsRead(id) {
    const card = document.querySelector(`.card[data-id="${id}"]`);
    if (card) {
        card.style.opacity = '0.7';
        showToast('success', '已标记为已读');

        // 这里可以添加API调用，将公告标记为已读
        // apiRequest(`${API_ENDPOINTS.markAnnouncementRead(id)}`, { method: 'POST' });
    }
}

// 设置事件监听器
function setupEventListeners() {
    // 筛选条件变化
    priorityFilter.addEventListener('change', () => {
        currentPage = 1;
        filterAndRenderAnnouncements();
    });

    publisherFilter.addEventListener('change', () => {
        currentPage = 1;
        filterAndRenderAnnouncements();
    });

    timeFilter.addEventListener('change', () => {
        currentPage = 1;
        filterAndRenderAnnouncements();
    });

    // 搜索功能
    searchInput.addEventListener('input', () => {
        clearSearchBtn.style.display = searchInput.value ? 'block' : 'none';
        currentPage = 1;
        filterAndRenderAnnouncements();
    });

    clearSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        clearSearchBtn.style.display = 'none';
        currentPage = 1;
        filterAndRenderAnnouncements();
    });

    // 模态框关闭
    modalClose.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    // 模态框标记已读
    modalMarkRead.addEventListener('click', () => {
        const id = modalMarkRead.dataset.id;
        markAsRead(id);
        modal.style.display = 'none';
    });
}

// 工具函数：根据状态获取优先级CSS类
function getPriorityClass(status) {
    switch (parseInt(status)) {
        case 1: return 'badge-warning'; // 重要
        case 2: return 'badge-danger';  // 紧急
        case 3: return 'badge-danger';  // 危机
        default: return 'badge-primary'; // 一般
    }
}

// 工具函数：根据状态获取优先级文本
function getPriorityText(status) {
    switch (parseInt(status)) {
        case 1: return '重要';
        case 2: return '紧急';
        case 3: return '危机';
        default: return '一般';
    }
}

// 工具函数：格式化时间显示
function formatTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) {
        return '刚刚';
    } else if (diffMins < 60) {
        return `${diffMins}分钟前`;
    } else if (diffHours < 24) {
        return `${diffHours}小时前`;
    } else if (diffDays < 7) {
        return `${diffDays}天前`;
    } else {
        return date.toLocaleDateString();
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init);