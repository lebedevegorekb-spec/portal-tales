import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index.tsx";
import Login from "./pages/Login.tsx";
import Catalog from "./pages/Catalog.tsx";
import Lobby from "./pages/Lobby.tsx";
import Join from "./pages/Join.tsx";
import Run from "./pages/Run.tsx";
import Intro from "./pages/Intro.tsx";
import Scene from "./pages/Scene.tsx";
import Consequence from "./pages/Consequence.tsx";
import Final from "./pages/Final.tsx";
import Offer from "./pages/Offer.tsx";
import Payment from "./pages/Payment.tsx";
import Pricing from "./pages/Pricing.tsx";
import Profile from "./pages/Profile.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/lobby/:roomId" element={<Lobby />} />
            <Route path="/join" element={<Join />} />
            <Route path="/join/:code" element={<Join />} />
            <Route path="/intro/:runId" element={<Intro />} />
            <Route path="/scene/:runId" element={<Scene />} />
            <Route path="/scene" element={<Scene />} />
            <Route path="/consequence/:runId" element={<Consequence />} />
            <Route path="/consequence" element={<Consequence />} />
            <Route path="/final/:runId" element={<Final />} />
            <Route path="/final" element={<Final />} />
            <Route path="/offer/:runId" element={<Offer />} />
            <Route path="/offer" element={<Offer />} />
            <Route path="/payment/:scenarioId" element={<Payment />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/play/run/:runId" element={<Run />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
