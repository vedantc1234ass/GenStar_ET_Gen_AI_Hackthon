import { 
  useGetDashboardAnalytics, 
  useGetProductivityAnalytics,
  useGetAgentActivity,
  useGetAuditLogs
} from "@workspace/api-client-react";

export function useDashboardData() {
  return useGetDashboardAnalytics({
    query: { refetchInterval: 5000 } // Poll every 5s for real-time feel
  });
}

export function useProductivityData() {
  return useGetProductivityAnalytics();
}

export function useActivityFeed() {
  return useGetAgentActivity({
    query: { refetchInterval: 3000 } // Fast poll for agent pipeline
  });
}

export function useAuditData() {
  return useGetAuditLogs();
}
