import { createThirdwebClient } from "thirdweb";
import type { ThirdwebClient } from "thirdweb";
import { supabase } from "@/integrations/supabase/client";

let thirdwebClientInstance: ThirdwebClient | null = null;
let clientIdPromise: Promise<string> | null = null;

async function fetchClientId(): Promise<string> {
  const { data, error } = await supabase.functions.invoke('get-thirdweb-config');
  
  if (error || !data?.clientId) {
    console.error('Failed to fetch Thirdweb config:', error);
    throw new Error('Failed to fetch Thirdweb configuration');
  }
  
  return data.clientId;
}

export async function getThirdwebClient(): Promise<ThirdwebClient> {
  if (thirdwebClientInstance) {
    return thirdwebClientInstance;
  }
  
  if (!clientIdPromise) {
    clientIdPromise = fetchClientId();
  }
  
  const clientId = await clientIdPromise;
  thirdwebClientInstance = createThirdwebClient({ clientId });
  
  return thirdwebClientInstance;
}

export function getThirdwebClientSync(): ThirdwebClient | null {
  return thirdwebClientInstance;
}
