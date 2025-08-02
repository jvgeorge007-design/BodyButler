import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { ThemeProvider } from "@/contexts/theme-context";
import { ModalProvider } from "@/contexts/modal-context";


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
import ScanReceipt from "@/pages/scan-receipt";
import DashboardV2 from "@/pages/dashboard-v2";
import DashboardNew from "@/pages/dashboard-new";
import PhotoFoodLogger from "@/pages/photo-food-logger";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <>
          <Route path="/" component={Login} />
          <Route path="/onboarding" component={Onboarding} />
        </>
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/dashboard" component={Dashboard} />
        <Route path="/dashboard-v2" component={DashboardV2} />
          <Route path="/dashboard-new" component={DashboardNew} />
          <Route path="/progress" component={Progress} />
          <Route path="/ai-chat" component={AIChat} />
          <Route path="/settings" component={Settings} />
          <Route path="/workout" component={Workout} />
          <Route path="/meal-log" component={MealLog} />
          <Route path="/workout-calendar" component={WorkoutCalendar} />
          <Route path="/add-food" component={AddFood} />
          <Route path="/scan-receipt" component={ScanReceipt} />
          <Route path="/photo-food-logger" component={PhotoFoodLogger} />
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
