// UserLevelUpNotification.java
package com.example.demo.model;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class UserLevelUpNotification {
    private Long id;
    private String username;
    private String oldLevel;
    private String newLevel;
    private LocalDateTime upgradeTime;
}