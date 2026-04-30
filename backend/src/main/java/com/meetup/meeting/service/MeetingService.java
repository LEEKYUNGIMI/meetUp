package com.meetup.meeting.service;

import com.meetup.meeting.dto.AddParticipantRequest;
import com.meetup.meeting.dto.CreateMeetingRequest;
import com.meetup.meeting.dto.MeetingResponse;
import com.meetup.meeting.entity.Meeting;
import com.meetup.meeting.entity.MeetingDate;
import com.meetup.meeting.entity.Participant;
import com.meetup.meeting.repository.MeetingDateRepository;
import com.meetup.meeting.repository.MeetingRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MeetingService {

    private final MeetingRepository meetingRepository;
    private final MeetingDateRepository meetingDateRepository;

    @Transactional
    public MeetingResponse create(CreateMeetingRequest req) {
        Meeting meeting = Meeting.builder()
                .title(req.getTitle())
                .description(req.getDescription())
                .dates(new ArrayList<>())
                .participants(new ArrayList<>())
                .build();
        meetingRepository.save(meeting);

        req.getDates().stream().distinct().sorted().forEach(date ->
            meeting.getDates().add(meetingDateRepository.save(
                MeetingDate.builder()
                    .meeting(meeting)
                    .date(date)
                    .participants(new ArrayList<>())
                    .build()
            ))
        );

        return new MeetingResponse(meetingRepository.findById(meeting.getId()).orElseThrow());
    }

    @Transactional(readOnly = true)
    public MeetingResponse get(String id) {
        Meeting meeting = meetingRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("약속을 찾을 수 없습니다."));
        return new MeetingResponse(meeting);
    }

    @Transactional
    public MeetingResponse addParticipant(String meetingId, AddParticipantRequest req) {
        Meeting meeting = meetingRepository.findById(meetingId)
                .orElseThrow(() -> new EntityNotFoundException("약속을 찾을 수 없습니다."));

        List<MeetingDate> selected = meetingDateRepository.findAllById(req.getAvailableDateIds())
                .stream()
                .filter(d -> d.getMeeting().getId().equals(meetingId))
                .toList();

        meeting.getParticipants().stream()
                .filter(p -> p.getName().equals(req.getName()))
                .findFirst()
                .ifPresentOrElse(
                    existing -> existing.updateAvailableDates(new ArrayList<>(selected)),
                    () -> meeting.getParticipants().add(
                        Participant.builder()
                            .meeting(meeting)
                            .name(req.getName())
                            .availableDates(new ArrayList<>(selected))
                            .build()
                    )
                );

        return new MeetingResponse(meetingRepository.findById(meetingId).orElseThrow());
    }
}