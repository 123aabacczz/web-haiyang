package com.example.demo.service;

import com.example.demo.mapper.UserTagMapper;
import com.example.demo.model.UserTag;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class UserTagServiceImpl implements UserTagService {

    private final UserTagMapper userTagMapper;

    public UserTagServiceImpl(UserTagMapper userTagMapper) {
        this.userTagMapper = userTagMapper;
    }

    @Override
    public List<UserTag> getByUserId(Long userId) {
        return userTagMapper.selectByUserId(userId);
    }

    @Override
    @Transactional
    public UserTag create(UserTag userTag) {
        userTag.setCreatedAt(LocalDateTime.now());
        userTagMapper.insert(userTag);
        return userTag;
    }

    @Override
    @Transactional
    public void deleteByUserId(Long userId) {
        userTagMapper.deleteByUserId(userId);
    }

    @Override
    @Transactional
    public void deleteById(Long id) {
        userTagMapper.deleteById(id);
    }
}