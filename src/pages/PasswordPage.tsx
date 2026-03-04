import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Eye, EyeOff, Lock, Mail, Radio, Save, Copy, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { SidebarDesktop, SidebarMobile } from "@/components/AppSidebar";

import { useAuth } from "@/context/AuthContext";
import { useUpdatePasswordMutation } from "@/hooks/use-auth";

interface PasswordFormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export function PasswordPage() {
  const navigate = useNavigate();
  const { logout, user, stationId } = useAuth();
  const updatePasswordMutation = useUpdatePasswordMutation();

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [copiedStationId, setCopiedStationId] = useState(false);

  const handleCopyStationId = () => {
    if (!stationId) return;
    navigator.clipboard.writeText(stationId);
    setCopiedStationId(true);
    setTimeout(() => setCopiedStationId(false), 2000);
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<PasswordFormValues>({
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  const onSubmit = async (data: PasswordFormValues) => {
    try {
      const { currentPassword, newPassword } = data;
      await updatePasswordMutation.mutateAsync({ currentPassword, newPassword });
      toast.success("¡Contraseña actualizada con éxito!");
      reset();
      setTimeout(() => {
        logout();
        navigate("/");
      }, 2000);
    } catch (error) {
      const axiosError = error as { response?: { data?: { message?: string; }; }; };
      toast.error(
        axiosError.response?.data?.message ||
        "Error al actualizar la contraseña. Intentá de nuevo."
      );
    }
  };

  return (
    <div className="dark h-screen w-full bg-app-base text-white flex overflow-hidden">
      {/* Sidebar */}
      <SidebarDesktop />

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        {/* Topbar */}
        <header className="border-b border-app-border bg-app-surface px-4 lg:px-8 py-4 flex items-center justify-between">
          <SidebarMobile />

          <div className="flex items-center gap-6 ml-auto">
            <div className="text-right text-sm px-2">
              <p className="font-medium text-white">{user?.email}</p>
              <p className="text-app-muted text-xs">Administrador</p>
            </div>
          </div>
        </header>

        {/* Content */}
        <ScrollArea className="flex-1 min-h-0">
          <div className="p-4 lg:p-8 space-y-8 max-w-5xl mx-auto w-full overflow-x-hidden">

            {/* Page title */}
            <div>
              <h1 className="text-3xl font-bold">Mi Cuenta</h1>
              <p className="text-app-muted text-sm">
                Información de tu cuenta y configuración de acceso.
              </p>
            </div>

            <Card className="bg-app-card border-app-border">
              <CardHeader>
                <h3 className="text-lg font-semibold">Mi cuenta</h3>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Read-only account info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-app-muted text-xs uppercase tracking-wide">Email</Label>
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-app-input border border-app-border text-sm text-white">
                      <Mail size={14} className="text-slate-400 shrink-0" />
                      <span className="truncate">{user?.email ?? "—"}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-app-muted text-xs uppercase tracking-wide">ID de tu radio</Label>
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-app-input border border-app-border text-sm text-white">
                      <Radio size={14} className="text-slate-400 shrink-0" />
                      <span className="truncate font-mono text-xs flex-1">{stationId ?? "—"}</span>
                      <button
                        type="button"
                        onClick={handleCopyStationId}
                        className="text-slate-400 hover:text-white transition-colors shrink-0"
                        title="Copiar ID"
                      >
                        {copiedStationId
                          ? <Check size={14} className="text-green-400" />
                          : <Copy size={14} />}
                      </button>
                    </div>
                  </div>
                </div>

                <Separator className="bg-app-border" />

                {/* Change password */}
                <div>
                  <h4 className="text-base font-semibold mb-1">Cambiar contraseña</h4>
                  <p className="text-app-muted text-sm mb-4">
                    Tras actualizar tu contraseña se cerrará la sesión automáticamente.
                  </p>

                  <form onSubmit={handleSubmit(onSubmit)} autoComplete="off" className="space-y-6">
                    {/* Current password */}
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Contraseña actual</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <Input
                          id="currentPassword"
                          type={showCurrentPassword ? "text" : "password"}
                          placeholder="Tu contraseña actual"
                          className="pl-9 pr-10 bg-app-input border-app-border focus-visible:ring-app-accent text-white"
                          {...register("currentPassword", {
                            required: "La contraseña actual es obligatoria",
                          })}
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-3 text-slate-400 hover:text-white"
                        >
                          {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {errors.currentPassword && (
                        <p className="text-xs text-red-500">{errors.currentPassword.message}</p>
                      )}
                    </div>

                    {/* New password */}
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">Nueva contraseña</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <Input
                          id="newPassword"
                          type={showNewPassword ? "text" : "password"}
                          placeholder="Mínimo 6 caracteres"
                          className="pl-9 pr-10 bg-app-input border-app-border focus-visible:ring-app-accent text-white"
                          {...register("newPassword", {
                            required: "La nueva contraseña es obligatoria",
                            minLength: {
                              value: 6,
                              message: "Debe tener al menos 6 caracteres",
                            },
                          })}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-3 text-slate-400 hover:text-white"
                        >
                          {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {errors.newPassword ? (
                        <p className="text-xs text-red-500">{errors.newPassword.message}</p>
                      ) : (
                        <p className="text-xs text-app-muted">
                          Debe tener al menos{" "}
                          <span className="text-app-accent font-medium">6 caracteres</span>.
                        </p>
                      )}
                    </div>

                    {/* Confirm new password */}
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Repetir nueva contraseña</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Repetí la nueva contraseña"
                          className="pl-9 pr-10 bg-app-input border-app-border focus-visible:ring-app-accent text-white"
                          {...register("confirmPassword", {
                            required: "Debés repetir la nueva contraseña",
                            validate: (value, formValues) =>
                              value === formValues.newPassword || "Las contraseñas no coinciden",
                          })}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-3 text-slate-400 hover:text-white"
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>
                      )}
                    </div>

                    <div className="flex justify-end pt-4">
                      <Button
                        type="submit"
                        disabled={isSubmitting || updatePasswordMutation.isPending}
                        className="bg-app-accent hover:bg-app-accent-hover text-white"
                      >
                        {isSubmitting || updatePasswordMutation.isPending ? (
                          "Actualizando..."
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Actualizar contraseña
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </div>
              </CardContent>
            </Card>

          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
