package com.example.demo.model;

import lombok.Data;

import java.time.LocalDateTime;


@Data
public class Schedule {

    private Long id;

    private String title;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private Boolean allDay = false;

    private String type; // meeting, task, project, personal

    private String location;

    private String description;

    private Long userId;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}