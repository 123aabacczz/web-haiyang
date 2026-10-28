package com.example.demo.mapper;

import com.example.demo.model.Material;
import org.apache.ibatis.annotations.*;

import java.util.List;
import java.util.Map;

@Mapper
public interface MaterialMapper {
    @Insert("INSERT INTO materials(name, type, uploader_id, uploader_name, category, status, upload_time, path, description, file_size, download_count, view_count, tags, version, language, original_filename, project_id) " +
            "VALUES(#{name}, #{type}, #{uploaderId}, #{uploaderName}, #{category}, #{status}, #{uploadTime}, #{path}, #{description}, #{fileSize}, #{downloadCount}, #{viewCount}, #{tags}, #{version}, #{language}, #{originalFilename}, #{projectId})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insertMaterial(Material material);

    @Select("SELECT * FROM materials WHERE status = #{status} LIMIT #{limit} OFFSET #{offset}")
    List<Material> selectByStatus(@Param("status") Integer status,
                                  @Param("offset") int offset,
                                  @Param("limit") int limit);

    @Select("SELECT COUNT(*) FROM materials WHERE status = #{status}")
    long countByStatus(@Param("status") Integer status);

    // MaterialMapper.java - 确保SQL查询正确
    @Select("<script>" +
            "SELECT * FROM materials " +
            "<where>" +
            "   <if test='status != null'> AND status = #{status} </if>" +
            "   <if test='category != null'> AND category = #{category} </if>" +
            "   <if test='type != null'> AND type = #{type} </if>" +
            "</where>" +
            " ORDER BY upload_time DESC " +
            " LIMIT #{limit} OFFSET #{offset}" +
            "</script>")
    List<Material> selectByFilters(@Param("status") Integer status,
                                   @Param("category") String category,
                                   @Param("type") String type,
                                   @Param("offset") int offset,
                                   @Param("limit") int limit);


    @Update("UPDATE materials SET status = #{status}, reject_reason = #{reason} WHERE id = #{id}")
    int updateStatus(@Param("id") Long id,
                     @Param("status") Integer status,
                     @Param("reason") String reason);

    @Select("SELECT category, COUNT(*) as count FROM materials GROUP BY category")
    List<Map<String, Object>> countByCategory();

    // 在MaterialMapper中添加删除方法
    @Delete("DELETE FROM materials WHERE id = #{id}")
    int deleteById(@Param("id") Long id);

    @Select("SELECT * FROM materials ORDER BY upload_time DESC LIMIT #{limit} OFFSET #{offset}")
    List<Material> selectAll(@Param("offset") int offset, @Param("limit") int limit);

    @Select("SELECT COUNT(*) FROM materials")
    long countAll();

    @Select("SELECT * FROM materials WHERE id = #{id}")
    Material selectById(Long id);

    @Select("SELECT m.*, u.username as uploaderName FROM materials m " +
            "JOIN users u ON m.uploader_id = u.id " +
            "WHERE m.status = #{status} LIMIT #{limit} OFFSET #{offset}")
    List<Material> selectByStatusWithUser(@Param("status") Integer status,
                                          @Param("offset") int offset,
                                          @Param("limit") int limit);

    @Select("<script>" +
            "SELECT COUNT(*) FROM materials " +
            "<where>" +
            "   <if test='status != null'> AND status = #{status} </if>" +
            "   <if test='category != null'> AND category = #{category} </if>" +
            "   <if test='type != null'> AND type = #{type} </if>" +
            "</where>" +
            "</script>")
    long countByFilters(@Param("status") Integer status,
                        @Param("category") String category,
                        @Param("type") String type);

    List<Material> selectMaterials(
            @Param("status") Integer status,
            @Param("offset") int offset,
            @Param("size") int size
    );

    @Select("SELECT * FROM materials ORDER BY ${orderBy} LIMIT #{limit} OFFSET #{offset}")
    List<Material> selectAllWithOrder(@Param("orderBy") String orderBy,
                                      @Param("offset") int offset,
                                      @Param("limit") int limit);

    @Select("<script>" +
            "SELECT * FROM materials " +
            "<where>" +
            "   <if test='status != null'> AND status = #{status} </if>" +
            "   <if test='category != null'> AND category = #{category} </if>" +
            "   <if test='type != null'> AND type = #{type} </if>" +
            "</where>" +
            " ORDER BY ${orderBy} " +
            " LIMIT #{limit} OFFSET #{offset}" +
            "</script>")
    List<Material> selectByFiltersWithOrder(@Param("status") Integer status,
                                            @Param("category") String category,
                                            @Param("type") String type,
                                            @Param("orderBy") String orderBy,
                                            @Param("offset") int offset,
                                            @Param("limit") int limit);

    long countMaterials(@Param("status") Integer status);

    List<Material> selectMaterialsByCategoryAndType(
            @Param("status") Integer status,
            @Param("category") String category,
            @Param("type") String type,
            @Param("offset") int offset,
            @Param("size") int size
    );

    long countMaterialsByCategoryAndType(
            @Param("status") Integer status,
            @Param("category") String category,
            @Param("type") String type
    );

    @Select({"<script>",
            "SELECT m.*, u.username as uploaderName FROM materials m",
            "LEFT JOIN users u ON m.uploader_id = u.id",
            "<where>",
            "   <if test='keyword != null'>",
            "       AND (m.name LIKE CONCAT('%', #{keyword}, '%') OR m.description LIKE CONCAT('%', #{keyword}, '%'))",
            "   </if>",
            "   <if test='status != null'>",
            "       AND m.status = #{status}",
            "   </if>",
            "</where>",
            "ORDER BY m.upload_time DESC",
            "LIMIT #{limit} OFFSET #{offset}",
            "</script>"})
    List<Material> searchMaterials(@Param("keyword") String keyword,
                                   @Param("status") Integer status,
                                   @Param("offset") int offset,
                                   @Param("limit") int limit);

    @Select({"<script>",
            "SELECT COUNT(*) FROM materials m",
            "<where>",
            "   <if test='keyword != null'>",
            "       AND (m.name LIKE CONCAT('%', #{keyword}, '%') OR m.description LIKE CONCAT('%', #{keyword}, '%'))",
            "   </if>",
            "   <if test='status != null'>",
            "       AND m.status = #{status}",
            "   </if>",
            "</where>",
            "</script>"})
    long countSearchMaterials(@Param("keyword") String keyword,
                              @Param("status") Integer status);

    @Update({"<script>",
            "UPDATE materials SET status = #{status}, reject_reason = #{reason}",
            "WHERE id IN",
            "<foreach item='id' collection='ids' open='(' separator=',' close=')'>",
            "   #{id}",
            "</foreach>",
            "</script>"})
    int batchUpdateStatus(@Param("ids") List<Long> ids,
                          @Param("status") Integer status,
                          @Param("reason") String reason);

    @Update("UPDATE materials SET view_count = view_count + 1 WHERE id = #{id}")
    int incrementViewCount(@Param("id") Long id);

    @Select("SELECT category as name, COUNT(*) as count FROM materials GROUP BY category ORDER BY count DESC")
    List<Map<String, Object>> getMaterialCategories();

    @Select("SELECT type as name, COUNT(*) as count FROM materials GROUP BY type ORDER BY count DESC")
    List<Map<String, Object>> getMaterialTypes();

    @Update("UPDATE materials SET download_count = download_count + 1 WHERE id = #{id}")
    int incrementDownloadCount(@Param("id") Long id);

    @Select("SELECT status, COUNT(*) as count FROM materials GROUP BY status")
    List<Map<String, Object>> countByStatusGroup();

    @Select("SELECT DATE(upload_time) as date, COUNT(*) as count " +
            "FROM materials WHERE upload_time >= DATE_SUB(NOW(), INTERVAL #{days} DAY) " +
            "GROUP BY DATE(upload_time) ORDER BY date DESC")
    List<Map<String, Object>> countRecentUploads(@Param("days") int days);

    @Select("SELECT * FROM materials ORDER BY download_count DESC LIMIT #{limit}")
    List<Material> getTopDownloaded(@Param("limit") int limit);

    @Select("SELECT COUNT(*) FROM materials WHERE uploader_id = #{userId}")
    long countByUploader(@Param("userId") Long userId);

    @Select("SELECT * FROM materials WHERE uploader_id = #{userId} " +
            "ORDER BY upload_time DESC LIMIT #{limit} OFFSET #{offset}")
    List<Material> selectByUploader(@Param("userId") Long userId,
                                    @Param("offset") int offset,
                                    @Param("limit") int limit);

    @Update("UPDATE materials SET is_featured = #{isFeatured} WHERE id = #{id}")
    int updateFeaturedStatus(@Param("id") Long id, @Param("isFeatured") Boolean isFeatured);

    @Select("SELECT * FROM materials WHERE creator_id = #{creatorId} ORDER BY created_at DESC")
    List<Material> findByCreatorId(Integer creatorId);
}