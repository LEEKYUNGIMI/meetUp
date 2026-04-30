package com.meetup.meeting.repository;

import com.meetup.meeting.entity.Meeting;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MeetingRepository extends JpaRepository<Meeting, String> {
}