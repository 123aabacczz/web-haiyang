package com.example.demo.model;

import lombok.Data;

@Data
public class Permission {
    private Long id;
    private Long moduleId;
    private String name; // VIEW, EDIT, DELETE, MANAGE
    private String description;
}