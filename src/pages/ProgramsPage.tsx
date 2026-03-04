import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Loader2, Plus, Pencil, Trash2, Radio as RadioIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SidebarDesktop, SidebarMobile } from "@/components/AppSidebar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

import { useAuth } from "@/context/AuthContext";
import type { Program } from "@/types";
import {
  useProgramsQuery,
  useCreateProgramMutation,
  useUpdateProgramMutation,
  useDeleteProgramMutation,
} from "@/hooks/use-programs";

/* ─── Types ───────────────────────────────────────────────────────────── */

interface ProgramFormValues {
  name: string;
  description: string;
}

/* ─── Page ────────────────────────────────────────────────────────────── */

export function ProgramsPage() {
  const { stationId, user } = useAuth();
  const { data: programs = [], isLoading } = useProgramsQuery(stationId);

  // Sheet state
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Program | null>(null);

  // Delete dialog state
  const [deleteTarget, setDeleteTarget] = useState<Program | null>(null);

  /* ── form ── */
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProgramFormValues>();

  const createMutation = useCreateProgramMutation();
  const updateMutation = useUpdateProgramMutation();
  const deleteMutation = useDeleteProgramMutation();

  const openEdit = (program: Program) => {
    setEditTarget(program);
    reset({ name: program.name, description: program.description });
    setSheetOpen(true);
  };

  const onSubmit = async (values: ProgramFormValues) => {
    if (!stationId) return;
    try {
      if (editTarget) {
        await updateMutation.mutateAsync({
          stationId,
          programId: editTarget.id,
          ...values,
        });
        toast.success("Programa actualizado con éxito");
      } else {
        await createMutation.mutateAsync({ stationId, ...values });
        toast.success("Programa creado con éxito");
      }
      setSheetOpen(false);
    } catch {
      toast.error("Ocurrió un error. Intentá de nuevo.");
    }
  };

  const confirmDelete = async () => {
    if (!stationId || !deleteTarget) return;
    try {
      await deleteMutation.mutateAsync({
        stationId,
        programId: deleteTarget.id,
      });
      toast.success(`"${deleteTarget.name}" eliminado`);
      setDeleteTarget(null);
    } catch {
      toast.error("No se pudo eliminar el programa.");
    }
  };

  const isSaving = isSubmitting || createMutation.isPending || updateMutation.isPending;

  /* ── render ── */
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
          <div className="p-4 lg:p-8 space-y-8 max-w-5xl mx-auto w-full overflow-x-hidden">
            {/* Page header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold">Programas</h1>
                <p className="text-app-muted text-sm mt-1">
                  Administrá los programas de tu estación. Los oyentes los verán en la grilla de programación.
                </p>
              </div>

              {/* Create button */}
              <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetTrigger asChild>
                  <Button
                    size="sm"
                    className="bg-app-accent hover:bg-app-accent-hover text-white gap-2 shrink-0"
                    onClick={() => {
                      setEditTarget(null);
                      reset({ name: "", description: "" });
                      setSheetOpen(true);
                    }}
                  >
                    <Plus size={16} />
                    Nuevo Programa
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="dark w-full sm:max-w-md border-l border-app-border bg-app-surface text-white flex flex-col"
                >
                  <SheetHeader className="mb-6">
                    <SheetTitle className="text-white text-xl">
                      {editTarget ? "Editar Programa" : "Nuevo Programa"}
                    </SheetTitle>
                  </SheetHeader>

                  <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 flex-1" autoComplete="off">
                    <div className="space-y-2">
                      <Label htmlFor="prog-name">
                        Nombre <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="prog-name"
                        placeholder="Ej: Rock Clásico"
                        className="bg-app-input border-app-border"
                        {...register("name", { required: "El nombre es obligatorio" })}
                      />
                      {errors.name && (
                        <p className="text-xs text-red-500">{errors.name.message}</p>
                      )}
                      <p className="text-[0.8rem] text-app-muted">
                        Nombre del programa tal como aparece en la app.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="prog-description">
                        Descripción <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        id="prog-description"
                        placeholder="Ej: Los mejores éxitos del rock de todos los tiempos"
                        className="bg-app-input border-app-border resize-none min-h-[120px]"
                        {...register("description", { required: "La descripción es obligatoria" })}
                      />
                      {errors.description && (
                        <p className="text-xs text-red-500">{errors.description.message}</p>
                      )}
                      <p className="text-[0.8rem] text-app-muted">
                        Breve reseña del contenido del programa.
                      </p>
                    </div>

                    <div className="mt-8">
                      <Button
                        type="submit"
                        className="w-full bg-app-accent hover:bg-app-accent-hover text-white"
                        disabled={isSubmitting || createMutation.isPending || updateMutation.isPending}
                      >
                        {isSaving ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        {editTarget ? "Guardar Cambios" : "Crear Programa"}
                      </Button>
                    </div>
                  </form>
                </SheetContent>
              </Sheet>
            </div>

            {/* Program list */}
            {isLoading ? (
              <ProgramsSkeletonGrid />
            ) : programs.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pb-10">
                {programs.map((program) => (
                  <ProgramCard
                    key={program.id}
                    program={program}
                    onEdit={() => openEdit(program)}
                    onDelete={() => setDeleteTarget(program)}
                  />
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open: boolean) => !open && setDeleteTarget(null)}>
        <DialogContent className="dark bg-app-surface border-app-border text-white">
          <DialogHeader>
            <DialogTitle>¿Eliminar programa?</DialogTitle>
            <DialogDescription className="text-app-muted pt-1">
              Estás por eliminar{" "}
              <span className="text-white font-semibold">"{deleteTarget?.name}"</span>.
              Esta acción no se puede deshacer.
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
      </Dialog>
    </div>
  );
}

/* ─── Sub-components ───────────────────────────────────────────────────── */

function ProgramCard({
  program,
  onEdit,
  onDelete,
}: {
  program: Program;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <Card className="bg-app-card border-app-border group relative flex flex-col hover:border-app-accent/50 hover:bg-app-surface transition-all duration-300 w-full min-w-0 max-w-full overflow-hidden shadow-sm hover:shadow-md">
      <CardContent className="p-4 flex flex-col h-full">
        {/* Header row with Title and Actions */}
        <div className="flex items-start justify-between gap-3 mb-3 shrink-0">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-app-surface border border-app-border flex items-center justify-center shrink-0 group-hover:bg-app-accent/10 group-hover:border-app-accent/30 transition-colors">
              <RadioIcon className="w-5 h-5 text-app-accent" />
            </div>
            <div className="pt-0.5 min-w-0">
              <h3 className="font-semibold text-white leading-tight line-clamp-2">{program.name}</h3>
            </div>
          </div>

          {/* Actions inline (no overlap with description) */}
          <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-slate-400 hover:text-white hover:bg-app-border rounded-full bg-app-surface/50 border border-transparent hover:border-app-border shrink-0"
              onClick={onEdit}
              aria-label="Editar programa"
            >
              <Pencil size={14} />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-slate-400 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/30 rounded-full bg-app-surface/50 border border-transparent shrink-0"
              onClick={onDelete}
              aria-label="Eliminar programa"
            >
              <Trash2 size={14} />
            </Button>
          </div>
        </div>

        {/* Description body */}
        <p className="text-app-muted text-sm line-clamp-3 leading-relaxed flex-1 mt-1">
          {program.description}
        </p>
      </CardContent>
    </Card>
  );
}

function ProgramsSkeletonGrid() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <Card key={i} className="bg-app-card border-app-border w-full min-w-0 max-w-full overflow-hidden animate-pulse">
          <CardContent className="p-4 flex flex-col h-full relative">
            <div className="flex items-start gap-3 pr-14 mb-3">
              <div className="w-10 h-10 rounded-full bg-slate-800 shrink-0" />
              <div className="w-full pt-1.5 space-y-2">
                <div className="h-4 bg-slate-800 rounded w-3/4" />
                <div className="h-3 bg-slate-800 rounded w-1/2" />
              </div>
            </div>

            <div className="space-y-2 mt-2">
              <div className="h-3 bg-slate-800 rounded w-full" />
              <div className="h-3 bg-slate-800 rounded w-5/6" />
              <div className="h-3 bg-slate-800 rounded w-4/5" />
            </div>

            <div className="absolute top-4 right-4 flex gap-1.5">
              <div className="h-8 w-8 rounded-full bg-slate-800" />
              <div className="h-8 w-8 rounded-full bg-slate-800" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center gap-5">
      <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center">
        <RadioIcon size={28} className="text-slate-500" />
      </div>
      <div>
        <p className="text-lg font-semibold text-white">Todavía no hay programas</p>
        <p className="text-app-muted text-sm mt-1">
          Creá tu primer programa y aparecerá acá.
        </p>
      </div>
    </div>
  );
}

/* ─── Sidebar ──────────────────────────────────────────────────────────── */
