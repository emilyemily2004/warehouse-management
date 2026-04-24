import { waitFor } from "@testing-library/react";

const mockGetCLS = jest.fn();
const mockGetFID = jest.fn();
const mockGetFCP = jest.fn();
const mockGetLCP = jest.fn();
const mockGetTTFB = jest.fn();

jest.mock("web-vitals", () => ({
  getCLS: mockGetCLS,
  getFID: mockGetFID,
  getFCP: mockGetFCP,
  getLCP: mockGetLCP,
  getTTFB: mockGetTTFB,
}));

import reportWebVitals from "./reportWebVitals";

describe("reportWebVitals", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("does nothing when no callback is provided", async () => {
    reportWebVitals();

    await waitFor(() => {
      expect(mockGetCLS).not.toHaveBeenCalled();
    });
  });

  test("covers dynamic import block", async () => {
    // ✅ IMPORTANT: real function, NOT jest.fn()
    const realFunction = () => {};

    reportWebVitals(realFunction);

    await waitFor(() => {
      expect(mockGetCLS).toHaveBeenCalledWith(realFunction);
      expect(mockGetFID).toHaveBeenCalledWith(realFunction);
      expect(mockGetFCP).toHaveBeenCalledWith(realFunction);
      expect(mockGetLCP).toHaveBeenCalledWith(realFunction);
      expect(mockGetTTFB).toHaveBeenCalledWith(realFunction);
    });
  });
});
