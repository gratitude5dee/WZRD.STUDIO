import { useState } from "react";
import { ChevronDown, ChevronUp, Copy, Check, Code, Link, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { MusicTrack } from "@/types/track";
import { getCoverUrl } from "@/lib/media-utils";

interface ArtistTrackCardProps {
  track: MusicTrack;
}

export function ArtistTrackCard({ track }: ArtistTrackCardProps) {
  const [showEmbed, setShowEmbed] = useState(false);
  const [copiedIframe, setCopiedIframe] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const baseUrl = window.location.origin;
  const embedUrl = `${baseUrl}/embed/track/${track.id}`;
  const iframeCode = `<iframe src="${embedUrl}" width="100%" height="152" frameborder="0" allow="autoplay; clipboard-write; encrypted-media" loading="lazy"></iframe>`;

  const copyToClipboard = async (text: string, type: 'iframe' | 'link') => {
    await navigator.clipboard.writeText(text);
    if (type === 'iframe') {
      setCopiedIframe(true);
      setTimeout(() => setCopiedIframe(false), 2000);
    } else {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
    toast({ title: `${type === 'iframe' ? 'Embed code' : 'Link'} copied to clipboard` });
  };

  return (
    <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
      {/* Track Info */}
      <div className="flex items-center gap-4 p-4">
        <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
          {getCoverUrl(track.cover_path) ? (
            <img 
              src={getCoverUrl(track.cover_path)!} 
              alt={track.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-primary/20">
              <Play className="h-6 w-6 text-primary" />
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">{track.title}</h3>
          <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-primary font-medium">{track.price} ETH</span>
            <span className="text-xs text-muted-foreground px-2 py-0.5 bg-muted/50 rounded-full">
              on Monad
            </span>
          </div>
        </div>
      </div>

      {/* Embed Code Toggle */}
      <button
        onClick={() => setShowEmbed(!showEmbed)}
        className="w-full flex items-center justify-between px-4 py-3 bg-muted/30 hover:bg-muted/50 transition-colors border-t border-border/50"
      >
        <div className="flex items-center gap-2">
          <Code className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">SHOW EMBED CODE</span>
        </div>
        {showEmbed ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {/* Embed Code Content */}
      {showEmbed && (
        <div className="p-4 space-y-4 bg-muted/20 border-t border-border/50">
          {/* Iframe Preview */}
          <div className="rounded-lg overflow-hidden border border-border/50 bg-background">
            <div className="p-3 flex items-center gap-3 bg-card">
              <div className="h-12 w-12 rounded-md overflow-hidden bg-muted flex-shrink-0">
                {getCoverUrl(track.cover_path) ? (
                  <img 
                    src={getCoverUrl(track.cover_path)!} 
                    alt={track.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-primary/20">
                    <Play className="h-4 w-4 text-primary" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground text-sm truncate">{track.title}</p>
                <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
              </div>
              <Button size="sm" variant="secondary" className="rounded-full h-8 w-8 p-0">
                <Play className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Iframe Code */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Embed Code
              </span>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 gap-1.5 text-xs"
                onClick={() => copyToClipboard(iframeCode, 'iframe')}
              >
                {copiedIframe ? (
                  <>
                    <Check className="h-3 w-3" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            <div className="bg-background rounded-lg p-3 font-mono text-xs text-muted-foreground break-all border border-border/50">
              {iframeCode}
            </div>
          </div>

          {/* Direct Link */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Direct Link
              </span>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 gap-1.5 text-xs"
                onClick={() => copyToClipboard(embedUrl, 'link')}
              >
                {copiedLink ? (
                  <>
                    <Check className="h-3 w-3" />
                    Copied
                  </>
                ) : (
                  <>
                    <Link className="h-3 w-3" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            <div className="bg-background rounded-lg p-3 font-mono text-xs text-primary break-all border border-border/50">
              {embedUrl}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
