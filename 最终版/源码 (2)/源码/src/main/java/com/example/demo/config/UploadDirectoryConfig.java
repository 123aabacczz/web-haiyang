package com.example.demo.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.boot.CommandLineRunner;

import java.io.File;

@Configuration
public class UploadDirectoryConfig implements CommandLineRunner {

    @Value("${file.upload-dir}")
    private String uploadDir;

    @Override
    public void run(String... args) throws Exception {
        File directory = new File(uploadDir);
        if (!directory.exists()) {
            boolean created = directory.mkdirs();
            if (created) {
                System.out.println("创建上传目录: " + uploadDir);
            } else {
                System.out.println("无法创建上传目录: " + uploadDir);
            }
        }
    }
}