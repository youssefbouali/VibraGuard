import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { apiRequest } from "@/lib/api";
import { useWorkOrders } from "./use-work-orders";
import { useBIKPIs } from "./use-bi-kpis";
import { useMtbfBySite } from "./use-mtbf-by-site";
import { useMaintenanceCosts } from "./use-maintenance-costs";
import { useInterventions } from "./use-interventions";
import { useTraceability } from "./use-traceability";

jest.mock("@/lib/api", () => ({
  apiRequest: jest.fn(),
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe("apiRequest hooks", () => {
  beforeEach(() => {
    (apiRequest as unknown as jest.Mock).mockResolvedValue([]);
  });

  it("useWorkOrders calls the expected endpoint", async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useWorkOrders(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(apiRequest).toHaveBeenCalledWith("GET", "/api/v1/iot/work-orders");
  });

  it("useBIKPIs calls the expected endpoint", async () => {
    const wrapper = createWrapper();
    (apiRequest as unknown as jest.Mock).mockResolvedValue({});
    const { result } = renderHook(() => useBIKPIs(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(apiRequest).toHaveBeenCalledWith("GET", "/api/v1/bi/kpis");
  });

  it("useMtbfBySite calls the expected endpoint", async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useMtbfBySite(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(apiRequest).toHaveBeenCalledWith("GET", "/api/v1/bi/mtbf-by-site");
  });

  it("useMaintenanceCosts calls the expected endpoint", async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useMaintenanceCosts(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(apiRequest).toHaveBeenCalledWith("GET", "/api/v1/bi/maintenance-costs");
  });

  it("useInterventions calls the expected endpoint", async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useInterventions(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(apiRequest).toHaveBeenCalledWith("GET", "/api/v1/bi/interventions");
  });

  it("useTraceability calls the expected endpoint", async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useTraceability(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(apiRequest).toHaveBeenCalledWith("GET", "/api/v1/blockchain/traceability");
  });
});

