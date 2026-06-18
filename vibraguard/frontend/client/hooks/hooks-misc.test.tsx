import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { fetchWorkOrderEvents, getBlockchainStats } from "@/lib/blockchain";
import { useIsMobile } from "./use-mobile";
import { useAudit } from "./use-audit";
import { useBlockchainKPIs } from "./use-blockchain-kpis";

jest.mock("@/lib/blockchain", () => ({
  fetchWorkOrderEvents: jest.fn(),
  getBlockchainStats: jest.fn(),
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe("misc hooks", () => {
  beforeEach(() => {
    (window.matchMedia as any) = jest.fn().mockImplementation(() => ({
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    }));
  });

  it("useIsMobile reflects window.innerWidth", async () => {
    Object.defineProperty(window, "innerWidth", { value: 500, writable: true });
    const { result } = renderHook(() => useIsMobile());
    await waitFor(() => expect(result.current).toBe(true));
  });

  it("useAudit returns blockchain events when available", async () => {
    (fetchWorkOrderEvents as unknown as jest.Mock).mockResolvedValueOnce([
      { hash: "0x1", date: "2025-01-01T00:00:00.000Z" },
    ]);

    const wrapper = createWrapper();
    const { result } = renderHook(() => useAudit(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.[0].hash).toBe("0x1");
  });

  it("useBlockchainKPIs derives KPIs and handles unreachable blockchain", async () => {
    (fetchWorkOrderEvents as unknown as jest.Mock).mockResolvedValueOnce([
      { bloc: "#1", date: "2025-01-01T00:00:00.000Z" },
      { bloc: "#2", date: "2025-01-01T00:00:05.000Z" },
      { bloc: "#2", date: "2025-01-01T00:00:10.000Z" },
    ]);
    (getBlockchainStats as unknown as jest.Mock).mockResolvedValueOnce({});

    const wrapper = createWrapper();
    const { result } = renderHook(() => useBlockchainKPIs(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.secureBlocks).toBe(2);
    expect(result.current.data?.smartContracts).toBe(1);
    expect(result.current.data?.integrityRate).toBe(100);

    (fetchWorkOrderEvents as unknown as jest.Mock).mockImplementationOnce(() => {
      throw new Error("down");
    });

    const { result: result2 } = renderHook(() => useBlockchainKPIs(), { wrapper: createWrapper() });
    await waitFor(() => expect(result2.current.isSuccess).toBe(true));
    expect(result2.current.data?.smartContracts).toBe(0);
    expect(result2.current.data?.integrityRate).toBe(0);
  });
});

