// UserMapper.java
package com.example.demo.mapper;

import com.example.demo.model.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.time.LocalDateTime;
import java.util.List;

@Mapper
public interface UserMapper {

    int insertUser(User user);
    User selectByUsername(String username);
    User selectByEmail(String email);
    User validateSecret(@Param("email") String email, @Param("secret") String secret);
    int updatePassword(@Param("email") String email, @Param("newPwd") String newPwd);
    User selectById(Long id);
    int deleteUserById(Long id);
    int updateUser(User user);
    int updateStatus(@Param("id") Long id, @Param("status") Integer status);

    List<User> selectByStatus(@Param("status") Integer status,
                              @Param("offset") int offset,
                              @Param("limit") int limit);
    long countByStatus(@Param("status") Integer status);

    List<User> selectAll(@Param("offset") int offset,
                         @Param("limit") int limit,
                         @Param("keyword") String keyword);

    long countAll(@Param("keyword") String keyword);

    long countNewUsers(@Param("date") LocalDateTime date);
    long countActiveUsers(@Param("date") LocalDateTime date);

    int updateById(User user);

    // 用户等级相关方法
    int insertUserLevel(@Param("userId") Long userId, @Param("userLevel") Integer userLevel);
    int updateUserLevel(@Param("userId") Long userId, @Param("userLevel") Integer userLevel);
    Integer selectUserLevelByUserId(Long userId);
    int deleteUserLevelByUserId(Long userId);

    @Select("SELECT * FROM users WHERE id = #{id}")
    User findById(@Param("id") Long id);

    @Update("UPDATE users SET position = #{position}, contact_info = #{contactInfo} WHERE id = #{id}")
    void update(User user);

    int updatePasswordById(Long userId, String encrypt);
}