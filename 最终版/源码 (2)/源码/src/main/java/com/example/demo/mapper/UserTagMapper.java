package com.example.demo.mapper;

import com.example.demo.model.UserTag;
import org.apache.ibatis.annotations.*;
import java.util.List;

@Mapper
public interface UserTagMapper {

    @Insert("INSERT INTO user_tags (user_id, tag_name, created_at) VALUES (#{userId}, #{tagName}, #{createdAt})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(UserTag userTag);

    @Select("SELECT * FROM user_tags WHERE user_id = #{userId}")
    List<UserTag> selectByUserId(@Param("userId") Long userId);

    @Delete("DELETE FROM user_tags WHERE user_id = #{userId}")
    int deleteByUserId(@Param("userId") Long userId);

    @Delete("DELETE FROM user_tags WHERE id = #{id}")
    int deleteById(@Param("id") Long id);
}