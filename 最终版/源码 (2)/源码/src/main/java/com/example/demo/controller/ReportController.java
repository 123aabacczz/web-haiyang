// ReportController.java
package com.example.demo.controller;

import com.example.demo.model.Report;
import com.example.demo.model.User; // 添加User导入
import com.example.demo.service.ReportService;
import com.example.demo.common.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
public class ReportController {
    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    // 获取数据报告指标
    @GetMapping("/metrics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getMetrics(HttpServletRequest request) {
        HttpSession session = request.getSession();
        User user = (User) session.getAttribute("user"); // 修改这里

        if (user == null) {
            return ResponseEntity.ok(ApiResponse.error("用户未登录"));
        }

        Map<String, Object> metrics = reportService.getUserMetrics(user.getId()); // 修改这里
        return ResponseEntity.ok(ApiResponse.success(metrics));
    }

    // 获取图表数据
    @GetMapping("/charts")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getChartsData(HttpServletRequest request) { // 修改参数名
        HttpSession session = request.getSession();
        User user = (User) session.getAttribute("user"); // 修改这里

        if (user == null) {
            return ResponseEntity.ok(ApiResponse.error("用户未登录"));
        }

        Map<String, Object> chartsData = reportService.getUserChartsData(user.getId()); // 修改这里
        return ResponseEntity.ok(ApiResponse.success(chartsData));
    }

    // 获取用户自己的报告列表
    @GetMapping("/my-reports")
    public ResponseEntity<ApiResponse<List<Report>>> getUserReports(HttpServletRequest request) { // 修改参数名
        HttpSession session = request.getSession();
        User user = (User) session.getAttribute("user"); // 修改这里

        if (user == null) {
            return ResponseEntity.ok(ApiResponse.error("用户未登录"));
        }

        List<Report> reports = reportService.getReportsByCreator(user.getId()); // 修改这里
        return ResponseEntity.ok(ApiResponse.success(reports));
    }

    // 创建报告
    @PostMapping
    public ResponseEntity<ApiResponse<Report>> createReport(@RequestBody Report report, HttpServletRequest request) { // 修改参数名
        HttpSession session = request.getSession();
        User user = (User) session.getAttribute("user"); // 修改这里

        if (user == null) {
            return ResponseEntity.ok(ApiResponse.error("用户未登录"));
        }

        report.setCreatorId(user.getId()); // 修改这里
        reportService.createReport(report);
        return ResponseEntity.ok(ApiResponse.success("报告创建成功", report));
    }

    // 获取特定报告详情
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Report>> getReport(@PathVariable Long id, HttpServletRequest request) { // 修改参数名
        HttpSession session = request.getSession();
        User user = (User) session.getAttribute("user"); // 修改这里

        if (user == null) {
            return ResponseEntity.ok(ApiResponse.error("用户未登录"));
        }

        Report report = reportService.getReportById(id);

        // 检查用户是否有权限访问此报告
        if (report != null && !report.getCreatorId().equals(user.getId())) { // 修改这里
            return ResponseEntity.ok(ApiResponse.error("无权访问此报告"));
        }

        return ResponseEntity.ok(ApiResponse.success(report));
    }
}