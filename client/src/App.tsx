import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Welcome from "@/pages/welcome";
import Login from "@/pages/login";
import Onboarding from "@/pages/onboarding";
import Home from "@/pages/home";
import Dashboard from "@/pages/dashboard";
import WorkoutLog from "@/pages/workout-log";
import MealLog from "@/pages/meal-log";
import WorkoutCalendar from "@/pages/workout-calendar";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <>
          <Route path="/" component={Welcome} />
          <Route path="/login" component={Login} />
          <Route path="/onboarding" component={Onboarding} />
        </>
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/workout-log" component={WorkoutLog} />
          <Route path="/meal-log" component={MealLog} />
          <Route path="/workout-calendar" component={WorkoutCalendar} />
          <Route path="/onboarding" component={Onboarding} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
