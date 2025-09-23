
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/providers/AuthProvider";
import ProtectedRoute from "@/components/ProtectedRoute";
import Home from "./pages/Home";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Credits from "./pages/Credits";
import ProjectSetup from "./pages/ProjectSetup";
import StudioPage from "./pages/StudioPage";
import LearningStudioPage from "./pages/LearningStudioPage";
import StoryboardPage from "./pages/StoryboardPage";
import EditorPage from "./pages/EditorPage";
import CustomCursor from "@/components/CustomCursor";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <AuthProvider>
            <CustomCursor />
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/home" element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              } />
              <Route path="/project-setup" element={
                <ProtectedRoute>
                  <ProjectSetup />
                </ProtectedRoute>
              } />
              
              {/* Studio Routes */}
              <Route path="/studio" element={
                <ProtectedRoute>
                  <StudioPage />
                </ProtectedRoute>
              } />
              <Route path="/studio/:projectId" element={
                <ProtectedRoute>
                  <StudioPage />
                </ProtectedRoute>
              } />
              
              {/* Learning Studio Route */}
              <Route path="/learning-studio" element={
                <ProtectedRoute>
                  <LearningStudioPage />
                </ProtectedRoute>
              } />
              
              {/* Timeline Routes - always requires projectId */}
              <Route path="/timeline/:projectId" element={
                <ProtectedRoute>
                  <StoryboardPage />
                </ProtectedRoute>
              } />
              
              {/* Editor Routes - always requires projectId */}
              <Route path="/editor/:projectId" element={
                <ProtectedRoute>
                  <EditorPage />
                </ProtectedRoute>
              } />
              
              {/* Redirect legacy routes */}
              <Route path="/storyboard/:projectId" element={<Navigate to="/timeline/$1" replace />} />
              <Route path="/storyboard" element={<Navigate to="/home" replace />} />
              <Route path="/timeline" element={<Navigate to="/home" replace />} />
              <Route path="/editor" element={<Navigate to="/home" replace />} />
              
              <Route path="/credits" element={
                <ProtectedRoute>
                  <Credits />
                </ProtectedRoute>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
