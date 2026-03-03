import { useMutation } from "@tanstack/react-query";
import api from "@/lib/axios";
import type {
  LoginPayload,
  LoginApiResponse,
  UpdatePasswordPayload,
  UpdatePasswordApiResponse,
  ApiErrorResponse
} from "@/types";


const loginRequest = async (payload: LoginPayload): Promise<LoginApiResponse["data"]> => {
  const { data } = await api.post<LoginApiResponse>("/users/login", payload);
  return data.data;
};

const updatePasswordRequest = async (payload: UpdatePasswordPayload): Promise<string> => {
  const { data } = await api.put<UpdatePasswordApiResponse>("/users/password", payload);
  return data.message ?? "Contraseña actualizada correctamente";
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

export function useUpdatePasswordMutation() {
  return useMutation<
    string,
    import("axios").AxiosError<ApiErrorResponse>,
    UpdatePasswordPayload
  >({
    mutationFn: updatePasswordRequest,
  });
}
