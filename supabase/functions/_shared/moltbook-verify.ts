// Moltbook Identity Verification Helper
// Currently using mock data - swap to real API when MOLTBOOK_APP_KEY is available

interface MoltbookAgent {
  id: string;
  name: string;
  karma: number;
  avatar_url: string | null;
  is_claimed: boolean;
  follower_count: number;
  following_count: number;
  stats: {
    posts: number;
    comments: number;
  };
  owner: {
    x_handle: string;
    x_name: string;
    x_avatar: string;
    x_verified: boolean;
    x_follower_count: number;
  } | null;
}

interface VerifySuccess {
  success: true;
  valid: true;
  agent: MoltbookAgent;
}

interface VerifyError {
  success: false;
  valid: false;
  error: string;
}

type VerifyResult = VerifySuccess | VerifyError;

// Mock agents for testing
const MOCK_AGENTS: Record<string, MoltbookAgent> = {
  mock_agent_1: {
    id: "moltbook_agent_001",
    name: "MogBot",
    karma: 420,
    avatar_url: "https://api.dicebear.com/7.x/bottts/svg?seed=MogBot",
    is_claimed: true,
    follower_count: 1250,
    following_count: 42,
    stats: { posts: 156, comments: 892 },
    owner: {
      x_handle: "moggy_owner",
      x_name: "Moggy Creator",
      x_avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=moggy",
      x_verified: true,
      x_follower_count: 15000,
    },
  },
  mock_agent_2: {
    id: "moltbook_agent_002",
    name: "StreamerBot",
    karma: 150,
    avatar_url: "https://api.dicebear.com/7.x/bottts/svg?seed=StreamerBot",
    is_claimed: true,
    follower_count: 320,
    following_count: 15,
    stats: { posts: 45, comments: 230 },
    owner: null,
  },
  test_token: {
    id: "moltbook_agent_test",
    name: "TestAgent",
    karma: 100,
    avatar_url: "https://api.dicebear.com/7.x/bottts/svg?seed=TestAgent",
    is_claimed: false,
    follower_count: 10,
    following_count: 5,
    stats: { posts: 5, comments: 20 },
    owner: {
      x_handle: "test_owner",
      x_name: "Test Owner",
      x_avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=test",
      x_verified: false,
      x_follower_count: 500,
    },
  },
};

// Mocked verification function
function mockVerify(token: string): VerifyResult {
  // Simulate error cases
  if (token === "expired_token") {
    return { success: false, valid: false, error: "identity_token_expired" };
  }
  if (token === "invalid_token") {
    return { success: false, valid: false, error: "invalid_token" };
  }

  // Check for known mock agents
  const mockAgent = MOCK_AGENTS[token];
  if (mockAgent) {
    return { success: true, valid: true, agent: mockAgent };
  }

  // For any other token, create a dynamic mock agent
  return {
    success: true,
    valid: true,
    agent: {
      id: `moltbook_agent_${token.slice(0, 8)}`,
      name: `Agent_${token.slice(0, 6)}`,
      karma: Math.floor(Math.random() * 500) + 50,
      avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${token}`,
      is_claimed: true,
      follower_count: Math.floor(Math.random() * 1000),
      following_count: Math.floor(Math.random() * 100),
      stats: {
        posts: Math.floor(Math.random() * 100),
        comments: Math.floor(Math.random() * 500),
      },
      owner: null,
    },
  };
}

// Real API verification function (ready to enable when API key arrives)
async function realVerify(token: string, audience: string): Promise<VerifyResult> {
  const appKey = Deno.env.get("MOLTBOOK_APP_KEY");
  
  if (!appKey) {
    console.error("MOLTBOOK_APP_KEY not configured");
    return { success: false, valid: false, error: "invalid_app_key" };
  }

  try {
    const response = await fetch("https://moltbook.com/api/v1/agents/verify-identity", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Moltbook-App-Key": appKey,
      },
      body: JSON.stringify({ token, audience }),
    });

    const data = await response.json();
    return data as VerifyResult;
  } catch (error) {
    console.error("Moltbook API error:", error);
    return { success: false, valid: false, error: "api_error" };
  }
}

// Main export - currently uses mock, swap when ready
export async function verifyMoltbookIdentity(
  token: string,
  audience: string = "mog.lovable.app"
): Promise<VerifyResult> {
  // TODO: Uncomment this line and remove mockVerify when MOLTBOOK_APP_KEY is available
  // return await realVerify(token, audience);
  
  // Using mock verification for development
  console.log(`[Moltbook Mock] Verifying token: ${token.slice(0, 10)}...`);
  return mockVerify(token);
}
