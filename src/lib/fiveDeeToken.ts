// $5DEE Token Configuration for Creator Payouts
// Contract deployed on Monad testnet

export const FIVE_DEE_CONTRACT_ADDRESS = "0x954fA8cfb797a26D4878ee212004889a2C9D7624";

// Payout rates in $5DEE tokens
export const PAYOUT_RATES = {
  view: 1,
  like: 5,
  comment: 10,
  share: 3,
  bookmark: 2,
} as const;

export type PayoutActionType = keyof typeof PAYOUT_RATES;

// Format $5DEE amount for display
export function formatFiveDee(amount: number): string {
  return `${amount} $5DEE`;
}

// Check if simulation mode is enabled (no private key configured)
export const isSimulationMode = true; // Will be false when PAYOUT_WALLET_PRIVATE_KEY is set
