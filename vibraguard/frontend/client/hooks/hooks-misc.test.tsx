import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { useIsMobile } from "./use-mobile";
import { useAudit } from "./use-audit";
import { useBlockchainKPIs } from "./use-blockchain-kpis";

const mockFetchWorkOrderEvents = jest.fn();
const mockGetBlockchainStats = jest.fn();
jest.mock("@/lib/blockchain", () => ({ fetchWorkOrderEvents: mockFetchWorkOrderEvents, getBlockchainStats: mockGetBlockchainStats }));

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
    mockFetchWorkOrderEvents.mockResolvedValueOnce([
      { hash: "0x1", date: "2025-01-01T00:00:00.000Z" },
    ]);

    const wrapper = createWrapper();
    const { result } = renderHook(() => useAudit(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.[0].hash).toBe("0x1");
  });

  it("useBlockchainKPIs derives KPIs and handles unreachable blockchain", async () => {
    mockFetchWorkOrderEvents.mockResolvedValueOnce([
      { bloc: "#1", date: "2025-01-01T00:00:00.000Z" },
      { bloc: "#2", date: "2025-01-01T00:00:05.000Z" },
      { bloc: "#2", date: "2025-01-01T00:00:10.000Z" },
    ]);
    mockGetBlockchainStats.mockResolvedValueOnce({});

    const wrapper = createWrapper();
    const { result } = renderHook(() => useBlockchainKPIs(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.secureBlocks).toBe(2);
    expect(result.current.data?.smartContracts).toBe(1);
    expect(result.current.data?.integrityRate).toBe(100);

    mockFetchWorkOrderEvents.mockImplementationOnce(() => {
      throw new Error("down");
    });

    const { result: result2 } = renderHook(() => useBlockchainKPIs(), { wrapper: createWrapper() });
    await waitFor(() => expect(result2.current.isSuccess).toBe(true));
    expect(result2.current.data?.smartContracts).toBe(0);
    expect(result2.current.data?.integrityRate).toBe(0);
  });
});
