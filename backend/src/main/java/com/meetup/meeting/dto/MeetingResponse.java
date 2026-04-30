package com.meetup.meeting.dto;

import com.meetup.meeting.entity.Meeting;
import com.meetup.meeting.entity.MeetingDate;
import com.meetup.meeting.entity.Participant;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter
public class MeetingResponse {
    private final String id;
    private final String title;
    private final String description;
    private final LocalDateTime createdAt;
    private final List<DateInfo> dates;
    private final List<ParticipantInfo> participants;

    public MeetingResponse(Meeting meeting) {
        this.id = meeting.getId();
        this.title = meeting.getTitle();
        this.description = meeting.getDescription();
        this.createdAt = meeting.getCreatedAt();
        this.dates = meeting.getDates().stream().map(DateInfo::new).toList();
        this.participants = meeting.getParticipants().stream().map(ParticipantInfo::new).toList();
    }

    @Getter
    public static class DateInfo {
        private final Long id;
        private final LocalDate date;
        private final int count;

        public DateInfo(MeetingDate d) {
            this.id = d.getId();
            this.date = d.getDate();
            this.count = d.getParticipants().size();
        }
    }

    @Getter
    public static class ParticipantInfo {
        private final Long id;
        private final String name;
        private final List<Long> availableDateIds;
        private final LocalDateTime createdAt;

        public ParticipantInfo(Participant p) {
            this.id = p.getId();
            this.name = p.getName();
            this.availableDateIds = p.getAvailableDates().stream().map(MeetingDate::getId).toList();
            this.createdAt = p.getCreatedAt();
        }
    }
}