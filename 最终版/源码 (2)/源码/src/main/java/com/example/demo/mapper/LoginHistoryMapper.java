package com.example.demo.mapper;

import com.example.demo.model.LoginHistory;
import org.apache.ibatis.annotations.*;
import java.util.List;

@Mapper
public interface LoginHistoryMapper {
    @Select("SELECT * FROM login_history WHERE user_id = #{userId} ORDER BY login_time DESC LIMIT #{limit} OFFSET #{offset}")
    @Results({
            @Result(property = "userId", column = "user_id"),
            @Result(property = "deviceId", column = "device_id"),
            @Result(property = "loginTime", column = "login_time")
    })
    List<LoginHistory> findByUserId(@Param("userId") Long userId, @Param("offset") int offset, @Param("limit") int limit);

    @Select("SELECT COUNT(*) FROM login_history WHERE user_id = #{userId}")
    int countByUserId(@Param("userId") Long userId);

    @Insert("INSERT INTO login_history (user_id, device_id, browser, os, ip_address, location, login_time, status) " +
            "VALUES (#{userId}, #{deviceId}, #{browser}, #{os}, #{ipAddress}, #{location}, #{loginTime}, #{status})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(LoginHistory history);
}