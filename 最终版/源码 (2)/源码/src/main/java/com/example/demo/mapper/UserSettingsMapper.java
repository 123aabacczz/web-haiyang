// UserSettingsMapper.java
package com.example.demo.mapper;

import com.example.demo.model.UserSettings;
import org.apache.ibatis.annotations.*;
import com.example.demo.handler.MapTypeHandler;

@Mapper
public interface UserSettingsMapper {

    @Select("SELECT * FROM user_settings WHERE user_id = #{userId}")
    @Results({
            @Result(property = "notificationSettings", column = "notification_settings", typeHandler = MapTypeHandler.class),
            @Result(property = "privacySettings", column = "privacy_settings", typeHandler = MapTypeHandler.class)
    })
    UserSettings findByUserId(@Param("userId") Long userId);

    @Insert("INSERT INTO user_settings (user_id, notification_settings, privacy_settings, language, theme) " +
            "VALUES (#{userId}, #{notificationSettings, typeHandler=com.example.demo.handler.MapTypeHandler}, " +
            "#{privacySettings, typeHandler=com.example.demo.handler.MapTypeHandler}, #{language}, #{theme})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    void insert(UserSettings settings);

    @Update("UPDATE user_settings SET notification_settings = #{notificationSettings, typeHandler=com.example.demo.handler.MapTypeHandler}, " +
            "privacy_settings = #{privacySettings, typeHandler=com.example.demo.handler.MapTypeHandler}, language = #{language}, theme = #{theme} " +
            "WHERE user_id = #{userId}")
    void update(UserSettings settings);
}