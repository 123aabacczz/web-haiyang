package com.example.demo.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;
import java.util.Map;

@Mapper
public interface TagMapper {

    @Select("SELECT id, tag_name as tagName, visit_count as visitCount, last_visited as lastVisited FROM task_tag_stats ORDER BY tag_name")
    List<Map<String, Object>> findAllTags();

    @Select("SELECT id, tag_name as tagName, visit_count as visitCount, last_visited as lastVisited FROM task_tag_stats ORDER BY visit_count DESC LIMIT #{limit}")
    List<Map<String, Object>> findPopularTags(@Param("limit") Integer limit);
}