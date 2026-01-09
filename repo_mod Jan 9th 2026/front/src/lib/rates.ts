export type RatesResponse = {
  conversion_rates: Record<string, number>;
  time_last_update_unix?: number;
  time_last_update_utc?: string;
  base_code?: string;
};

export async function fetchRates(): Promise<RatesResponse> {
  const base = (import.meta as any).env?.VITE_API_BASE_URL ?? '';
  const url = `${base}/rates`;
  const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
  if (!res.ok) {
    throw new Error(`Failed to fetch rates: ${res.status} ${res.statusText}`);
  }
  return await res.json();
}
