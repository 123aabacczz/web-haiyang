package com.example.demo.service;

import com.example.demo.model.UserTag;
import java.util.List;

public interface UserTagService {
    List<UserTag> getByUserId(Long userId);
    UserTag create(UserTag userTag);
    void deleteByUserId(Long userId);
    void deleteById(Long id);
}