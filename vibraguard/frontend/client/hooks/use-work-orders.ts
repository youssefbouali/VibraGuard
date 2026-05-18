import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";

export interface WorkOrder {
  id: string;
  title: string;
  asset: string;
  status: string;
  assignedTo: any;
  dueDate: string;
  priority: string;
  type?: string;
  cost?: number;
  duration?: string;
  parts?: string;
}

export function useWorkOrders() {
  return useQuery<WorkOrder[]>({
    queryKey: ["/api/v1/iot/work-orders"],
    queryFn: () => apiRequest("GET", "/api/v1/iot/work-orders"),
  });
}
