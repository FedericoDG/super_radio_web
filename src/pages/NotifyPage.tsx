import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Loader2, Send, ImageIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SidebarDesktop, SidebarMobile } from "@/components/AppSidebar";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/axios";

/* ─── Types ───────────────────────────────────────────────────────────── */


interface NotifyFormValues {
  title: string;
  body: string;
  image: string;
}

/* ─── Page ────────────────────────────────────────────────────────────── */

export function NotifyPage() {
  const { stationId, user } = useAuth();
  const [isSending, setIsSending] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NotifyFormValues>({
    defaultValues: {
      title: "",
      body: "",
      image: "",
    },
  });


  const onSubmit = async (values: NotifyFormValues) => {
    if (!stationId) return;
    setIsSending(true);


    const payload: Record<string, unknown> = {
      title: values.title,
      body: values.body,
    };
    if (values.image.trim()) payload.image = values.image.trim();

    try {
      const response = await api.post(`/devices/${stationId}/notify`, payload);
      console.log(response.data.data);
      toast.success("¡Notificación enviada con éxito!");
      reset();
    } catch {
      toast.error("Error al enviar la notificación. Intentá de nuevo.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="dark h-screen w-full bg-app-base text-white flex overflow-hidden">
      {/* Sidebar — desktop */}
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
          <div className="p-4 lg:p-8 max-w-5xl mx-auto w-full overflow-x-hidden">
            {/* Page header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold">Notificaciones Push</h1>
              <p className="text-app-muted text-sm mt-1">
                Enviá un mensaje instantáneo a todos los dispositivos que tienen la app instalada.
              </p>
            </div>

            <div className="pb-10">
              {/* ── Form ── */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" autoComplete="off">
                {/* Required fields */}
                <Card className="bg-app-card border-app-border">
                  <CardHeader>
                    <h3 className="text-lg font-semibold">Mensaje</h3>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="notif-title">
                        Título <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="notif-title"
                        placeholder="Ej: ¡Estamos en vivo!"
                        className="bg-app-input border-app-border"
                        {...register("title", { required: "El título es obligatorio" })}
                      />
                      {errors.title && (
                        <p className="text-xs text-red-500">{errors.title.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notif-body">
                        Cuerpo <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        id="notif-body"
                        placeholder="Ej: Hoy tenemos un programa especial. ¡No te lo pierdas!"
                        className="bg-app-input border-app-border resize-none min-h-[100px]"
                        {...register("body", { required: "El cuerpo es obligatorio" })}
                      />
                      {errors.body && (
                        <p className="text-xs text-red-500">{errors.body.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notif-image" className="flex items-center gap-2">
                        <ImageIcon size={14} className="text-app-muted" />
                        URL de Imagen{" "}
                        <span className="text-slate-500 font-normal text-xs">(opcional)</span>
                      </Label>
                      <Input
                        id="notif-image"
                        placeholder="https://tusitio.com/imagen.png"
                        className="bg-app-input border-app-border"
                        {...register("image")}
                      />
                      <p className="text-[0.8rem] text-app-muted">
                        Imagen que acompaña la notificación en Android.
                      </p>
                    </div>
                  </CardContent>
                </Card>


                {/* Submit */}
                <div className="mt-8 pt-6 border-t border-app-border/50 flex justify-end">
                  <Button
                    type="submit"
                    disabled={isSending}
                    className="bg-app-accent hover:bg-app-accent-hover text-white px-8 gap-2"
                  >
                    {isSending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Send size={16} />
                    )}
                    Enviar Push
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
