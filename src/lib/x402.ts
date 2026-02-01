import { wrapFetchWithPayment } from "thirdweb/x402";
import { thirdwebClient } from "@/lib/thirdweb";
import { useActiveWallet } from "thirdweb/react";

export function useX402Fetch(maxValue: bigint) {
  const wallet = useActiveWallet();

  if (!wallet) {
    return null;
  }

  return wrapFetchWithPayment(fetch, thirdwebClient, wallet, { maxValue });
}
