import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { GameProvider } from "./contexts/GameContext";
import Dashboard from "./pages/Dashboard";
import Log from "./pages/Log";
import Quests from "./pages/Quests";
import Stats from "./pages/Stats";
import Profile from "./pages/Profile";
import BottomNav from "./components/BottomNav";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/log" component={Log} />
      <Route path="/quests" component={Quests} />
      <Route path="/stats" component={Stats} />
      <Route path="/profile" component={Profile} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
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
              <BottomNav />
            </div>
          </TooltipProvider>
        </GameProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
