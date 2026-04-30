package com.meetup.meeting.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;

import java.time.LocalDate;
import java.util.List;

@Getter
public class CreateMeetingRequest {
    @NotBlank
    private String title;
    private String description;
    @NotEmpty
    private List<LocalDate> dates;
}