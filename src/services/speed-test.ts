/**
 * Represents the results of a speed test.
 */
export interface SpeedTestResult {
  /**
   * The download speed in Mbps.
   */
  downloadSpeedMbps: number;
  /**
   * The upload speed in Mbps.
   */
  uploadSpeedMbps: number;
  /**
   * The ping time in milliseconds.
   */
  pingMilliseconds: number;
}

/**
 * Asynchronously performs a speed test.
 *
 * @returns A promise that resolves to a SpeedTestResult object containing download speed, upload speed, and ping.
 */
export async function runSpeedTest(): Promise<SpeedTestResult> {
  // TODO: Implement this by calling an API.

  return {
    downloadSpeedMbps: 50,
    uploadSpeedMbps: 20,
    pingMilliseconds: 30,
  };
}
