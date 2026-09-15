import styles from "./page.module.css";
import { config } from "@/lib/config";
import { getAccountView } from "@/lib/warden";
import { getIndexedEvents } from "@/lib/indexer";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [account, indexed] = await Promise.all([
    getAccountView(config.demoAccountId).catch((err: unknown) => ({
      error: err instanceof Error ? err.message : String(err),
    })),
    getIndexedEvents(),
  ]);

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>Warden Account Viewer</h1>
        <p className={styles.subtitle}>
          Reads live from Stellar testnet via a simulated (unsigned) contract
          call -- no wallet needed. Account creation isn&apos;t wired up yet;
          see the repo README for that next step.
        </p>

        <section className={styles.section}>
          <h2>Account</h2>
          <p className={styles.mono}>{config.demoAccountId}</p>
          {"error" in account ? (
            <p className={styles.error}>Failed to read account: {account.error}</p>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Rule ID</th>
                  <th>Name</th>
                  <th>Context type</th>
                  <th>Signers</th>
                  <th>Policies</th>
                </tr>
              </thead>
              <tbody>
                {account.contextRules.map((rule) => (
                  <tr key={rule.id}>
                    <td>{rule.id}</td>
                    <td>{rule.name}</td>
                    <td className={styles.mono}>{JSON.stringify(rule.contextType)}</td>
                    <td>{rule.signerCount}</td>
                    <td>{rule.policyCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section className={styles.section}>
          <h2>Indexed events</h2>
          <p className={styles.subtitle}>
            From{" "}
            <code className={styles.code}>{config.indexerUrl}</code> --
            warden-backend&apos;s indexer. Run it locally (see that repo) to
            populate this section; empty is expected otherwise.
          </p>
          {indexed.events.length === 0 ? (
            <p className={styles.subtitle}>No events indexed yet.</p>
          ) : (
            <ul className={styles.eventList}>
              {indexed.events.map((event) => (
                <li key={event.id} className={styles.eventItem}>
                  <div className={styles.mono}>
                    ledger {event.ledger} -- {event.topic.join(", ")}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
