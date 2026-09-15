import type { AssembledTransaction, MethodOptions } from "@stellar/stellar-sdk/contract";
import { Client as ContractClient } from "@stellar/stellar-sdk/contract";

import { config } from "./config";

interface ContextRule {
  id: number;
  name: string;
  context_type: unknown;
  signer_ids: unknown[];
  policy_ids: unknown[];
}

/**
 * The handful of `warden-smart-account` read methods this viewer calls,
 * typed by hand rather than generated -- see the repo README for why
 * codegen'd bindings are still an open item.
 */
interface WardenSmartAccountContract {
  get_context_rules_count(
    opts?: MethodOptions,
  ): Promise<AssembledTransaction<number>>;
  get_context_rule(
    args: { context_rule_id: number },
    opts?: MethodOptions,
  ): Promise<AssembledTransaction<ContextRule>>;
}

export interface ContextRuleView {
  id: number;
  name: string;
  contextType: unknown;
  signerCount: number;
  policyCount: number;
}

export interface AccountView {
  contractId: string;
  contextRules: ContextRuleView[];
}

/**
 * Reads a Warden smart account's on-chain state via a simulated (read-only,
 * unsigned) contract call -- no wallet needed. `contract.Client.from`
 * downloads the deployed contract's spec directly from its on-chain Wasm, so
 * this needs no generated bindings package yet; see the repo README for why
 * that's still an open item.
 */
export async function getAccountView(contractId: string): Promise<AccountView> {
  const client = await ContractClient.from<WardenSmartAccountContract>({
    contractId,
    rpcUrl: config.rpcUrl,
    networkPassphrase: config.networkPassphrase,
  });

  const countTx = await client.get_context_rules_count();
  const count = countTx.result;

  const contextRules: ContextRuleView[] = [];
  for (let id = 0; id < count; id++) {
    const ruleTx = await client.get_context_rule({ context_rule_id: id });
    const rule = ruleTx.result;
    contextRules.push({
      id: rule.id,
      name: rule.name,
      contextType: rule.context_type,
      signerCount: rule.signer_ids.length,
      policyCount: rule.policy_ids.length,
    });
  }

  return { contractId, contextRules };
}
