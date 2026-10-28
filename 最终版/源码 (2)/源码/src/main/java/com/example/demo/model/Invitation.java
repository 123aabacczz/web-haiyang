package com.example.demo.model;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class Invitation {
    private Integer id;
    private List<String> inviteeEmails;
    private Integer inviterId;
    private String role;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
}