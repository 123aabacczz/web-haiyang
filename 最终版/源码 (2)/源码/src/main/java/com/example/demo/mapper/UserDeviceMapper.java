package com.example.demo.mapper;

import com.example.demo.model.UserDevice;
import org.apache.ibatis.annotations.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Mapper
public interface UserDeviceMapper {
    @Select("SELECT * FROM user_devices WHERE user_id = #{userId}")
    @Results({
            @Result(property = "userId", column = "user_id"),
            @Result(property = "deviceId", column = "device_id"),
            @Result(property = "deviceName", column = "device_name"),
            @Result(property = "ipAddress", column = "ip_address"),
            @Result(property = "lastActivity", column = "last_activity"),
            @Result(property = "createdAt", column = "created_at")
    })
    List<UserDevice> findByUserId(@Param("userId") Long userId);

    @Delete("DELETE FROM user_devices WHERE user_id = #{userId} AND device_id = #{deviceId}")
    int deleteByUserAndDeviceId(@Param("userId") Long userId, @Param("deviceId") String deviceId);

    @Insert("INSERT INTO user_devices (user_id, device_id, device_name, browser, os, ip_address, location, last_activity) " +
            "VALUES (#{userId}, #{deviceId}, #{deviceName}, #{browser}, #{os}, #{ipAddress}, #{location}, #{lastActivity})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(UserDevice device);

    @Update("UPDATE user_devices SET last_activity = #{lastActivity} WHERE user_id = #{userId} AND device_id = #{deviceId}")
    int updateLastActivity(UserDevice device);
}