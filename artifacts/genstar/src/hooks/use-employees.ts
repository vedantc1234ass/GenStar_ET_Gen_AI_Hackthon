import { useQueryClient } from "@tanstack/react-query";
import { 
  useGetEmployees, 
  useCreateEmployee, 
  useUpdateEmployee, 
  useDeleteEmployee,
  getGetEmployeesQueryKey
} from "@workspace/api-client-react";

export function useEmployeesData() {
  return useGetEmployees();
}

export function useAddEmployee() {
  const queryClient = useQueryClient();
  return useCreateEmployee({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetEmployeesQueryKey() });
      }
    }
  });
}

export function useEditEmployee() {
  const queryClient = useQueryClient();
  return useUpdateEmployee({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetEmployeesQueryKey() });
      }
    }
  });
}

export function useRemoveEmployee() {
  const queryClient = useQueryClient();
  return useDeleteEmployee({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetEmployeesQueryKey() });
      }
    }
  });
}
