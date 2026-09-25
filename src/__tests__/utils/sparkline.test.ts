import { sparklinePath } from "@/utils/sparkline";

describe("sparklinePath", () => {
  it("returns an empty path when there are no samples", () => {
    expect(sparklinePath([], 10, 10)).toBe("");
  });

  it("draws a flat line when every sample is the same", () => {
    expect(sparklinePath(["1.00000000", "1.00000000"], 10, 10)).toBe(
      "M0.0 5.0 L10.0 5.0",
    );
  });

  it("puts the highest sample at the top of the viewBox", () => {
    const path = sparklinePath(["1.00000000", "2.00000000"], 10, 10);
    expect(path.startsWith("M0.0 10.0")).toBe(true);
    expect(path.endsWith("L10.0 0.0")).toBe(true);
  });
});
