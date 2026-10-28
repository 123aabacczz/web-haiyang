package com.example.demo.service;

import com.example.demo.mapper.VideoMapper;
import com.example.demo.model.Video;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@Service
public class VideoServiceImpl implements VideoService {

    @Autowired
    private VideoMapper videoMapper;

    @Autowired
    private FileService fileService;

    @Override
    public Video saveVideo(Video video, MultipartFile file) {
        // 保存视频文件
        String fileName = fileService.saveFile(file);
        video.setFileName(fileName);
        video.setFilePath("/api/files/" + fileName);

        // 保存视频信息到数据库
        if (video.getId() == null) {
            videoMapper.insert(video);
        } else {
            videoMapper.updateByPrimaryKey(video);
        }

        return video;
    }

    @Override
    public Video getVideoById(Integer id) {
        return videoMapper.selectByPrimaryKey(id);
    }

    @Override
    public List<Video> getVideosByCourseId(Integer courseId) {
        return videoMapper.selectByCourseId(courseId);
    }

    @Override
    public List<Video> getAllVideos() {
        return videoMapper.selectAll();
    }

    @Override
    public void deleteVideo(Integer id) {
        Video video = videoMapper.selectByPrimaryKey(id);
        if (video != null) {
            // 删除视频文件
            fileService.deleteFile(video.getFileName());
            // 删除数据库记录
            videoMapper.deleteByPrimaryKey(id);
        }
    }
}