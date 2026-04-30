package com.meetup.meeting.repository;

import com.meetup.meeting.entity.MeetingDate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MeetingDateRepository extends JpaRepository<MeetingDate, Long> {
    List<MeetingDate> findByMeetingIdOrderByDateAsc(String meetingId);
}