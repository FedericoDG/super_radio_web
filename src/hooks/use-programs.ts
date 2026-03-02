import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import type {
  Program,
  ProgramsApiResponse,
  ProgramApiResponse,
  CreateProgramInput,
  UpdateProgramInput,
  DeleteProgramInput,
} from "@/types";

/* ─── Queries ─────────────────────────────────────────────────────────── */

export function useProgramsQuery(stationId: string | null) {
  return useQuery({
    queryKey: ["programs", stationId],
    queryFn: async () => {
      if (!stationId) throw new Error("No station ID provided");
      const { data } = await api.get<ProgramsApiResponse>(
        `/stations/${stationId}/programs`
      );
      return data.data.programs;
    },
    enabled: !!stationId,
  });
}

/* ─── Mutations ───────────────────────────────────────────────────────── */

export function useCreateProgramMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ stationId, name, description }: CreateProgramInput) => {
      const { data } = await api.post<ProgramApiResponse>(
        `/stations/${stationId}/programs`,
        { name, description }
      );
      return data.data.program;
    },
    onSuccess: (program: Program) => {
      queryClient.invalidateQueries({ queryKey: ["programs", program.stationId] });
    },
  });
}

export function useUpdateProgramMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      stationId,
      programId,
      name,
      description,
    }: UpdateProgramInput) => {
      const { data } = await api.put<ProgramApiResponse>(
        `/stations/${stationId}/programs/${programId}`,
        { name, description }
      );
      return data.data.program;
    },
    onSuccess: (program) => {
      queryClient.invalidateQueries({ queryKey: ["programs", program.stationId] });
    },
  });
}

export function useDeleteProgramMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ stationId, programId }: DeleteProgramInput) => {
      await api.delete(`/stations/${stationId}/programs/${programId}`);
      return { stationId };
    },
    onSuccess: (_: unknown, variables) => {
      queryClient.invalidateQueries({ queryKey: ["programs", variables.stationId] });
    },
  });
}
