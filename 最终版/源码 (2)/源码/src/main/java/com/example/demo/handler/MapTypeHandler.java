// com/example/demo/handler/MapTypeHandler.java
package com.example.demo.handler;

import org.apache.ibatis.type.BaseTypeHandler;
import org.apache.ibatis.type.JdbcType;
import org.apache.ibatis.type.MappedTypes;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.sql.CallableStatement;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.Map;

@MappedTypes({Map.class})
public class MapTypeHandler extends BaseTypeHandler<Map<String, Object>> {

    private static final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void setNonNullParameter(PreparedStatement ps, int i, Map<String, Object> parameter, JdbcType jdbcType) throws SQLException {
        try {
            ps.setString(i, objectMapper.writeValueAsString(parameter));
        } catch (Exception e) {
            throw new SQLException("Error converting map to JSON", e);
        }
    }

    @Override
    public Map<String, Object> getNullableResult(ResultSet rs, String columnName) throws SQLException {
        return parseJson(rs.getString(columnName));
    }

    @Override
    public Map<String, Object> getNullableResult(ResultSet rs, int columnIndex) throws SQLException {
        return parseJson(rs.getString(columnIndex));
    }

    @Override
    public Map<String, Object> getNullableResult(CallableStatement cs, int columnIndex) throws SQLException {
        return parseJson(cs.getString(columnIndex));
    }

    private Map<String, Object> parseJson(String json) {
        try {
            if (json == null || json.isEmpty()) {
                return new HashMap<>();
            }
            // 尝试直接解析为JSON对象
            return objectMapper.readValue(json, Map.class);
        } catch (Exception e) {
            // 处理非JSON格式数据的兼容情况
            try {
                // 检查是否为纯数字
                Double.parseDouble(json);
                // 如果是数字，返回包含该数字的map
                Map<String, Object> result = new HashMap<>();
                result.put("value", json);
                return result;
            } catch (NumberFormatException nfe) {
                // 如果不是数字，返回包含原始字符串的map
                Map<String, Object> result = new HashMap<>();
                result.put("value", json);
                return result;
            }
        }
    }
}