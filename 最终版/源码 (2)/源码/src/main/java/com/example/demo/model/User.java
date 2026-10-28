package com.example.demo.model;

import lombok.Data;
import jakarta.validation.constraints.*;

import java.io.Serializable;

@Data
public class User implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long id;

    @NotBlank(message = "用户名不能为空")
    @Size(min = 3, max = 20, message = "用户名长度 3-20")
    private String username;

    @Email(message = "邮箱格式错误")
    @NotBlank(message = "邮箱不能为空")
    private String email;

    @NotBlank(message = "密码不能为空")
    @Size(min = 6, message = "密码至少 6 位")
    private String password;

    @NotBlank(message = "暗号不能为空")
    private String secret;

    private Integer userLevel=1; // 用户等级 (1-13)

    // 添加验证分组
    public interface CreateGroup {}
    public interface UpdateGroup {}

    private Integer status;   // 0待审核 1正常 2禁用 3拒绝

    private String registrationDate;

    private Integer adminLevel;

    private String role;

    private String position;

    private String contactInfo;

    private String avatar;

    public static class Roles {
        public static final String TEMPORARY = "temporary";
        public static final String USER = "user";
        public static final String LEVEL1_ADMIN = "level1_admin";
        public static final String LEVEL2_ADMIN = "level2_admin";
        public static final String LEVEL3_ADMIN = "level3_admin";
        public static final String LEVEL4_ADMIN = "level4_admin";
        public static final String LEVEL5_ADMIN = "level5_admin";
    }
}