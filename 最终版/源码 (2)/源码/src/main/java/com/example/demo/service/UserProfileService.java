package com.example.demo.service;

import com.example.demo.model.UserProfile;

public interface UserProfileService {
    UserProfile getByUserId(Long userId);
    UserProfile createOrUpdate(UserProfile userProfile);
    void deleteByUserId(Long userId);
}