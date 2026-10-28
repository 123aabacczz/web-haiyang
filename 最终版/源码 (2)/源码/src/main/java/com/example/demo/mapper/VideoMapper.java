package com.example.demo.mapper;

import com.example.demo.model.Video;
import org.apache.ibatis.annotations.Mapper;
import java.util.List;

@Mapper
public interface VideoMapper {
    int insert(Video video);
    int updateByPrimaryKey(Video video);
    int deleteByPrimaryKey(Integer id);
    Video selectByPrimaryKey(Integer id);
    List<Video> selectByCourseId(Integer courseId);
    List<Video> selectAll();
}