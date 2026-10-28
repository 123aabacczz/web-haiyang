package com.example.demo.mapper;

import com.example.demo.model.Task;
import org.apache.ibatis.annotations.*;

import java.util.List;
import java.util.Map;

@Mapper
public interface TaskMapper {

    @Select("SELECT * FROM task WHERE id = #{id} AND is_deleted = 0")
    Task findById(Long id);

    @Select({"<script>",
            "SELECT t.*, u1.username as assignee_name, u2.username as reviewer_name FROM task t",
            "LEFT JOIN users u1 ON t.assignee_id = u1.id",  // 修改这里
            "LEFT JOIN users u2 ON t.reviewer_id = u2.id",  // 修改这里
            "WHERE t.is_deleted = 0",
            "<if test='status != null'>AND t.status = #{status}</if>",
            "<if test='priority != null'>AND t.priority = #{priority}</if>",
            "<if test='keyword != null'>AND (t.title LIKE CONCAT('%', #{keyword}, '%') OR t.description LIKE CONCAT('%', #{keyword}, '%'))</if>",
            "ORDER by t.create_time DESC",
            "LIMIT #{offset}, #{pageSize}",
            "</script>"})
    List<Task> findTasks(Map<String, Object> params);

    @Select({"<script>",
            "SELECT COUNT(*) FROM task t WHERE t.is_deleted = 0",
            "<if test='status != null'>AND t.status = #{status}</if>",
            "<if test='priority != null'>AND t.priority = #{priority}</if>",
            "<if test='keyword != null'>AND (t.title LIKE CONCAT('%', #{keyword}, '%') OR t.description LIKE CONCAT('%', #{keyword}, '%'))</if>",
            "</script>"})
    int countTasks(Map<String, Object> params);

    @Select("SELECT t.*, u1.username as assignee_name, u2.username as reviewer_name FROM task t " +
            "LEFT JOIN users u1 ON t.assignee_id = u1.id " +  // 修改这里
            "LEFT JOIN users u2 ON t.reviewer_id = u2.id " +  // 修改这里
            "WHERE t.status = 0 AND t.is_deleted = 0 ORDER BY t.create_time DESC " +
            "LIMIT #{offset}, #{pageSize}")
    List<Task> findPendingTasks(@Param("offset") int offset, @Param("pageSize") int pageSize);

    @Select("SELECT COUNT(*) FROM task WHERE status = 0 AND is_deleted = 0")
    int countPendingTasks();

    @Insert("INSERT INTO task (title, description, assignee_id, priority, status, create_time, " +
            "update_time, attachment_url, creator_id, creator_name, material_id, is_deleted, reward) " +
            "VALUES (#{title}, #{description}, #{assigneeId}, #{priority}, #{status}, #{createTime}, " +
            "#{updateTime}, #{attachmentUrl}, #{creatorId}, #{creatorName}, #{materialId}, #{isDeleted}, #{reward})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(Task task);

    @Update("UPDATE task SET title=#{title}, description=#{description}, assignee_id=#{assigneeId}, " +
            "priority=#{priority}, status=#{status}, update_time=#{updateTime}, start_time=#{startTime}, " +
            "end_time=#{endTime}, reviewer_id=#{reviewerId}, review_time=#{reviewTime}, " +
            "review_comment=#{reviewComment}, attachment_url=#{attachmentUrl}, " +
            "progress=#{progress} WHERE id=#{id} AND is_deleted=0")
    int update(Task task);

    @Update("UPDATE task SET is_deleted=1, update_time=NOW() WHERE id=#{id}")
    int deleteById(Long id);

    @Update("UPDATE task SET status=#{status}, reviewer_id=#{reviewerId}, review_time=NOW(), " +
            "review_comment=#{reviewComment} WHERE id=#{id} AND is_deleted=0")
    int reviewTask(@Param("id") Long id, @Param("status") Integer status,
                   @Param("reviewerId") Long reviewerId, @Param("reviewComment") String reviewComment);

    @Select("SELECT username FROM users")  // 只检索用户名
    List<Map<String, Object>> findAdminUsers();

    // 新增：查询最近的任务
    @Select("SELECT t.*, u1.username as assignee_name, u2.username as reviewer_name FROM task t " +
            "LEFT JOIN users u1 ON t.assignee_id = u1.id " +
            "LEFT JOIN users u2 ON t.reviewer_id = u2.id " +
            "WHERE t.is_deleted = 0 ORDER BY t.create_time DESC LIMIT 10")
    List<Task> selectRecentTasks();
}