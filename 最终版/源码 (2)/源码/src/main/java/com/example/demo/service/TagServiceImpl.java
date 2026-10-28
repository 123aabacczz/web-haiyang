// TagServiceImpl.java
package com.example.demo.service;

import com.example.demo.mapper.TagMapper;
import com.example.demo.model.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Slf4j
public class TagServiceImpl implements TagService {

    @Autowired
    private TagMapper tagMapper;

    @Override
    public List<Map<String, Object>> getAllTags() {
        return tagMapper.findAllTags();
    }

    @Override
    public List<Map<String, Object>> getPopularTags(Integer limit) {
        return tagMapper.findPopularTags(limit);
    }

    // 在 TagServiceImpl.java 中添加方法
    public List<Tag> getAllTagsAsEntities() {
        List<Map<String, Object>> tagMaps = tagMapper.findAllTags();
        return tagMaps.stream()
                .map(map -> new Tag(
                        ((Number) map.get("id")).longValue(),
                        (String) map.get("tagName"),
                        ((Number) map.get("visitCount")).intValue(),
                        (LocalDateTime) map.get("lastVisited")
                ))
                .collect(Collectors.toList());
    }
}