/**
 * Runtime configuration, read from environment variables. Defaults match the
 * current testnet deployment recorded in
 * `warden-contracts/deployments/testnet.json` -- this repo only consumes
 * that address, it doesn't own it.
 */
export const config = {
  rpcUrl: process.env.WARDEN_RPC_URL ?? "https://soroban-testnet.stellar.org",
  networkPassphrase:
    process.env.WARDEN_NETWORK_PASSPHRASE ?? "Test SDF Network ; September 2015",
  demoAccountId:
    process.env.WARDEN_DEMO_ACCOUNT_ID ??
    "CCBXMG3RJUQUW6RNONDSLQUKL6P7YIYR6T56BCXLECMPA3TVCASAABOG",
  // warden-backend's indexer -- see that repo's README for how to run it
  // locally. NEXT_PUBLIC_ so it's also reachable from the client if a future
  // page fetches it in the browser instead of on the server.
  indexerUrl: process.env.NEXT_PUBLIC_INDEXER_URL ?? "http://localhost:8080",
};
