package com.example.demo.mapper;

import com.example.demo.model.Permission;
import org.apache.ibatis.annotations.*;

import java.util.List;

@Mapper
public interface PermissionMapper {

    // ✅ 插入权限
    @Insert("INSERT INTO permissions(module_id, name, description) " +
            "VALUES(#{moduleId}, #{name}, #{description})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insertPermission(Permission permission);

    // ✅ 删除权限
    @Delete("DELETE FROM permissions WHERE id = #{id}")
    int deletePermission(Long id);

    // ✅ 根据模块查询权限
    @Select("SELECT * FROM permissions WHERE module_id = #{moduleId}")
    List<Permission> selectByModuleId(Long moduleId);

    // ✅ 根据用户查询权限
    @Select("SELECT p.* FROM user_permissions up " +
            "JOIN permissions p ON up.permission_id = p.id " +
            "WHERE up.user_id = #{userId}")
    List<Permission> selectByUserId(Long userId);

    // ✅ 为用户分配权限（新增）
    @Insert("INSERT INTO user_permissions(user_id, permission_id) VALUES(#{userId}, #{permissionId})")
    int assignPermissionToUser(@Param("userId") Long userId, @Param("permissionId") Long permissionId);

    // ✅ 撤销用户权限（新增）
    @Delete("DELETE FROM user_permissions WHERE user_id = #{userId} AND permission_id = #{permissionId}")
    int revokePermissionFromUser(@Param("userId") Long userId, @Param("permissionId") Long permissionId);

    // 新增查询所有权限
    @Select("SELECT id, module_id AS moduleId, name, description FROM permissions")
    List<Permission> selectAll();

    @Update("UPDATE permissions SET name = #{name}, description = #{description} WHERE id = #{id}")
    int updatePermission(Permission permission);

    @Insert("INSERT INTO permissions(module_id, name, description) " +
            "VALUES(#{moduleId}, #{name}, #{description})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    void insert(Permission permission);  // 修改为void并添加主键回填
}