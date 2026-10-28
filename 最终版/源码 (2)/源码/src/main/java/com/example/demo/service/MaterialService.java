package com.example.demo.service;

import com.example.demo.mapper.MaterialMapper;
import com.example.demo.model.Material;
import com.example.demo.model.MaterialStatus;
import com.example.demo.util.PageInfo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MaterialService {
    private final MaterialMapper materialMapper;
    private final FileService fileService;

    @Transactional
    public void incrementDownloadCount(Long id) {
        materialMapper.incrementDownloadCount(id);
    }

    @Transactional
    public void approveMaterial(Long materialId) {
        materialMapper.updateStatus(materialId,
                MaterialStatus.APPROVED.getCode(), null);
    }

    @Transactional
    public void rejectMaterial(Long materialId, String reason) {
        materialMapper.updateStatus(materialId,
                MaterialStatus.REJECTED.getCode(), reason);
    }

    @Transactional
    public boolean deleteMaterial(Long materialId) {
        try {
            Material material = materialMapper.selectById(materialId);
            if (material != null && material.getPath() != null) {
                // 删除物理文件
                fileService.deleteFile(material.getPath());
            }
            // 删除数据库记录
            return materialMapper.deleteById(materialId) > 0;
        } catch (Exception e) {
            throw new RuntimeException("删除资料失败: " + e.getMessage());
        }
    }

    // 在MaterialService.java中添加带排序功能的筛选方法
    @Transactional
    public PageInfo<Material> getMaterialsByFilters(Integer status, String category, String type, String sort, int page, int size) {
        int offset = (page - 1) * size;
        List<Material> list;
        long total;

        // 根据排序参数构建排序条件
        String orderBy = "upload_time DESC"; // 默认按上传时间降序
        if ("downloadCount".equals(sort)) {
            orderBy = "download_count DESC";
        } else if ("viewCount".equals(sort)) {
            orderBy = "view_count DESC";
        } else if ("name".equals(sort)) {
            orderBy = "name ASC";
        }

        if (status == null && category == null && type == null) {
            list = materialMapper.selectAllWithOrder(orderBy, offset, size);
            total = materialMapper.countAll();
        } else {
            list = materialMapper.selectByFiltersWithOrder(status, category, type, orderBy, offset, size);
            total = materialMapper.countByFilters(status, category, type);
        }

        PageInfo<Material> pageInfo = new PageInfo<>();
        pageInfo.setItems(list);
        pageInfo.setCurrentPage(page);
        pageInfo.setPageSize(size);
        pageInfo.setTotal(total);
        return pageInfo;
    }

    @Transactional
    public PageInfo<Material> getPendingMaterials(int page, int size) {
        int offset = (page - 1) * size;
        List<Material> materials = materialMapper.selectByStatus(
                MaterialStatus.PENDING.getCode(), offset, size
        );
        long total = materialMapper.countByStatus(MaterialStatus.PENDING.getCode());

        PageInfo<Material> pageInfo = new PageInfo<>();
        pageInfo.setItems(materials); // 使用 setItems 而不是 setList
        pageInfo.setCurrentPage(page);
        pageInfo.setPageSize(size);
        pageInfo.setTotal(total);
        return pageInfo;
    }

    @Transactional
    public PageInfo<Material> searchMaterials(String keyword, Integer status, int page, int size) {
        int offset = (page - 1) * size;
        List<Material> materials = materialMapper.searchMaterials(keyword, status, offset, size);
        long total = materialMapper.countSearchMaterials(keyword, status);

        PageInfo<Material> pageInfo = new PageInfo<>();
        pageInfo.setItems(materials);
        pageInfo.setCurrentPage(page);
        pageInfo.setPageSize(size);
        pageInfo.setTotal(total);
        return pageInfo;
    }

    @Transactional
    public Map<String, Long> getMaterialStatistics() {
        return materialMapper.countByCategory().stream()
                .collect(Collectors.toMap(
                        map -> (String) map.get("category"),
                        map -> (Long) map.get("count")
                ));
    }

    @Transactional
    public Material getMaterialById(Long id) {
        return materialMapper.selectById(id);
    }

    @Transactional
    public PageInfo<Material> getMaterialsByStatus(Integer status, int page, int size) {
        int offset = (page - 1) * size;
        List<Material> list;
        long total;

        if (status == null) {
            list = materialMapper.selectAll(offset, size);
            total = materialMapper.countAll();
        } else {
            list = materialMapper.selectByStatus(status, offset, size);
            total = materialMapper.countByStatus(status);
        }

        PageInfo<Material> pageInfo = new PageInfo<>();
        pageInfo.setItems(list);
        pageInfo.setCurrentPage(page);
        pageInfo.setPageSize(size);
        pageInfo.setTotal(total);
        return pageInfo;
    }

    @Transactional
    public long countByStatus(int status) {
        return materialMapper.countByStatus(status);
    }

}