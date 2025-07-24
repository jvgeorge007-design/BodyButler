import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { ThemeProvider } from "@/contexts/theme-context";
import { ModalProvider } from "@/contexts/modal-context";
import Splash from "@/pages/splash";
import Welcome from "@/pages/welcome";
import Login from "@/pages/login";
import Onboarding from "@/pages/onboarding";
import Home from "@/pages/home";
import Dashboard from "@/pages/dashboard";
import Progress from "@/pages/progress";
import AIChat from "@/pages/ai-chat";
import Settings from "@/pages/settings";
import Workout from "@/pages/workout";
import MealLog from "@/pages/meal-log";
import WorkoutCalendar from "@/pages/workout-calendar";
import AddFood from "@/pages/add-food";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <>
          <Route path="/" component={Splash} />
          <Route path="/welcome" component={Welcome} />
          <Route path="/login" component={Login} />
          <Route path="/onboarding" component={Onboarding} />
        </>
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/progress" component={Progress} />
          <Route path="/ai-chat" component={AIChat} />
          <Route path="/settings" component={Settings} />
          <Route path="/workout" component={Workout} />
          <Route path="/meal-log" component={MealLog} />
          <Route path="/workout-calendar" component={WorkoutCalendar} />
          <Route path="/add-food" component={AddFood} />
          <Route path="/onboarding" component={Onboarding} />
          <Route path="/welcome" component={Welcome} />
          <Route path="/splash" component={Splash} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ModalProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </ModalProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
