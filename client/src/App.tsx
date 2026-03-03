import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { GameProvider } from "./contexts/GameContext";
import Home from "./pages/Home";
import Log from "./pages/Log";
import Quests from "./pages/Quests";
import Stats from "./pages/Stats";
import Profile from "./pages/Profile";
import SystemLogPage from "./pages/SystemLog";
import BottomNav from "./components/BottomNav";
import PageTransition from "./components/PageTransition";
import { useAuth } from "./_core/hooks/useAuth";

function AuthenticatedRoutes() {
  const [location] = useLocation();

  return (
    <>
      <PageTransition locationKey={location}>
        <Switch>
          <Route path="/log" component={Log} />
          <Route path="/quests" component={Quests} />
          <Route path="/stats" component={Stats} />
          <Route path="/profile" component={Profile} />
          <Route path="/system-log" component={SystemLogPage} />
          <Route path="/404" component={NotFound} />
          <Route component={NotFound} />
        </Switch>
      </PageTransition>
      <BottomNav />
    </>
  );
}

function Router() {
  const { isAuthenticated, loading } = useAuth();
  const [location] = useLocation();

  // Home page handles its own auth display (login screen vs dashboard)
  if (location === '/') {
    return (
      <PageTransition locationKey={location}>
        <Home />
        {isAuthenticated && !loading && <BottomNav />}
      </PageTransition>
    );
  }

  // All other routes require auth — redirect handled by useAuth in each page
  return <AuthenticatedRoutes />;
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <GameProvider>
          <TooltipProvider>
            <Toaster
              theme="dark"
              toastOptions={{
                style: {
                  background: '#0a0e1e',
                  border: '1px solid rgba(0, 212, 255, 0.2)',
                  color: '#e5e7eb',
                  fontFamily: 'Space Grotesk, sans-serif',
                },
              }}
            />
            <div className="max-w-lg mx-auto relative">
              <Router />
            </div>
          </TooltipProvider>
        </GameProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
