import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThirdwebProvider } from "thirdweb/react";
import { WalletProvider } from "@/contexts/WalletContext";
import { PlayerProvider } from "@/contexts/PlayerContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Intro from "./pages/Intro";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Listen from "./pages/Listen";
import Read from "./pages/Read";
import Artist from "./pages/Artist";
import Upload from "./pages/Upload";
import Search from "./pages/Search";
import NowPlaying from "./pages/NowPlaying";
import Album from "./pages/Album";
import Library from "./pages/Library";
import Watch from "./pages/Watch";
import WatchHome from "./pages/WatchHome";
import EmbedPlayer from "./pages/EmbedPlayer";
import Onboarding from "./pages/Onboarding";
import NotFound from "./pages/NotFound";
import Mog from "./pages/Mog";
import MogUpload from "./pages/MogUpload";
import MogProfile from "./pages/MogProfile";
import MogPost from "./pages/MogPost";
import MogSearch from "./pages/MogSearch";

const queryClient = new QueryClient();

const App = () => (
  <ThirdwebProvider>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <WalletProvider>
          <PlayerProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Intro />} />
                  <Route path="/landing" element={<Landing />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/home" element={<Mog />} />
                  <Route path="/listen" element={<Listen />} />
                  <Route path="/read" element={<Read />} />
                  <Route path="/artist" element={<Artist />} />
                  <Route path="/upload" element={<Upload />} />
                  <Route path="/search" element={<Search />} />
                  <Route path="/now-playing" element={<NowPlaying />} />
                  <Route path="/album/:id" element={<Album />} />
                  <Route path="/library" element={<Library />} />
                  <Route path="/watch" element={<WatchHome />} />
                  <Route path="/watch/:id" element={<Watch />} />
                  <Route path="/embed/track/:trackId" element={<EmbedPlayer />} />
                  <Route path="/onboarding" element={<Onboarding />} />
                  {/* Mog Sub-Routes */}
                  <Route path="/mog/upload" element={<MogUpload />} />
                  <Route path="/mog/profile/:wallet" element={<MogProfile />} />
                  <Route path="/mog/post/:id" element={<MogPost />} />
                  <Route path="/mog/search" element={<MogSearch />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </PlayerProvider>
        </WalletProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ThirdwebProvider>
);

export default App;
