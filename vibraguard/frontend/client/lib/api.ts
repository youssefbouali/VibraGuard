const BASE_URL = "/api/v1";

export async function fetchWithAuth(endpoint: string) {
    const token = localStorage.getItem("token");
    const response = await fetch(`${BASE_URL}${endpoint}`, {
        headers: {
            "Authorization": token ? `Bearer ${token}` : "",
        },
    });
    if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
    }
    return response.json();
}

export const api = {
    getMotors: () => fetchWithAuth("/iot/motors"),
    getKPIs: () => fetchWithAuth("/iot/kpis"),
    getAlerts: () => fetchWithAuth("/ml/alerts"),
    getAudit: () => fetchWithAuth("/blockchain/audit"),
};
