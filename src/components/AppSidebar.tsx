import { Bell, Calendar, Settings, Radio, Menu, LogOut, KeyRound, RadioIcon } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/context/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { fetchPrograms } from "@/hooks/use-programs";
import { fetchSchedules } from "@/hooks/use-schedules";

/* ─── SidebarItem ─────────────────────────────────────────────────────── */

function SidebarItem({
  icon,
  label,
  to,
  onClick,
  onMouseEnter,
}: {
  icon: React.ReactNode;
  label: string;
  to?: string;
  onClick?: () => void;
  onMouseEnter?: () => void;
}) {
  const { pathname } = useLocation();
  const active =
    to === "/panel"
      ? pathname === "/panel" || pathname === "/panel/"
      : to ? pathname.startsWith(to) : false;

  const content = (
    <>
      {icon}
      <span>{label}</span>
    </>
  );

  const className = `flex items-center gap-3 px-3 py-2 rounded-lg transition cursor-pointer ${active ? "bg-app-accent text-white" : "text-app-muted hover:bg-app-border hover:text-white"
    }`;

  if (to) {
    return (
      <Link to={to} className={className} onClick={onClick} onMouseEnter={onMouseEnter}>
        {content}
      </Link>
    );
  }

  return (
    <div className={className} onClick={onClick}>
      {content}
    </div>
  );
}

/* ─── SidebarContent ──────────────────────────────────────────────────── */

function SidebarContent() {
  const { logout, stationId } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handlePrefetchPrograms = () => {
    if (stationId) {
      queryClient.prefetchQuery({
        queryKey: ["programs", stationId],
        queryFn: () => fetchPrograms(stationId),
        staleTime: 1000 * 60 * 5,
      });
    }
  };

  const handlePrefetchSchedules = () => {
    if (stationId) {
      queryClient.prefetchQuery({
        queryKey: ["schedules", stationId],
        queryFn: () => fetchSchedules(stationId),
        staleTime: 1000 * 60 * 5,
      });
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-10">
        <div className="w-8 h-8 bg-app-accent rounded-lg flex items-center justify-center shrink-0">
          <Radio size={18} className="text-white" />
        </div>
        <span className="text-lg font-semibold text-white">Super Radio</span>
      </div>

      <nav className="space-y-2 text-sm flex-1">
        <SidebarItem icon={<Settings size={16} />} label="Ajustes" to="/panel" />
        <SidebarItem icon={<RadioIcon size={16} />} label="Programas" to="/panel/programs" onMouseEnter={handlePrefetchPrograms} />
        <SidebarItem icon={<Calendar size={16} />} label="Programación" to="/panel/schedule" onMouseEnter={handlePrefetchSchedules} />
        <SidebarItem icon={<Bell size={16} />} label="Notificaciones" to="/panel/notify" />
        <SidebarItem icon={<KeyRound size={16} />} label="Mi cuenta" to="/panel/password" />
      </nav>

      <div className="mt-auto pt-8 space-y-4">
        <SidebarItem
          icon={<LogOut size={16} />}
          label="Cerrar sesión"
          onClick={handleLogout}
        />
        <div className="border-t border-app-border pt-4 px-1">
          <p className="text-[0.7rem] text-app-muted leading-tight">
            © {new Date().getFullYear()} Federico González
          </p>
          <p className="text-[0.65rem] text-app-muted/60 truncate">federicodg80@gmail.com</p>
        </div>
      </div>
    </div>
  );
}

/* ─── Public exports ──────────────────────────────────────────────────── */

/** Fixed sidebar shown on desktop (lg+). */
export function SidebarDesktop() {
  return (
    <aside className="hidden lg:flex w-64 flex-col border-r border-app-border bg-app-surface p-6">
      <SidebarContent />
    </aside>
  );
}

/** Hamburger button + Sheet drawer shown on mobile (< lg). */
export function SidebarMobile() {
  return (
    <div className="flex items-center gap-4 lg:hidden">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
            <Menu size={20} />
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="dark w-64 border-r border-app-border bg-app-surface text-white flex flex-col pt-12"
        >
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Logo shown in topbar on mobile */}
      <div className="w-8 h-8 bg-app-accent rounded-lg flex items-center justify-center">
        <Radio size={18} className="text-white" />
      </div>
    </div>
  );
}
