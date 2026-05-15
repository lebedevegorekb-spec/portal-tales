import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Index from "./pages/Index.tsx";
import Login from "./pages/Login.tsx";
import Catalog from "./pages/Catalog.tsx";
import Lobby from "./pages/Lobby.tsx";
import Join from "./pages/Join.tsx";
import Character from "./pages/Character.tsx";
import Secret from "./pages/Secret.tsx";
import SecretAction from "./pages/SecretAction.tsx";
import Waiting from "./pages/Waiting.tsx";
import Vote from "./pages/Vote.tsx";
import PersonalResult from "./pages/PersonalResult.tsx";
import Reconnect from "./pages/Reconnect.tsx";
import Scene from "./pages/Scene.tsx";
import Consequence from "./pages/Consequence.tsx";
import Final from "./pages/Final.tsx";
import Offer from "./pages/Offer.tsx";
import Payment from "./pages/Payment.tsx";
import Pricing from "./pages/Pricing.tsx";
import Profile from "./pages/Profile.tsx";
import ScenarioPreview from "./pages/ScenarioPreview.tsx";
import AdminScenarios from "./pages/admin/Scenarios.tsx";
import AdminScenarioEdit from "./pages/admin/ScenarioEdit.tsx";
import RoundTest from "./pages/admin/RoundTest.tsx";
import NotFound from "./pages/NotFound.tsx";
const queryClient = new QueryClient();
const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ErrorBoundary>
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/catalog" element={<Catalog />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/lobby/:roomId" element={<Lobby />} />
              <Route path="/scene/:runId" element={<Scene />} />
              <Route path="/scene" element={<Scene />} />
              <Route path="/consequence/:runId" element={<Consequence />} />
              <Route path="/consequence" element={<Consequence />} />
              <Route path="/final/:runId" element={<Final />} />
              <Route path="/final" element={<Final />} />
              <Route path="/offer/:runId" element={<Offer />} />
              <Route path="/offer" element={<Offer />} />
              <Route path="/join" element={<Join />} />
              <Route path="/join/:code" element={<Join />} />
              <Route path="/character/:characterId" element={<Character />} />
              <Route path="/character" element={<Character />} />
              <Route path="/secret/:roleId" element={<Secret />} />
              <Route path="/secret" element={<Secret />} />
              <Route path="/secret-action/:roleId" element={<SecretAction />} />
              <Route path="/secret-action" element={<SecretAction />} />
              <Route path="/waiting/:runId" element={<Waiting />} />
              <Route path="/waiting" element={<Waiting />} />
              <Route path="/vote" element={<Vote />} />
              <Route path="/me/result/:resultId" element={<PersonalResult />} />
              <Route path="/me/result" element={<PersonalResult />} />
              <Route path="/reconnect" element={<Reconnect />} />
              <Route path="/payment/:scenarioId" element={<Payment />} />
              <Route path="/payment" element={<Payment />} />
              <Route path="/scenarios/:scenarioId" element={<ScenarioPreview />} />
              <Route path="/admin/scenarios" element={<AdminScenarios />} />
              <Route path="/admin/scenarios/:scenarioId" element={<AdminScenarioEdit />} />
              <Route path="/admin/scenarios/:scenarioId/test" element={<RoundTest />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </ErrorBoundary>
    </TooltipProvider>
  </QueryClientProvider>
);
export default App;
