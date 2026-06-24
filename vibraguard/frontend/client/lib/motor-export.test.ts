import { downloadMotorsCsv } from "./motor-export";

describe("downloadMotorsCsv", () => {
  beforeEach(() => {
    (window.URL.createObjectURL as any) = jest.fn();
    (window.URL.revokeObjectURL as any) = jest.fn();
  });

  it("generates a CSV blob and triggers a download", async () => {
    let capturedBlob: Blob | null = null;
    (window.URL.createObjectURL as any).mockImplementation((blob: Blob) => {
      capturedBlob = blob;
      return "blob:mock";
    });

    const clickSpy = jest.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});

    downloadMotorsCsv(
      [
        {
          id: "MTR-1",
          zone: 'A "Zone"',
          localisation: "L1",
          type: "Asynchrone",
          puissance: "45 kW",
          etatSante: "Normal",
          vibrationRMS: 1.2345,
        },
      ],
      "motors.csv",
    );

    expect(window.URL.createObjectURL).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalled();
    expect(window.URL.revokeObjectURL).toHaveBeenCalledWith("blob:mock");

    const text = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result ?? ""));
      reader.readAsText(capturedBlob as Blob);
    });
    expect(text).toContain("Motor ID");
    expect(text).toContain("Vibration RMS Initial (mm/s)");
    expect(text).toContain('"MTR-1"');
    expect(text).toContain('"A ""Zone"""');

    clickSpy.mockRestore();
  });
});
