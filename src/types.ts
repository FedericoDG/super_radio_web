export interface User {
  id: string;
  email: string;
  name?: string;
  photoUrl?: string;
  role?: string;
}

export interface Station {
  id: string;
  name: string;
  streamUrl: string;
  slogan?: string;
  logoUrl?: string;
  websiteUrl?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  twitterUrl?: string;
  youtubeUrl?: string;
  tiktokUrl?: string;
  country?: string;
  state?: string;
  city?: string;
  postalCode?: string;
  address?: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  dayStartTime?: string;
}

export interface Program {
  id: string;
  stationId: string;
  name: string;
  description: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface WeeklySchedule {
  id: string;
  stationId: string;
  programId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  program?: Program;
}

/* ─── Inputs ────────────────────────────────────────────────────────── */

export type CreateProgramInput = { stationId: string; name: string; description: string };
export type UpdateProgramInput = { stationId: string; programId: string; name: string; description: string };
export type DeleteProgramInput = { stationId: string; programId: string };

export type CreateScheduleInput = {
  stationId: string;
  programId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
};
export type UpdateScheduleInput = CreateScheduleInput & { scheduleId: string };
export type DeleteScheduleInput = { stationId: string; scheduleId: string };
export type DeleteAllSchedulesInput = { stationId: string };

/* ─── API Responses ─────────────────────────────────────────────────── */

export interface ApiResponse<T> {
  status: "success" | "error";
  data: T;
  message?: string;
}

export type StationApiResponse = ApiResponse<{ station: Station }>;
export type ProgramsApiResponse = ApiResponse<{ programs: Program[] }>;
export type ProgramApiResponse = ApiResponse<{ program: Program }>;
export type SchedulesApiResponse = ApiResponse<{ schedules: WeeklySchedule[] }>;
export type ScheduleApiResponse = ApiResponse<{ schedule: WeeklySchedule }>;

/* ─── Auth ──────────────────────────────────────────────────────────── */

export interface LoginPayload {
  email: string;
  password: string;
}

export type LoginApiResponse = ApiResponse<{
  user: User;
  token: string;
  stationId: string;
}>;

export interface ApiErrorResponse {
  status: "error";
  message: string;
}
export interface UpdatePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export type UpdatePasswordApiResponse = ApiResponse<{ message: string }>;
