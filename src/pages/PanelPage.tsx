import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { useStationQuery, useUpdateStationMutation } from "@/hooks/use-station";
import type { Station } from "@/types";
import { StationPlayer } from "@/components/StationPlayer";
import { SidebarDesktop, SidebarMobile } from "@/components/AppSidebar";

export function PanelPage() {
  const { stationId, user } = useAuth();
  const { data: station, isLoading } = useStationQuery(stationId);
  const updateMutation = useUpdateStationMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Partial<Station>>();

  useEffect(() => {
    if (station) {
      reset(station);
    }
  }, [station, reset]);

  const onSubmit = async (data: Partial<Station>) => {
    try {
      if (!stationId) return;
      await updateMutation.mutateAsync({ ...data, id: stationId });
      toast.success("¡Estación actualizada con éxito!");
    } catch {
      toast.error("Hubo un error al actualizar la estación");
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
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold">Ajustes de la Estación</h1>
                <p className="text-app-muted text-sm">
                  Configura los detalles de tu radio. Se recomienda completar todos los campos para mejorar la experiencia de los oyentes en la app.
                </p>
              </div>
            </div>

            {isLoading ? (
              <PanelSkeleton />
            ) : (
              <div className="space-y-8 pb-10">
                {/* Reproductor de la estación */}
                {station && <StationPlayer station={station} />}

                {/* Formulario */}
                <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
                  <Card className="bg-app-card border-app-border">
                    <CardHeader>
                      <h3 className="text-lg font-semibold">Ajustes de la Estación</h3>
                    </CardHeader>
                    <CardContent className="space-y-8">

                      {/* Información Básica */}
                      <div>
                        <h4 className="text-base font-semibold mb-4">Información Básica</h4>
                        <div className="grid gap-6 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="name">Nombre de la Radio <span className="text-red-500">*</span></Label>
                            <Input
                              id="name"
                              placeholder="Ej: Radio Galaxia"
                              className="bg-app-input border-app-border"
                              {...register("name", { required: "El nombre es obligatorio" })}
                            />
                            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                            <p className="text-[0.8rem] text-app-muted">El nombre principal de la estación que verán los oyentes.</p>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="streamUrl">URL de Streaming <span className="text-red-500">*</span></Label>
                            <Input
                              id="streamUrl"
                              placeholder="Ej: https://stream.radiogalaxia.com/live"
                              className="bg-app-input border-app-border"
                              {...register("streamUrl", { required: "La URL de streaming es obligatoria" })}
                            />
                            {errors.streamUrl && <p className="text-xs text-red-500">{errors.streamUrl.message}</p>}
                            <p className="text-[0.8rem] text-app-muted">Enlace directo al servidor de audio en formato Icecast/Shoutcast.</p>
                          </div>

                          <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="slogan">Slogan</Label>
                            <Textarea
                              id="slogan"
                              placeholder="Ej: El sonido de tu universo..."
                              className="bg-app-input border-app-border"
                              {...register("slogan")}
                            />
                            <p className="text-[0.8rem] text-app-muted">Frase corta que aparece debajo del nombre de la radio.</p>
                          </div>
                        </div>
                      </div>

                      <Separator className="bg-app-border" />

                      {/* Media & Links */}
                      <div>
                        <h4 className="text-base font-semibold mb-4">Media y Links</h4>
                        <div className="grid gap-6 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="logoUrl">URL del Logo</Label>
                            <Input id="logoUrl" placeholder="Ej: https://tusitio.com/logo.png" className="bg-app-input border-app-border" {...register("logoUrl")} />
                            <p className="text-[0.8rem] text-app-muted">Se recomienda una imagen cuadrada en PNG o JPG.</p>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="websiteUrl">Sitio Web</Label>
                            <Input id="websiteUrl" placeholder="Ej: https://radiogalaxia.com" className="bg-app-input border-app-border" {...register("websiteUrl")} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="facebookUrl">Facebook URL</Label>
                            <Input id="facebookUrl" placeholder="Ej: https://facebook.com/radiogalaxia" className="bg-app-input border-app-border" {...register("facebookUrl")} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="instagramUrl">Instagram URL</Label>
                            <Input id="instagramUrl" placeholder="Ej: https://instagram.com/radiogalaxia" className="bg-app-input border-app-border" {...register("instagramUrl")} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="twitterUrl">X (Twitter) URL</Label>
                            <Input id="twitterUrl" placeholder="Ej: https://x.com/radiogalaxia" className="bg-app-input border-app-border" {...register("twitterUrl")} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="youtubeUrl">YouTube URL</Label>
                            <Input id="youtubeUrl" placeholder="Ej: https://youtube.com/@radiogalaxia" className="bg-app-input border-app-border" {...register("youtubeUrl")} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="tiktokUrl">TikTok URL</Label>
                            <Input id="tiktokUrl" placeholder="Ej: https://tiktok.com/@radiogalaxia" className="bg-app-input border-app-border" {...register("tiktokUrl")} />
                          </div>
                        </div>
                      </div>

                      <Separator className="bg-app-border" />

                      {/* Ubicación y Contacto */}
                      <div>
                        <h4 className="text-base font-semibold mb-4">Ubicación y Contacto</h4>
                        <div className="grid gap-6 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="country">País</Label>
                            <Input id="country" placeholder="Ej: Argentina" className="bg-app-input border-app-border" {...register("country")} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="state">Estado/Provincia</Label>
                            <Input id="state" placeholder="Ej: Buenos Aires" className="bg-app-input border-app-border" {...register("state")} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="city">Ciudad</Label>
                            <Input id="city" placeholder="Ej: Pergamino" className="bg-app-input border-app-border" {...register("city")} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="postalCode">Código Postal</Label>
                            <Input id="postalCode" placeholder="Ej: 2700" className="bg-app-input border-app-border" {...register("postalCode")} />
                          </div>
                          <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="address">Dirección</Label>
                            <Input id="address" placeholder="Ej: Calle Falsa 123, Piso 4" className="bg-app-input border-app-border" {...register("address")} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email">Email de Contacto</Label>
                            <Input id="email" type="email" placeholder="Ej: contacto@radiogalaxia.com" className="bg-app-input border-app-border" {...register("email")} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="phone">Teléfono Fijo / Comercial</Label>
                            <Input id="phone" placeholder="Ej: +54 11 1234 5678" className="bg-app-input border-app-border" {...register("phone")} />
                            <p className="text-[0.8rem] text-app-muted">Línea tradicional para llamadas de oyentes/anunciantes.</p>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="whatsapp">WhatsApp / Mensajes</Label>
                            <Input id="whatsapp" placeholder="Ej: +54 9 11 1234 5678" className="bg-app-input border-app-border" {...register("whatsapp")} />
                            <p className="text-[0.8rem] text-app-muted">Número celular configurado para recibir mensajes a la radio.</p>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="dayStartTime">Hora inicio día</Label>
                            <Input id="dayStartTime" type="time" className="bg-app-input border-app-border" {...register("dayStartTime")} />
                            <p className="text-[0.8rem] text-app-muted">
                              Controla a qué hora comienza visualmente el calendario de programación en la app móvil.
                            </p>
                          </div>
                        </div>
                      </div>

                    </CardContent>

                    <div className="flex justify-end px-6 pb-6">
                      <Button
                        type="submit"
                        className="bg-app-accent hover:bg-app-accent-hover text-white"
                        disabled={updateMutation.isPending || isSubmitting}
                      >
                        {updateMutation.isPending || isSubmitting ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="mr-2 h-4 w-4" />
                        )}
                        Guardar Cambios
                      </Button>
                    </div>
                  </Card>
                </form>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

function PanelSkeleton() {
  return (
    <div className="space-y-8 pb-10">
      {/* Reproductor placeholder */}
      <div className="h-24 bg-app-card border border-app-border rounded-xl animate-pulse" />

      {/* Formulario placeholder */}
      <Card className="bg-app-card border-app-border animate-pulse">
        <CardHeader>
          <div className="h-6 bg-slate-800 rounded w-48" />
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Información Básica */}
          <div>
            <div className="h-5 bg-slate-800 rounded w-40 mb-4" />
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <div className="h-4 bg-slate-800 rounded w-32" />
                <div className="h-10 bg-app-input border border-app-border rounded-md" />
                <div className="h-3 bg-slate-800 rounded w-3/4" />
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-slate-800 rounded w-32" />
                <div className="h-10 bg-app-input border border-app-border rounded-md" />
                <div className="h-3 bg-slate-800 rounded w-3/4" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <div className="h-4 bg-slate-800 rounded w-24" />
                <div className="h-24 bg-app-input border border-app-border rounded-md" />
                <div className="h-3 bg-slate-800 rounded w-1/2" />
              </div>
            </div>
          </div>

          <Separator className="bg-app-border" />

          {/* Media & Links */}
          <div>
            <div className="h-5 bg-slate-800 rounded w-32 mb-4" />
            <div className="grid gap-6 md:grid-cols-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-slate-800 rounded w-24" />
                  <div className="h-10 bg-app-input border border-app-border rounded-md" />
                </div>
              ))}
            </div>
          </div>

          <Separator className="bg-app-border" />

          {/* Ubicación y Contacto */}
          <div>
            <div className="h-5 bg-slate-800 rounded w-48 mb-4" />
            <div className="grid gap-6 md:grid-cols-2">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className={`space-y-2 ${i === 4 ? "md:col-span-2" : ""}`}>
                  <div className="h-4 bg-slate-800 rounded w-24" />
                  <div className="h-10 bg-app-input border border-app-border rounded-md" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>

        <div className="flex justify-end px-6 pb-6">
          <div className="h-10 bg-slate-800 rounded w-40" />
        </div>
      </Card>
    </div>
  );
}
