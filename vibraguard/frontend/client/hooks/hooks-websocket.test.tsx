import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useAlerts } from "./use-alerts";
import { useKPIs } from "./use-kpis";
import { useVibrations } from "./use-vibrations";
import { useMoteurs } from "./use-moteurs";

jest.mock("@/lib/api", () => ({ apiRequest: jest.fn() }));

const mockApiRequest = (jest.requireMock("@/lib/api") as any).apiRequest;

class MockWebSocket {
  static instances: MockWebSocket[] = [];
  url: string;
  onmessage: ((event: { data: string }) => void) | null = null;
  close = jest.fn();

  constructor(url: string) {
    this.url = url;
    MockWebSocket.instances.push(this);
  }
}

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return {
    queryClient,
    Wrapper: function Wrapper({ children }: { children: React.ReactNode }) {
      return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
    },
  };
}

describe("websocket hooks", () => {
  beforeEach(() => {
    (global as any).WebSocket = MockWebSocket as any;
    MockWebSocket.instances = [];
    mockApiRequest.mockReset();
    mockApiRequest.mockResolvedValue([]);
  });

  it("useAlerts pushes new alerts into query cache without duplicates", async () => {
    const { Wrapper, queryClient } = createWrapper();
    const { result } = renderHook(() => useAlerts(), { wrapper: Wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(MockWebSocket.instances).toHaveLength(1);
    await waitFor(() => expect(MockWebSocket.instances[0].onmessage).toBeTruthy());

    act(() => {
      MockWebSocket.instances[0].onmessage?.({
        data: JSON.stringify({ id: "A1", message: "m", level: "x", time: "t", color: "c", status: "s", priority: "p", motorId: "M1", title: "T" }),
      });
    });

    await waitFor(() => {
      const data = queryClient.getQueryData(["/api/v1/ml/alerts"]) as any[] | undefined;
      expect(data?.[0]?.id).toBe("A1");
    });

    act(() => {
      MockWebSocket.instances[0].onmessage?.({
        data: JSON.stringify({ id: "A1", message: "m", level: "x", time: "t", color: "c", status: "s", priority: "p", motorId: "M1", title: "T" }),
      });
    });

    await waitFor(() => {
      const data = queryClient.getQueryData(["/api/v1/ml/alerts"]) as any[] | undefined;
      expect((data ?? []).filter((a) => a.id === "A1")).toHaveLength(1);
    });
  });

  it("useKPIs invalidates and refetches on alert message", async () => {
    mockApiRequest
      .mockResolvedValueOnce({ totalMotors: 1 })
      .mockResolvedValueOnce({ totalMotors: 2 });

    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useKPIs(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockApiRequest).toHaveBeenCalledWith("GET", "/api/v1/bi/kpis");
    expect(MockWebSocket.instances).toHaveLength(1);
    await waitFor(() => expect(MockWebSocket.instances[0].onmessage).toBeTruthy());

    act(() => {
      MockWebSocket.instances[0].onmessage?.({ data: JSON.stringify({ id: "A1" }) });
    });

    await waitFor(() => expect(mockApiRequest.mock.calls.length).toBeGreaterThanOrEqual(2));
  });

  it("useVibrations appends websocket data and filters by motorId when provided", async () => {
    mockApiRequest.mockResolvedValueOnce([]);

    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useVibrations("M1"), { wrapper: Wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(MockWebSocket.instances).toHaveLength(1);
    await waitFor(() => expect(MockWebSocket.instances[0].onmessage).toBeTruthy());

    act(() => {
      MockWebSocket.instances[0].onmessage?.({
        data: JSON.stringify({ motorId: "M2", time: "t", vibRms: 1, vibPeak: 1, vibKurtosis: 1, temperature: 1, currentRms: 1, isAnomalous: false }),
      });
    });

    await waitFor(() => expect(Array.isArray(result.current.data) ? result.current.data : []).toHaveLength(0));

    act(() => {
      MockWebSocket.instances[0].onmessage?.({
        data: JSON.stringify({ motorId: "M1", time: "t", vibRms: 2, vibPeak: 2, vibKurtosis: 2, temperature: 2, currentRms: 2, isAnomalous: true }),
      });
    });

    await waitFor(() => expect(result.current.data).toHaveLength(1));
    expect(result.current.data?.[0].motorId).toBe("M1");
  });

  it("useMoteurs updates vibration and alert fields via websockets", async () => {
    mockApiRequest.mockResolvedValueOnce([
      {
        id: "M1",
        type: "x",
        zone: "z",
        localisation: "l",
        puissance: "p",
        etatSante: "Normal",
        vibrationRMS: 0,
        derniereAlerte: "",
        etatPct: 90,
      },
    ]);

    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useMoteurs(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    await waitFor(() => expect(result.current.data).toHaveLength(1));
    expect(MockWebSocket.instances).toHaveLength(2);
    await waitFor(() => expect(MockWebSocket.instances[0].onmessage).toBeTruthy());

    act(() => {
      MockWebSocket.instances[0].onmessage?.({
        data: JSON.stringify({ motorId: "M1", vibRms: 1.111, anomalous: true }),
      });
    });

    await waitFor(() => {
      expect(result.current.data?.[0].vibrationRMS).toBe(1.11);
    });

    act(() => {
      MockWebSocket.instances[1].onmessage?.({
        data: JSON.stringify({ motorId: "M1", time: "2025-01-01", priority: "high", anomalyType: "X" }),
      });
    });

    await waitFor(() => {
      expect(result.current.data?.[0].derniereAlerte).toBe("2025-01-01");
      expect(result.current.data?.[0].etatSante).toBe("Critique");
    });
  });
});
