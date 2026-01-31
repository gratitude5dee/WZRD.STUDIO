import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Video, VideoSession } from "@/types/video";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Radio, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { useViewPayout } from "@/hooks/useViewPayout";

export default function Watch() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);

  const [video, setVideo] = useState<Video | null>(location.state?.video || null);
  const [session, setSession] = useState<VideoSession | null>(location.state?.session || null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>("");

  // Trigger view payout after 5 seconds of watching
  useViewPayout('video', id || '');

  // Fetch video URL using session
  useEffect(() => {
    async function fetchVideoUrl() {
      if (!session || !id) {
        setError("No valid session. Please purchase access first.");
        setLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase.functions.invoke('get-video-stream', {
          body: {
            video_id: id,
            access_token: session.access_token,
          },
        });

        if (fetchError || data?.error) {
          console.error("Error fetching video URL:", fetchError || data?.error);
          setError(data?.error || "Failed to load video. Your session may have expired.");
          setLoading(false);
          return;
        }

        setVideoUrl(data.url);
        if (data.video) {
          setVideo((prev) => prev || data.video);
        }
      } catch (err) {
        console.error("Error:", err);
        setError("An error occurred loading the video.");
      } finally {
        setLoading(false);
      }
    }

    fetchVideoUrl();
  }, [id, session]);

  // Update time remaining countdown
  useEffect(() => {
    if (!session?.expires_at) return;

    const updateTimer = () => {
      const expiresAt = new Date(session.expires_at);
      const now = new Date();
      const diff = expiresAt.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining("Expired");
        setError("Your streaming session has expired. Please purchase again.");
        if (videoRef.current) {
          videoRef.current.pause();
        }
        return;
      }

      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, "0")}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [session?.expires_at]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-bold text-foreground mb-2">Access Error</h2>
        <p className="text-muted-foreground text-center mb-6">{error}</p>
        <Button onClick={() => navigate("/home")}>Back to Home</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-4 safe-top">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          {video?.is_livestream && (
            <div className="flex items-center gap-1 bg-destructive text-destructive-foreground text-xs font-semibold px-2 py-1 rounded">
              <Radio className="h-3 w-3" />
              LIVE
            </div>
          )}
          <div className="bg-primary/20 text-primary text-sm font-medium px-3 py-1 rounded-full">
            {timeRemaining} remaining
          </div>
        </div>
      </header>

      {/* Video Player */}
      <div className="flex-1 flex flex-col">
        <div className="w-full aspect-video bg-black">
          {videoUrl ? (
            <video
              ref={videoRef}
              src={videoUrl}
              controls
              autoPlay
              className="w-full h-full"
              playsInline
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
        </div>

        {/* Video Info */}
        <div className="p-4">
          <h1 className="text-xl font-bold text-foreground mb-1">{video?.title}</h1>
          <p className="text-muted-foreground">{video?.artist}</p>
          {video?.description && (
            <p className="text-sm text-muted-foreground mt-3">{video.description}</p>
          )}
        </div>
      </div>
    </div>
  );
}
