import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThirdwebProvider } from "thirdweb/react";
import { WalletProvider } from "@/contexts/WalletContext";
import { PlayerProvider } from "@/contexts/PlayerContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { MoltbookProvider } from "@/contexts/MoltbookContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import Intro from "./pages/Intro";
import Landing from "./pages/Landing";
import Auth from "./pages/Login";
import StudioPage from "./pages/StudioPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ThirdwebProvider>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <WalletProvider>
          <NotificationProvider>
            <MoltbookProvider>
              <PlayerProvider>
                <TooltipProvider>
                  <Toaster />
                  <Sonner />
                  <BrowserRouter>
                    <Routes>
                      <Route path="/" element={<Intro />} />
                      <Route path="/landing" element={<Landing />} />
                      <Route path="/auth" element={<Auth />} />
                      <Route path="/login" element={<Navigate to="/auth" replace />} />
                      <Route path="/home" element={<Navigate to="/landing" replace />} />
                      <Route path="/studio" element={<StudioPage />} />
                      <Route path="/studio/:projectId" element={<StudioPage />} />
                      {/* Redirect old routes */}
                      <Route path="/onboarding" element={<Navigate to="/studio" replace />} />
                      <Route path="/mog/*" element={<Navigate to="/landing" replace />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </BrowserRouter>
                </TooltipProvider>
              </PlayerProvider>
            </MoltbookProvider>
          </NotificationProvider>
        </WalletProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ThirdwebProvider>
);

export default App;
