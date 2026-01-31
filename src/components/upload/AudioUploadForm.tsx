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
import { Image, Music, Upload, Loader2, Check, X, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { TagInput } from "./TagInput";

const AUDIO_GENRES = [
  "Hip-Hop",
  "Electronic",
  "Pop",
  "Rock",
  "R&B",
  "Jazz",
  "Classical",
  "Country",
  "Indie",
  "Lo-Fi",
  "Soul",
  "Reggae",
  "Metal",
  "Folk",
  "Blues",
  "Ambient",
];

const MOODS = [
  "Energetic",
  "Chill",
  "Dark",
  "Uplifting",
  "Melancholic",
  "Romantic",
  "Aggressive",
  "Peaceful",
  "Nostalgic",
  "Dreamy",
];

const MUSICAL_KEYS = [
  "C Major", "C Minor", "C# Major", "C# Minor",
  "D Major", "D Minor", "D# Major", "D# Minor",
  "E Major", "E Minor",
  "F Major", "F Minor", "F# Major", "F# Minor",
  "G Major", "G Minor", "G# Major", "G# Minor",
  "A Major", "A Minor", "A# Major", "A# Minor",
  "B Major", "B Minor",
];

export function AudioUploadForm() {
  const navigate = useNavigate();
  const { address } = useWallet();
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [album, setAlbum] = useState("");
  const [description, setDescription] = useState("");
  const [genre, setGenre] = useState("");
  const [moodTags, setMoodTags] = useState<string[]>([]);
  const [bpm, setBpm] = useState("");
  const [musicalKey, setMusicalKey] = useState("");
  const [isrc, setIsrc] = useState("");
  const [isExplicit, setIsExplicit] = useState(false);
  const [price, setPrice] = useState("0.001");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      const reader = new FileReader();
      reader.onload = () => setCoverPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!audioFile || !title || !artist || !address) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const trackId = crypto.randomUUID();

      const audioExt = audioFile.name.split(".").pop() || "mp3";
      const audioPath = `${trackId}.${audioExt}`;
      const { error: audioError } = await supabase.storage
        .from("audio")
        .upload(audioPath, audioFile);

      if (audioError) throw new Error(`Audio upload failed: ${audioError.message}`);

      let coverPath = null;
      if (coverFile) {
        const coverExt = coverFile.name.split(".").pop() || "jpg";
        coverPath = `${trackId}_cover.${coverExt}`;
        const { error: coverError } = await supabase.storage
          .from("covers")
          .upload(coverPath, coverFile);

        if (coverError) throw new Error(`Cover upload failed: ${coverError.message}`);
      }

      const { error: dbError } = await supabase.from("music_tracks").insert({
        id: trackId,
        title,
        artist,
        description: description || null,
        price: parseFloat(price),
        artist_wallet: address.toLowerCase(),
        audio_path: audioPath,
        cover_path: coverPath,
      } as any);

      if (dbError) throw new Error(`Database error: ${dbError.message}`);

      toast({
        title: "Track uploaded!",
        description: "Your track is now live and ready to stream",
      });

      navigate("/artist");
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
      {/* Cover Image */}
      <div className="space-y-2">
        <Label className="text-foreground">Cover Art</Label>
        <label className="block cursor-pointer">
          <div className="aspect-square max-w-48 mx-auto rounded-lg border-2 border-dashed border-border bg-secondary/30 flex items-center justify-center overflow-hidden hover:border-primary transition-colors">
            {coverPreview ? (
              <img
                src={coverPreview}
                alt="Cover preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center p-4">
                <Image className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Tap to add cover (1:1)
                </p>
              </div>
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handleCoverChange}
            className="hidden"
          />
        </label>
      </div>

      {/* Audio File */}
      <div className="space-y-2">
        <Label className="text-foreground">Audio File *</Label>
        <label className="block cursor-pointer">
          <div className="p-4 rounded-lg border-2 border-dashed border-border bg-secondary/30 flex items-center gap-3 hover:border-primary transition-colors">
            {audioFile ? (
              <>
                <Check className="h-5 w-5 text-primary" />
                <span className="text-sm text-foreground truncate flex-1">
                  {audioFile.name}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setAudioFile(null);
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </>
            ) : (
              <>
                <Music className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Tap to select audio file
                </span>
              </>
            )}
          </div>
          <input
            type="file"
            accept="audio/*"
            onChange={handleAudioChange}
            className="hidden"
          />
        </label>
      </div>

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title" className="text-foreground">Track Title *</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter track title"
          className="bg-secondary border-border"
          required
        />
      </div>

      {/* Artist */}
      <div className="space-y-2">
        <Label htmlFor="artist" className="text-foreground">Artist Name *</Label>
        <Input
          id="artist"
          value={artist}
          onChange={(e) => setArtist(e.target.value)}
          placeholder="Your artist name"
          className="bg-secondary border-border"
          required
        />
      </div>

      {/* Genre */}
      <div className="space-y-2">
        <Label className="text-foreground">Genre</Label>
        <Select value={genre} onValueChange={setGenre}>
          <SelectTrigger className="bg-secondary border-border">
            <SelectValue placeholder="Select a genre" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border max-h-60">
            {AUDIO_GENRES.map((g) => (
              <SelectItem key={g} value={g.toLowerCase()}>
                {g}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Mood Tags */}
      <div className="space-y-2">
        <Label className="text-foreground">Mood</Label>
        <div className="flex flex-wrap gap-2">
          {MOODS.map((mood) => (
            <button
              key={mood}
              type="button"
              onClick={() => {
                setMoodTags((prev) =>
                  prev.includes(mood)
                    ? prev.filter((m) => m !== mood)
                    : prev.length < 3
                    ? [...prev, mood]
                    : prev
                );
              }}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                moodTags.includes(mood)
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {mood}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">Select up to 3 moods</p>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-foreground">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Tell listeners about this track..."
          className="bg-secondary border-border"
          rows={3}
        />
      </div>

      {/* Price */}
      <div className="space-y-2">
        <Label htmlFor="price" className="text-foreground">Price per Stream (USD) *</Label>
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
          Listeners pay this amount each time they stream your track
        </p>
      </div>

      {/* Explicit Toggle */}
      <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30">
        <div>
          <Label className="text-foreground">Explicit Content</Label>
          <p className="text-xs text-muted-foreground">Contains explicit lyrics</p>
        </div>
        <Switch checked={isExplicit} onCheckedChange={setIsExplicit} />
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
          {/* Album */}
          <div className="space-y-2">
            <Label htmlFor="album" className="text-foreground">Album</Label>
            <Input
              id="album"
              value={album}
              onChange={(e) => setAlbum(e.target.value)}
              placeholder="Album name (optional)"
              className="bg-secondary border-border"
            />
          </div>

          {/* BPM */}
          <div className="space-y-2">
            <Label htmlFor="bpm" className="text-foreground">BPM</Label>
            <Input
              id="bpm"
              type="number"
              min="20"
              max="300"
              value={bpm}
              onChange={(e) => setBpm(e.target.value)}
              placeholder="e.g., 120"
              className="bg-secondary border-border"
            />
          </div>

          {/* Musical Key */}
          <div className="space-y-2">
            <Label className="text-foreground">Key</Label>
            <Select value={musicalKey} onValueChange={setMusicalKey}>
              <SelectTrigger className="bg-secondary border-border">
                <SelectValue placeholder="Select musical key" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border max-h-60">
                {MUSICAL_KEYS.map((key) => (
                  <SelectItem key={key} value={key}>
                    {key}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* ISRC */}
          <div className="space-y-2">
            <Label htmlFor="isrc" className="text-foreground">ISRC Code</Label>
            <Input
              id="isrc"
              value={isrc}
              onChange={(e) => setIsrc(e.target.value.toUpperCase())}
              placeholder="e.g., USRC12345678"
              className="bg-secondary border-border"
              maxLength={12}
            />
            <p className="text-xs text-muted-foreground">
              International Standard Recording Code
            </p>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Submit */}
      <Button
        type="submit"
        disabled={isUploading || !audioFile || !title || !artist}
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
            Upload Track
          </>
        )}
      </Button>
    </form>
  );
}
