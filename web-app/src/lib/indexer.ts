import { config } from "./config";

export interface IndexedEvent {
  id: string;
  ledger: number;
  ledger_closed_at: string;
  contract_id: string;
  topic: string[];
  value: string;
}

interface EventsResponse {
  events: IndexedEvent[];
  latestLedger: number;
}

/**
 * Fetches indexed events from warden-backend's indexer. Returns an empty
 * list (rather than throwing) if the indexer isn't reachable -- it's a
 * separate, optional-for-now service, and the account view above works fine
 * without it, so one being down shouldn't take the other's section of the
 * page with it.
 */
export async function getIndexedEvents(): Promise<EventsResponse> {
  try {
    const res = await fetch(`${config.indexerUrl}/events`, {
      cache: "no-store",
    });
    if (!res.ok) {
      return { events: [], latestLedger: 0 };
    }
    return (await res.json()) as EventsResponse;
  } catch {
    return { events: [], latestLedger: 0 };
  }
}
