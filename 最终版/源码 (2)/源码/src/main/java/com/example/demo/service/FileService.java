package com.example.demo.service;


import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

public interface FileService {
    String saveFile(MultipartFile file);
    Resource loadFileAsResource(String fileName);
    boolean deleteFile(String fileName); // 新增删除方法
    
}