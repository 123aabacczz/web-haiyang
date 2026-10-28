package com.example.demo.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final AdminAuthInterceptor adminAuthInterceptor;
    private final UserAuthInterceptor userAuthInterceptor; // 新增

    public WebConfig(AdminAuthInterceptor adminAuthInterceptor,
                     UserAuthInterceptor userAuthInterceptor) {
        this.adminAuthInterceptor = adminAuthInterceptor;
        this.userAuthInterceptor = userAuthInterceptor; // 新增
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        // 管理员拦截器配置
        registry.addInterceptor(adminAuthInterceptor)
                .addPathPatterns("/api/admin/**")
                .excludePathPatterns(
                        "/api/admin/login",
                        "/api/admin/logout",
                        "/api/admin/current-admin",
                        "/api/admin/public/**",
                        "/api/admin/dashboard-stats"
                );

        // 用户拦截器配置 - 新增
        registry.addInterceptor(userAuthInterceptor)
                .addPathPatterns("/api/**")
                .excludePathPatterns(
                        "/api/login",
                        "/api/register",
                        "/api/forgot-password",
                        "/api/admin/**", // 排除管理员路径
                        "/api/home-info/announcements/important",
                        "/api/home-info/announcements/latest",
                        "/api/home-info/meetings/recent",
                        "/api/notifications/today",
                        "/api/notifications/unread-count",
                        "/api/videos/**", // 排除视频API路径
                        "/api/files/**", // 排除文件API路径
                        "/api/tasks/assignees" // 排除任务负责人API
                );
    }
}