export async function apiRequest<T>(
  method: string,
  url: string,
  data?: unknown
): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(localStorage.getItem("token")
        ? { Authorization: `Bearer ${localStorage.getItem("token")}` }
        : {}),
    },
    body: data ? JSON.stringify(data) : undefined,
  });

  if (res.status === 401) {
    // Optional: handle unauthorized
  }

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.message || "An error occurred");
  }

  return res.json();
}

export const api = {
  getMotors: () => apiRequest<any[]>("GET", "/api/v1/iot/motors"),
  getAlerts: () => apiRequest<any[]>("GET", "/api/v1/ml/alerts"),
  getKPIs: () => apiRequest<any>("GET", "/api/v1/iot/kpis"),
  getWorkOrders: () => apiRequest<any[]>("GET", "/api/v1/iot/work-orders"),
  getAudit: () => apiRequest<any[]>("GET", "/api/v1/blockchain/audit"),
  getMotorById: (id: string) => apiRequest<any>("GET", `/api/v1/iot/motors/${id}`),
  getMotorVibrations: (id: string) => apiRequest<any[]>("GET", `/api/v1/iot/motors/${id}/vibration`),
  getTechnicians: () => apiRequest<any[]>("GET", "/api/v1/iot/technicians"),
  getInventoryParts: () => apiRequest<any[]>("GET", "/api/v1/iot/inventory-parts"),
  createWorkOrder: (data: any) => apiRequest<any>("POST", "/api/v1/iot/work-orders", data),
  updateWorkOrder: (id: string, data: any) => apiRequest<any>("PUT", `/api/v1/iot/work-orders/${id}`, data),
  updateAlert: (id: string, data: any) => apiRequest<any>("PUT", `/api/v1/ml/alerts/${id}`, data),
  createMotor: (data: any) => apiRequest<any>("POST", "/api/v1/iot/motors", data),
  updateMotor: (id: string, data: any) => apiRequest<any>("PUT", `/api/v1/iot/motors/${id}`, data),
  deleteMotor: (id: string) => apiRequest<any>("DELETE", `/api/v1/iot/motors/${id}`),
  getBIKPIs: () => apiRequest<any>("GET", "/api/v1/bi/kpis"),
  getMtbfBySite: () => apiRequest<any[]>("GET", "/api/v1/bi/mtbf-by-site"),
  getMaintenanceCosts: () => apiRequest<any[]>("GET", "/api/v1/bi/maintenance-costs"),
  getInterventions: () => apiRequest<any[]>("GET", "/api/v1/bi/interventions"),
};
