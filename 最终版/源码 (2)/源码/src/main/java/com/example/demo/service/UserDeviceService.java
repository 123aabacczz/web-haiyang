package com.example.demo.service;

import com.example.demo.model.LoginHistory;
import com.example.demo.model.UserDevice;
import com.example.demo.util.PageInfo;
import java.util.List;

public interface UserDeviceService {
    List<UserDevice> getUserDevices(Long userId);
    void logoutDevice(Long userId, String deviceId);
    PageInfo<LoginHistory> getLoginHistory(Long userId, int page, int size);
    // 接口
    void saveDevice(UserDevice device);
    void saveLoginHistory(LoginHistory history);
}