package com.example.demo.controller;

import com.example.demo.common.ApiResponse;
import com.example.demo.model.Task;
import com.example.demo.service.TaskService;
import com.example.demo.util.PageInfo;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/tasks")
@RequiredArgsConstructor
public class AdminTaskController {

    private final TaskService taskService;

    /** 列表 + 筛选 */
    @GetMapping
    public ApiResponse<PageInfo<Task>> list(@RequestParam(required = false) Integer status,
                                            @RequestParam(required = false) Integer priority,
                                            @RequestParam(required = false) String keyword,
                                            @RequestParam(defaultValue = "1")  Integer page,
                                            @RequestParam(defaultValue = "10") Integer size) {
        return ApiResponse.success(taskService.getTasks(status, priority, keyword, page, size));
    }

    /** 待审核列表 */
    @GetMapping("/pending")
    public ApiResponse<PageInfo<Task>> pending(@RequestParam(defaultValue = "1")  Integer page,
                                               @RequestParam(defaultValue = "10") Integer size) {
        return ApiResponse.success(taskService.getPendingTasks(page, size));
    }

    /** 审核接口 */
    @PostMapping("/{id}/review")
    public ApiResponse<Task> review(@PathVariable Long id,
                                    @RequestBody Map<String,Object> body) {
        Integer status = (Integer) body.get("status");
        String comment = (String) body.get("reviewComment");
        // 审核人 ID 由拦截器统一注入即可，这里简化
        Long reviewerId = 1L;   // 如需真实 ID，从 Session 拿 Admin->User->id
        return ApiResponse.success(taskService.reviewTask(id, status, reviewerId, comment));
    }

    /** 单条详情 */
    @GetMapping("/{id}")
    public ApiResponse<Task> detail(@PathVariable Long id) {
        return ApiResponse.success(taskService.getTaskById(id));
    }

    /** 删除 */
    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        taskService.deleteTask(id);
        return ApiResponse.success("任务已删除");
    }

    /** 创建/修改——如果管理员也需要在后台直接新增 */
    @PostMapping
    public ApiResponse<Task> create(@ModelAttribute Task task, HttpServletRequest req) {
        try {
            // 从session中获取管理员信息
            var session = req.getSession();
            var admin = (com.example.demo.model.Admin) session.getAttribute("admin");
            
            if (admin != null) {
                // 设置创建者信息
                task.setCreatorId(admin.getUser().getId());
                task.setCreatorName(admin.getUser().getUsername());
            } else {
                return ApiResponse.error("用户未登录");
            }
            
            return ApiResponse.success(taskService.createTask(task));
        } catch (Exception e) {
            return ApiResponse.error("创建任务失败: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ApiResponse<Task> update(@PathVariable Long id, @RequestBody Task task) {
        task.setId(id);
        return ApiResponse.success(taskService.updateTask(task));
    }
}