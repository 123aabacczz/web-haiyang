package com.example.demo.model;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class UserWeeklyOverview {
    private Long id;
    private Long userId;
    private LocalDate weekStartDate;
    private LocalDate weekEndDate;
    private Integer documentsCreated;
    private Integer tasksInProgress;
    private Integer commentsCount;
    private Integer studyTimeMinutes;
    private Integer documentsTrend;
    private Integer tasksTrend;
    private Integer commentsTrend;
    private Integer studyTimeTrend;
    private LocalDateTime createdAt;

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public LocalDate getWeekStartDate() {
        return weekStartDate;
    }

    public void setWeekStartDate(LocalDate weekStartDate) {
        this.weekStartDate = weekStartDate;
    }

    public LocalDate getWeekEndDate() {
        return weekEndDate;
    }

    public void setWeekEndDate(LocalDate weekEndDate) {
        this.weekEndDate = weekEndDate;
    }

    public Integer getDocumentsCreated() {
        return documentsCreated;
    }

    public void setDocumentsCreated(Integer documentsCreated) {
        this.documentsCreated = documentsCreated;
    }

    public Integer getTasksInProgress() {
        return tasksInProgress;
    }

    public void setTasksInProgress(Integer tasksInProgress) {
        this.tasksInProgress = tasksInProgress;
    }

    public Integer getCommentsCount() {
        return commentsCount;
    }

    public void setCommentsCount(Integer commentsCount) {
        this.commentsCount = commentsCount;
    }

    public Integer getStudyTimeMinutes() {
        return studyTimeMinutes;
    }

    public void setStudyTimeMinutes(Integer studyTimeMinutes) {
        this.studyTimeMinutes = studyTimeMinutes;
    }

    public Integer getDocumentsTrend() {
        return documentsTrend;
    }

    public void setDocumentsTrend(Integer documentsTrend) {
        this.documentsTrend = documentsTrend;
    }

    public Integer getTasksTrend() {
        return tasksTrend;
    }

    public void setTasksTrend(Integer tasksTrend) {
        this.tasksTrend = tasksTrend;
    }

    public Integer getCommentsTrend() {
        return commentsTrend;
    }

    public void setCommentsTrend(Integer commentsTrend) {
        this.commentsTrend = commentsTrend;
    }

    public Integer getStudyTimeTrend() {
        return studyTimeTrend;
    }

    public void setStudyTimeTrend(Integer studyTimeTrend) {
        this.studyTimeTrend = studyTimeTrend;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}