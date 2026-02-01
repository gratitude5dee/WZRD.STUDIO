export type MoltbookAgent = {
  id: string;
  name: string;
  karma: number;
  avatar_url: string | null;
  is_claimed: boolean;
  owner?: {
    x_handle?: string | null;
    x_verified?: boolean | null;
  } | null;
};

export type MoltbookVerifyResponse = {
  success?: boolean;
  valid: boolean;
  agent?: MoltbookAgent;
  error?: string;
};

const VERIFY_URL = "https://www.moltbook.com/api/v1/agents/verify-identity";

export async function verifyMoltbookIdentity(token: string): Promise<MoltbookVerifyResponse> {
  const appKey = Deno.env.get("MOLTBOOK_APP_KEY");
  if (!appKey) {
    return { valid: false, error: "missing_app_key" };
  }

  const audience = Deno.env.get("MOLTBOOK_AUDIENCE");

  const response = await fetch(VERIFY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Moltbook-App-Key": appKey,
    },
    body: JSON.stringify({
      token,
      ...(audience ? { audience } : {}),
    }),
  });

  const data = (await response.json()) as MoltbookVerifyResponse & {
    hint?: string;
  };

  return data;
}

export async function requireMoltbookAgent(req: Request): Promise<
  | { ok: true; agent: MoltbookAgent }
  | { ok: false; status: number; error: string }
> {
  const token = req.headers.get("x-moltbook-identity");

  if (!token) {
    return { ok: false, status: 401, error: "missing_identity_token" };
  }

  try {
    const result = await verifyMoltbookIdentity(token);

    if (!result.valid || !result.agent) {
      const error = result.error || "invalid_token";
      return { ok: false, status: 401, error };
    }

    return { ok: true, agent: result.agent };
  } catch (_error) {
    return { ok: false, status: 500, error: "verification_failed" };
  }
}
