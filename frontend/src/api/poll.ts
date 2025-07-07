import api from "./axios";
import type { Poll } from "../types";

export async function getPublicPolls(
  page = 1,
  search = "",
  status = "active",
  limit = 5
) {
  const { data } = await api.get<Poll[]>(`/polls`, {
    params: { page, search, status, limit },
  });

  return data;
}

export async function getUserPolls(token: string, page = 1, search = "") {
  const { data } = await api.get<Poll[]>(`/polls/mine`, {
    params: { page, search },
    headers: { Authorization: `Bearer ${token}` },
  });

  return data;
}

export async function createPoll(token: string, formData: FormData) {
  const { data } = await api.post<Poll>(`/polls`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });

  return data;
}

export async function getPollById(token: string, id: string) {
  const { data } = await api.get<Poll>(`/polls/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return data;
}

export async function votePoll(token: string, id: string, option: string) {
  const { data } = await api.post<Poll>(
    `/polls/${id}/vote`,
    { option },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  return data;
}
