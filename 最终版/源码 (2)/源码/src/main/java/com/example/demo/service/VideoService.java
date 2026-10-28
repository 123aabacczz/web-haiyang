package com.example.demo.service;

import com.example.demo.model.Video;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

public interface VideoService {
    Video saveVideo(Video video, MultipartFile file);
    Video getVideoById(Integer id);
    List<Video> getVideosByCourseId(Integer courseId);
    List<Video> getAllVideos();
    void deleteVideo(Integer id);
}