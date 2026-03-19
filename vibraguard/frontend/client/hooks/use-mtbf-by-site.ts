import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";

export interface SiteMtbf {
  name: string;
  value: number;
  color: string;
}

export function useMtbfBySite() {
  return useQuery<SiteMtbf[]>({
    queryKey: ["/api/v1/bi/mtbf-by-site"],
    queryFn: () => apiRequest("GET", "/api/v1/bi/mtbf-by-site"),
  });
}
