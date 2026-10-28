import { apiRequest, API_ENDPOINTS } from '../../api-config.js';
import { showToast } from '../../toast.js';

// 全局变量
let editingEventId = null;
let isEditMode = false;

// 在文件顶部添加全局变量
let currentUser = null;

// 添加用户会话验证函数（与main.js保持一致）
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

        // 设置当前用户信息
        currentUser = {
            id: session.userId || session.id,
            username: session.username,
            userLevel: session.userLevel || session.adminLevel
        };

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

// 日程中心功能实现
document.addEventListener('DOMContentLoaded', async function() {
    // 先检查登录状态（使用与main.js相同的会话检查逻辑）
    const isValid = await checkUserSession();
    if (!isValid) {
        return;
    }

    // 初始化日历和功能
    initCalendar();
    initViewSwitcher();
    initDateNavigation();
    initFilterFunctionality();
    initEventCreation();
    updateCurrentDate();
    loadUpcomingEvents();
});

// 初始化日历
function initCalendar() {
    const calendarEl = document.getElementById('calendar');
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        headerToolbar: false,
        timeZone: 'local',
        locale: 'zh-cn',
        firstDay: 1,
        dayMaxEvents: 3,
        eventDisplay: 'block',
        events: function(fetchInfo, successCallback, failureCallback) {
            // 从后端获取事件数据
            loadCalendarEvents(fetchInfo.start, fetchInfo.end)
                .then(events => successCallback(events))
                .catch(error => {
                    console.error('Failed to load events:', error);
                    failureCallback(error);
                });
        },
        eventClick: function(info) {
            showEventDetails(info.event);
        },
        datesSet: function(info) {
            updatePeriodDisplay(info.view);
        }
    });

    calendar.render();
    window.calendar = calendar;
}

// 从后端加载日历事件
async function loadCalendarEvents(start, end) {
    try {
        // 检查登录状态
        if (!currentUser) {
            const isLoggedIn = await checkLoginStatus();
            if (!isLoggedIn) return [];
        }

        const params = new URLSearchParams({
            start: start.toISOString(),
            end: end.toISOString()
            // 移除 userId 参数
        });

        const response = await apiRequest(`${API_ENDPOINTS.schedules}?${params}`);

        // 处理401未授权错误
        if (response && response.code === 401) {
            showToast('error', '请重新登录', 2000, '/login/login.html');
            return [];
        }

        // 确保从响应中获取 data 字段
        const events = response.data || response;
        return (Array.isArray(events) ? events : []).map(event => ({
            id: event.id,
            title: event.title,
            start: event.startTime,
            end: event.endTime,
            allDay: event.allDay,
            extendedProps: {
                type: event.type,
                location: event.location,
                description: event.description
            },
            classNames: [`fc-event-${event.type}`]
        }));
    } catch (error) {
        console.error('Error loading calendar events:', error);
        showToast('error', '加载日程失败');
        return [];
    }
}

// 修改保存日程函数，确保正确处理会话
async function saveSchedule(eventData) {
    try {
        // 检查登录状态
        if (!currentUser) {
            const isLoggedIn = await checkLoginStatus();
            if (!isLoggedIn) {
                throw new Error('用户未登录');
            }
        }

        // 添加用户ID到事件数据
        eventData.userId = currentUser.id;

        const response = await apiRequest(API_ENDPOINTS.schedules, {
            method: 'POST',
            body: eventData,
            credentials: 'include' // 确保发送cookie
        });

        // 检查响应状态
        if (response && response.code === 401) {
            // 清除本地存储并重定向到登录页
            localStorage.removeItem('userSession');
            localStorage.removeItem('adminSession');
            showToast('error', '会话已过期，请重新登录', 2000, '../../login/login.html');
            throw new Error('用户未登录');
        }

        return response;
    } catch (error) {
        console.error('Error saving schedule:', error);
        throw error;
    }
}

// 更新日程
async function updateSchedule(id, eventData) {
    try {
        const response = await apiRequest(`${API_ENDPOINTS.schedules}/${id}`, {
            method: 'PUT',
            body: eventData
        });
        return response;
    } catch (error) {
        console.error('Error updating schedule:', error);
        throw error;
    }
}

// 删除日程
async function deleteSchedule(id) {
    try {
        // 添加用户ID参数
        const response = await apiRequest(`${API_ENDPOINTS.schedules}/${id}?userId=${currentUser.id}`, {
            method: 'DELETE'
        });
        return response;
    } catch (error) {
        console.error('Error deleting schedule:', error);
        throw error;
    }
}

// 初始化视图切换
function initViewSwitcher() {
    const viewButtons = document.querySelectorAll('.view-type-btn');
    const calendarContainer = document.getElementById('calendar-container');
    const listContainer = document.getElementById('list-container');

    viewButtons.forEach(button => {
        button.addEventListener('click', function() {
            const viewType = this.getAttribute('data-view');

            // 更新活动按钮状态
            viewButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            // 切换视图
            if (viewType === 'list') {
                calendarContainer.classList.remove('active');
                listContainer.style.display = 'block';
                loadListViewEvents();
            } else {
                calendarContainer.classList.add('active');
                listContainer.style.display = 'none';

                // 切换日历视图
                if (window.calendar) {
                    let calendarView;
                    switch(viewType) {
                        case 'month':
                            calendarView = 'dayGridMonth';
                            break;
                        case 'week':
                            calendarView = 'timeGridWeek';
                            break;
                        case 'day':
                            calendarView = 'timeGridDay';
                            break;
                    }

                    window.calendar.changeView(calendarView);
                }
            }
        });
    });
}

// 初始化日期导航
function initDateNavigation() {
    const prevBtn = document.getElementById('prev-period');
    const nextBtn = document.getElementById('next-period');
    const todayBtn = document.getElementById('today-btn');

    prevBtn.addEventListener('click', function() {
        if (window.calendar) {
            window.calendar.prev();
        }
    });

    nextBtn.addEventListener('click', function() {
        if (window.calendar) {
            window.calendar.next();
        }
    });

    todayBtn.addEventListener('click', function() {
        if (window.calendar) {
            window.calendar.today();
        }
    });
}

// 初始化筛选功能
function initFilterFunctionality() {
    const filterCheckboxes = document.querySelectorAll('.filter-options input[type="checkbox"]');

    filterCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            applyEventFilters();
        });
    });
}

// 应用事件筛选
function applyEventFilters() {
    const checkedTypes = Array.from(document.querySelectorAll('.filter-options input[type="checkbox"]:checked'))
        .map(checkbox => checkbox.getAttribute('data-type'));

    if (window.calendar) {
        // 获取所有事件
        const events = window.calendar.getEvents();

        // 显示或隐藏事件基于筛选条件
        events.forEach(event => {
            const eventType = event.extendedProps.type;
            if (checkedTypes.includes(eventType)) {
                event.setProp('display', 'auto');
            } else {
                event.setProp('display', 'none');
            }
        });
    }
}

// 显示事件详情
function showEventDetails(event) {
    // 创建详情模态框
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-calendar-detail"></i> 事件详情</h3>
                <span class="close-modal">&times;</span>
            </div>
            <div class="modal-body">
                <div class="event-detail-group">
                    <label>标题:</label>
                    <div class="event-detail-value">${event.title}</div>
                </div>
                <div class="event-detail-group">
                    <label>开始时间:</label>
                    <div class="event-detail-value">${event.start ? event.start.toLocaleString() : '全天'}</div>
                </div>
                ${event.end ? `
                <div class="event-detail-group">
                    <label>结束时间:</label>
                    <div class="event-detail-value">${event.end.toLocaleString()}</div>
                </div>
                ` : ''}
                <div class="event-detail-group">
                    <label>类型:</label>
                    <div class="event-detail-value">
                        <span class="event-type ${event.extendedProps.type}">
                            ${getEventTypeText(event.extendedProps.type)}
                        </span>
                    </div>
                </div>
                ${event.extendedProps.location ? `
                <div class="event-detail-group">
                    <label>地点:</label>
                    <div class="event-detail-value">${event.extendedProps.location}</div>
                </div>
                ` : ''}
                ${event.extendedProps.description ? `
                <div class="event-detail-group">
                    <label>描述:</label>
                    <div class="event-detail-value">${event.extendedProps.description}</div>
                </div>
                ` : ''}
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-outline close-detail-modal">关闭</button>
                <button type="button" class="btn btn-danger delete-event-btn">删除</button>
                <button type="button" class="btn btn-primary edit-event-btn">编辑</button>
            </div>
        </div>
    `;

    // 添加到页面
    document.body.appendChild(modal);

    // 显示模态框
    setTimeout(() => {
        modal.style.display = 'flex';
    }, 10);

    // 关闭模态框的函数
    function closeModal() {
        modal.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(modal);
        }, 300);
    }

    // 关闭按钮事件
    modal.querySelector('.close-modal').addEventListener('click', closeModal);
    modal.querySelector('.close-detail-modal').addEventListener('click', closeModal);

    // 点击模态框外部关闭
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });

    // 编辑按钮事件
    modal.querySelector('.edit-event-btn').addEventListener('click', function() {
        closeModal();
        // 先关闭详情模态框，然后打开编辑模态框
        setTimeout(() => {
            showEventModal(event);
        }, 300);
    });

    // 删除按钮事件
    modal.querySelector('.delete-event-btn').addEventListener('click', async function() {
        const confirmDelete = confirm(`确定要删除日程"${event.title}"吗？此操作不可撤销。`);

        if (confirmDelete) {
            try {
                await deleteSchedule(event.id);
                showToast('success', `日程"${event.title}"已删除`);

                // 刷新日历
                if (window.calendar) {
                    window.calendar.refetchEvents();
                }

                closeModal();
            } catch (error) {
                showToast('error', '删除日程失败');
            }
        }
    });
}

// 显示事件创建/编辑模态框
function showEventModal(event = null) {
    const modal = document.getElementById('event-modal');
    const form = document.getElementById('event-form');

    // 设置编辑模式
    isEditMode = event !== null;
    editingEventId = isEditMode ? event.id : null;

    // 设置模态框标题
    const modalTitle = modal.querySelector('h3');
    modalTitle.innerHTML = isEditMode ?
        '<i class="fas fa-edit"></i> 编辑日程' :
        '<i class="fas fa-calendar-plus"></i> 新建日程';

    // 重置表单
    form.reset();

    // 设置默认值
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const time = now.toTimeString().substr(0, 5);

    document.getElementById('event-start-date').value = today;
    document.getElementById('event-end-date').value = today;
    document.getElementById('event-start-time').value = time;

    // 设置结束时间为1小时后
    const endTime = new Date(now.getTime() + 60 * 60 * 1000);
    document.getElementById('event-end-time').value = endTime.toTimeString().substr(0, 5);

    // 如果是编辑模式，填充事件数据
    if (isEditMode) {
        document.getElementById('event-title').value = event.title || '';

        if (event.start) {
            const startDate = event.start.toISOString().split('T')[0];
            document.getElementById('event-start-date').value = startDate;

            if (!event.allDay) {
                const startTime = event.start.toTimeString().substr(0, 5);
                document.getElementById('event-start-time').value = startTime;
            }
        }

        if (event.end) {
            const endDate = event.end.toISOString().split('T')[0];
            document.getElementById('event-end-date').value = endDate;

            if (!event.allDay) {
                const endTime = event.end.toTimeString().substr(0, 5);
                document.getElementById('event-end-time').value = endTime;
            }
        }

        document.getElementById('event-all-day').checked = event.allDay || false;
        document.getElementById('event-type').value = event.extendedProps?.type || 'meeting';
        document.getElementById('event-location').value = event.extendedProps?.location || '';
        document.getElementById('event-description').value = event.extendedProps?.description || '';

        // 根据全天事件状态更新时间字段的显示
        toggleTimeFields(event.allDay || false);
    }

    // 显示模态框
    modal.style.display = 'flex';

    // 聚焦到标题字段
    setTimeout(() => {
        document.getElementById('event-title').focus();
    }, 100);
}

// 切换时间字段的显示
function toggleTimeFields(isAllDay) {
    const timeInputs = document.querySelectorAll('#event-start-time, #event-end-time');
    timeInputs.forEach(input => {
        if (isAllDay) {
            input.setAttribute('disabled', 'disabled');
            input.closest('.form-group').style.opacity = '0.5';
        } else {
            input.removeAttribute('disabled');
            input.closest('.form-group').style.opacity = '1';
        }
    });
}

// 初始化事件创建功能
function initEventCreation() {
    const createBtn = document.getElementById('create-event-btn');
    const modal = document.getElementById('event-modal');
    const closeBtn = document.querySelector('.close-modal');
    const cancelBtn = document.getElementById('cancel-event');
    const saveBtn = document.getElementById('save-event');
    const allDayCheckbox = document.getElementById('event-all-day');

    // 新建日程按钮点击事件
    createBtn.addEventListener('click', function() {
        showEventModal();
    });

    // 关闭模态框
    function closeModal() {
        modal.style.display = 'none';
        isEditMode = false;
        editingEventId = null;
    }

    // 关闭按钮事件
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);

    // 点击模态框外部关闭
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });

    // 全天事件复选框事件
    allDayCheckbox.addEventListener('change', function() {
        toggleTimeFields(this.checked);
    });

    // 保存事件处理函数
    saveBtn.addEventListener('click', async function() {
        const form = document.getElementById('event-form');

        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        // 收集表单数据
        const title = document.getElementById('event-title').value;
        const startDate = document.getElementById('event-start-date').value;
        const startTime = document.getElementById('event-start-time').value;
        const endDate = document.getElementById('event-end-date').value;
        const endTime = document.getElementById('event-end-time').value;
        const allDay = document.getElementById('event-all-day').checked;
        const type = document.getElementById('event-type').value;
        const location = document.getElementById('event-location').value;
        const description = document.getElementById('event-description').value;

        // 验证日期逻辑
        if (!allDay && new Date(`${startDate}T${startTime}`) >= new Date(`${endDate}T${endTime}`)) {
            showToast('error', '结束时间必须晚于开始时间');
            return;
        }

        // 创建事件对象
        const eventData = {
            title: title,
            startTime: allDay ? `${startDate}T00:00:00` : `${startDate}T${startTime}:00`,
            endTime: allDay ? `${endDate}T23:59:59` : `${endDate}T${endTime}:00`,
            allDay: allDay,
            type: type,
            location: location,
            description: description
        };

    try {
        let result;
        if (isEditMode && editingEventId) {
            result = await updateSchedule(editingEventId, eventData);
            showToast('success', `日程"${title}"已更新!`);
        } else {
            result = await saveSchedule(eventData);
            showToast('success', `日程"${title}"已成功创建!`);
        }

        // 检查是否有错误响应
        if (result && result.code === 401) {
            showToast('error', '请重新登录');
            // 跳转到登录页
            setTimeout(() => {
                window.location.href = '../../login/login.html';
            }, 1500);
            return;
        }

        // 刷新日历
        if (window.calendar) {
            window.calendar.refetchEvents();
        }

        // 关闭模态框
        closeModal();
    } catch (error) {
        if (error.message.includes('未登录')) {
            showToast('error', '请重新登录', 2000, '/login/login.html');
        } else {
            showToast('error', '保存日程失败');
        }
    }
    });
}

// 更新当前日期显示
function updateCurrentDate() {
    const now = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' };
    const dateString = now.toLocaleDateString('zh-CN', options);

    document.getElementById('current-full-date').textContent = dateString;
}

// 更新周期显示（月/周/日）
function updatePeriodDisplay(view) {
    const periodElement = document.getElementById('current-period');
    let periodText = '';

    switch(view.type) {
        case 'dayGridMonth':
            periodText = view.currentStart.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' });
            break;
        case 'timeGridWeek':
            const start = view.currentStart;
            const end = new Date(view.currentEnd);
            end.setDate(end.getDate() - 1); // 减去一天，因为end是 exclusive的

            if (start.getMonth() === end.getMonth()) {
                periodText = `${start.getFullYear()}年${start.getMonth() + 1}月 ${start.getDate()}日-${end.getDate()}日`;
            } else {
                periodText = `${start.getFullYear()}年${start.getMonth() + 1}月${start.getDate()}日-${end.getMonth() + 1}月${end.getDate()}日`;
            }
            break;
        case 'timeGridDay':
            periodText = view.currentStart.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
            break;
    }

    periodElement.textContent = periodText;
}

// 加载列表视图事件
function loadListViewEvents() {
    const rangeSelect = document.getElementById('list-range');
    const eventList = document.getElementById('event-list');

    // 清空当前列表
    eventList.innerHTML = '';

    // 获取选定范围
    const range = rangeSelect.value;
    let startDate, endDate;
    const today = new Date();

    switch(range) {
        case 'today':
            startDate = new Date(today);
            endDate = new Date(today);
            endDate.setDate(endDate.getDate() + 1);
            break;
        case 'week':
            startDate = new Date(today);
            startDate.setDate(startDate.getDate() - startDate.getDay() + 1); // 本周一
            endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 7);
            break;
        case 'month':
            startDate = new Date(today.getFullYear(), today.getMonth(), 1);
            endDate = new Date(today.getFullYear(), today.getMonth() + 1, 1);
            break;
    }

    // 在实际应用中，这里应该从后端API获取事件
    loadCalendarEvents(startDate, endDate)
        .then(events => {
            // 渲染事件列表
            events.forEach(event => {
                const eventItem = document.createElement('div');
                eventItem.className = 'event-item';

                const eventDate = document.createElement('div');
                eventDate.className = 'event-date';
                eventDate.textContent = formatEventDate(event.start);

                const eventDetails = document.createElement('div');
                eventDetails.className = 'event-details';

                const eventTitle = document.createElement('div');
                eventTitle.className = 'event-title';
                eventTitle.textContent = event.title;

                const eventMeta = document.createElement('div');
                eventMeta.className = 'event-meta';

                const eventType = document.createElement('span');
                eventType.className = `event-type ${event.extendedProps.type}`;
                eventType.textContent = getEventTypeText(event.extendedProps.type);

                eventMeta.appendChild(eventType);

                if (event.extendedProps.location) {
                    const eventLocation = document.createElement('span');
                    eventLocation.className = 'event-location';
                    eventLocation.textContent = event.extendedProps.location;
                    eventMeta.appendChild(eventLocation);
                }

                eventDetails.appendChild(eventTitle);
                eventDetails.appendChild(eventMeta);

                eventItem.appendChild(eventDate);
                eventItem.appendChild(eventDetails);

                eventList.appendChild(eventItem);
            });
        })
        .catch(error => {
            console.error('Failed to load events for list view:', error);
            eventList.innerHTML = '<div class="no-events">加载事件失败</div>';
        });

    // 添加范围变化监听
    rangeSelect.addEventListener('change', loadListViewEvents);
}

// 格式化事件日期
function formatEventDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
}

// 获取事件类型文本
function getEventTypeText(type) {
    const typeMap = {
        'meeting': '会议',
        'task': '任务',
        'project': '项目',
        'personal': '个人'
    };

    return typeMap[type] || type;
}

// 加载近期事件
function loadUpcomingEvents() {
    // 检查登录状态
    if (!currentUser) {
        checkLoginStatus().then(isLoggedIn => {
            if (isLoggedIn) loadUpcomingEvents();
        });
        return;
    }

    // 计算前7天和后7天的日期范围
    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - 7);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() + 7);
    endDate.setHours(23, 59, 59, 999);

    // 从API获取近期事件
    const params = new URLSearchParams({
        start: startDate.toISOString(),
        end: endDate.toISOString()
    });

    apiRequest(`${API_ENDPOINTS.schedules}?${params}`)
        .then(response => {
            // 处理401未授权错误
            if (response && response.code === 401) {
                showToast('error', '请重新登录', 2000, '/login/login.html');
                return;
            }

            const upcomingList = document.getElementById('upcoming-list');
            if (!upcomingList) return;

            // 清空现有内容
            upcomingList.innerHTML = '';

            // 确保从响应中获取 data 字段
            let events = response.data || response;

            // 确保 events 是数组
            if (!Array.isArray(events)) {
                console.warn('Expected array but got:', events);
                events = [];
            }

            // 按开始时间排序
            events.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

            // 添加新事件
            events.forEach(event => {
                const eventItem = document.createElement('div');
                eventItem.className = 'upcoming-event-item';

                const eventDate = new Date(event.startTime);
                const now = new Date();
                const isToday = eventDate.toDateString() === now.toDateString();

                eventItem.innerHTML = `
                    <div class="upcoming-event-date ${isToday ? 'today' : ''}">
                        ${formatUpcomingEventDate(eventDate)}
                    </div>
                    <div class="upcoming-event-content">
                        <div class="upcoming-event-title">${event.title}</div>
                        <div class="upcoming-event-time">${formatUpcomingEventTime(eventDate, event.allDay)}</div>
                        ${event.location ? `<div class="upcoming-event-location">${event.location}</div>` : ''}
                    </div>
                `;

                upcomingList.appendChild(eventItem);
            });

            if (events.length === 0) {
                upcomingList.innerHTML = '<div class="no-events">暂无近期日程</div>';
            }
        })
        .catch(error => {
            console.error('Failed to load upcoming events:', error);
            const upcomingList = document.getElementById('upcoming-list');
            if (upcomingList) {
                upcomingList.innerHTML = '<div class="no-events">加载失败</div>';
            }
        });
}

// 格式化近期日程的日期
function formatUpcomingEventDate(date) {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
        return '今天';
    } else if (date.toDateString() === tomorrow.toDateString()) {
        return '明天';
    } else if (date.toDateString() === yesterday.toDateString()) {
        return '昨天';
    } else {
        return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
    }
}

// 格式化近期日程的时间
function formatUpcomingEventTime(date, isAllDay) {
    if (isAllDay) {
        return '全天';
    }
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
}