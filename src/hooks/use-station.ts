import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import type { Station, StationApiResponse } from "@/types";

export function useStationQuery(stationId: string | null) {
  return useQuery({
    queryKey: ["station", stationId],
    queryFn: async () => {
      if (!stationId) throw new Error("No station ID provided");
      const { data } = await api.get<StationApiResponse>(`/stations/${stationId}`);
      return data.data.station;
    },
    enabled: !!stationId,
  });
}

export function useUpdateStationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (stationData: Partial<Station>) => {
      const { data } = await api.put<StationApiResponse>(`/stations/${stationData.id}`, stationData);
      return data.data.station;
    },
    onSuccess: (updatedStation) => {
      queryClient.setQueryData(["station", updatedStation.id], updatedStation);
    },
  });
}
