import { Play, Pause, Volume2, VolumeX, AlertCircle, Radio } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import type { Station } from "@/types";
import { useAudioPlayer } from "@/hooks/use-audio-player";

interface StationPlayerProps {
  station: Station;
}

export function StationPlayer({ station }: StationPlayerProps) {
  const {
    isPlaying,
    volume,
    setVolume,
    isMuted,
    toggleMute,
    status,
    togglePlay,
  } = useAudioPlayer(station.streamUrl);

  const getStatusBadge = () => {
    if (!station.streamUrl) {
      return <Badge variant="secondary" className="bg-app-border text-app-muted">SIN URL</Badge>;
    }

    switch (status) {
      case "live":
        return <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"><Radio className="w-3 h-3 mr-1 animate-pulse" /> EN VIVO</Badge>;
      case "offline":
        return <Badge variant="destructive" className="bg-red-500/10 text-red-500 hover:bg-red-500/20"><AlertCircle className="w-3 h-3 mr-1" /> OFFLINE</Badge>;
      case "connecting":
        return <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20"><LoaderIcon className="w-3 h-3 mr-1 animate-spin" /> CONECTANDO...</Badge>;
      default:
        return <Badge variant="secondary" className="bg-app-border text-app-muted">ESPERANDO</Badge>;
    }
  };

  return (
    <Card className="bg-app-card border-app-border overflow-hidden relative">
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row h-full">
          {/* Cover/Logo Area */}
          <div className="w-full md:w-48 h-48 md:h-auto bg-app-card flex items-center justify-center shrink-0 border-b md:border-b-0 md:border-r border-app-border relative group">
            {station.logoUrl ? (
              <div className="w-40 h-40 rounded-full overflow-hidden border-2 border-app-border/50 group-hover:border-app-accent transition-colors">
                <img
                  src={station.logoUrl}
                  alt={`${station.name} logo`}
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjM2I4MmY2IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiPjwvY2lyY2xlPjxwb2x5bGluZSBwb2ludHM9IjEyIDYgMTIgMTIgMTYgMTQiPjwvcG9seWxpbmU+PC9zdmc+';
                  }}
                />
              </div>
            ) : (
              <div className="w-40 h-40 rounded-full flex items-center justify-center bg-app-card border-2 border-app-border/50">
                <Radio className="w-16 h-16 text-app-muted" />
              </div>
            )}

          </div>

          {/* Player Controls & Info */}
          <div className="flex-1 p-6 flex flex-col justify-center relative">
            <div className="absolute top-6 right-6 z-10 hidden md:block">
              {getStatusBadge()}
            </div>

            <div className="mb-6">
              <div className="md:hidden mb-2">
                {getStatusBadge()}
              </div>
              <h2 className="text-2xl font-bold text-white truncate md:pr-20">{station.name || "Sin Nombre"}</h2>
              <p className="text-slate-400 text-sm italic line-clamp-2 mt-1 max-w-md">
                {station.slogan || "Configura el slogan de tu radio en los ajustes."}
              </p>
            </div>

            <div className="flex items-center gap-6 mt-auto">
              {/* Play/Pause Button */}
              <Button
                size="icon"
                className={`w-12 h-12 rounded-full shrink-0 flex text-white ${isPlaying ? 'bg-app-border hover:bg-app-card' : 'bg-app-accent hover:bg-app-accent-hover'}`}
                onClick={togglePlay}
                disabled={!station.streamUrl}
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-1" />}
              </Button>

              {/* Volume Control */}
              <div className="flex items-center gap-3 flex-1 max-w-[200px]">
                <Button
                  size="icon"
                  variant="ghost"
                  className="w-8 h-8 text-slate-400 hover:text-white"
                  onClick={toggleMute}
                >
                  {isMuted || volume[0] === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </Button>
                <Slider
                  defaultValue={[80]}
                  max={100}
                  step={1}
                  value={volume}
                  onValueChange={setVolume}
                  className="w-full"
                />
              </div>
            </div>

            {!station.streamUrl && (
              <p className="text-xs text-red-400 mt-4 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> Añade una URL de streaming para probar la radio.
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Simple loader icon component inline
function LoaderIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
