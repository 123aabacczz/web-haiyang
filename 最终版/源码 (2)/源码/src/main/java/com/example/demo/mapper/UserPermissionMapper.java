package com.example.demo.mapper;

import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface UserPermissionMapper {
    @Delete("DELETE FROM user_permissions WHERE user_id = #{userId}")
    void deleteAllByUserId(@Param("userId") Long userId);
}