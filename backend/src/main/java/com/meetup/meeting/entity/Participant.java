package com.meetup.meeting.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "participants")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@AllArgsConstructor
public class Participant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "meeting_id", nullable = false)
    private Meeting meeting;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @ManyToMany
    @JoinTable(
        name = "participant_dates",
        joinColumns = @JoinColumn(name = "participant_id"),
        inverseJoinColumns = @JoinColumn(name = "meeting_date_id")
    )
    private List<MeetingDate> availableDates = new ArrayList<>();

    public void updateAvailableDates(List<MeetingDate> dates) {
        this.availableDates.clear();
        this.availableDates.addAll(dates);
    }

    @PrePersist
    void prePersist() {
        if (this.createdAt == null) this.createdAt = LocalDateTime.now();
    }
}