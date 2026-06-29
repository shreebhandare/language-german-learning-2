
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { AuthCallbackPage } from "./components/langrushi/AuthCallbackPage";
import { AppProvider } from "./contexts/AppContext";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider defaultTheme="light">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/learn" element={<Index />} />
              <Route path="/dashboard" element={<Index />} />
              <Route path="/admin" element={<Index />} />
              <Route path="/pricing" element={<Index />} />
              <Route path="/exercises/:id" element={<Index />} />
              <Route path="/auth/callback" element={<AuthCallbackPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
