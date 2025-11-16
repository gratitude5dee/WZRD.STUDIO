import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import { AuthProvider } from "@/providers/AuthProvider";
import ProtectedRoute from "@/components/ProtectedRoute";
import PerfShell from "@/components/perf/PerfShell";
import CustomCursor from "@/components/CustomCursor";
import { CursorLoadingProvider, useCursorLoading } from "@/contexts/CursorLoadingContext";

const Landing = lazy(() => import("./pages/Landing"));
const Login = lazy(() => import("./pages/Login"));
const Home = lazy(() => import("./pages/Home"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Credits = lazy(() => import("./pages/Credits"));
const ProjectSetup = lazy(() => import("./pages/ProjectSetup"));
const StudioPage = lazy(() => import("./pages/StudioPage"));
const LearningStudioPage = lazy(() => import("./pages/LearningStudioPage"));
const StoryboardPage = lazy(() => import("./pages/StoryboardPage"));
const EditorPage = lazy(() => import("./pages/EditorPage"));
const Storyboard = lazy(() => import("./pages/Storyboard"));
const ShotEditor = lazy(() => import("./pages/ShotEditor"));
const VideoEditor = lazy(() => import("./pages/VideoEditor"));
const KanvasPage = lazy(() => import("./pages/KanvasPage"));
const AssetsPage = lazy(() => import("./pages/AssetsPage"));

const RedirectToTimeline = () => {
  const { projectId } = useParams();
  return <Navigate to={`/timeline/${projectId}`} replace />;
};

const CursorWrapper = () => {
  const { isLoading } = useCursorLoading();
  return <CustomCursor isLoading={isLoading} />;
};

const queryClient = new QueryClient();

const App = () => {
  const usePerfShell = (import.meta.env.VITE_USE_PERF_SHELL ?? 'true') !== 'false';
  const fallback = usePerfShell ? <PerfShell headline="Preparing studio" /> : null;

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <AuthProvider>
            <CursorLoadingProvider>
              <CursorWrapper />
              <Toaster />
              <Sonner />
              <Suspense fallback={fallback}>
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/login" element={<Login />} />
                  <Route
                    path="/home"
                    element={
                      <ProtectedRoute>
                        <Home />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/project-setup"
                    element={
                      <ProtectedRoute>
                        <ProjectSetup />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/studio"
                    element={
                      <ProtectedRoute>
                        <StudioPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/studio/:projectId"
                    element={
                      <ProtectedRoute>
                        <StudioPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/assets"
                    element={
                      <ProtectedRoute>
                        <AssetsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/learning-studio"
                    element={
                      <ProtectedRoute>
                        <LearningStudioPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/timeline/:projectId"
                    element={
                      <ProtectedRoute>
                        <StoryboardPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/editor/:projectId"
                    element={
                      <ProtectedRoute>
                        <EditorPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/storyboard/:projectId" element={<RedirectToTimeline />} />
                  <Route path="/storyboard" element={<Navigate to="/home" replace />} />
                  <Route path="/timeline" element={<Navigate to="/home" replace />} />
                  <Route path="/editor" element={<Navigate to="/home" replace />} />
                  <Route
                    path="/credits"
                    element={
                      <ProtectedRoute>
                        <Credits />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/storyboard-generator"
                    element={
                      <ProtectedRoute>
                        <Storyboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/shot-editor/:shotId"
                    element={
                      <ProtectedRoute>
                        <ShotEditor />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/video-editor/:projectId"
                    element={
                      <ProtectedRoute>
                        <VideoEditor />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/kanvas"
                    element={
                      <ProtectedRoute>
                        <KanvasPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </CursorLoadingProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
