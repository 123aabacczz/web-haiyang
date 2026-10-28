package com.example.demo.controller;

import com.example.demo.common.ApiResponse;
import com.example.demo.service.TagService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tags")
@Slf4j
public class TagController {

    @Autowired
    private TagService tagService;

    @GetMapping
    public ApiResponse<List<Map<String, Object>>> getAllTags() {
        try {
            List<Map<String, Object>> tags = tagService.getAllTags();
            return ApiResponse.success(tags);
        } catch (Exception e) {
            log.error("获取标签列表失败", e);
            return ApiResponse.error("获取标签列表失败: " + e.getMessage());
        }
    }

    @GetMapping("/popular")
    public ApiResponse<List<Map<String, Object>>> getPopularTags(
            @RequestParam(defaultValue = "20") Integer limit) {
        try {
            List<Map<String, Object>> tags = tagService.getPopularTags(limit);
            return ApiResponse.success(tags);
        } catch (Exception e) {
            log.error("获取热门标签失败", e);
            return ApiResponse.error("获取热门标签失败: " + e.getMessage());
        }
    }
}