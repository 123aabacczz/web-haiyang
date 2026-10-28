package com.example.demo.mapper;

import com.example.demo.model.UserProfile;
import org.apache.ibatis.annotations.*;

@Mapper
public interface UserProfileMapper {

    @Insert("INSERT INTO user_profiles (user_id, username, title, level, bio, created_at, updated_at) " +
            "VALUES (#{userId}, #{username}, #{title}, #{level}, #{bio}, #{createdAt}, #{updatedAt})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(UserProfile userProfile);

    @Select("SELECT * FROM user_profiles WHERE user_id = #{userId}")
    UserProfile selectByUserId(@Param("userId") Long userId);

    @Update("UPDATE user_profiles SET username = #{username}, title = #{title}, level = #{level}, " +
            "bio = #{bio}, updated_at = #{updatedAt} WHERE user_id = #{userId}")
    int updateByUserId(UserProfile userProfile);

    @Delete("DELETE FROM user_profiles WHERE user_id = #{userId}")
    int deleteByUserId(@Param("userId") Long userId);
}