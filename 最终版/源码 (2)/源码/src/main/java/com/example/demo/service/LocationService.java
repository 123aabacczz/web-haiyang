package com.example.demo.service;

import cn.hutool.core.util.StrUtil;
import cn.hutool.http.HttpUtil;
import cn.hutool.json.JSONObject;
import cn.hutool.json.JSONUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
public class LocationService {

    private final Map<String, String> cache = new ConcurrentHashMap<>();

    public String getLocation(String ip) {
        if (StrUtil.isBlank(ip) || "unknown".equalsIgnoreCase(ip)) return "未知位置";
        return cache.computeIfAbsent(ip, k -> fetchFromGaode(k));
    }

    private String fetchFromGaode(String ip) {
        try {
            String url = "https://restapi.amap.com/v3/ip?key=26fd6d1811bdc31b1081855f82a8d2a7&ip=" + ip;
            String body = HttpUtil.get(url);
            JSONObject obj = JSONUtil.parseObj(body);

            if ("1".equals(obj.getStr("status"))) {
                String province = obj.getStr("province");
                String city = obj.getStr("city");
                String district = obj.getStr("district");

                // 过滤掉 null、[]、""
                List<String> parts = new ArrayList<>();
                if (StrUtil.isNotBlank(province) && !"[]".equals(province)) parts.add(province);
                if (StrUtil.isNotBlank(city) && !"[]".equals(city)) parts.add(city);
                if (StrUtil.isNotBlank(district) && !"null".equals(district) && !"[]".equals(district)) parts.add(district);

                if (!parts.isEmpty()) return String.join(" · ", parts);
            }
        } catch (Exception e) {
            log.warn("高德定位失败: {}", e.getMessage());
        }

        // 降级：淘宝 IP 库
        try {
            String tbUrl = "https://ip.taobao.com/outGetIpInfo?ip=" + ip + "&accessKey=alibaba-inc";
            String tbBody = HttpUtil.get(tbUrl);
            JSONObject tb = JSONUtil.parseObj(tbBody);
            if (tb.getInt("code") == 0) {
                JSONObject data = tb.getJSONObject("data");
                String country = data.getStr("country");
                String region = data.getStr("region");
                String city = data.getStr("city");
                String isp = data.getStr("isp");

                List<String> parts = new ArrayList<>();
                if (StrUtil.isNotBlank(country) && !"XX".equals(country)) parts.add(country);
                if (StrUtil.isNotBlank(region) && !"XX".equals(region)) parts.add(region);
                if (StrUtil.isNotBlank(city) && !"XX".equals(city)) parts.add(city);
                if (StrUtil.isNotBlank(isp)) parts.add(isp);

                if (!parts.isEmpty()) return String.join(" · ", parts);
            }
        } catch (Exception e) {
            log.warn("淘宝 IP 库降级失败: {}", e.getMessage());
        }

        return "未知位置";
    }
}
