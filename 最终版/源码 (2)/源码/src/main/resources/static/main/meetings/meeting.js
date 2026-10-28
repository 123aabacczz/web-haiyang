// 添加导入语句
import { API_BASE_URL, apiRequest } from '../../api-config.js';
import { showToast } from '../../toast.js';

    // 添加用户会话检查
    let currentUser = null;

// 检查用户登录状态
async function checkUserSession() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/current-user`, {
            credentials: 'include'
        });

        if (response.ok) {
            const userData = await response.json();
            currentUser = userData;
            return true;
        } else {
            showToast('error', '请先登录系统');
            setTimeout(() => {
                window.location.href = '../login/login.html';
            }, 1500);
            return false;
        }
    } catch (error) {
        console.error('检查会话失败:', error);
        showToast('error', '网络错误，请检查连接');
        return false;
    }
}

    // 获取会议数据
    async function fetchMeetings() {
        try {
            const data = await apiRequest(`${API_BASE_URL}/api/home-info/meetings`);
            // 检查返回的数据结构，提取会议列表
            if (data && data.items) {
                return data.items; // 返回分页数据中的items列表
            } else if (data && data.list) {
                return data.list; // 兼容其他可能的字段名
            } else if (Array.isArray(data)) {
                return data; // 如果直接返回数组，则直接返回
            } else {
                console.error('无效的会议数据格式:', data);
                showToast('error', '会议数据格式错误');
                return [];
            }
        } catch (error) {
            console.error('获取会议数据失败:', error);
            showToast('error', '获取会议数据失败');
            return [];
        }
    }

    // 渲染会议卡片
    function renderMeetings(meetings) {
        const contentGrid = document.querySelector('.content-grid');
        contentGrid.innerHTML = '';

        if (meetings.length === 0) {
            contentGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-calendar-times"></i>
                    <h3>暂无会议数据</h3>
                    <p>当前没有可显示的会议信息</p>
                </div>
            `;
            return;
        }

        meetings.forEach(meeting => {
            const statusMap = {
                0: { text: '待审核', class: 'badge-warning' },
                1: { text: '未开始', class: 'badge-primary' },
                2: { text: '进行中', class: 'badge-success' },
                3: { text: '已结束', class: 'badge-secondary' },
                4: { text: '已取消', class: 'badge-danger' }
            };

            const status = statusMap[meeting.status] || statusMap[0];
            const meetingTime = new Date(meeting.meetingTime);
            const formattedTime = formatMeetingTime(meetingTime);

            const card = document.createElement('div');
            card.className = 'card';
            card.dataset.status = meeting.status;
            card.dataset.type = meeting.type || 'internal';
            card.dataset.timeRange = getTimeRange(meetingTime);

            card.innerHTML = `
                <div class="card-header">
                    <div>
                        <h3 class="card-title">${meeting.title}</h3>
                        <div class="meta-item">
                            <i class="fas fa-user"></i>
                            <span>${meeting.organizer}</span>
                        </div>
                    </div>
                    <span class="card-badge ${status.class}">${status.text}</span>
                </div>
                <div class="card-meta">
                    <div class="meta-item">
                        <i class="fas fa-clock"></i>
                        <span>${formattedTime}</span>
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${meeting.location || '线上会议'}</span>
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-users"></i>
                        <span>${meeting.participants || 0}人参与</span>
                    </div>
                </div>
                <div class="card-content">
                    <p>${meeting.content || '暂无详细描述'}</p>
                </div>
                <div class="card-footer">
                    <div class="card-actions">
                        <button class="btn btn-outline add-to-calendar" data-meeting='${JSON.stringify(meeting)}'>
                            <i class="fas fa-calendar-plus"></i>添加到日历
                        </button>
                        ${meeting.status === 2 ?
                            `<a href="${meeting.meetingLink || '#'}" class="btn btn-success" target="_blank">
                                <i class="fas fa-video"></i>立即加入
                            </a>` :
                            `<button class="btn btn-primary" disabled>
                                <i class="fas fa-video"></i>加入会议
                            </button>`
                        }
                    </div>
                </div>
            `;

            contentGrid.appendChild(card);
        });

        // 添加日历事件监听
        attachCalendarEventListeners();
    }

    // 辅助函数：格式化会议时间
    function formatMeetingTime(date) {
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
    }

    // 辅助函数：确定时间范围
    function getTimeRange(date) {
        const now = new Date();
        const diffTime = date.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return 'past';
        if (diffDays === 0) return 'today';
        if (diffDays <= 7) return 'week';
        if (diffDays <= 30) return 'month';
        return 'future';
    }

    // 添加到日历功能
    function attachCalendarEventListeners() {
        document.querySelectorAll('.add-to-calendar').forEach(button => {
            button.addEventListener('click', function() {
                const meeting = JSON.parse(this.dataset.meeting);
                // 这里可以集成真实的日历API
                showToast('success', '已添加到日历');
            });
        });
    }

    // 初始化筛选和搜索功能
    function initializeFiltersAndSearch() {
        const meetingSearch = document.getElementById('meeting-search');
        const clearMeetingSearch = document.getElementById('clear-meeting-search');
        const timeRangeFilter = document.getElementById('time-range-filter');
        const typeFilter = document.getElementById('type-filter');
        const statusFilter = document.getElementById('status-filter');
        const meetingCards = document.querySelectorAll('.card');

        // 清除搜索按钮
        clearMeetingSearch.addEventListener('click', function() {
            meetingSearch.value = '';
            this.style.display = 'none';
            filterMeetings();
        });

        // 搜索框输入事件
        meetingSearch.addEventListener('input', function() {
            clearMeetingSearch.style.display = this.value ? 'block' : 'none';
            filterMeetings();
        });

        // 筛选条件变化事件
        timeRangeFilter.addEventListener('change', filterMeetings);
        typeFilter.addEventListener('change', filterMeetings);
        statusFilter.addEventListener('change', filterMeetings);

        // 筛选会议函数
        function filterMeetings() {
            const searchTerm = meetingSearch.value.toLowerCase();
            const timeRangeValue = timeRangeFilter.value;
            const typeValue = typeFilter.value;
            const statusValue = statusFilter.value;

            let hasVisibleCards = false;

            meetingCards.forEach(card => {
                const title = card.querySelector('.card-title').textContent.toLowerCase();
                const content = card.querySelector('.card-content').textContent.toLowerCase();
                const cardTimeRange = card.dataset.timeRange || '';
                const cardType = card.dataset.type || '';
                const cardStatus = card.dataset.status || '';

                const matchesSearch = title.includes(searchTerm) || content.includes(searchTerm);
                const matchesTime = timeRangeValue === 'all' || cardTimeRange === timeRangeValue;
                const matchesType = typeValue === 'all' || cardType === typeValue;
                const matchesStatus = statusValue === 'all' || cardStatus === statusValue;

                if (matchesSearch && matchesTime && matchesType && matchesStatus) {
                    card.style.display = 'block';
                    hasVisibleCards = true;
                } else {
                    card.style.display = 'none';
                }
            });

            let emptyState = document.querySelector('.empty-state');
            if (!hasVisibleCards) {
                if (!emptyState) {
                    emptyState = document.createElement('div');
                    emptyState.className = 'empty-state';
                    emptyState.innerHTML = `
                        <i class="fas fa-calendar-times"></i>
                        <h3>重要筛选条件</h3>
                        <p>没有找到匹配的会议</p>
                        <button class="btn btn-primary" id="reset-filters">重置筛选条件</button>
                    `;
                    document.querySelector('.content-grid').appendChild(emptyState);

                    document.getElementById('reset-filters').addEventListener('click', function() {
                        meetingSearch.value = '';
                        clearMeetingSearch.style.display = 'none';
                        timeRangeFilter.value = 'month';
                        typeFilter.value = 'all';
                        statusFilter.value = 'all';
                        filterMeetings();
                    });
                }
            } else if (emptyState) {
                emptyState.remove();
            }
        }
    }

    // 主执行函数
    async function initMeetingsPage() {
        // 检查用户会话
        const isLoggedIn = await checkUserSession();
        if (!isLoggedIn) return;

        // 获取并渲染会议数据
        const meetings = await fetchMeetings();
        renderMeetings(meetings);

        // 初始化筛选和搜索
        initializeFiltersAndSearch();
    }

    // 页面加载完成后初始化
    document.addEventListener('DOMContentLoaded', initMeetingsPage);