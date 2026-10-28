// ReportMapper.java
package com.example.demo.mapper;

import com.example.demo.model.Report;
import org.apache.ibatis.annotations.*;

import java.util.List;

@Mapper
public interface ReportMapper {
    @Insert("INSERT INTO report(title, type, content, creator_id, start_date, end_date, submit_time, status) " +
            "VALUES(#{title}, #{type}, #{content}, #{creatorId}, #{startDate}, #{endDate}, NOW(), #{status})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    void insert(Report report);

    @Update("UPDATE report SET status=#{status}, review_comment=#{reviewComment} WHERE id=#{id}")
    void updateStatus(@Param("id") Long id, @Param("status") Integer status,
                      @Param("reviewComment") String reviewComment);

    @Select("SELECT * FROM report ORDER BY submit_time DESC")
    List<Report> selectAll();

    @Select("SELECT * FROM report WHERE status=#{status} ORDER BY submit_time DESC")
    List<Report> selectByStatus(Integer status);

    @Select("SELECT * FROM report WHERE id=#{id}")
    Report selectById(Long id);

    @Select("SELECT COUNT(*) FROM report WHERE status = #{status}")
    int countByStatus(@Param("status") int status);

    @Select("SELECT COUNT(*) FROM report WHERE creator_id = #{userId} AND status = #{status}")
    int countUserProjectsByStatus(@Param("userId") Long userId, @Param("status") int status);

    @Select("SELECT COUNT(*) FROM report WHERE creator_id = #{userId}")
    int countUserProjects(@Param("userId") Long userId);

    @Update("UPDATE report SET file_path = #{filePath} WHERE id = #{id}")
    int updateFilePath(@Param("id") Long id, @Param("filePath") String filePath);

    @Select("SELECT * FROM report WHERE creator_id = #{creatorId} ORDER BY created_at DESC")
    List<Report> findByCreatorId(Long creatorId);

    @Delete("DELETE FROM report WHERE id = #{id}")
    void deleteById(Long id);

    @Select("SELECT * FROM report LIMIT #{limit} OFFSET #{offset}")
    List<Report> selectPage(@Param("offset") int offset, @Param("limit") int limit);

    @Select("SELECT COUNT(*) FROM report")
    long countAll();
}