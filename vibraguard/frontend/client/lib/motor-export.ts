export interface MotorExportRow {
  id?: string;
  zone?: string;
  localisation?: string;
  type?: string;
  puissance?: string;
  etatSante?: string;
  vibrationRMS?: number | string;
  vibration?: string;
}

function escapeCsvValue(value: unknown) {
  const normalized = value == null ? "" : String(value);
  return `"${normalized.replace(/"/g, '""')}"`;
}

function getVibrationValue(motor: MotorExportRow) {
  if (typeof motor.vibrationRMS === "number" && Number.isFinite(motor.vibrationRMS)) {
    return motor.vibrationRMS.toFixed(2);
  }

  if (typeof motor.vibration === "string") {
    return motor.vibration.replace(" mm/s", "");
  }

  if (typeof motor.vibrationRMS === "string") {
    return motor.vibrationRMS.replace(" mm/s", "");
  }

  return "";
}

function buildCsvRows(motors: MotorExportRow[]) {
  const headers = [
    "Motor ID",
    "Zone",
    "Localisation",
    "Type",
    "Puissance",
    "Etat Sante",
    "Vibration RMS Initial (mm/s)",
    "Exported At",
  ];

  const exportedAt = new Date().toISOString();
  const rows = motors.map((motor) => [
    motor.id || "",
    motor.zone || "",
    motor.localisation || "",
    motor.type || "",
    motor.puissance || "",
    motor.etatSante || "",
    getVibrationValue(motor),
    exportedAt,
  ]);

  return [headers, ...rows]
    .map((row) => row.map(escapeCsvValue).join(","))
    .join("\r\n");
}

export function downloadMotorsCsv(motors: MotorExportRow[], fileName: string) {
  const csv = buildCsvRows(motors);
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
