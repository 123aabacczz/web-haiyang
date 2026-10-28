// data-reports.js
import { apiRequest, API_ENDPOINTS } from '../../api-config.js';
import { showToast } from '../../toast.js';

// 图表实例
let chartInstances = {};
let currentChartsData = null;
let currentMetrics = null;

// 获取指标数据
async function fetchMetrics() {
  try {
    const response = await apiRequest(API_ENDPOINTS.reportMetrics);
    console.log('Metrics response:', response);

    // 检查响应是否包含错误消息
    if (response && response.message === '用户未登录') {
      showToast('error', '请先登录', 3000, '/login/login.html');
      return null;
    }

    return response;
  } catch (error) {
    console.error('获取指标数据失败:', error);

    // 处理特定的错误消息
    if (error.message.includes('用户未登录')) {
      showToast('error', '请先登录', 3000, '/login/login.html');
    } else {
      showToast('error', '获取指标数据失败: ' + error.message);
    }

    return null;
  }
}

// 获取图表数据
async function fetchChartsData() {
  try {
    const response = await apiRequest(API_ENDPOINTS.reportCharts);
    console.log('Charts response:', response);

    if (response && response.message === '用户未登录') {
      showToast('error', '请先登录', 3000, '/login/login.html');
      return null;
    }

    return response;
  } catch (error) {
    console.error('获取图表数据失败:', error);

    if (error.message.includes('用户未登录')) {
      showToast('error', '请先登录', 3000, '/login/login.html');
    } else {
      showToast('error', '获取图表数据失败: ' + error.message);
    }

    return null;
  }
}

// 初始化图表
function initCharts(chartsData) {
  currentChartsData = chartsData;

  // 销毁现有图表
  Object.values(chartInstances).forEach(chart => {
    if (chart && typeof chart.destroy === 'function') {
      chart.destroy();
    }
  });
  chartInstances = {};

  // 状态分布图
  if (chartsData.statusDistribution) {
    const ctx = document.getElementById('statusChart');
    if (ctx) {
      const statusData = chartsData.statusDistribution;
      const total = Object.values(statusData).reduce((sum, value) => sum + value, 0);

      // 更新摘要信息
      document.getElementById('in-progress-count').textContent = statusData['进行中'] || 0;
      document.getElementById('completed-count').textContent = statusData['已完成'] || 0;

      chartInstances.statusChart = new Chart(ctx.getContext('2d'), {
        type: 'pie',
        data: {
          labels: Object.keys(chartsData.statusDistribution),
          datasets: [{
            data: Object.values(chartsData.statusDistribution),
            backgroundColor: ['#10b981', '#3b82f6', '#94a3b8', '#ef4444', '#f59e0b']
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                padding: 15
              }
            },
            title: {
              display: true,
              text: '项目状态分布',
              font: {
                size: 16
              }
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const label = context.label || '';
                  const value = context.raw || 0;
                  const percentage = Math.round((value / total) * 100);
                  return `${label}: ${value} (${percentage}%)`;
                }
              }
            }
          }
        }
      });
    }
  }

  // 完成率趋势图
  if (chartsData.completionTrend) {
    const ctx = document.getElementById('trendChart');
    if (ctx) {
      const trendData = Object.values(chartsData.completionTrend);
      const avgCompletion = Math.round(trendData.reduce((sum, value) => sum + value, 0) / trendData.length);
      const maxCompletion = Math.max(...trendData);

      // 更新摘要信息
      document.getElementById('avg-completion').textContent = `${avgCompletion}%`;
      document.getElementById('max-completion').textContent = `${maxCompletion}%`;

      chartInstances.trendChart = new Chart(ctx.getContext('2d'), {
        type: 'line',
        data: {
          labels: Object.keys(chartsData.completionTrend),
          datasets: [{
            label: '完成率',
            data: Object.values(chartsData.completionTrend),
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true,
            tension: 0.3,
            pointBackgroundColor: '#3b82f6',
            pointRadius: 4,
            pointHoverRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: '完成率趋势',
              font: {
                size: 16
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              max: 100,
              ticks: {
                callback: function(value) {
                  return value + '%';
                }
              }
            }
          }
        }
      });
    }
  }

  // 里程碑进度图
  if (chartsData.milestoneProgress) {
    const ctx = document.getElementById('milestoneChart');
    if (ctx) {
      const milestoneData = chartsData.milestoneProgress;
      const values = Object.values(milestoneData);
      const avgProgress = Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);

      // 找到进度最慢的里程碑
      let slowestMilestone = '-';
      let minProgress = 100;
      Object.entries(milestoneData).forEach(([key, value]) => {
        if (value < minProgress) {
          minProgress = value;
          slowestMilestone = key;
        }
      });

      // 更新摘要信息
      document.getElementById('avg-milestone').textContent = `${avgProgress}%`;
      document.getElementById('slowest-milestone').textContent = slowestMilestone;

      chartInstances.milestoneChart = new Chart(ctx.getContext('2d'), {
        type: 'doughnut',
        data: {
          labels: Object.keys(chartsData.milestoneProgress),
          datasets: [{
            data: Object.values(chartsData.milestoneProgress),
            backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4']
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                padding: 15
              }
            },
            title: {
              display: true,
              text: '里程碑进度',
              font: {
                size: 16
              }
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  return `${context.label}: ${context.raw}%`;
                }
              }
            }
          }
        }
      });
    }
  }
}

// 更新指标卡片
function updateMetricsCards(metrics) {
  if (!metrics) return;
  currentMetrics = metrics;

  const metricCards = document.querySelectorAll('.metric-card');
  if (metricCards.length >= 4) {
    metricCards[0].querySelector('.metric-value').textContent = metrics.totalProjects || 0;
    metricCards[1].querySelector('.metric-value').textContent = Math.round(metrics.completionRate || 0) + '%';
    metricCards[2].querySelector('.metric-value').textContent = Math.round(metrics.efficiency || 0) + '%';
    metricCards[3].querySelector('.metric-value').textContent = metrics.delayedProjects || 0;
  }
}

// 加载数据报告
async function loadDataReports() {
  // 显示加载状态，隐藏错误状态
  const loadingState = document.getElementById('loading-state');
  const errorState = document.getElementById('error-state');
  const metricsGrid = document.querySelector('.metrics-grid');
  const chartsGrid = document.querySelector('.charts-grid');

  loadingState.style.display = 'block';
  errorState.style.display = 'none';

  // 显示骨架屏
  document.querySelectorAll('.metric-value').forEach(el => {
    el.innerHTML = '<div class="skeleton" style="width:50px;height:24px;display:inline-block"></div>';
  });

  try {
    // 获取数据
    const [metricsResponse, chartsResponse, reportsResponse] = await Promise.all([
      fetchMetrics(),
      fetchChartsData(),
      fetchReportsList()
    ]);

    console.log('Metrics:', metricsResponse, 'Charts:', chartsResponse, 'Reports:', reportsResponse);

    // 检查响应是否有效
    if (metricsResponse === null || chartsResponse === null) {
      throw new Error('获取数据失败');
    }

    // 更新UI
    updateMetricsCards(metricsResponse);
    initCharts(chartsResponse);

    // 更新项目列表
    if (reportsResponse && Array.isArray(reportsResponse.data)) {
      updateReportsList(reportsResponse.data);
    } else {
      updateReportsList(reportsResponse);
    }

    // 隐藏加载状态
    loadingState.style.display = 'none';
  } catch (error) {
    console.error('加载数据报告失败:', error);
    // 显示错误状态
    loadingState.style.display = 'none';
    errorState.style.display = 'block';
  }
}

// 初始化筛选器事件
function initFilters() {
  const timeRangeSelect = document.getElementById('time-range');
  const projectTypeSelect = document.getElementById('project-type');

  if (timeRangeSelect) {
    timeRangeSelect.addEventListener('change', loadDataReports);
  }

  if (projectTypeSelect) {
    projectTypeSelect.addEventListener('change', loadDataReports);
  }
}

// 初始化按钮事件
function initButtons() {
  const refreshBtn = document.getElementById('refresh-btn');
  const exportBtn = document.getElementById('export-btn');

  if (refreshBtn) {
    refreshBtn.addEventListener('click', loadDataReports);
  }

  if (exportBtn) {
    exportBtn.addEventListener('click', exportReport);
  }
}

// 初始化图表全屏功能
function initChartFullscreen() {
  const modal = document.getElementById('chart-modal');
  const closeBtn = document.querySelector('.close');
  const modalChart = document.getElementById('modal-chart');
  const modalTitle = document.getElementById('modal-chart-title');

  // 关闭模态框
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      modal.style.display = 'none';
    });
  }

  // 点击模态框外部关闭
  window.addEventListener('click', (event) => {
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  });

  // 图表全屏按钮事件
  document.querySelectorAll('.chart-action-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const chartId = btn.getAttribute('data-chart');
      const chartInstance = chartInstances[chartId];

      if (chartInstance) {
        modalTitle.textContent = btn.closest('.chart-card').querySelector('h3').textContent;
        modal.style.display = 'block';

        // 销毁现有的模态框图表
        if (chartInstances.modalChart) {
          chartInstances.modalChart.destroy();
        }

        // 创建新的图表实例
        const ctx = modalChart.getContext('2d');
        chartInstances.modalChart = new Chart(ctx, {
          type: chartInstance.config.type,
          data: JSON.parse(JSON.stringify(chartInstance.config.data)),
          options: JSON.parse(JSON.stringify(chartInstance.config.options))
        });
      }
    });
  });
}

// 导出报告
function exportReport() {
  showToast('info', '导出功能开发中', 2000);
  // 实际项目中这里可以实现PDF导出功能
}

// 添加页面加载事件监听
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    loadDataReports();
    initFilters();
    initButtons();
    initChartFullscreen();
  });
} else {
  loadDataReports();
  initFilters();
  initButtons();
  initChartFullscreen();
}

// 获取项目列表数据
async function fetchReportsList() {
  try {
    const response = await apiRequest(API_ENDPOINTS.myProjects);
    console.log('Projects list response:', response);

    if (response && response.message === '用户未登录') {
      showToast('error', '请先登录', 3000, '/login/login.html');
      return null;
    }

    return response;
  } catch (error) {
    console.error('获取项目列表失败:', error);

    if (error.message.includes('用户未登录')) {
      showToast('error', '请先登录', 3000, '/login/login.html');
    } else {
      console.error('获取项目列表失败:', error);
    }

    return null;
  }
}

// 更新项目列表
function updateReportsList(projects) {
  const tableBody = document.getElementById('reports-table-body');
  if (!tableBody) return;

  if (!projects || projects.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="6" class="table-loading">暂无项目数据</td></tr>';
    return;
  }

  // 只显示最近5个项目
  const recentProjects = projects.slice(0, 5);

  let html = '';
  recentProjects.forEach(project => {
    // 确定状态徽章类
    let statusClass = 'status-pending';
    let statusText = '未开始';

    if (project.status === 'progress') {
      statusClass = 'status-progress';
      statusText = '进行中';
    } else if (project.status === 'completed') {
      statusClass = 'status-completed';
      statusText = '已完成';
    } else if (project.status === 'delayed') {
      statusClass = 'status-delayed';
      statusText = '已延期';
    }

    // 格式化日期
    const formatDate = (dateString) => {
      if (!dateString) return '-';
      return new Date(dateString).toLocaleDateString('zh-CN');
    };

    html += `
      <tr>
        <td>${project.name || '未命名项目'}</td>
        <td>${project.type || '未分类'}</td>
        <td>${formatDate(project.createdAt)}</td>
        <td>${formatDate(project.updatedAt)}</td>
        <td><span class="status-badge ${statusClass}">${statusText}</span></td>
        <td><a href="/projects/detail.html?id=${project.id}" class="table-action">查看详情</a></td>
      </tr>
    `;
  });

  tableBody.innerHTML = html;
}