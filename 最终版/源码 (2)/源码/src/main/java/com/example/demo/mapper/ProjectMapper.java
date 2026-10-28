package com.example.demo.mapper;

import com.example.demo.model.Project;
import org.apache.ibatis.annotations.*;

import java.util.List;

@Mapper
public interface ProjectMapper {
    @Insert("INSERT INTO projects (name, type, creator_id, status, created_at) " +
            "VALUES (#{name}, #{type}, #{creatorId}, #{status}, NOW())")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(Project project);

    @Select("SELECT * FROM projects WHERE id = #{id}")
    Project findById(Integer id);

    @Select("SELECT * FROM projects WHERE creator_id = #{creatorId} ORDER BY created_at DESC")
    List<Project> findByCreatorId(Long creatorId);

    @Select("SELECT * FROM projects WHERE id = #{id}")
    Project selectById(Integer id);
}
