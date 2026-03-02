import { useMutation } from "@tanstack/react-query";
import api from "@/lib/axios";
import type {
  LoginPayload,
  LoginApiResponse,
  ApiErrorResponse
} from "@/types";


const loginRequest = async (payload: LoginPayload): Promise<LoginApiResponse["data"]> => {
  const { data } = await api.post<LoginApiResponse>("/users/login", payload);
  return data.data;
};

export function useLoginMutation() {
  return useMutation<
    LoginApiResponse["data"],
    import("axios").AxiosError<ApiErrorResponse>,
    LoginPayload
  >({
    mutationFn: loginRequest,
  });
}
