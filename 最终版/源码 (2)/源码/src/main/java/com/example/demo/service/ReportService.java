package com.example.demo.service;

import com.example.demo.model.Report;
import com.example.demo.mapper.ReportMapper;
import com.example.demo.util.PageInfo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ReportService {
    private final ReportMapper reportMapper;

    public void createReport(Report report) {
        reportMapper.insert(report);
    }

    public void reviewReport(Long id, Integer status, String comment) {
        reportMapper.updateStatus(id, status, comment);
    }

    public List<Report> getAllReports() {
        return reportMapper.selectAll();
    }

    public List<Report> getReportsByStatus(Integer status) {
        return reportMapper.selectByStatus(status);
    }

    public Report getReportById(Long id) {
        return reportMapper.selectById(id);
    }

    public Map<String, Object> getUserMetrics(Long userId) {
        Map<String, Object> metrics = new HashMap<>();

        // 获取用户相关的项目统计
        int totalProjects = reportMapper.countUserProjects(userId);
        int completedProjects = reportMapper.countUserProjectsByStatus(userId, 2); // 2表示已完成
        int inProgressProjects = reportMapper.countUserProjectsByStatus(userId, 1); // 1表示进行中
        int delayedProjects = reportMapper.countUserProjectsByStatus(userId, 3); // 3表示延期

        metrics.put("totalProjects", totalProjects);
        metrics.put("completionRate", totalProjects > 0 ? (double) completedProjects / totalProjects * 100 : 0);
        metrics.put("inProgress", inProgressProjects);
        metrics.put("delayedProjects", delayedProjects);

        // 计算效率（这里简化处理，实际应根据更复杂的业务逻辑）
        double efficiency = 90.0; // 默认值
        if (totalProjects > 0) {
            efficiency = (double) completedProjects / totalProjects * 100;
            // 延期项目会降低效率
            efficiency -= delayedProjects * 5;
            efficiency = Math.max(efficiency, 0);
        }
        metrics.put("efficiency", efficiency);

        return metrics;
    }

    public Map<String, Object> getUserChartsData(Long userId) {
        Map<String, Object> chartsData = new HashMap<>();

        // 状态分布
        Map<String, Integer> statusDistribution = new HashMap<>();
        statusDistribution.put("已完成", reportMapper.countUserProjectsByStatus(userId, 2));
        statusDistribution.put("进行中", reportMapper.countUserProjectsByStatus(userId, 1));
        statusDistribution.put("未开始", reportMapper.countUserProjectsByStatus(userId, 0));
        statusDistribution.put("延期", reportMapper.countUserProjectsByStatus(userId, 3));
        chartsData.put("statusDistribution", statusDistribution);

        // 完成率趋势（简化实现，实际应从数据库按时间查询）
        Map<String, Double> completionTrend = new HashMap<>();
        completionTrend.put("1月", 65.0);
        completionTrend.put("2月", 70.0);
        completionTrend.put("3月", 72.0);
        completionTrend.put("4月", 75.0);
        completionTrend.put("5月", 73.0);
        completionTrend.put("6月", 78.0);
        chartsData.put("completionTrend", completionTrend);

        // 里程碑进度（简化实现）
        Map<String, Integer> milestoneProgress = new HashMap<>();
        milestoneProgress.put("需求", 100);
        milestoneProgress.put("设计", 100);
        milestoneProgress.put("开发", 85);
        milestoneProgress.put("测试", 60);
        milestoneProgress.put("部署", 20);
        chartsData.put("milestoneProgress", milestoneProgress);

        return chartsData;
    }

    /* === 追加到 ReportService.java 最下方 === */
    public void deleteReport(Long id) {
        reportMapper.deleteById(id);
    }
    public PageInfo<Report> getAllReports(int page, int size) {
        int offset = (page - 1) * size;
        List<Report> list = reportMapper.selectPage(offset, size);
        long total = reportMapper.countAll();
        PageInfo<Report> pi = new PageInfo<>();
        pi.setList(list); pi.setTotal(total); pi.setPage(page); pi.setPageSize(size);
        return pi;
    }

    public Map<String, Object> getSystemMetrics() {
        Map<String, Object> m = new HashMap<>();
        m.put("totalReports", reportMapper.countAll());
        m.put("pendingReports", reportMapper.countByStatus(0));
        m.put("approvedReports", reportMapper.countByStatus(1));
        return m;
    }

    public List<Report> getReportsByCreator(Long creatorId) {
        return reportMapper.findByCreatorId(creatorId);
    }
}