import { useQueryClient } from "@tanstack/react-query";
import { 
  useGetWorkflows, 
  useCreateWorkflow, 
  useUpdateWorkflow, 
  useDeleteWorkflow,
  useExecuteWorkflow,
  getGetWorkflowsQueryKey
} from "@workspace/api-client-react";

export function useWorkflowsData() {
  return useGetWorkflows();
}

export function useAddWorkflow() {
  const queryClient = useQueryClient();
  return useCreateWorkflow({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetWorkflowsQueryKey() });
      }
    }
  });
}

export function useEditWorkflow() {
  const queryClient = useQueryClient();
  return useUpdateWorkflow({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetWorkflowsQueryKey() });
      }
    }
  });
}

export function useRemoveWorkflow() {
  const queryClient = useQueryClient();
  return useDeleteWorkflow({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetWorkflowsQueryKey() });
      }
    }
  });
}

export function useTriggerWorkflow() {
  const queryClient = useQueryClient();
  return useExecuteWorkflow({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetWorkflowsQueryKey() });
      }
    }
  });
}
