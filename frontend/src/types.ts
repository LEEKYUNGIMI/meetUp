export interface DateInfo {
  id: number;
  date: string;
  count: number;
}

export interface ParticipantInfo {
  id: number;
  name: string;
  availableDateIds: number[];
  createdAt: string;
}

export interface Meeting {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  dates: DateInfo[];
  participants: ParticipantInfo[];
}