package com.meetup.meeting.controller;

import com.meetup.meeting.dto.AddParticipantRequest;
import com.meetup.meeting.dto.CreateMeetingRequest;
import com.meetup.meeting.dto.MeetingResponse;
import com.meetup.meeting.service.MeetingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/meetings")
@RequiredArgsConstructor
public class MeetingController {

    private final MeetingService meetingService;

    @PostMapping
    public ResponseEntity<MeetingResponse> create(@Valid @RequestBody CreateMeetingRequest req) {
        return ResponseEntity.ok(meetingService.create(req));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MeetingResponse> get(@PathVariable String id) {
        return ResponseEntity.ok(meetingService.get(id));
    }

    @PostMapping("/{id}/participants")
    public ResponseEntity<MeetingResponse> addParticipant(
            @PathVariable String id,
            @Valid @RequestBody AddParticipantRequest req) {
        return ResponseEntity.ok(meetingService.addParticipant(id, req));
    }
}