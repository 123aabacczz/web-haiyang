package com.example.demo.controller;

import com.example.demo.common.ApiResponse;
import com.example.demo.model.Report;
import com.example.demo.service.ReportService;
import com.example.demo.util.PageInfo;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 后台报告管理专用控制器
 */
@RestController
@RequestMapping({"/api/admin/home-info/reports", "/api/reports/manage"})
@RequiredArgsConstructor
public class AdminReportController {

    private final ReportService reportService;

    /* ====== 分页列表 ====== */
    @GetMapping
    public ApiResponse<PageInfo<Report>> list(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.success(reportService.getAllReports(page, size));
    }

    /* ====== 待审核列表 ====== */
    @GetMapping("/pending")
    public ApiResponse<List<Report>> pending() {
        return ApiResponse.success(reportService.getReportsByStatus(0));
    }

    /* ====== 审核 ====== */
    @PutMapping("/{id}/review")
    public ApiResponse<Report> review(@PathVariable Long id,
                                      @RequestParam Integer status,
                                      @RequestParam(required = false) String comment) {
        reportService.reviewReport(id, status, comment);
        return ApiResponse.success(reportService.getReportById(id));
    }

    /* ====== 详情 ====== */
    @GetMapping("/{id}")
    public ApiResponse<Report> detail(@PathVariable Long id) {
        return ApiResponse.success(reportService.getReportById(id));
    }

    /* ====== 删除 ====== */
    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        reportService.deleteReport(id);
        return ApiResponse.success("报告已删除");
    }

    /* ====== 后台指标面板 ====== */
    @GetMapping("/metrics")
    public ApiResponse<Map<String, Object>> metrics() {
        // 可返回全站指标，这里示例返回空
        return ApiResponse.success(reportService.getSystemMetrics());
    }
}