import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Loader2, Plus, Pencil, Trash2, Tv } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 pb-10">
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
    <Card className="bg-app-card border-app-border group relative flex flex-col hover:border-app-border transition-colors w-full min-w-0 max-w-full overflow-hidden">
      <CardHeader className="pb-2 pr-16">
        <h3 className="font-semibold text-white leading-tight line-clamp-1">{program.name}</h3>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-app-muted text-sm line-clamp-3 leading-relaxed">
          {program.description}
        </p>
      </CardContent>

      {/* Actions */}
      <div className="absolute top-3 right-3 flex items-center gap-1">
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7 text-slate-500 hover:text-white hover:bg-app-border"
          onClick={onEdit}
          aria-label="Editar programa"
        >
          <Pencil size={14} />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7 text-slate-500 hover:text-red-400 hover:bg-app-border"
          onClick={onDelete}
          aria-label="Eliminar programa"
        >
          <Trash2 size={14} />
        </Button>
      </div>
    </Card>
  );
}

function ProgramsSkeletonGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="bg-app-card border border-app-border rounded-xl p-5 space-y-3 animate-pulse"
        >
          <div className="h-4 bg-slate-800 rounded w-2/3" />
          <div className="h-3 bg-slate-800 rounded w-full" />
          <div className="h-3 bg-slate-800 rounded w-5/6" />
          <div className="h-3 bg-slate-800 rounded w-3/4" />
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center gap-5">
      <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center">
        <Tv size={28} className="text-slate-500" />
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
