// 导入API配置和工具函数
import { apiRequest, API_ENDPOINTS } from '../../api-config.js';
import { showToast } from '../../toast.js';

// 全局变量
let currentUserId = null;

// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function() {
    // 检查用户会话并加载数据
    checkUserSession().then(isValid => {
        if (!isValid) {
            return;
        }
        
        // 加载组织架构数据
        loadOrganizationStructure().then(orgData => {
            // 使用相同的数据初始化组织架构图
            initOrgChart(orgData);
        });
        // 加载我的团队数据
        loadMyTeams();
    });
    
    // 初始化事件监听器
    initEventListeners();
});

// 检查用户会话
async function checkUserSession() {
    try {
        // 从本地存储获取用户会话
        const userSession = localStorage.getItem('userSession');
        if (!userSession) {
            if (typeof showToast === 'function') {
                showToast('info', '请先登录');
            } else {
                alert('请先登录');
            }
            setTimeout(() => {
                window.location.href = '../../login/login.html';
            }, 1500);
            return false;
        }
        
        // 解析用户会话
        const parsedSession = JSON.parse(userSession);
        currentUserId = parsedSession.userId;
        
        // 检查会话是否过期（24小时）
        const sessionTime = parsedSession.timestamp;
        const now = Date.now();
        const sessionExpiry = 24 * 60 * 60 * 1000; // 24小时
        
        if (now - sessionTime > sessionExpiry) {
            localStorage.removeItem('userSession');
            if (typeof showToast === 'function') {
                showToast('info', '会话已过期，请重新登录');
            } else {
                alert('会话已过期，请重新登录');
            }
            setTimeout(() => {
                window.location.href = '../../login/login.html';
            }, 1500);
            return false;
        }
        
        // 验证会话是否有效
        try {
            if (typeof apiRequest === 'function' && typeof API_ENDPOINTS === 'object') {
                try {
                    const response = await apiRequest(API_ENDPOINTS.currentUser, {
                        credentials: 'include'
                    });
                
                if (!response) {
                    localStorage.removeItem('userSession');
                    if (typeof showToast === 'function') {
                        showToast('info', '请重新登录');
                    } else {
                        alert('请重新登录');
                    }
                    setTimeout(() => {
                        window.location.href = '../../login/login.html';
                    }, 1500);
                    return false;
                }
                } catch (currentUserError) {
                    // currentUser API 请求失败，使用本地会话
                    console.warn('获取当前用户信息失败，使用本地会话:', currentUserError);
                }
            }
        } catch (apiError) {
            // API请求失败，但本地会话存在，暂时允许访问
            console.warn('验证用户会话失败，使用本地会话:', apiError);
        }
        
        return true;
    } catch (error) {
        console.error('检查用户会话失败:', error);
        localStorage.removeItem('userSession');
        if (typeof showToast === 'function') {
            showToast('info', '请重新登录');
        } else {
            alert('请重新登录');
        }
        setTimeout(() => {
            window.location.href = '../../login/login.html';
        }, 1500);
        return false;
    }
}

// 初始化事件监听器
function initEventListeners() {
    // 选项卡切换功能
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // 移除所有活动状态
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));

            // 添加当前活动状态
            button.classList.add('active');
            const tabId = button.getAttribute('data-tab');
            document.getElementById(`${tabId}-tab`).classList.add('active');

            // 根据标签类型加载对应数据
            switch(tabId) {
                case 'members':
                    loadTeamMembers();
                    break;
                case 'activities':
                    loadTeamActivities();
                    break;
                case 'settings':
                    // 团队设置数据在加载团队详情时已经更新
                    break;
            }
        });
    });

    // 颜色选择器交互
    const colorOptions = document.querySelectorAll('.color-option');
    colorOptions.forEach(option => {
        option.addEventListener('click', () => {
            // 移除所有活动状态
            colorOptions.forEach(opt => opt.classList.remove('active'));
            // 添加当前活动状态
            option.classList.add('active');
        });
    });

    // 默认选中第一个颜色选项
    if (colorOptions.length > 0) {
        colorOptions[0].classList.add('active');
    }

    // 团队搜索功能
    const teamSearch = document.getElementById('team-search');
    if (teamSearch) {
        teamSearch.addEventListener('input', () => {
            const searchTerm = teamSearch.value.toLowerCase();
            document.querySelectorAll('.joinable-team-item').forEach(item => {
                const teamName = item.querySelector('h4').textContent.toLowerCase();
                const teamDesc = item.querySelector('p').textContent.toLowerCase();
                if (teamName.includes(searchTerm) || teamDesc.includes(searchTerm)) {
                    item.style.display = 'flex';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    }

    // 成员搜索功能
    const memberSearch = document.getElementById('member-search');
    if (memberSearch) {
        memberSearch.addEventListener('input', () => {
            const searchTerm = memberSearch.value.toLowerCase();
            document.querySelectorAll('.member-card').forEach(card => {
                const memberName = card.querySelector('.member-name').textContent.toLowerCase();
                if (memberName.includes(searchTerm)) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }

    // 角色筛选功能
    const roleFilter = document.getElementById('role-filter');
    if (roleFilter) {
        roleFilter.addEventListener('change', () => {
            const selectedRole = roleFilter.value;
            document.querySelectorAll('.member-card').forEach(card => {
                const memberRole = card.querySelector('.member-role').textContent.toLowerCase();
                if (selectedRole === 'all') {
                    card.style.display = 'flex';
                } else if (selectedRole === 'leader' &&
                           (memberRole.includes('ceo') || memberRole.includes('cto') ||
                            memberRole.includes('总监') || memberRole.includes('负责人'))) {
                    card.style.display = 'flex';
                } else if (selectedRole === 'core' &&
                           (memberRole.includes('主管') || memberRole.includes('专家') ||
                            memberRole.includes('架构师'))) {
                    card.style.display = 'flex';
                } else if (selectedRole === 'member' &&
                           !memberRole.includes('ceo') && !memberRole.includes('cto') &&
                           !memberRole.includes('总监') && !memberRole.includes('负责人') &&
                           !memberRole.includes('主管') && !memberRole.includes('专家') &&
                           !memberRole.includes('架构师') && !memberRole.includes('试用')) {
                    card.style.display = 'flex';
                } else if (selectedRole === 'trial' && memberRole.includes('试用')) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }

    // 创建团队按钮
    const createTeamBtn = document.getElementById('create-team-btn');
    if (createTeamBtn) {
        createTeamBtn.addEventListener('click', () => {
            document.getElementById('create-team-modal').style.display = 'block';
        });
    }

    // 加入团队按钮
    const joinTeamBtn = document.getElementById('join-team-btn');
    if (joinTeamBtn) {
        joinTeamBtn.addEventListener('click', () => {
            document.getElementById('join-team-modal').style.display = 'block';
            // 加载可加入的团队列表
            loadJoinableTeams();
        });
    }

    // 获取模态框元素
    const createTeamModal = document.getElementById('create-team-modal');
    const joinTeamModal = document.getElementById('join-team-modal');
    const modalCloseButtons = document.querySelectorAll('.modal-close, .modal-cancel');

    // 关闭模态框
    modalCloseButtons.forEach(button => {
        button.addEventListener('click', () => {
            createTeamModal.style.display = 'none';
            joinTeamModal.style.display = 'none';
        });
    });

    // 点击模态框外部关闭
    window.addEventListener('click', (e) => {
        if (e.target === createTeamModal) {
            createTeamModal.style.display = 'none';
        }
        if (e.target === joinTeamModal) {
            joinTeamModal.style.display = 'none';
        }
    });

    // 创建团队表单提交
    const createTeamForm = document.getElementById('create-team-form');
    if (createTeamForm) {
        createTeamForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await handleCreateTeam();
        });
    }

    // 团队设置表单提交
    const settingsForm = document.getElementById('team-settings-form');
    if (settingsForm) {
        settingsForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await handleSaveTeamSettings();
        });
    }

    // 解散团队按钮
    const disbandTeamBtn = document.getElementById('disband-team-btn');
    if (disbandTeamBtn) {
        disbandTeamBtn.addEventListener('click', async () => {
            await handleDisbandTeam();
        });
    }
}

// 加载组织架构数据
async function loadOrganizationStructure() {
    try {
        if (typeof apiRequest === 'function' && typeof API_ENDPOINTS === 'object') {
            const response = await apiRequest(API_ENDPOINTS.organizationStructure, {
                credentials: 'include'
            });
            
            // 处理响应数据，显示组织架构
            if (Array.isArray(response)) {
                renderOrganizationStructure(response);
                return response;
            } else {
                console.error('组织架构数据格式错误:', response);
                if (typeof showToast === 'function') {
                    showToast('error', '组织架构数据格式错误');
                } else {
                    alert('组织架构数据格式错误');
                }
                return null;
            }
        } else {
            console.error('API函数未定义');
            if (typeof showToast === 'function') {
                showToast('error', 'API函数未定义');
            } else {
                alert('API函数未定义');
            }
            return null;
        }
    } catch (error) {
        console.error('加载组织架构失败:', error);
        if (typeof showToast === 'function') {
            showToast('error', '加载组织架构失败');
        } else {
            alert('加载组织架构失败');
        }
        return null;
    }
}

// 加载我的团队数据
async function loadMyTeams() {
    try {
        if (typeof apiRequest === 'function' && typeof API_ENDPOINTS === 'object') {
            const response = await apiRequest(API_ENDPOINTS.myTeams, {
                credentials: 'include'
            });
            
            // 处理响应数据，显示我的团队
            if (Array.isArray(response)) {
                // 获取当前用户信息
                const currentUser = localStorage.getItem('currentUser');
                let currentUserId = null;
                if (currentUser) {
                    try {
                        const user = JSON.parse(currentUser);
                        currentUserId = user.id;
                    } catch (e) {
                        console.error('解析当前用户信息失败:', e);
                    }
                }
                
                // 为每个团队添加角色信息
                const teamsWithRole = response.map(team => {
                    // 如果团队已经有角色信息，则使用它
                    if (team.role) {
                        return team;
                    }
                    
                    // 否则，根据 organizerId 和当前用户 ID 来判断角色
                    let role = '成员';
                    if (currentUserId && team.organizerId === currentUserId) {
                        role = 'admin';
                    }
                    
                    return {
                        ...team,
                        role
                    };
                });
                
                renderMyTeams(teamsWithRole);
            } else {
                console.error('团队数据格式错误:', response);
                if (typeof showToast === 'function') {
                    showToast('error', '团队数据格式错误');
                } else {
                    alert('团队数据格式错误');
                }
            }
        } else {
            console.error('API函数未定义');
            if (typeof showToast === 'function') {
                showToast('error', 'API函数未定义');
            } else {
                alert('API函数未定义');
            }
        }
    } catch (error) {
        console.error('加载我的团队失败:', error);
        if (typeof showToast === 'function') {
            showToast('error', '加载我的团队失败');
        } else {
            alert('加载我的团队失败');
        }
    }
}

// 加载团队成员数据
async function loadTeamMembers() {
    try {
        // 获取当前选中的团队ID
        const activeTeamItem = document.querySelector('.team-item.active');
        if (!activeTeamItem) {
            return;
        }
        const teamId = activeTeamItem.getAttribute('data-team-id');
        
        if (typeof apiRequest === 'function' && typeof API_ENDPOINTS === 'object') {
            const response = await apiRequest(API_ENDPOINTS.teamMembers(teamId), {
                credentials: 'include'
            });

            // 处理响应数据，显示团队成员列表
            if (response && Array.isArray(response.members)) {
                renderTeamMembers(response.members);
            } else {
                console.error('团队成员数据格式错误:', response);
                if (typeof showToast === 'function') {
                    showToast('error', '团队成员数据格式错误');
                } else {
                    alert('团队成员数据格式错误');
                }
            }
        } else {
            console.error('API函数未定义');
            if (typeof showToast === 'function') {
                showToast('error', 'API函数未定义');
            } else {
                alert('API函数未定义');
            }
        }
    } catch (error) {
        console.error('加载团队成员失败:', error);
        if (typeof showToast === 'function') {
            showToast('error', '加载团队成员失败');
        } else {
            alert('加载团队成员失败');
        }
    }
}

// 加载团队动态数据
async function loadTeamActivities() {
    try {
        // 获取当前选中的团队ID
        const activeTeamItem = document.querySelector('.team-item.active');
        if (!activeTeamItem) {
            return;
        }
        const teamId = activeTeamItem.getAttribute('data-team-id');
        
        if (typeof apiRequest === 'function' && typeof API_ENDPOINTS === 'object') {
            const response = await apiRequest(API_ENDPOINTS.teamActivities(teamId), {
                credentials: 'include'
            });

            // 处理响应数据，显示团队动态
            if (response && typeof response === 'object') {
                // 检查是否为ApiResponse格式
                const activities = response.data || response;
                if (Array.isArray(activities)) {
                    renderTeamActivities(activities);
                } else {
                    console.error('团队动态数据格式错误:', response);
                    if (typeof showToast === 'function') {
                        showToast('error', '团队动态数据格式错误');
                    } else {
                        alert('团队动态数据格式错误');
                    }
                }
            } else {
                console.error('团队动态数据格式错误:', response);
                if (typeof showToast === 'function') {
                    showToast('error', '团队动态数据格式错误');
                } else {
                    alert('团队动态数据格式错误');
                }
            }
        } else {
            console.error('API函数未定义');
            if (typeof showToast === 'function') {
                showToast('error', 'API函数未定义');
            } else {
                alert('API函数未定义');
            }
        }
    } catch (error) {
        console.error('加载团队动态失败:', error);
        if (typeof showToast === 'function') {
            showToast('error', '加载团队动态失败');
        } else {
            alert('加载团队动态失败');
        }
    }
}

// 加载可加入的团队列表
async function loadJoinableTeams() {
    try {
        if (typeof apiRequest === 'function' && typeof API_ENDPOINTS === 'object') {
            const response = await apiRequest(API_ENDPOINTS.joinableTeams, {
                credentials: 'include'
            });

            const joinableTeamsList = document.querySelector('.joinable-teams-list');
            if (!joinableTeamsList) return;

            // 清空现有列表
            joinableTeamsList.innerHTML = '';

            // 渲染可加入的团队
            response.forEach(team => {
                const teamItem = document.createElement('div');
                teamItem.className = 'joinable-team-item';
                teamItem.innerHTML = `
                  <div class="team-info">
                    <h4>${team.name}</h4>
                    <p>${team.description || '暂无描述'}</p>
                    <div class="team-meta">
                      <span><i class="fas fa-users"></i> ${team.member_count || 0}人</span>
                      <span><i class="fas fa-star"></i> 等级${team.level || 1}</span>
                      ${team.level_limit ? `<span><i class="fas fa-user-level"></i> 最低等级${team.level_limit}</span>` : ''}
                    </div>
                  </div>
                  <button class="btn btn-sm btn-primary join-team-btn" data-team-id="${team.id}" ${team.join_code ? 'data-join-code="' + team.join_code + '"' : ''} ${team.level_limit ? 'data-level-limit="' + team.level_limit + '"' : ''}>申请加入</button>
                `;

                joinableTeamsList.appendChild(teamItem);
            });

            // 添加加入团队按钮的点击事件
            document.querySelectorAll('.join-team-btn').forEach(button => {
                button.addEventListener('click', async function() {
                    const teamId = this.getAttribute('data-team-id');
                    const teamItem = this.closest('.joinable-team-item');
                    const teamName = teamItem.querySelector('h4').textContent;
                    const joinCode = this.getAttribute('data-join-code');
                    const levelLimit = this.getAttribute('data-level-limit');

                    // 检查等级限制
                    if (levelLimit) {
                        // 获取当前用户等级
                        const currentUser = localStorage.getItem('currentUser');
                        let userLevel = 0;
                        if (currentUser) {
                            try {
                                const user = JSON.parse(currentUser);
                                userLevel = user.level || 0;
                            } catch (e) {
                                console.error('解析当前用户信息失败:', e);
                            }
                        }

                        if (userLevel < parseInt(levelLimit)) {
                            if (typeof showToast === 'function') {
                                showToast('error', `您的等级(${userLevel})低于团队要求的最低等级(${levelLimit})，无法加入`);
                            } else {
                                alert(`您的等级(${userLevel})低于团队要求的最低等级(${levelLimit})，无法加入`);
                            }
                            return;
                        }
                    }

                    if (joinCode) {
                        // 如果团队设置了验证码，弹出输入框
                        const userInputCode = prompt(`请输入加入 "${teamName}" 的验证码：`);
                        if (!userInputCode) return; // 用户取消输入
                        if (userInputCode !== joinCode) {
                            if (typeof showToast === 'function') {
                                showToast('error', '验证码错误，请重新输入');
                            } else {
                                alert('验证码错误，请重新输入');
                            }
                            return;
                        }
                    } else {
                        // 确认加入
                        const confirmed = confirm(`确认要申请加入 "${teamName}" 吗？`);
                        if (!confirmed) return;
                    }

                    try {
                        // 发送加入团队请求
                        await apiRequest(API_ENDPOINTS.joinTeam, {
                            method: 'POST',
                            credentials: 'include',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ 
                                team_id: teamId,
                                join_code: joinCode 
                            })
                        });

                        // 更新按钮状态
                        this.textContent = '已申请';
                        this.disabled = true;
                        this.classList.remove('btn-primary');
                        this.classList.add('btn-outline');

                        if (typeof showToast === 'function') {
                            showToast('success', `已向 "${teamName}" 发送加入申请，等待管理员审批。`);
                        } else {
                            alert(`已向 "${teamName}" 发送加入申请，等待管理员审批。`);
                        }
                    } catch (error) {
                        console.error('加入团队失败:', error);
                        if (typeof showToast === 'function') {
                            showToast('error', '加入团队失败，请稍后重试');
                        } else {
                            alert('加入团队失败，请稍后重试');
                        }
                    }
                });
            });
        } else {
            console.error('API函数未定义');
            if (typeof showToast === 'function') {
                showToast('error', 'API函数未定义');
            } else {
                alert('API函数未定义');
            }
        }
    } catch (error) {
        console.error('加载可加入团队失败:', error);
        if (typeof showToast === 'function') {
            showToast('error', '加载可加入团队失败');
        } else {
            alert('加载可加入团队失败');
        }
    }
}

// 处理创建团队
async function handleCreateTeam() {
    const teamName = document.getElementById('new-team-name').value;
    const teamDesc = document.getElementById('new-team-desc').value;
    const teamType = document.getElementById('new-team-type').value;
    // 获取选中的可见性radio的值
    const teamVisibility = document.querySelector('input[name="visibility"]:checked').value;

    try {
        if (typeof apiRequest === 'function' && typeof API_ENDPOINTS === 'object') {
            // 发送创建团队请求
            const response = await apiRequest(API_ENDPOINTS.createTeam, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: teamName,
                    description: teamDesc,
                    type: teamType,
                    visibility: teamVisibility
                })
            });

            // 显示成功消息
            if (typeof showToast === 'function') {
                showToast('success', `团队 "${teamName}" 创建成功！`);
            } else {
                alert(`团队 "${teamName}" 创建成功！`);
            }

            // 关闭模态框并重置表单
            document.getElementById('create-team-modal').style.display = 'none';
            document.getElementById('create-team-form').reset();

            // 重新加载我的团队列表
            loadMyTeams();
        } else {
            console.error('API函数未定义');
            if (typeof showToast === 'function') {
                showToast('error', 'API函数未定义');
            } else {
                alert('API函数未定义');
            }
        }
    } catch (error) {
        console.error('创建团队失败:', error);
        if (typeof showToast === 'function') {
            showToast('error', '创建团队失败，请稍后重试');
        } else {
            alert('创建团队失败，请稍后重试');
        }
    }
}

// 处理保存团队设置
async function handleSaveTeamSettings() {
    // 获取表单数据
    const teamName = document.getElementById('team-name').value;
    const teamDesc = document.getElementById('team-desc').value;
    const joinMethod = document.getElementById('team-join-method').value;
    const teamVisible = document.getElementById('team-visible').value;
    const joinCode = document.getElementById('team-join-code').value;
    const levelLimit = document.getElementById('team-level-limit').value;

    try {
        // 获取当前选中的团队ID
        const activeTeamItem = document.querySelector('.team-item.active');
        if (!activeTeamItem) {
            if (typeof showToast === 'function') {
                showToast('error', '请先选择一个团队');
            } else {
                alert('请先选择一个团队');
            }
            return;
        }

        const teamId = activeTeamItem.getAttribute('data-team-id');

        if (typeof apiRequest === 'function' && typeof API_ENDPOINTS === 'object') {
            try {
                // 发送更新团队设置请求（同时更新团队基本信息）
                await apiRequest(API_ENDPOINTS.teamSettings(teamId), {
                    method: 'PUT',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        name: teamName,
                        description: teamDesc,
                        joinMethod: joinMethod,
                        visibility: teamVisible,
                        joinCode: joinCode,
                        levelLimit: levelLimit ? parseInt(levelLimit) : 0
                    })
                });

                if (typeof showToast === 'function') {
                    showToast('success', '团队设置已保存！');
                } else {
                    alert('团队设置已保存！');
                }
            } catch (error) {
                console.error('保存团队设置失败:', error);
                if (typeof showToast === 'function') {
                    showToast('error', '保存团队设置失败，请稍后重试');
                } else {
                    alert('保存团队设置失败，请稍后重试');
                }
                throw error; // 重新抛出错误，让外部catch块也能捕获
            }
        } else {
            console.error('API函数未定义');
            if (typeof showToast === 'function') {
                showToast('error', 'API函数未定义');
            } else {
                alert('API函数未定义');
            }
        }
    } catch (error) {
        console.error('保存团队设置失败:', error);
        if (typeof showToast === 'function') {
            showToast('error', '保存团队设置失败，请稍后重试');
        } else {
            alert('保存团队设置失败，请稍后重试');
        }
    }
}

// 处理解散团队
async function handleDisbandTeam() {
    const confirmDisband = confirm('确定要解散团队吗？此操作不可撤销！');

    if (confirmDisband) {
        try {
            // 获取当前选中的团队ID
            const activeTeamItem = document.querySelector('.team-item.active');
            if (!activeTeamItem) {
                if (typeof showToast === 'function') {
                    showToast('error', '请先选择一个团队');
                } else {
                    alert('请先选择一个团队');
                }
                return;
            }

            const teamId = activeTeamItem.getAttribute('data-team-id');

            if (typeof apiRequest === 'function' && typeof API_ENDPOINTS === 'object') {
                // 发送解散团队请求
                await apiRequest(API_ENDPOINTS.disbandTeam(teamId), {
                    method: 'DELETE',
                    credentials: 'include'
                });

                if (typeof showToast === 'function') {
                    showToast('success', '团队已解散');
                } else {
                    alert('团队已解散');
                }

                // 重新加载我的团队列表
                loadMyTeams();
            } else {
                console.error('API函数未定义');
                if (typeof showToast === 'function') {
                    showToast('error', 'API函数未定义');
                } else {
                    alert('API函数未定义');
                }
            }
        } catch (error) {
            console.error('解散团队失败:', error);
            if (typeof showToast === 'function') {
                showToast('error', '解散团队失败，请稍后重试');
            } else {
                alert('解散团队失败，请稍后重试');
            }
        }
    }
}

// 渲染组织架构
function renderOrganizationStructure(orgData) {
    const orgTree = document.getElementById('org-tree');
    if (!orgTree) return;

    // 清空现有的组织架构数据
    orgTree.innerHTML = '';

    // 构建组织架构树
    if (orgData && orgData.length > 0) {
        // 映射字段，确保数据结构一致
        const mappedData = orgData.map(item => ({
            id: item.id,
            name: item.name,
            description: item.description,
            parent_id: item.parentId, // 映射不同的父组织字段
            level: item.level // 提供默认 level 值
        }));
        
        const rootOrg = mappedData.find(org => org.parent_id === null);
        if (rootOrg) {
            renderOrgItem(rootOrg, mappedData, orgTree);
        }
    }
}

// 递归渲染组织架构项
function renderOrgItem(org, orgData, container) {
    if (!org || !org.id || !org.name) return;
    
    // 创建一个包装容器，用于包含组织项和子组织
    const orgWrapper = document.createElement('div');
    orgWrapper.className = 'org-wrapper';
    
    const orgItem = document.createElement('div');
    orgItem.className = 'org-item';
    orgItem.setAttribute('data-org-id', org.id);
    
    const icon = getOrgIcon(org.level);
    const levelLabel = getOrgLevelLabel(org.level);
    
    orgItem.innerHTML = `
        <i class="fas fa-${icon}"></i>
        <span>${org.name}</span>
        <span class="org-badge">${levelLabel}</span>
    `;

    // 添加点击事件
    orgItem.addEventListener('click', function() {
        // 移除所有活动状态
        document.querySelectorAll('.org-item, .team-item').forEach(item => {
            item.classList.remove('active');
        });

        // 添加当前活动状态
        this.classList.add('active');

        // 加载组织详情
        loadOrgDetails(org.id);
    });

    // 将组织项添加到包装容器中
    orgWrapper.appendChild(orgItem);
    
    // 渲染子组织
    const children = orgData.filter(child => child.parent_id === org.id);
    if (children && children.length > 0) {
        const childrenContainer = document.createElement('div');
        childrenContainer.className = 'org-children';
        children.forEach(child => {
            renderOrgItem(child, orgData, childrenContainer);
        });
        // 将子组织容器添加到包装容器中
        orgWrapper.appendChild(childrenContainer);
    }
    
    // 将包装容器添加到父容器中
    container.appendChild(orgWrapper);
}

// 渲染我的团队
function renderMyTeams(teams) {
    const myTeamsList = document.getElementById('my-teams-list');
    if (!myTeamsList) return;

    // 清空现有的团队数据
    myTeamsList.innerHTML = '';

    // 渲染团队列表
    if (teams && teams.length > 0) {
        teams.forEach(team => {
            if (!team || !team.id || !team.name) return;
            
            const teamItem = document.createElement('div');
            teamItem.className = 'team-item';
            teamItem.setAttribute('data-team-id', team.id);
            teamItem.innerHTML = `
                <i class="fas fa-users"></i>
                <span>${team.name}</span>
                <span class="team-role">${team.role || '成员'}</span>
                <span class="team-member-count">${team.memberCount} 成员</span>
            `;

            // 添加点击事件
            teamItem.addEventListener('click', function() {
                // 移除所有活动状态
                document.querySelectorAll('.org-item, .team-item').forEach(item => {
                    item.classList.remove('active');
                });

                // 添加当前活动状态
                this.classList.add('active');

                // 加载团队详情
                loadTeamDetails(team.id);
            });

            myTeamsList.appendChild(teamItem);
        });

        // 默认选择第一个团队
        const firstTeamItem = myTeamsList.querySelector('.team-item');
        if (firstTeamItem) {
            firstTeamItem.click();
        }
    }
}

// 加载组织详情
async function loadOrgDetails(orgId) {
    try {
        if (typeof apiRequest === 'function' && typeof API_ENDPOINTS === 'object') {
            const response = await apiRequest(API_ENDPOINTS.organizationDetails(orgId), {
                credentials: 'include'
            });
            
            if (response && typeof response === 'object') {
                // 检查是否为错误响应
                if (response.success === false) {
                    console.error('组织详情获取失败:', response.message);
                    if (typeof showToast === 'function') {
                        showToast('error', response.message || '组织详情获取失败');
                    } else {
                        alert(response.message || '组织详情获取失败');
                    }
                } else {
                    // 提取数据（处理 ApiResponse 格式）
                    const orgData = response.data || response;
                    
                    // 更新团队信息
                    if (orgData.name) document.getElementById('current-team-name').textContent = orgData.name;
                    if (orgData.description) document.getElementById('current-team-desc').textContent = orgData.description;
                    if (orgData.member_count || orgData.memberCount) document.getElementById('member-count').textContent = orgData.member_count || orgData.memberCount;
                    if (orgData.level) document.getElementById('team-level').textContent = orgData.level;
                    if (orgData.reputation || orgData.totalPoints || orgData.points) document.getElementById('team-reputation').textContent = orgData.reputation || orgData.totalPoints || orgData.points || 0;
                    if (orgData.activity_rate || orgData.activityRate) document.getElementById('team-activity').textContent = (orgData.activity_rate || orgData.activityRate) + '%';
                    
                    // 更新团队元信息
                    if (orgData.establish_date || orgData.establishDate) document.getElementById('team-establish-date').textContent = orgData.establish_date || orgData.establishDate;
                    if (orgData.goal) document.getElementById('team-goal').textContent = orgData.goal;
                    if (orgData.location) document.getElementById('team-location').textContent = orgData.location;
                    
                    // 更新团队标签
                    const teamTags = document.getElementById('team-tags');
                    teamTags.innerHTML = '';
                    if (orgData.tags) {
                        const tags = orgData.tags.split(',');
                        tags.forEach(tag => {
                            if (tag.trim()) {
                                const tagElement = document.createElement('span');
                                tagElement.className = 'team-tag';
                                tagElement.textContent = tag.trim();
                                teamTags.appendChild(tagElement);
                            }
                        });
                    }
                    
                    // 加载组织成员
                    loadOrganizationMembers(orgId);
                }
            } else {
                console.error('组织详情数据格式错误:', response);
                if (typeof showToast === 'function') {
                    showToast('error', '组织详情数据格式错误');
                } else {
                    alert('组织详情数据格式错误');
                }
            }
        } else {
            console.error('API函数未定义');
            if (typeof showToast === 'function') {
                showToast('error', 'API函数未定义');
            } else {
                alert('API函数未定义');
            }
        }
    } catch (error) {
        console.error('加载组织详情失败:', error);
        if (typeof showToast === 'function') {
            showToast('error', '加载组织详情失败');
        } else {
            alert('加载组织详情失败');
        }
    }
}

// 加载团队详情
async function loadTeamDetails(teamId) {
    try {
        if (typeof apiRequest === 'function' && typeof API_ENDPOINTS === 'object') {
            // 获取团队基本信息
            const teamResponse = await apiRequest(API_ENDPOINTS.teamDetail(teamId), {
                credentials: 'include'
            });
            
            // 获取团队详情
            const detailsResponse = await apiRequest(API_ENDPOINTS.teamDetails(teamId), {
                credentials: 'include'
            });
            
            // 获取团队设置
            const settingsResponse = await apiRequest(API_ENDPOINTS.teamSettings(teamId), {
                credentials: 'include'
            });
            
            // 合并所有响应数据
            const teamData = { ...teamResponse, ...detailsResponse };
            
            // 更新团队信息
            if (teamData.name) document.getElementById('current-team-name').textContent = teamData.name;
            if (teamData.description) document.getElementById('current-team-desc').textContent = teamData.description;
            
            // 处理驼峰命名的字段
            if (teamData.memberCount) document.getElementById('member-count').textContent = teamData.memberCount;
            if (teamData.level) document.getElementById('team-level').textContent = teamData.level;
            if (teamData.totalPoints || teamData.points) document.getElementById('team-reputation').textContent = teamData.totalPoints || teamData.points || 0;
            if (teamData.activityRate) document.getElementById('team-activity').textContent = teamData.activityRate + '%';
            if (teamData.establishDate) document.getElementById('team-establish-date').textContent = teamData.establishDate;
            if (teamData.goal) document.getElementById('team-goal').textContent = teamData.goal;
            if (teamData.location) document.getElementById('team-location').textContent = teamData.location;
            
            // 更新团队标签
            const teamTags = document.getElementById('team-tags');
            teamTags.innerHTML = '';
            if (teamData.tags) {
                const tags = teamData.tags.split(',');
                tags.forEach(tag => {
                    if (tag.trim()) {
                        const tagElement = document.createElement('span');
                        tagElement.className = 'team-tag';
                        tagElement.textContent = tag.trim();
                        teamTags.appendChild(tagElement);
                    }
                });
            }
            
            // 更新团队设置表单
            if (teamData.name) document.getElementById('team-name').value = teamData.name;
            if (teamData.description) document.getElementById('team-desc').value = teamData.description;
            if (settingsResponse && typeof settingsResponse === 'object') {
                if (settingsResponse.join_method || settingsResponse.joinMethod) document.getElementById('team-join-method').value = settingsResponse.join_method || settingsResponse.joinMethod;
                if (settingsResponse.visibility) document.getElementById('team-visible').value = settingsResponse.visibility;
                if (settingsResponse.join_code || settingsResponse.joinCode) document.getElementById('team-join-code').value = settingsResponse.join_code || settingsResponse.joinCode;
                if (settingsResponse.level_limit || settingsResponse.levelLimit) document.getElementById('team-level-limit').value = settingsResponse.level_limit || settingsResponse.levelLimit;
            }
            
            // 加载团队成员
            loadTeamMembers();
            // 加载团队动态
            loadTeamActivities();
        } else {
            console.error('API函数未定义');
            if (typeof showToast === 'function') {
                showToast('error', 'API函数未定义');
            } else {
                alert('API函数未定义');
            }
        }
    } catch (error) {
        console.error('加载团队详情失败:', error);
        if (typeof showToast === 'function') {
            showToast('error', '加载团队详情失败');
        } else {
            alert('加载团队详情失败');
        }
    }
}

// 加载组织成员
async function loadOrganizationMembers(orgId) {
    try {
        if (typeof apiRequest === 'function' && typeof API_ENDPOINTS === 'object') {
            console.log('加载组织成员，orgId:', orgId);
            const response = await apiRequest(API_ENDPOINTS.organizationMembers(orgId), {
                credentials: 'include'
            });
            
            console.log('组织成员响应:', response);
            
            // 处理响应数据，显示组织成员列表
            if (response && Array.isArray(response)) {
                console.log('组织成员数量:', response.length);
                renderTeamMembers(response);
            } else {
                console.error('组织成员数据格式错误:', response);
                if (typeof showToast === 'function') {
                    showToast('error', '组织成员数据格式错误');
                } else {
                    alert('组织成员数据格式错误');
                }
            }
        } else {
            console.error('API函数未定义');
            if (typeof showToast === 'function') {
                showToast('error', 'API函数未定义');
            } else {
                alert('API函数未定义');
            }
        }
    } catch (error) {
        console.error('加载组织成员失败:', error);
        if (typeof showToast === 'function') {
            showToast('error', '加载组织成员失败');
        } else {
            alert('加载组织成员失败');
        }
    }
}

// 渲染团队成员
function renderTeamMembers(members) {
    const container = document.getElementById('members-list');
    if (!container) return;

    // 清空现有的成员数据
    container.innerHTML = '';

    // 渲染成员列表
    if (members && members.length > 0) {
        members.forEach(member => {
            if (!member) return;
            
            const memberCard = document.createElement('div');
            memberCard.className = 'member-card';
            
            // 处理不同的数据结构
            const username = member.username || (member.user ? member.user.username : (member.teamMember && member.teamMember.user ? member.teamMember.user.username : (member.teamMember ? '用户ID: ' + member.teamMember.userId : '')));
            const position = member.position || '';
            const role = member.role || (member.teamMember ? member.teamMember.role : '');
            const userLevel = member.user_level || (member.user ? member.user.level : (member.teamMember && member.teamMember.user ? member.teamMember.user.userLevel : ''));
            const points = member.points || '';
            const department = member.department || '';
            
            let memberInfo = '';
            if (username) {
                memberInfo += `<div class="member-name">${username} ${position}</div>`;
            }
            if (role) {
                memberInfo += `<div class="member-role">${role}</div>`;
            }
            if (userLevel || points || department) {
                memberInfo += `<div class="member-meta">`;
                if (userLevel) memberInfo += `<span>职级: ${userLevel}</span>`;
                if (points) memberInfo += `<span>积分: ${points}</span>`;
                if (department) memberInfo += `<span>部门: ${department}</span>`;
                memberInfo += `</div>`;
            }
            
            if (memberInfo) {
                memberCard.innerHTML = `
                    <div class="member-avatar"><i class="fas fa-user-tie"></i></div>
                    <div class="member-info">
                        ${memberInfo}
                    </div>
                    <div class="member-actions">
                        <button class="btn btn-sm btn-outline">发送消息</button>
                        <button class="btn btn-sm btn-primary">查看详情</button>
                    </div>
                `;
                container.appendChild(memberCard);
            }
        });

        // 添加成员操作按钮事件
        addMemberActionListeners();
    }
}

// 添加成员操作按钮事件
function addMemberActionListeners() {
    // 发送消息按钮
    const messageButtons = document.querySelectorAll('.member-actions .btn-outline');
    messageButtons.forEach(button => {
        button.addEventListener('click', () => {
            const memberCard = button.closest('.member-card');
            const memberName = memberCard.querySelector('.member-name').textContent;

            // 在实际应用中，这里会打开聊天窗口
            alert(`向 ${memberName} 发送消息`);
        });
    });

    // 查看详情按钮
    const detailButtons = document.querySelectorAll('.member-actions .btn-primary');
    detailButtons.forEach(button => {
        button.addEventListener('click', () => {
            const memberCard = button.closest('.member-card');
            const memberName = memberCard.querySelector('.member-name').textContent;

            // 在实际应用中，这里会跳转到成员详情页面
            alert(`查看 ${memberName} 的详细信息`);
        });
    });
}

// 渲染团队动态
function renderTeamActivities(activities) {
    const container = document.getElementById('activities-feed');
    if (!container) return;

    // 清空现有的动态数据
    container.innerHTML = '';

    // 渲染动态列表
    if (activities && activities.length > 0) {
        activities.forEach(activity => {
            if (!activity || !activity.type || !activity.title) return;
            
            const activityItem = document.createElement('div');
            activityItem.className = 'activity-item';
            
            const icon = getActivityIcon(activity.type);
            
            let activityContent = `<div class="activity-icon"><i class="fas fa-${icon}"></i></div><div class="activity-content"><div class="activity-title">${activity.title}</div>`;
            
            if (activity.description) {
                activityContent += `<div class="activity-desc">${activity.description}</div>`;
            }
            
            if (activity.createdAt) {
                activityContent += `<div class="activity-time">${formatTime(activity.createdAt)}</div>`;
            }
            
            activityContent += `</div>`;
            activityItem.innerHTML = activityContent;
            container.appendChild(activityItem);
        });
    }
}

// 初始化组织架构图连接 - 使用orgchart.js
function initOrgChart(orgData) {
    // 检查是否已加载jQuery和orgchart
    if (typeof $ !== 'undefined' && $.fn.orgchart) {
        if (orgData) {
            // 使用传入的组织架构数据
            console.log('使用已加载的组织架构数据渲染图表...');
            const chartData = buildOrgChartData(orgData);
            
            console.log('构建的图表数据:', chartData);
            
            if (chartData) {
                console.log('开始渲染组织架构图...');
                $('#hierarchy-chart').orgchart({
                    data: chartData,
                    nodeContent: 'title',
                    verticalLevel: 3,
                    pan: true,
                    zoom: true
                });
                console.log('组织架构图渲染完成');
            } else {
                console.warn('没有有效的组织架构数据');
                $('#hierarchy-chart').html('<div class="empty-state">暂无组织架构数据</div>');
            }
        } else {
            // 从API获取组织架构数据（备用方案）
            if (typeof apiRequest === 'function' && typeof API_ENDPOINTS === 'object') {
                console.log('开始加载组织架构图数据...');
                apiRequest(API_ENDPOINTS.organizationStructure, {
                    credentials: 'include'
                }).then(response => {
                    console.log('组织架构数据响应:', response);
                    const orgData = response;
                    const chartData = buildOrgChartData(orgData);
                    
                    console.log('构建的图表数据:', chartData);
                    
                    if (chartData) {
                        console.log('开始渲染组织架构图...');
                        $('#hierarchy-chart').orgchart({
                            data: chartData,
                            nodeContent: 'title',
                            verticalLevel: 3,
                            pan: true,
                            zoom: true
                        });
                        console.log('组织架构图渲染完成');
                    } else {
                        console.warn('没有有效的组织架构数据');
                        $('#hierarchy-chart').html('<div class="empty-state">暂无组织架构数据</div>');
                    }
                }).catch(error => {
                    console.error('加载组织架构图失败:', error);
                    $('#hierarchy-chart').html('<div class="empty-state">加载组织架构失败</div>');
                    if (typeof showToast === 'function') {
                        showToast('error', '加载组织架构失败');
                    }
                });
            } else {
                console.error('API函数未定义，等待加载...');
                // 等待一段时间后再次尝试
                setTimeout(() => {
                    if (typeof apiRequest === 'function' && typeof API_ENDPOINTS === 'object') {
                        console.log('重试加载组织架构图数据...');
                        apiRequest(API_ENDPOINTS.organizationStructure, {
                            credentials: 'include'
                        }).then(response => {
                            console.log('组织架构数据响应:', response);
                            const orgData = response;
                            const chartData = buildOrgChartData(orgData);
                            
                            console.log('构建的图表数据:', chartData);
                            
                            if (chartData) {
                                console.log('开始渲染组织架构图...');
                                $('#hierarchy-chart').orgchart({
                                    data: chartData,
                                    nodeContent: 'title',
                                    verticalLevel: 3,
                                    pan: true,
                                    zoom: true
                                });
                                console.log('组织架构图渲染完成');
                            } else {
                                console.warn('没有有效的组织架构数据');
                                $('#hierarchy-chart').html('<div class="empty-state">暂无组织架构数据</div>');
                            }
                        }).catch(error => {
                            console.error('加载组织架构图失败:', error);
                            $('#hierarchy-chart').html('<div class="empty-state">加载组织架构失败</div>');
                        });
                    } else {
                        console.error('API函数加载失败');
                        $('#hierarchy-chart').html('<div class="empty-state">API函数加载失败</div>');
                    }
                }, 1000);
            }
        }
    } else {
        console.warn('jQuery或orgchart.js未加载，使用回退方案');
        // 回退到基本样式
        const orgNodes = document.querySelectorAll('.org-node');
        if (orgNodes.length > 0) {
            orgNodes.forEach(node => {
                // 添加悬停效果
                node.addEventListener('mouseenter', () => {
                    node.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                    node.style.transform = 'translateY(-2px)';
                });
                node.addEventListener('mouseleave', () => {
                    node.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.05)';
                    node.style.transform = 'translateY(0)';
                });
            });
        } else {
            $('#hierarchy-chart').html('<div class="empty-state">组织架构组件未加载</div>');
        }
    }
}

// 从API数据构建组织架构图数据
function buildOrgChartData(orgData) {
    console.log('开始构建组织架构图数据，原始数据:', orgData);
    
    // 找到根组织
    if (!orgData || !Array.isArray(orgData)) {
        console.error('组织架构数据格式错误，不是数组:', orgData);
        return null;
    }
    
    if (orgData.length === 0) {
        console.warn('组织架构数据为空数组');
        return null;
    }
    
    // 映射字段，确保数据结构一致
    const mappedData = orgData.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        parent_id: item.parentId || item.organizerId || null, // 映射不同的父组织字段，默认为null
        level: item.level || 1 // 提供默认 level 值
    })).filter(item => item.id && item.name); // 过滤掉没有id或name的项
    
    console.log('映射后的数据:', mappedData);
    
    if (mappedData.length === 0) {
        console.warn('映射后没有有效的组织数据');
        return null;
    }
    
    const rootOrg = mappedData.find(org => org.parent_id === null);
    if (!rootOrg || !rootOrg.name) {
        console.warn('未找到根组织或根组织没有名称');
        // 尝试使用第一个组织作为根组织
        const firstOrg = mappedData[0];
        if (firstOrg && firstOrg.name) {
            console.log('使用第一个组织作为根组织:', firstOrg.name);
            return buildNode(firstOrg);
        }
        return null;
    }

    console.log('找到根组织:', rootOrg.name);

    // 递归构建组织架构树
    function buildNode(org) {
        if (!org || !org.name) {
            return null;
        }
        
        const node = {
            name: org.name,
            title: org.description || org.name
        };

        // 找到子组织
        const children = mappedData.filter(child => child.parent_id === org.id);
        if (children && children.length > 0) {
            const validChildren = children.map(child => buildNode(child)).filter(Boolean);
            if (validChildren.length > 0) {
                node.children = validChildren;
            }
        }

        return node;
    }

    const chartData = buildNode(rootOrg);
    console.log('构建完成的图表数据:', chartData);
    return chartData;
}



// 根据组织层级获取图标
function getOrgIcon(level) {
    switch(level) {
        case 1: return 'crown';
        case 2: return 'building';
        case 3: return 'users';
        default: return 'user';
    }
}

// 获取组织层级标签
function getOrgLevelLabel(level) {
    switch(level) {
        case 1: return '高层';
        case 2: return '中层';
        case 3: return '基层';
        default: return '成员';
    }
}

// 根据动态类型获取图标
function getActivityIcon(type) {
    switch(type) {
        case 'promotion': return 'star';
        case 'cooperation': return 'handshake';
        case 'project': return 'project-diagram';
        case 'innovation': return 'lightbulb';
        case 'join': return 'user-plus';
        case 'leave': return 'user-minus';
        default: return 'bell';
    }
}

// 格式化时间
function formatTime(timestamp) {
    const now = new Date();
    const activityDate = new Date(timestamp);
    const diffMs = now - activityDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
        return `${diffMins}分钟前`;
    } else if (diffHours < 24) {
        return `${diffHours}小时前`;
    } else if (diffDays < 7) {
        return `${diffDays}天前`;
    } else {
        return activityDate.toLocaleDateString();
    }
}