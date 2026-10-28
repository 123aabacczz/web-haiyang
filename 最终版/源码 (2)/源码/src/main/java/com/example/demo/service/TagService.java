package com.example.demo.service;

// TagService.java

import java.util.List;
import java.util.Map;

public interface TagService {
    List<Map<String, Object>> getAllTags();
    List<Map<String, Object>> getPopularTags(Integer limit);
}