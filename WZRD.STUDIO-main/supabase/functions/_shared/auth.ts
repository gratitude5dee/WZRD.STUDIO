
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Custom error class for authentication errors
export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

/**
 * Authenticates a request using the JWT from the Authorization header
 * @param headers Request headers containing the JWT
 * @returns The authenticated user object
 * @throws AuthError if authentication fails
 */
export async function authenticateRequest(headers: Headers) {
  const authHeader = headers.get('Authorization');
  if (!authHeader) {
    throw new AuthError('Missing authorization header');
  }

  const token = authHeader.replace('Bearer ', '');
  
  // Create a Supabase client with the service role key
  const supabaseClient = createClient(
    // @ts-ignore
    Deno.env.get('SUPABASE_URL') ?? '',
    // @ts-ignore
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const { data: { user }, error } = await supabaseClient.auth.getUser(token);

  if (error || !user) {
    console.error('Authentication error:', error?.message);
    throw new AuthError(error?.message || 'Invalid authentication token');
  }

  return user;
}
