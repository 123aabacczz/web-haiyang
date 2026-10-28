package com.example.demo.mapper;

import com.example.demo.model.Invitation;
import org.apache.ibatis.annotations.*;

import java.util.List;

@Mapper
public interface InvitationMapper {
    @Insert("INSERT INTO invitations (invitee_emails, inviter_id, role, status, created_at, expires_at) " +
            "VALUES (#{inviteeEmails, typeHandler=com.example.demo.typehandler.ListToStringTypeHandler}, #{inviterId}, #{role}, #{status}, NOW(), #{expiresAt})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(Invitation invitation);

    @Select("SELECT * FROM invitations WHERE id = #{id}")
    Invitation findById(Integer id);

    @Select("SELECT * FROM invitations WHERE inviter_id = #{inviterId} ORDER BY created_at DESC")
    List<Invitation> findByInviterId(Integer inviterId);
}
