import axios from 'axios';
import type { Meeting } from './types';

const client = axios.create({ baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api' });

export const createMeeting = (data: { title: string; description?: string; dates: string[] }) =>
  client.post<Meeting>('/meetings', data).then(r => r.data);

export const getMeeting = (id: string) =>
  client.get<Meeting>(`/meetings/${id}`).then(r => r.data);

export const addParticipant = (meetingId: string, data: { name: string; availableDateIds: number[] }) =>
  client.post<Meeting>(`/meetings/${meetingId}/participants`, data).then(r => r.data);