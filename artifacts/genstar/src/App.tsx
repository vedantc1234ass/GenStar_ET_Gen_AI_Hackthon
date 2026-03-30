import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import { Layout } from "@/components/Layout";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Workflows from "@/pages/workflows";
import Meetings from "@/pages/meetings";
import Employees from "@/pages/employees";
import Analytics from "@/pages/analytics";
import Reports from "@/pages/reports";
import Chatbot from "@/pages/chatbot";
import AuditLogs from "@/pages/audit";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function AppRouter() {
  return (
    <Switch>
      {/* Landing page has no sidebar */}
      <Route path="/" component={Landing} />
      
      {/* App pages inside Layout */}
      <Route path="/:rest*">
        <Layout>
          <Switch>
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/workflows" component={Workflows} />
            <Route path="/meetings" component={Meetings} />
            <Route path="/employees" component={Employees} />
            <Route path="/analytics" component={Analytics} />
            <Route path="/reports" component={Reports} />
            <Route path="/chatbot" component={Chatbot} />
            <Route path="/audit" component={AuditLogs} />
            <Route component={NotFound} />
          </Switch>
        </Layout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AppRouter />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
