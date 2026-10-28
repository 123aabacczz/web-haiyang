package com.example.demo.model;

public enum UserStatus {
    PENDING(0, "待审核"),
    ACTIVE(1, "正常"),
    DISABLED(2, "禁用"),
    REJECTED(3, "已拒绝");

    private final int code;
    private final String description;

    UserStatus(int code, String description) {
        this.code = code;
        this.description = description;
    }

    public int getCode() {
        return code;
    }

    public String getDescription() {
        return description;
    }

    public static UserStatus fromCode(int code) {
        for (UserStatus status : values()) {
            if (status.getCode() == code) {
                return status;
            }
        }
        throw new IllegalArgumentException("Invalid status code: " + code);
    }
}