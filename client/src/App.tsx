import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import GymDashboard from "@/pages/gym-dashboard";
import CoachDashboard from "@/pages/coach-dashboard";
import GymnastDashboard from "@/pages/gymnast-dashboard";
import AdminDashboard from "@/pages/admin-dashboard";
import AdminSetup from "@/pages/admin-setup";
import DemoLogin from "@/pages/demo-login";
import Checkout from "@/pages/checkout";

function Router() {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Don't show loading spinner for unauthenticated state
  // Show the public pages and let authenticated routes handle loading
  
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/admin-setup" component={AdminSetup} />
      <Route path="/demo-login" component={DemoLogin} />
      
      {isAuthenticated && user && (
        <>
          {user.role === 'admin' && <Route path="/admin-dashboard" component={AdminDashboard} />}
          {user.role === 'gym_admin' && <Route path="/gym-dashboard" component={GymDashboard} />}
          {user.role === 'coach' && <Route path="/coach-dashboard" component={CoachDashboard} />}
          {user.role === 'gymnast' && <Route path="/gymnast-dashboard" component={GymnastDashboard} />}
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
