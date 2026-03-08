import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import type {
  SchedulesApiResponse,
  ScheduleApiResponse,
  CreateScheduleInput,
  UpdateScheduleInput,
  DeleteScheduleInput,
  DeleteAllSchedulesInput,
} from "@/types";

/* ─── Fetchers ────────────────────────────────────────────────────────── */

export const fetchSchedules = async (stationId: string) => {
  const { data } = await api.get<SchedulesApiResponse>(`/stations/${stationId}/schedules`);
  return data.data.schedules;
};

/* ─── Query ───────────────────────────────────────────────────────────── */

export function useSchedulesQuery(stationId: string | null) {
  return useQuery({
    queryKey: ["schedules", stationId],
    queryFn: async () => {
      if (!stationId) throw new Error("No station ID provided");
      return fetchSchedules(stationId);
    },
    enabled: !!stationId,
  });
}

/* ─── Mutations ───────────────────────────────────────────────────────── */


export function useCreateScheduleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ stationId, ...body }: CreateScheduleInput) => {
      const { data } = await api.post<ScheduleApiResponse>(
        `/stations/${stationId}/schedules`,
        body
      );
      return data.data.schedule;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["schedules", variables.stationId] });
    },
  });
}

export function useUpdateScheduleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ stationId, scheduleId, ...body }: UpdateScheduleInput) => {
      const { data } = await api.put<ScheduleApiResponse>(
        `/stations/${stationId}/schedules/${scheduleId}`,
        body
      );
      return data.data.schedule;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["schedules", variables.stationId] });
    },
  });
}

export function useDeleteScheduleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ stationId, scheduleId }: DeleteScheduleInput) => {
      await api.delete(`/stations/${stationId}/schedules/${scheduleId}`);
      return { stationId };
    },
    onSuccess: (_: unknown, variables: DeleteScheduleInput) => {
      queryClient.invalidateQueries({ queryKey: ["schedules", variables.stationId] });
    },
  });
}

export function useDeleteAllSchedulesMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ stationId }: DeleteAllSchedulesInput) => {
      await api.delete(`/stations/${stationId}/schedules`);
      return { stationId };
    },
    onSuccess: (_: unknown, variables: DeleteAllSchedulesInput) => {
      queryClient.invalidateQueries({ queryKey: ["schedules", variables.stationId] });
    },
  });
}

export function useCopyDayScheduleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      stationId,
      schedulesToCopy,
      targetDays,
    }: {
      stationId: string;
      schedulesToCopy: Omit<CreateScheduleInput, "stationId" | "dayOfWeek">[];
      targetDays: number[];
    }) => {
      const promises = targetDays.flatMap((dayOfWeek) =>
        schedulesToCopy.map((schedule) =>
          api.post<ScheduleApiResponse>(`/stations/${stationId}/schedules`, {
            ...schedule,
            dayOfWeek,
          })
        )
      );
      await Promise.all(promises);
      return { stationId };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["schedules", variables.stationId] });
    },
  });
}
