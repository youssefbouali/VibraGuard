import { api, apiRequest } from "./api";

describe("apiRequest", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    (global as any).fetch = jest.fn();
  });

  it("adds Authorization header when token exists", async () => {
    localStorage.setItem("token", "tkn");

    (global as any).fetch.mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => "application/json" },
      json: async () => ({ ok: true }),
    });

    await apiRequest("GET", "/api/test");

    expect((global as any).fetch).toHaveBeenCalledWith(
      "/api/test",
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({
          Authorization: "Bearer tkn",
        }),
      }),
    );
  });

  it("sends JSON body when data is provided", async () => {
    (global as any).fetch.mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => "application/json" },
      json: async () => ({ ok: true }),
    });

    await apiRequest("POST", "/api/test", { a: 1 });

    expect((global as any).fetch).toHaveBeenCalledWith(
      "/api/test",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ a: 1 }),
      }),
    );
  });

  it("throws with backend message for non-ok responses", async () => {
    (global as any).fetch.mockResolvedValue({
      ok: false,
      status: 500,
      headers: { get: () => "application/json" },
      json: async () => ({ message: "boom" }),
    });

    await expect(apiRequest("GET", "/api/test")).rejects.toThrow("boom");
  });

  it("throws with default message when response JSON is not readable", async () => {
    (global as any).fetch.mockResolvedValue({
      ok: false,
      status: 500,
      headers: { get: () => "application/json" },
      json: async () => {
        throw new Error("bad json");
      },
    });

    await expect(apiRequest("GET", "/api/test")).rejects.toThrow("An error occurred");
  });

  it("returns empty object for 204 response", async () => {
    (global as any).fetch.mockResolvedValue({
      ok: true,
      status: 204,
      headers: { get: () => "application/json" },
      json: async () => ({ ok: true }),
    });

    const res = await apiRequest("GET", "/api/test");
    expect(res).toEqual({});
  });

  it("returns empty object when content-type is not JSON", async () => {
    (global as any).fetch.mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => "text/plain" },
      json: async () => ({ ok: true }),
    });

    const res = await apiRequest("GET", "/api/test");
    expect(res).toEqual({});
  });

  it("api convenience methods call fetch with expected endpoints", async () => {
    (global as any).fetch.mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => "application/json" },
      json: async () => ({}),
    });

    await api.getMotors();
    await api.getAlerts();
    await api.getKPIs();
    await api.getWorkOrders();
    await api.getAudit();
    await api.getMotorById("M1");
    await api.getMotorVibrations("M1");
    await api.getTechnicians();
    await api.getInventoryParts();
    await api.createWorkOrder({ a: 1 });
    await api.updateWorkOrder("W1", { a: 2 });
    await api.updateAlert("A1", { a: 3 });
    await api.createMotor({ a: 4 });
    await api.updateMotor("M1", { a: 5 });
    await api.deleteMotor("M1");
    await api.getBIKPIs();
    await api.getMtbfBySite();
    await api.getMaintenanceCosts();
    await api.getInterventions();
    await api.search("hello world");
    await api.markAllAlertsAsRead();
    await api.markAlertAsRead("A1");
    await api.getTechnicianById("T1");
    await api.updateTechnician("T1", { a: 6 });
    await api.createInventoryPart({ a: 7 });
    await api.getReports();
    await api.generateReport({ a: 8 });
    await api.deleteReport("R1");
    await api.deleteTechnician("T1");

    expect((global as any).fetch).toHaveBeenCalled();
    const urls = (global as any).fetch.mock.calls.map((c: any[]) => c[0]);
    expect(urls).toContain("/api/v1/iot/motors");
    expect(urls).toContain("/api/v1/ml/alerts");
    expect(urls).toContain("/api/v1/search?q=hello%20world");
  });
});
