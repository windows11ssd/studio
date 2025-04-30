/**
 * Represents information about a cell tower.
 */
export interface CellTowerInfo {
  /**
   * The cell ID.
   */
  cellId: string;
  /**
   * The location area code.
   */
  lac: string;
  /**
   * The mobile country code.
   */
  mcc: string;
  /**
   * The mobile network code.
   */
  mnc: string;
}

/**
 * Asynchronously retrieves cell tower information.
 *
 * **Note:** This function currently returns *mock* data.
 * Real cell tower information typically requires access to device hardware APIs
 * (like telephony APIs in native apps) or specialized geolocation services,
 * which are not available in a standard web browser environment for privacy
 * and security reasons. Web APIs like `navigator.geolocation` provide GPS/Wi-Fi/IP-based
 * location, but not specific cell tower details.
 *
 * @returns A promise that resolves to a CellTowerInfo object containing mock cell ID, LAC, MCC, and MNC.
 */
export async function getCellTowerInfo(): Promise<CellTowerInfo> {
  // Simulate fetching data - Replace with actual API call if available.
  await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay

  // Generate slightly varied mock data
  const mockCellId = String(Math.floor(Math.random() * 50000) + 10000); // Random 5-digit number
  const mockLac = String(Math.floor(Math.random() * 5000) + 1000); // Random 4-digit number

  return {
    cellId: mockCellId, // Example: '34567'
    lac: mockLac,       // Example: '2345'
    mcc: '310',         // Example Mobile Country Code (USA)
    mnc: '260',         // Example Mobile Network Code (T-Mobile USA)
  };
}
