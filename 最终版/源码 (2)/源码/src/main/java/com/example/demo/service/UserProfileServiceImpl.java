package com.example.demo.service;

import com.example.demo.mapper.UserProfileMapper;
import com.example.demo.model.UserProfile;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class UserProfileServiceImpl implements UserProfileService {

    private final UserProfileMapper userProfileMapper;

    public UserProfileServiceImpl(UserProfileMapper userProfileMapper) {
        this.userProfileMapper = userProfileMapper;
    }

    @Override
    public UserProfile getByUserId(Long userId) {
        return userProfileMapper.selectByUserId(userId);
    }

    @Override
    @Transactional
    public UserProfile createOrUpdate(UserProfile userProfile) {
        LocalDateTime now = LocalDateTime.now();
        userProfile.setCreatedAt(now);
        userProfile.setUpdatedAt(now);

        UserProfile existing = userProfileMapper.selectByUserId(userProfile.getUserId());
        if (existing != null) {
            userProfileMapper.updateByUserId(userProfile);
            return userProfile;
        } else {
            userProfileMapper.insert(userProfile);
            return userProfile;
        }
    }

    @Override
    @Transactional
    public void deleteByUserId(Long userId) {
        userProfileMapper.deleteByUserId(userId);
    }
}