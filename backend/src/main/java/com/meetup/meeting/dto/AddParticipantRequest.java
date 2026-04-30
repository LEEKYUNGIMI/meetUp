package com.meetup.meeting.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;

import java.util.List;

@Getter
public class AddParticipantRequest {
    @NotBlank
    private String name;
    @NotEmpty
    private List<Long> availableDateIds;
}