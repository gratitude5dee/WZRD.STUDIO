import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "@/contexts/WalletContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Image, Video, Upload, Loader2, Check, X, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { TagInput } from "./TagInput";

const VIDEO_CATEGORIES = [
  "Music Video",
  "Documentary",
  "Interview",
  "Live Performance",
  "Behind the Scenes",
  "Tutorial",
  "Short Film",
  "Vlog",
  "Concert",
  "Podcast",
];

const VIDEO_GENRES = [
  "Hip-Hop",
  "Electronic",
  "Pop",
  "Rock",
  "R&B",
  "Jazz",
  "Classical",
  "Country",
  "Indie",
  "Alternative",
];

export function VideoUploadForm() {
  const navigate = useNavigate();
  const { address } = useWallet();
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [creator, setCreator] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [genre, setGenre] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isLivestream, setIsLivestream] = useState(false);
  const [price, setPrice] = useState("0.001");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onload = () => setThumbnailPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!videoFile || !title || !creator || !address) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const videoId = crypto.randomUUID();

      const videoExt = videoFile.name.split(".").pop() || "mp4";
      const videoPath = `${videoId}.${videoExt}`;
      const { error: videoError } = await supabase.storage
        .from("videos")
        .upload(videoPath, videoFile);

      if (videoError) throw new Error(`Video upload failed: ${videoError.message}`);

      let thumbnailPath = null;
      if (thumbnailFile) {
        const thumbExt = thumbnailFile.name.split(".").pop() || "jpg";
        thumbnailPath = `${videoId}_thumb.${thumbExt}`;
        const { error: thumbError } = await supabase.storage
          .from("covers")
          .upload(thumbnailPath, thumbnailFile);

        if (thumbError) throw new Error(`Thumbnail upload failed: ${thumbError.message}`);
      }

      const { error: dbError } = await supabase.from("music_videos").insert({
        id: videoId,
        title,
        artist: creator,
        description: description || null,
        price: parseFloat(price),
        artist_wallet: address.toLowerCase(),
        video_path: videoPath,
        thumbnail_path: thumbnailPath,
        is_livestream: isLivestream,
      } as any);

      if (dbError) throw new Error(`Database error: ${dbError.message}`);

      toast({
        title: "Video uploaded!",
        description: "Your video is now live and ready to stream",
      });

      navigate("/watch");
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Thumbnail */}
      <div className="space-y-2">
        <Label className="text-foreground">Thumbnail</Label>
        <label className="block cursor-pointer">
          <div className="aspect-video max-w-full rounded-lg border-2 border-dashed border-border bg-secondary/30 flex items-center justify-center overflow-hidden hover:border-primary transition-colors">
            {thumbnailPreview ? (
              <img
                src={thumbnailPreview}
                alt="Thumbnail preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center p-4">
                <Image className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Tap to add thumbnail (16:9)
                </p>
              </div>
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handleThumbnailChange}
            className="hidden"
          />
        </label>
      </div>

      {/* Video File */}
      <div className="space-y-2">
        <Label className="text-foreground">Video File *</Label>
        <label className="block cursor-pointer">
          <div className="p-4 rounded-lg border-2 border-dashed border-border bg-secondary/30 flex items-center gap-3 hover:border-primary transition-colors">
            {videoFile ? (
              <>
                <Check className="h-5 w-5 text-primary" />
                <span className="text-sm text-foreground truncate flex-1">
                  {videoFile.name}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setVideoFile(null);
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </>
            ) : (
              <>
                <Video className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Tap to select video file
                </span>
              </>
            )}
          </div>
          <input
            type="file"
            accept="video/*"
            onChange={handleVideoChange}
            className="hidden"
          />
        </label>
      </div>

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title" className="text-foreground">Title *</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter video title"
          className="bg-secondary border-border"
          required
        />
      </div>

      {/* Creator */}
      <div className="space-y-2">
        <Label htmlFor="creator" className="text-foreground">Creator Name *</Label>
        <Input
          id="creator"
          value={creator}
          onChange={(e) => setCreator(e.target.value)}
          placeholder="Your name"
          className="bg-secondary border-border"
          required
        />
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label className="text-foreground">Category</Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="bg-secondary border-border">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border max-h-60">
            {VIDEO_CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat.toLowerCase().replace(/ /g, "-")}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Genre */}
      <div className="space-y-2">
        <Label className="text-foreground">Genre</Label>
        <Select value={genre} onValueChange={setGenre}>
          <SelectTrigger className="bg-secondary border-border">
            <SelectValue placeholder="Select a genre" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border max-h-60">
            {VIDEO_GENRES.map((g) => (
              <SelectItem key={g} value={g.toLowerCase()}>
                {g}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <Label className="text-foreground">Tags</Label>
        <TagInput
          tags={tags}
          onChange={setTags}
          placeholder="Add tags (press Enter)"
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-foreground">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Tell viewers about this video..."
          className="bg-secondary border-border"
          rows={3}
        />
      </div>

      {/* Price */}
      <div className="space-y-2">
        <Label htmlFor="price" className="text-foreground">Price per View (USD) *</Label>
        <Input
          id="price"
          type="number"
          step="0.001"
          min="0.001"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="bg-secondary border-border"
          required
        />
        <p className="text-xs text-muted-foreground">
          Viewers pay this amount each time they watch your video
        </p>
      </div>

      {/* Livestream Toggle */}
      <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30">
        <div>
          <Label className="text-foreground">Livestream</Label>
          <p className="text-xs text-muted-foreground">This is a live broadcast</p>
        </div>
        <Switch checked={isLivestream} onCheckedChange={setIsLivestream} />
      </div>

      {/* Advanced Options */}
      <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
        <CollapsibleTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            className="w-full justify-between text-muted-foreground hover:text-foreground"
          >
            Advanced Options
            <ChevronDown className={`h-4 w-4 transition-transform ${advancedOpen ? "rotate-180" : ""}`} />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4 pt-4">
          <p className="text-sm text-muted-foreground text-center py-4">
            Additional video metadata options coming soon
          </p>
        </CollapsibleContent>
      </Collapsible>

      {/* Submit */}
      <Button
        type="submit"
        disabled={isUploading || !videoFile || !title || !creator}
        className="w-full h-12"
      >
        {isUploading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            Uploading...
          </>
        ) : (
          <>
            <Upload className="h-5 w-5 mr-2" />
            Upload Video
          </>
        )}
      </Button>
    </form>
  );
}
