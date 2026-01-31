import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "@/contexts/WalletContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Music, Video } from "lucide-react";
import { ArticleUploadForm } from "@/components/upload/ArticleUploadForm";
import { AudioUploadForm } from "@/components/upload/AudioUploadForm";
import { VideoUploadForm } from "@/components/upload/VideoUploadForm";

type MediaType = "article" | "audio" | "video";

const MEDIA_TABS: { type: MediaType; label: string; icon: typeof FileText }[] = [
  { type: "article", label: "Article", icon: FileText },
  { type: "audio", label: "Audio", icon: Music },
  { type: "video", label: "Video", icon: Video },
];

export default function Upload() {
  const navigate = useNavigate();
  const { isConnected } = useWallet();
  const [activeTab, setActiveTab] = useState<MediaType>("audio");

  if (!isConnected) {
    navigate("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-background safe-top">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <span className="font-bold text-lg text-foreground">Upload</span>
        </div>
      </header>

      {/* Media Type Tabs */}
      <div className="px-4 pt-4">
        <div className="relative flex items-center justify-center bg-secondary/50 rounded-full p-1">
          {/* Animated background pill */}
          <div
            className="absolute h-[calc(100%-8px)] rounded-full bg-primary transition-all duration-300 ease-out"
            style={{
              width: `calc(${100 / MEDIA_TABS.length}% - 4px)`,
              left: `calc(${(MEDIA_TABS.findIndex((t) => t.type === activeTab) * 100) / MEDIA_TABS.length}% + 4px)`,
            }}
          />
          
          {MEDIA_TABS.map(({ type, label, icon: Icon }) => (
            <button
              key={type}
              onClick={() => setActiveTab(type)}
              className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-full text-sm font-medium transition-colors ${
                activeTab === type
                  ? "text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Form */}
      <div className="p-4 pb-24">
        {activeTab === "article" && <ArticleUploadForm />}
        {activeTab === "audio" && <AudioUploadForm />}
        {activeTab === "video" && <VideoUploadForm />}
      </div>
    </div>
  );
}
