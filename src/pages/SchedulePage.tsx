import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Calendar, Loader2, Plus, Pencil, Trash2, Clock, Copy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { SidebarDesktop, SidebarMobile } from "@/components/AppSidebar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

import { useAuth } from "@/context/AuthContext";
import { useProgramsQuery } from "@/hooks/use-programs";
import { useStationQuery } from "@/hooks/use-station";
import {
  useSchedulesQuery,
  useCreateScheduleMutation,
  useUpdateScheduleMutation,
  useDeleteScheduleMutation,
  useDeleteAllSchedulesMutation,
  useCopyDayScheduleMutation,
} from "@/hooks/use-schedules";
import type { WeeklySchedule } from "@/types";

/* ─── Constants ───────────────────────────────────────────────────────── */

const DAYS: { label: string; short: string; initial: string; value: number; }[] = [
  { label: "Lunes", short: "Lun", initial: "Lun", value: 1 },
  { label: "Martes", short: "Mar", initial: "Mar", value: 2 },
  { label: "Miércoles", short: "Mié", initial: "Mié", value: 3 },
  { label: "Jueves", short: "Jue", initial: "Jue", value: 4 },
  { label: "Viernes", short: "Vie", initial: "Vie", value: 5 },
  { label: "Sábado", short: "Sáb", initial: "Sáb", value: 6 },
  { label: "Domingo", short: "Dom", initial: "Dom", value: 0 },
];

/* ─── Helpers ─────────────────────────────────────────────────────────── */

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

/** Sort schedules circularly relative to dayStartTime */
function sortByDayStart(schedules: WeeklySchedule[], dayStartTime: string): WeeklySchedule[] {
  const pivot = timeToMinutes(dayStartTime || "00:00");
  return [...schedules].sort((a, b) => {
    const aMin = (timeToMinutes(a.startTime) - pivot + 1440) % 1440;
    const bMin = (timeToMinutes(b.startTime) - pivot + 1440) % 1440;
    return aMin - bMin;
  });
}

/* ─── Types ───────────────────────────────────────────────────────────── */

interface ScheduleFormValues {
  programId: string;
  startTime: string;
  endTime: string;
}

/* ─── Page ────────────────────────────────────────────────────────────── */

export function SchedulePage() {
  const { stationId, user } = useAuth();
  const { data: station } = useStationQuery(stationId);
  const { data: programs = [] } = useProgramsQuery(stationId);
  const { data: schedules = [], isLoading } = useSchedulesQuery(stationId);

  const dayStartTime = station?.dayStartTime || "00:00";

  // Active day tab
  const [activeDay, setActiveDay] = useState<number>(1);

  // Sheet state
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<WeeklySchedule | null>(null);

  // Delete single dialog
  const [deleteTarget, setDeleteTarget] = useState<WeeklySchedule | null>(null);

  // Delete all dialog
  const [deleteAllOpen, setDeleteAllOpen] = useState(false);

  // Copy dialog
  const [copyDialogOpen, setCopyDialogOpen] = useState(false);
  const [selectedTargetDays, setSelectedTargetDays] = useState<number[]>([]);

  /* ── form ── */
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ScheduleFormValues>();

  const createMutation = useCreateScheduleMutation();
  const updateMutation = useUpdateScheduleMutation();
  const deleteMutation = useDeleteScheduleMutation();
  const deleteAllMutation = useDeleteAllSchedulesMutation();
  const copyMutation = useCopyDayScheduleMutation();

  /* ── filtered + sorted schedules for the active day ── */
  const daySchedules = useMemo(() => {
    const filtered = schedules.filter((s) => s.dayOfWeek === activeDay);
    return sortByDayStart(filtered, dayStartTime);
  }, [schedules, activeDay, dayStartTime]);

  /* ── handlers ── */
  const openCreate = () => {
    setEditTarget(null);
    reset({ programId: programs[0]?.id ?? "", startTime: "", endTime: "" });
    setSheetOpen(true);
  };

  const openEdit = (schedule: WeeklySchedule) => {
    setEditTarget(schedule);
    reset({
      programId: schedule.programId,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
    });
    setSheetOpen(true);
  };

  const onSubmit = async (values: ScheduleFormValues) => {
    if (!stationId) return;
    try {
      if (editTarget) {
        await updateMutation.mutateAsync({
          stationId,
          scheduleId: editTarget.id,
          dayOfWeek: activeDay,
          ...values,
        });
        toast.success("Bloque actualizado con éxito");
      } else {
        await createMutation.mutateAsync({
          stationId,
          dayOfWeek: activeDay,
          ...values,
        });
        toast.success("Bloque creado con éxito");
      }
      setSheetOpen(false);
    } catch {
      toast.error("Ocurrió un error. Intentá de nuevo.");
    }
  };

  const confirmDelete = async () => {
    if (!stationId || !deleteTarget) return;
    try {
      await deleteMutation.mutateAsync({ stationId, scheduleId: deleteTarget.id });
      toast.success("Bloque eliminado");
      setDeleteTarget(null);
    } catch {
      toast.error("No se pudo eliminar el bloque.");
    }
  };

  const confirmDeleteAll = async () => {
    if (!stationId) return;
    try {
      await deleteAllMutation.mutateAsync({ stationId });
      toast.success("Programación semanal eliminada");
      setDeleteAllOpen(false);
    } catch {
      toast.error("No se pudo eliminar la programación.");
    }
  };

  const handleCopyDay = async () => {
    if (!stationId || selectedTargetDays.length === 0 || daySchedules.length === 0) return;
    try {
      const schedulesToCopy = daySchedules.map((s) => ({
        programId: s.programId,
        startTime: s.startTime,
        endTime: s.endTime,
      }));

      await copyMutation.mutateAsync({
        stationId,
        schedulesToCopy,
        targetDays: selectedTargetDays,
      });

      toast.success("Programación copiada con éxito");
      setCopyDialogOpen(false);
      setSelectedTargetDays([]);
    } catch {
      toast.error("Hubo un error al copiar la programación.");
    }
  };

  const isSaving = isSubmitting || createMutation.isPending || updateMutation.isPending;

  /* ── render ── */
  return (
    <div className="dark h-screen w-full bg-app-base text-white flex overflow-hidden">
      {/* Sidebar — desktop */}
      <SidebarDesktop />

      {/* Main layout */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        {/* Top Header */}
        <header className="border-b border-app-border bg-app-surface px-4 lg:px-8 py-4 flex items-center justify-between">
          <SidebarMobile />

          <div className="flex items-center gap-6 ml-auto">
            <div className="text-right text-sm px-2">
              <p className="font-medium text-white">{user?.email}</p>
              <p className="text-app-muted text-xs">Administrador</p>
            </div>
            <div className="hidden sm:flex" />
          </div>
        </header>

        {/* Content */}
        <ScrollArea className="flex-1 min-h-0">
          <div className="p-4 lg:p-8 space-y-6 max-w-5xl mx-auto w-full overflow-x-hidden">
            {/* Page header */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold">Programación Semanal</h1>
                <p className="text-app-muted text-sm mt-1">
                  Asigná programas a franjas horarias por día. Los bloques se ordenan desde las{" "}
                  <span className="text-white font-medium">{dayStartTime}</span> hs.
                </p>
              </div>
              <Button
                variant="destructive" className="shrink-0 gap-2 self-end sm:self-start"
                onClick={() => setDeleteAllOpen(true)}
                disabled={schedules.length === 0}
              >
                <Trash2 size={14} />
                Borrar toda la programación
              </Button>
            </div>

            {/* Day tabs */}
            <div className="w-full overflow-x-auto pb-2 scrollbar-none">
              <div className="flex gap-2 sm:gap-1">
                {DAYS.map((day) => {
                  const count = schedules.filter((s) => s.dayOfWeek === day.value).length;
                  const isActive = activeDay === day.value;
                  return (
                    <button
                      key={day.value}
                      onClick={() => setActiveDay(day.value)}
                      className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 px-1 py-1 sm:px-3 sm:py-2 rounded-lg font-medium transition-colors shrink-0 min-w-[2.5rem] sm:min-w-0 ${isActive
                        ? "bg-app-accent text-white"
                        : "bg-app-card text-app-muted hover:bg-app-border hover:text-white"
                        }`}
                    >
                      <span className="hidden md:inline text-sm">{day.label}</span>
                      <span className="hidden sm:inline md:hidden text-sm">{day.short}</span>
                      <span className="sm:hidden text-sm leading-none">{day.initial}</span>
                      {count > 0 && (
                        <span
                          className={`text-[11px] font-bold rounded-full px-2 py-0.5 leading-none mt-0.5 sm:mt-0 ${isActive ? "bg-white/20 text-white" : "bg-slate-700 text-slate-300"
                            }`}
                        >
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Day content */}
            <div>
              {/* Day header: active day title + add button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <h2 className="text-lg font-semibold text-white">
                  {DAYS.find((d) => d.value === activeDay)?.label}
                </h2>
                <div className="flex flex-row items-center gap-2 self-end sm:self-auto max-w-full">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-auto max-w-[120px] sm:max-w-none border-app-border text-slate-300 hover:bg-app-border hover:text-white shrink-0"
                    disabled={daySchedules.length === 0}
                    onClick={() => {
                      setSelectedTargetDays([]);
                      setCopyDialogOpen(true);
                    }}
                  >
                    <Copy size={14} className="mr-1 sm:mr-1.5 shrink-0" />
                    <span className="truncate">Copiar</span>
                  </Button>
                  <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                    <SheetTrigger asChild>
                      <Button
                        size="sm"
                        className="w-auto max-w-[160px] sm:max-w-none bg-app-accent hover:bg-app-accent-hover text-white gap-1 sm:gap-2 px-2 sm:px-3 shrink-0"
                        onClick={openCreate}
                      >
                        <Plus size={14} className="shrink-0" />
                        <span className="truncate">Agregar bloque</span>
                      </Button>
                    </SheetTrigger>
                    <SheetContent
                      side="right"
                      className="dark w-full sm:max-w-md border-l border-app-border bg-app-surface text-white flex flex-col"
                    >
                      <SheetHeader className="mb-6">
                        <SheetTitle className="text-white text-xl">
                          {editTarget ? "Editar Bloque" : "Nuevo Bloque"}
                        </SheetTitle>
                      </SheetHeader>

                      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 flex-1" autoComplete="off">
                        {/* Program select */}
                        <div className="space-y-2">
                          <Label htmlFor="sch-program">
                            Programa <span className="text-red-500">*</span>
                          </Label>
                          <select
                            id="sch-program"
                            className="flex h-9 w-full rounded-md border border-app-border bg-app-input px-3 py-1 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-app-accent disabled:cursor-not-allowed disabled:opacity-50 text-sm text-white [color-scheme:dark]"
                            {...register("programId", { required: "Seleccioná un programa" })}
                          >
                            <option value="" disabled>
                              Seleccioná un programa…
                            </option>
                            {programs.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name} {p.description ? `- ${p.description}` : ""}
                              </option>
                            ))}
                          </select>
                          {errors.programId && (
                            <p className="text-xs text-red-500">{errors.programId.message}</p>
                          )}
                          <p className="text-[0.8rem] text-app-muted">
                            Programa que saldrá al aire en este bloque.
                          </p>
                        </div>

                        {/* Times */}
                        <div className="space-y-2">
                          <Label>
                            Horarios <span className="text-red-500">*</span>
                          </Label>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Input
                                id="sch-start"
                                type="time"
                                lang="en-GB"
                                className="bg-app-input border-app-border [color-scheme:dark]"
                                {...register("startTime", { required: "Requerido" })}
                              />
                              {errors.startTime && (
                                <p className="text-xs text-red-500">{errors.startTime.message}</p>
                              )}
                            </div>
                            <div className="space-y-2">
                              <Input
                                id="sch-end"
                                type="time"
                                lang="en-GB"
                                className="bg-app-input border-app-border [color-scheme:dark]"
                                {...register("endTime", { required: "Requerido" })}
                              />
                              {errors.endTime && (
                                <p className="text-xs text-red-500">{errors.endTime.message}</p>
                              )}
                            </div>
                          </div>
                          <p className="text-[0.8rem] text-app-muted">
                            Determina el inicio y el fin del bloque horario.
                          </p>
                        </div>

                        <div className="mt-8">
                          <Button
                            type="submit"
                            className="w-full bg-app-accent hover:bg-app-accent-hover text-white"
                            disabled={isSaving}
                          >
                            {isSaving ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : null}
                            {editTarget ? "Guardar Cambios" : "Crear Bloque"}
                          </Button>
                        </div>
                      </form>
                    </SheetContent>
                  </Sheet>
                </div>
              </div>
            </div>

            {/* Schedule list */}
            {isLoading ? (
              <ScheduleSkeletonList />
            ) : daySchedules.length === 0 ? (
              <DayEmptyState />
            ) : (
              <div className="space-y-3 pb-10">
                {daySchedules.map((schedule) => {
                  const programName =
                    schedule.program?.name ??
                    programs.find((p) => p.id === schedule.programId)?.name ??
                    "Programa";
                  return (
                    <ScheduleCard
                      key={schedule.id}
                      schedule={schedule}
                      programName={programName}
                      onEdit={() => openEdit(schedule)}
                      onDelete={() => setDeleteTarget(schedule)}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Delete single block dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="dark bg-app-surface border-app-border text-white">
          <DialogHeader>
            <DialogTitle>¿Eliminar bloque?</DialogTitle>
            <DialogDescription className="text-app-muted pt-1">
              Esto eliminará el bloque de{" "}
              <span className="text-white font-semibold">
                {deleteTarget?.startTime} – {deleteTarget?.endTime}
              </span>{" "}
              del día. Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 pt-2">
            <Button
              variant="ghost"
              className="text-app-muted hover:text-white hover:bg-app-border"
              onClick={() => setDeleteTarget(null)}
              disabled={deleteMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog >

      {/* Delete ALL dialog */}
      < Dialog open={deleteAllOpen} onOpenChange={setDeleteAllOpen} >
        <DialogContent className="dark bg-app-surface border-app-border text-white">
          <DialogHeader>
            <DialogTitle>¿Borrar toda la programación semanal?</DialogTitle>
            <DialogDescription className="text-app-muted pt-1">
              Esta acción eliminará{" "}
              <span className="text-white font-semibold">todos los bloques</span> de los 7 días.
              No se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 pt-2">
            <Button
              variant="ghost"
              className="text-app-muted hover:text-white hover:bg-app-border"
              onClick={() => setDeleteAllOpen(false)}
              disabled={deleteAllMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteAll}
              disabled={deleteAllMutation.isPending}
            >
              {deleteAllMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Borrar todo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog >

      {/* Copy day dialog */}
      < Dialog open={copyDialogOpen} onOpenChange={setCopyDialogOpen} >
        <DialogContent className="dark bg-app-surface border-app-border text-white">
          <DialogHeader>
            <DialogTitle>Copiar programación</DialogTitle>
            <DialogDescription className="text-app-muted pt-1">
              Seleccioná los días a los que querés copiar los {daySchedules.length} bloques del{" "}
              <span className="text-white font-semibold flex-inline">
                {DAYS.find((d) => d.value === activeDay)?.label}
              </span>.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-3">
            {/* Checkbox Select All */}
            <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-app-border/50 cursor-pointer border-b border-app-border">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-app-border accent-app-accent bg-app-card"
                checked={selectedTargetDays.length === 6}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedTargetDays(
                      DAYS.filter((d) => d.value !== activeDay).map((d) => d.value)
                    );
                  } else {
                    setSelectedTargetDays([]);
                  }
                }}
              />
              <span className="font-semibold text-sm">Seleccionar todos</span>
            </label>

            {/* Checkboxes days */}
            <div className="grid grid-cols-2 gap-2 mt-2">
              {DAYS.filter((d) => d.value !== activeDay).map((d) => (
                <label
                  key={d.value}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-app-border/50 cursor-pointer text-sm"
                >
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-app-border accent-app-accent bg-app-card"
                    checked={selectedTargetDays.includes(d.value)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedTargetDays((prev) => [...prev, d.value]);
                      } else {
                        setSelectedTargetDays((prev) => prev.filter((v) => v !== d.value));
                      }
                    }}
                  />
                  <span>{d.label}</span>
                </label>
              ))}
            </div>
          </div>

          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 pt-2">
            <Button
              variant="ghost"
              className="text-app-muted hover:text-white hover:bg-app-border"
              onClick={() => setCopyDialogOpen(false)}
              disabled={copyMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              className="bg-app-accent hover:bg-app-accent-hover text-white"
              onClick={handleCopyDay}
              disabled={selectedTargetDays.length === 0 || copyMutation.isPending}
            >
              {copyMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Copiar ({selectedTargetDays.length})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog >
    </div >
  );
}

/* ─── Sub-components ───────────────────────────────────────────────────── */

function ScheduleCard({
  schedule,
  programName,
  onEdit,
  onDelete,
}: {
  schedule: WeeklySchedule;
  programName: string;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center gap-2 sm:gap-4 bg-app-card border border-app-border rounded-xl px-3 sm:px-4 py-3 group hover:border-app-accent/50 hover:bg-app-surface transition-all duration-300 w-full min-w-0 max-w-full overflow-hidden shadow-sm hover:shadow-md">
      {/* Time badge */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="w-1.5 h-10 bg-app-accent rounded-full" />
        <div className="text-center">
          <p className="text-xs font-mono font-semibold text-app-accent">{schedule.startTime}</p>
          <p className="text-[10px] text-slate-500 font-mono">{schedule.endTime}</p>
        </div>
      </div>

      {/* Program name */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-white text-sm truncate">{programName}</p>
        <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
          <Clock size={10} />
          {schedule.startTime} – {schedule.endTime}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 text-slate-500 hover:text-white hover:bg-app-border"
              onClick={onEdit}
              aria-label="Editar bloque"
            >
              <Pencil size={13} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            Editar bloque
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 text-slate-500 hover:text-red-400 hover:bg-app-border"
              onClick={onDelete}
              aria-label="Eliminar bloque"
            >
              <Trash2 size={13} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            Eliminar bloque
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}

function ScheduleSkeletonList() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 bg-app-card border border-app-border rounded-xl px-4 py-3 animate-pulse"
        >
          <div className="w-1.5 h-10 bg-slate-800 rounded-full" />
          <div className="space-y-2 flex-1">
            <div className="h-3 bg-slate-800 rounded w-1/3" />
            <div className="h-2 bg-slate-800 rounded w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

function DayEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
      <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center">
        <Calendar size={24} className="text-slate-500" />
      </div>
      <div>
        <p className="text-base font-semibold text-white">Sin bloques para este día</p>
        <p className="text-app-muted text-sm mt-1">
          Agregá un bloque horario para comenzar.
        </p>
      </div>
    </div>
  );
}

