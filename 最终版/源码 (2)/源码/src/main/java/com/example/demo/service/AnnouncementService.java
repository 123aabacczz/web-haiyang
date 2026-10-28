// AnnouncementService.java
package com.example.demo.service;

import com.example.demo.mapper.AnnouncementMapper;
import com.example.demo.model.Announcement;
import com.example.demo.util.PageInfo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AnnouncementService {
    private final AnnouncementMapper announcementMapper;

    public Announcement createAnnouncement(Announcement announcement) {
        announcementMapper.insert(announcement);
        return announcement;
    }

    public Announcement updateAnnouncement(Announcement announcement) {
        announcementMapper.update(announcement);
        return announcement;
    }

    public void deleteAnnouncement(Long id) {
        announcementMapper.delete(id);
    }

    public PageInfo<Announcement> getAllAnnouncements(int page, int size) {
        int offset = (page - 1) * size;
        List<Announcement> announcements = announcementMapper.selectWithPagination(size, offset);
        int total = announcementMapper.countAll();

        PageInfo<Announcement> pageInfo = new PageInfo<>();
        pageInfo.setPage(page);
        pageInfo.setPageSize(size);
        pageInfo.setTotal(total);
        pageInfo.setItems(announcements);  // 改为items而非list
        pageInfo.setTotalPages((int) Math.ceil((double) total / size));

        return pageInfo;
    }

    public Announcement getAnnouncementById(Long id) {
        return announcementMapper.selectById(id);
    }

    public int countAll() {
        return announcementMapper.countAll();
    }

    public int countByStatus(int status) {
        return announcementMapper.countByStatus(status);
    }

    public int countPending() {
        return announcementMapper.countPending();
    }

    // 添加缺失的方法
    public List<Announcement> getImportantAnnouncements() {
        return announcementMapper.selectImportantAnnouncements();
    }

    public List<Announcement> getLatestAnnouncements(int count) {
        return announcementMapper.selectLatestAnnouncements(count);
    }
}