// File: UserSettings.java
package com.example.demo.model;

import lombok.Data;
import java.util.Map;

@Data
public class UserSettings {
    private Long userId;
    private Map<String, Boolean> notificationSettings;
    private Map<String, Boolean> privacySettings;
    private String language;
    private String theme;
}