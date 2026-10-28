package com.example.demo.controller;

import com.example.demo.common.ApiResponse;
import com.example.demo.mapper.MaterialMapper;
import com.example.demo.model.Admin;
import com.example.demo.model.Material;
import com.example.demo.model.MaterialStatus;
import com.example.demo.service.FileService;
import com.example.demo.service.UserService;
import com.example.demo.util.PageInfo;
import com.example.demo.service.MaterialService;
import com.example.demo.model.User;
import jakarta.annotation.PostConstruct;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/admin/materials")
@RequiredArgsConstructor
@Slf4j
public class MaterialController {
    private final MaterialService materialService;
    private final MaterialMapper materialMapper;
    private final UserService userService;
    private final FileService fileService; // 添加文件服务依赖

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    @PostConstruct
    public void init() {
        try {
            Files.createDirectories(Paths.get(uploadDir));
        } catch (IOException e) {
            throw new RuntimeException("无法创建上传目录: " + uploadDir, e);
        }
    }

    @GetMapping("/pending")
    public ApiResponse<PageInfo<Material>> getPendingMaterials(
            @RequestParam(name = "page", defaultValue = "1") int page,
            @RequestParam(name = "size", defaultValue = "10") int size
    ) {
        return ApiResponse.success(materialService.getPendingMaterials(page, size));
    }

    @PostMapping("/{id}/approve")
    public ApiResponse<String> approveMaterial(@PathVariable Long id) {
        materialService.approveMaterial(id);
        return ApiResponse.success("资料审核通过");
    }

    // MaterialController.java - 添加更多端点
    @GetMapping("/search")
    public ApiResponse<PageInfo<Material>> searchMaterials(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {

        PageInfo<Material> result = materialService.searchMaterials(keyword, status, page, size);
        return ApiResponse.success(result);
    }

    @GetMapping("/user/{userId}")
    public ApiResponse<PageInfo<Material>> getUserMaterials(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {

        // 实现获取用户上传的资料
        int offset = (page - 1) * size;
        List<Material> materials = materialMapper.selectByUploader(userId, offset, size);
        long total = materialMapper.countByUploader(userId);

        PageInfo<Material> pageInfo = new PageInfo<>();
        pageInfo.setItems(materials);
        pageInfo.setCurrentPage(page);
        pageInfo.setPageSize(size);
        pageInfo.setTotal(total);

        return ApiResponse.success(pageInfo);
    }

    @PostMapping("/{id}/feature")
    public ApiResponse<String> toggleFeatured(@PathVariable Long id) {
        Material material = materialMapper.selectById(id);
        if (material == null) {
            return ApiResponse.error("资料不存在");
        }

        material.setIsFeatured(!material.getIsFeatured());
        materialMapper.updateFeaturedStatus(id, material.getIsFeatured());

        return ApiResponse.success("资料推荐状态已更新");
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> downloadMaterial(@PathVariable Long id) {
        try {
            Material material = materialMapper.selectById(id);
            if (material == null) {
                return ResponseEntity.notFound().build();
            }

            // 增加下载计数
            materialMapper.incrementDownloadCount(id);

            // 获取文件资源
            Resource resource = fileService.loadFileAsResource(material.getPath());

            // 优先使用原始文件名，如果没有则使用资料名称
            String originalFileName = material.getOriginalFilename() != null ?
                    material.getOriginalFilename() : material.getName();

            String fileExtension = getFileExtension(material.getPath());

            // 确保下载的文件名包含正确的扩展名
            String downloadFileName = originalFileName;

            // 只有当原始文件名不包含扩展名，且文件有扩展名时，才添加扩展名
            if (!originalFileName.contains(".") && fileExtension != null && !fileExtension.isEmpty()) {
                downloadFileName = originalFileName + "." + fileExtension;
            }

            // 处理中文文件名编码
            String encodedFileName = URLEncoder.encode(downloadFileName, StandardCharsets.UTF_8.toString())
                    .replaceAll("\\+", "%20");

            // 设置响应头
            String contentDisposition = "attachment; filename=\"" + encodedFileName + "\"; filename*=UTF-8''" + encodedFileName;

            // 根据文件类型设置Content-Type
            String contentType = getMimeType(material.getPath());

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, contentDisposition)
                    .contentType(MediaType.parseMediaType(contentType))
                    .body(resource);
        } catch (Exception e) {
            log.error("下载资料失败: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    private String getFileExtension(String filename) {
        if (filename == null || filename.isEmpty()) {
            return null;
        }

        int lastDotIndex = filename.lastIndexOf(".");
        if (lastDotIndex == -1 || lastDotIndex == filename.length() - 1) {
            return null;
        }

        return filename.substring(lastDotIndex + 1).toLowerCase();
    }

    private boolean isTextFile(String extension) {
        return Arrays.asList("txt", "md", "html", "static/main/css", "js", "java", "py", "json", "xml").contains(extension);
    }

    private boolean isImageFile(String extension) {
        return Arrays.asList("jpg", "jpeg", "png", "gif", "bmp", "webp").contains(extension);
    }

    @GetMapping("/public")
    public ResponseEntity<PageInfo<Material>> getPublicMaterials(
            @RequestParam(value = "keyword", required = false) String keyword,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "type", required = false) String type,
            @RequestParam(value = "sort", defaultValue = "uploadTime") String sort,
            @RequestParam(value = "page", defaultValue = "1") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {

        // 只返回已审核通过的材料
        Integer approvedStatus = MaterialStatus.APPROVED.getCode();

        // 处理空字符串参数
        String actualCategory = (category != null && category.isEmpty()) ? null : category;
        String actualType = (type != null && type.isEmpty()) ? null : type;

        PageInfo<Material> result = materialService.getMaterialsByFilters(approvedStatus, actualCategory, actualType, sort, page, size);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/batch/approve")
    public ApiResponse<String> batchApproveMaterials(@RequestBody List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            return ApiResponse.error("请选择要审核的资料");
        }

        int count = materialMapper.batchUpdateStatus(ids, MaterialStatus.APPROVED.getCode(), null);
        return ApiResponse.success("已通过 " + count + " 个资料");
    }

    @GetMapping("/export/csv")
    public ResponseEntity<byte[]> exportMaterialsToCsv(
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) String category) {

        List<Material> materials = materialService.getMaterialsByFilters(status, category, null, "uploadTime", 1, Integer.MAX_VALUE).getItems();

        StringBuilder csv = new StringBuilder();
        csv.append("ID,名称,类型,分类,上传者,上传时间,状态,文件大小,下载次数,查看次数\n");

        materials.forEach(m -> {
            csv.append(m.getId()).append(",")
                    .append(escapeCsv(m.getName())).append(",")
                    .append(escapeCsv(m.getType())).append(",")
                    .append(escapeCsv(m.getCategory())).append(",")
                    .append(escapeCsv(m.getUploaderName())).append(",")
                    .append(m.getUploadTime()).append(",")
                    .append(getStatusText(m.getStatus())).append(",")
                    .append(formatFileSize(m.getFileSize())).append(",")
                    .append(m.getDownloadCount()).append(",")
                    .append(m.getViewCount()).append("\n");
        });

        byte[] data = csv.toString().getBytes(StandardCharsets.UTF_8);

        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=materials_export.csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(data);
    }

    private String getStatusText(Integer status) {
        if (status == null) return "未知";
        switch (status) {
            case 0: return "待审核";
            case 1: return "审核通过";
            case 2: return "已拒绝";
            default: return "未知状态";
        }
    }

    @GetMapping("/categories")
    public ResponseEntity<List<Map<String, Object>>> getMaterialCategories() {
        List<Map<String, Object>> categories = materialMapper.getMaterialCategories();
        return ResponseEntity.ok(categories);
    }

    @GetMapping("/types")
    public ResponseEntity<List<Map<String, Object>>> getMaterialTypes() {
        List<Map<String, Object>> types = materialMapper.getMaterialTypes();
        return ResponseEntity.ok(types);
    }

    private String escapeCsv(String value) {
        if (value == null) return "";
        return "\"" + value.replace("\"", "\"\"") + "\"";
    }

    private String formatFileSize(Long size) {
        if (size == null) return "0 B";

        String[] units = {"B", "KB", "MB", "GB"};
        int unitIndex = 0;
        double currentSize = size;

        while (currentSize >= 1024 && unitIndex < units.length - 1) {
            currentSize /= 1024;
            unitIndex++;
        }

        return String.format("%.2f %s", currentSize, units[unitIndex]);
    }

    @PostMapping("/batch/reject")
    public ResponseEntity<String> batchRejectMaterials(@RequestBody List<Long> ids,
                                                       @RequestParam String reason) {
        if (ids == null || ids.isEmpty()) {
            return ResponseEntity.badRequest().body("请选择要拒绝的资料");
        }

        int count = materialMapper.batchUpdateStatus(ids, MaterialStatus.REJECTED.getCode(), reason);
        return ResponseEntity.ok("已拒绝 " + count + " 个资料");
    }

    @DeleteMapping("/batch")
    public ApiResponse<String> batchDeleteMaterials(@RequestBody List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            return ApiResponse.error("请选择要删除的资料");
        }

        int successCount = 0;
        for (Long id : ids) {
            try {
                if (materialService.deleteMaterial(id)) {
                    successCount++;
                }
            } catch (Exception e) {
                // 记录错误但继续处理其他资料
                log.error("删除资料失败: {}", id, e);
            }
        }

        return ApiResponse.success("已成功删除 " + successCount + " 个资料");
    }

    @GetMapping("/stats")
    public ApiResponse<Map<String, Object>> getMaterialStats() {
        Map<String, Object> stats = new HashMap<>();

        // 各类别资料数量
        stats.put("byCategory", materialMapper.countByCategory());

        // 各状态资料数量
        stats.put("byStatus", materialMapper.countByStatusGroup());

        // 最近上传统计
        stats.put("recentUploads", materialMapper.countRecentUploads(7));

        // 热门下载
        stats.put("topDownloads", materialMapper.getTopDownloaded(10));

        return ApiResponse.success(stats);
    }

    @GetMapping("/{id}/preview")
    public ApiResponse<Map<String, Object>> previewMaterial(@PathVariable Long id) {
        try {
            Material material = materialMapper.selectById(id);
            if (material == null) {
                return ApiResponse.error("资料不存在");
            }

            // 增加查看计数
            materialMapper.incrementViewCount(id);

            Map<String, Object> result = new HashMap<>();
            result.put("material", material);

            // 获取文件扩展名
            String fileExtension = getFileExtension(material.getPath());
            result.put("fileType", fileExtension);

            // 根据文件类型提供不同的预览内容
            if (isTextFile(fileExtension)) {
                try {
                    Path filePath = Paths.get(uploadDir, material.getPath());
                    if (Files.exists(filePath)) {
                        String content = Files.readString(filePath);
                        result.put("content", content);
                        result.put("contentType", "text");
                    } else {
                        result.put("content", "文件不存在");
                        result.put("contentType", "error");
                    }
                } catch (IOException e) {
                    result.put("content", "无法读取文件内容");
                    result.put("contentType", "error");
                }
            } else if (isImageFile(fileExtension)) {
                result.put("previewUrl", "/api/admin/materials/" + id + "/file");
                result.put("contentType", "image");
            } else if (isPdfFile(fileExtension)) {
                result.put("previewUrl", "/api/admin/materials/" + id + "/file");
                result.put("contentType", "pdf");
            } else {
                result.put("contentType", "unsupported");
                result.put("message", "不支持预览此文件类型");
            }

            return ApiResponse.success(result);
        } catch (Exception e) {
            log.error("预览资料失败: {}", id, e);
            return ApiResponse.error("预览资料失败");
        }
    }

    // 添加文件获取端点
    @GetMapping("/{id}/file")
    public ResponseEntity<Resource> getMaterialFile(@PathVariable Long id) {
        try {
            Material material = materialMapper.selectById(id);
            if (material == null) {
                return ResponseEntity.notFound().build();
            }

            String filePath = uploadDir + "/" + material.getPath();
            Resource resource = fileService.loadFileAsResource(filePath);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_TYPE, getMimeType(material.getPath()))
                    .body(resource);
        } catch (Exception e) {
            log.error("获取资料文件失败: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // 添加辅助方法
    private String getMimeType(String filename) {
        String extension = getFileExtension(filename);
        if (extension == null) {
            return "application/octet-stream";
        }

        switch (extension.toLowerCase()) {
            case "pdf": return "application/pdf";
            case "jpg": case "jpeg": return "image/jpeg";
            case "png": return "image/png";
            case "gif": return "image/gif";
            case "txt": return "text/plain";
            case "html": return "text/html";
            case "static/main/css": return "text/css";
            case "js": return "application/javascript";
            case "doc": return "application/msword";
            case "docx": return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
            case "xls": return "application/vnd.ms-excel";
            case "xlsx": return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            case "ppt": return "application/vnd.ms-powerpoint";
            case "pptx": return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
            case "zip": return "application/zip";
            case "rar": return "application/x-rar-compressed";
            default: return "application/octet-stream";
        }
    }

    private boolean isPdfFile(String extension) {
        return "pdf".equalsIgnoreCase(extension);
    }

    @DeleteMapping("/{id}")
    public ApiResponse<String> deleteMaterial(@PathVariable Long id) {
        materialService.deleteMaterial(id);
        return ApiResponse.success("资料删除成功");
    }

    @PostMapping("/{id}/reject")
    public ApiResponse<String> rejectMaterial(
            @PathVariable Long id,
            @RequestParam String reason) {
        materialService.rejectMaterial(id, reason);
        return ApiResponse.success("资料已拒绝");
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<String> uploadMaterial(
            HttpServletRequest request,
            @RequestParam("name") String name,
            @RequestParam("category") String category,
            @RequestParam("type") String type,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "tags", required = false) String tags,
            @RequestParam(value = "version", required = false) String version,
            @RequestParam(value = "language", required = false) String language,
            @RequestParam("file") MultipartFile file) {

        try {
            log.info("=== 开始处理资料上传 ===");
            log.info("资料名称: {}", name);
            log.info("分类: {}", category);
            log.info("类型: {}", type);
            log.info("文件: {}, 大小: {} bytes", file.getOriginalFilename(), file.getSize());

            // 验证文件大小
            if (file.getSize() > 10 * 1024 * 1024) {
                log.warn("文件大小超过限制: {} bytes", file.getSize());
                return ApiResponse.error("文件大小不能超过10MB");
            }

            // 从会话中获取用户信息
            HttpSession session = request.getSession(false);
            if (session == null) {
                log.warn("会话不存在，未登录");
                return ApiResponse.error("请先登录");
            }

            Long uploaderId = null;
            String uploaderName = null;

            // 优先检查管理员会话
            Admin admin = (Admin) session.getAttribute("admin");
            if (admin != null) {
                uploaderId = admin.getUser().getId();
                uploaderName = admin.getUser().getUsername();
                log.info("管理员上传 - 上传者ID: {}, 上传者名称: {}", uploaderId, uploaderName);
            } else {
                // 检查普通用户会话
                User user = (User) session.getAttribute("user");
                if (user != null) {
                    uploaderId = user.getId();
                    uploaderName = user.getUsername();
                    log.info("普通用户上传 - 上传者ID: {}, 上传者名称: {}", uploaderId, uploaderName);
                } else {
                    log.warn("用户信息不存在，未登录");
                    return ApiResponse.error("请先登录");
                }
            }

            // 生成唯一文件名
            String originalFilename = file.getOriginalFilename();
            String fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
            String uniqueFileName = UUID.randomUUID().toString() + fileExtension;
            log.info("原始文件名: {}, 唯一文件名: {}", originalFilename, uniqueFileName);

            // 保存文件
            Path uploadPath = Paths.get("uploads");
            if (!Files.exists(uploadPath)) {
                log.info("创建上传目录: {}", uploadPath);
                Files.createDirectories(uploadPath);
            }

            Path filePath = uploadPath.resolve(uniqueFileName);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            log.info("文件保存成功: {}", filePath);

            // 创建Material对象并保存到数据库
            Material material = new Material();
            material.setName(name);
            material.setType(type);
            material.setCategory(category);
            material.setUploaderId(uploaderId);
            material.setStatus(MaterialStatus.PENDING.getCode());
            material.setUploadTime(LocalDateTime.now());
            material.setPath(uniqueFileName);
            material.setDescription(description);
            material.setFileSize(file.getSize());
            material.setTags(tags);
            material.setVersion(version);
            material.setLanguage(language);
            material.setUploaderName(uploaderName);
            material.setOriginalFilename(originalFilename); // 保存原始文件名

            int result = materialMapper.insertMaterial(material);
            log.info("数据库插入结果: {}, 资料ID: {}", result, material.getId());

            log.info("=== 资料上传完成 ===");
            return ApiResponse.success("资料上传成功，等待审核");
        } catch (Exception e) {
            log.error("上传失败: {}", e.getMessage(), e);
            return ApiResponse.error("上传失败: " + e.getMessage());
        }
    }

    @GetMapping("/statistics")
    public ApiResponse<Map<String, Long>> getMaterialStatistics() {
        return ApiResponse.success(materialService.getMaterialStatistics());
    }

    @GetMapping("/export")
    public ResponseEntity<byte[]> exportMaterials() {
        List<Material> materials = materialService.getMaterialsByStatus(null, 1, Integer.MAX_VALUE).getItems();

        StringBuilder csv = new StringBuilder();
        csv.append("ID,Name,Type,Category,Uploader,Upload Time,Status\n");

        materials.forEach(m -> {
            csv.append(m.getId()).append(",")
                    .append(m.getName()).append(",")
                    .append(m.getType()).append(",")
                    .append(m.getCategory()).append(",")
                    .append(m.getUploaderId()).append(",")
                    .append(m.getUploadTime()).append(",")
                    .append(m.getStatus()).append("\n");
        });

        byte[] data = csv.toString().getBytes(StandardCharsets.UTF_8);

        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=materials.csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(data);
    }

    @GetMapping
    public ApiResponse<PageInfo<Material>> getMaterials(
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String type,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {

        // 修改这行调用，添加缺失的 keyword 和 sort 参数
        return ApiResponse.success(materialService.getMaterialsByFilters(status, category, type, "uploadTime", page, size));
    }
}