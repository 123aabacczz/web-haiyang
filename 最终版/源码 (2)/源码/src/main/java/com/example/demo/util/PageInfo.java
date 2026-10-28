package com.example.demo.util;

import lombok.Data;

import java.util.List;

@Data
public class PageInfo<T> {
    // Getters
    private int currentPage;    // 当前页码
    private int pageSize;       // 每页大小
    private long totalPages;    // 总页数
    private long totalItems;    // 总记录数
    private List<T> items;

    // 是否第一页
    public boolean isFirstPage() {
        return currentPage == 1;
    }

    // 是否最后一页
    public boolean isLastPage() {
        return currentPage == totalPages;
    }

    // 是否有上一页
    public boolean hasPreviousPage() {
        return currentPage > 1;
    }

    // 是否有下一页
    public boolean hasNextPage() {
        return currentPage < totalPages;
    }

    // 对应 setter
    public void setList(List<T> list) { this.items = list; }
    public void setPage(int page) { this.currentPage = page; }

    public void setTotal(long totalItems) {
        this.totalItems = totalItems;
        this.totalPages = (int) Math.ceil((double) totalItems / this.pageSize);
    }
}