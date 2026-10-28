package com.example.demo.controller;

import com.example.demo.model.Video;
import com.example.demo.service.VideoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@RestController
@RequestMapping("/api/videos")
public class VideoController {

    @Autowired
    private VideoService videoService;

    @PostMapping
    public ResponseEntity<Video> uploadVideo(
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("courseId") Integer courseId,
            @RequestParam("file") MultipartFile file) {
        Video video = new Video();
        video.setTitle(title);
        video.setDescription(description);
        video.setCourseId(courseId);

        Video savedVideo = videoService.saveVideo(video, file);
        return new ResponseEntity<>(savedVideo, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Video> getVideo(@PathVariable Integer id) {
        Video video = videoService.getVideoById(id);
        return video != null ? ResponseEntity.ok(video) : ResponseEntity.notFound().build();
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<Video>> getVideosByCourse(@PathVariable Integer courseId) {
        List<Video> videos = videoService.getVideosByCourseId(courseId);
        return ResponseEntity.ok(videos);
    }

    @GetMapping
    public ResponseEntity<List<Video>> getAllVideos() {
        List<Video> videos = videoService.getAllVideos();
        return ResponseEntity.ok(videos);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVideo(@PathVariable Integer id) {
        videoService.deleteVideo(id);
        return ResponseEntity.noContent().build();
    }
}