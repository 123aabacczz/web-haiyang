package com.example.demo.mapper;

import com.example.demo.model.OrganizationStructure;
import org.apache.ibatis.annotations.*;

import java.util.List;

@Mapper
public interface OrganizationStructureMapper {

    @Select("SELECT * FROM organization_structure ORDER BY level, id")
    List<OrganizationStructure> selectAll();

    @Select("SELECT * FROM organization_structure WHERE id = #{id}")
    OrganizationStructure selectById(@Param("id") Long id);

    @Select("SELECT * FROM organization_structure WHERE parent_id = #{parentId}")
    List<OrganizationStructure> selectByParentId(@Param("parentId") Long parentId);

    @Select("SELECT * FROM organization_structure WHERE team_id = #{teamId}")
    List<OrganizationStructure> selectByTeamId(@Param("teamId") Long teamId);

    @Options(useGeneratedKeys = true, keyProperty = "id")
    @Insert("INSERT INTO organization_structure(name, description, parent_id, team_id, level, icon, badge_type, created_at, updated_at) " +
            "VALUES(#{name}, #{description}, #{parentId}, #{teamId}, #{level}, #{icon}, #{badgeType}, NOW(), NOW())")
    void insert(OrganizationStructure organizationStructure);

    @Update("UPDATE organization_structure SET name = #{name}, description = #{description}, parent_id = #{parentId}, " +
            "team_id = #{teamId}, level = #{level}, icon = #{icon}, badge_type = #{badgeType}, updated_at = NOW() " +
            "WHERE id = #{id}")
    boolean update(OrganizationStructure organizationStructure);

    @Delete("DELETE FROM organization_structure WHERE id = #{id}")
    boolean delete(@Param("id") Long id);
}
