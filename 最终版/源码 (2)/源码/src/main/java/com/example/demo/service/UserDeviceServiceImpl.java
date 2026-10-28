package com.example.demo.service;

import com.example.demo.mapper.LoginHistoryMapper;
import com.example.demo.mapper.UserDeviceMapper;
import com.example.demo.model.LoginHistory;
import com.example.demo.model.UserDevice;
import com.example.demo.service.UserDeviceService;
import com.example.demo.util.PageInfo;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@Slf4j
public class UserDeviceServiceImpl implements UserDeviceService {

    @Autowired
    private UserDeviceMapper userDeviceMapper;

    @Autowired
    private LoginHistoryMapper loginHistoryMapper;

    // 实现
    @Override
    public void saveDevice(UserDevice device) {
        // 先尝试更新最后活动时间
        int updated = userDeviceMapper.updateLastActivity(device);
        if (updated == 0) {
            // 如果更新行数为0，说明不存在，则插入
            userDeviceMapper.insert(device);
        }
    }

    @Override
    public void saveLoginHistory(LoginHistory history) {
        loginHistoryMapper.insert(history);
    }

    @Override
    public List<UserDevice> getUserDevices(Long userId) {
        try {
            List<UserDevice> devices = userDeviceMapper.findByUserId(userId);
            return devices != null ? devices : new ArrayList<>(); // 确保不为null
        } catch (Exception e) {
            // 记录错误日志
            log.error("获取用户设备失败: {}", e.getMessage());
            return new ArrayList<>(); // 返回空列表
        }
    }

    @Override
    public void logoutDevice(Long userId, String deviceId) {
        userDeviceMapper.deleteByUserAndDeviceId(userId, deviceId);
    }

    @Override
    public PageInfo<LoginHistory> getLoginHistory(Long userId, int page, int size) {
        try {
            // 计算偏移量
            int offset = (page - 1) * size;

            // 获取当前页的数据
            List<LoginHistory> historyList = loginHistoryMapper.findByUserId(userId, offset, size);
            if (historyList == null) {
                historyList = new ArrayList<>(); // 确保不为null
            }

            // 获取总记录数
            int totalCount = loginHistoryMapper.countByUserId(userId);

            // 创建并填充 PageInfo 对象
            PageInfo<LoginHistory> pageInfo = new PageInfo<>();
            pageInfo.setPage(page);
            pageInfo.setTotal(totalCount);
            pageInfo.setList(historyList);

            return pageInfo;
        } catch (Exception e) {
            // 记录错误日志
            log.error("获取登录历史失败: {}", e.getMessage());
            // 返回空的分页结果
            PageInfo<LoginHistory> emptyPage = new PageInfo<>();
            emptyPage.setPage(page);
            emptyPage.setTotal(0);
            emptyPage.setList(new ArrayList<>());
            return emptyPage;
        }
    }
}