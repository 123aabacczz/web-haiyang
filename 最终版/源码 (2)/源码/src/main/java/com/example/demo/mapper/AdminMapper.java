package com.example.demo.mapper;

import com.example.demo.model.Admin;
import com.example.demo.model.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface AdminMapper {
    List<Admin> selectAdmins();
    int insertAdmin(Admin admin);
    Admin selectAdminById(Long id);
    int updateAdmin(Admin admin);
    int deleteAdminById(Long id);

    // 关键修改：返回带用户信息的Admin对象
    Admin selectByUsername(String username);

    // 添加用户更新方法
    int updateUser(User user);

    Admin selectByUserId(Long userId);
    int deleteByUserId(Long userId);
}