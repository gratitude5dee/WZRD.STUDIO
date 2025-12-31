// ============================================================================
// EDGE FUNCTION: newsletter-subscribe
// PURPOSE: Handle newsletter subscriptions with email validation and storage
// ROUTE: POST /functions/v1/newsletter-subscribe
// ============================================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';
import { corsHeaders, errorResponse, successResponse, handleCors } from '../_shared/response.ts';

interface SubscribeRequest {
  email: string;
  source?: string;
  preferences?: {
    productUpdates?: boolean;
    tips?: boolean;
    promotions?: boolean;
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return handleCors();
  }

  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return errorResponse('Method not allowed', 405);
    }

    // Create Supabase admin client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Parse request body
    const body: SubscribeRequest = await req.json();
    const { email, source = 'unknown', preferences } = body;

    if (!email) {
      return errorResponse('Email is required', 400);
    }

    // Validate email format
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!emailRegex.test(email)) {
      return errorResponse('Invalid email format', 400);
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if already subscribed
    const { data: existing } = await supabaseClient
      .from('newsletter_subscribers')
      .select('id, is_active, unsubscribed_at')
      .eq('email', normalizedEmail)
      .single();

    if (existing) {
      if (existing.is_active) {
        return successResponse({
          success: true,
          message: 'Already subscribed',
          alreadySubscribed: true,
        });
      } else {
        // Reactivate subscription
        await supabaseClient
          .from('newsletter_subscribers')
          .update({
            is_active: true,
            unsubscribed_at: null,
            resubscribed_at: new Date().toISOString(),
            source: source,
          })
          .eq('id', existing.id);

        return successResponse({
          success: true,
          message: 'Subscription reactivated',
          reactivated: true,
        });
      }
    }

    // Create new subscription
    const { data: subscriber, error: insertError } = await supabaseClient
      .from('newsletter_subscribers')
      .insert({
        email: normalizedEmail,
        source,
        subscribed_at: new Date().toISOString(),
        is_active: true,
        metadata: {
          preferences,
          ip: req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for'),
          userAgent: req.headers.get('user-agent'),
        },
      })
      .select()
      .single();

    if (insertError) {
      console.error('Subscription insert error:', insertError);
      if (insertError.code === '23505') {
        return successResponse({
          success: true,
          message: 'Already subscribed',
          alreadySubscribed: true,
        });
      }
      return errorResponse('Failed to subscribe', 500, insertError.message);
    }

    // Send welcome email via Resend (optional)
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (RESEND_API_KEY) {
      try {
        const appUrl = Deno.env.get('APP_URL') ?? 'https://wzrd.studio';

        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'WZRD Studio <newsletter@wzrd.studio>',
            to: [normalizedEmail],
            subject: 'Welcome to WZRD Studio!',
            html: `
              <!DOCTYPE html>
              <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Welcome to WZRD Studio</title>
                <style>
                  body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    margin: 0;
                    padding: 0;
                    background-color: #f5f5f5;
                  }
                  .container {
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 40px 20px;
                  }
                  .card {
                    background: #ffffff;
                    border-radius: 12px;
                    padding: 40px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                  }
                  .logo {
                    text-align: center;
                    margin-bottom: 30px;
                  }
                  .logo span {
                    font-size: 28px;
                    font-weight: bold;
                    background: linear-gradient(135deg, #8B5CF6, #6366F1);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                  }
                  h1 {
                    color: #1a1a1a;
                    font-size: 24px;
                    margin-bottom: 20px;
                    text-align: center;
                  }
                  .button {
                    display: inline-block;
                    padding: 14px 32px;
                    background: linear-gradient(135deg, #8B5CF6, #6366F1);
                    color: white !important;
                    text-decoration: none;
                    border-radius: 8px;
                    font-weight: 600;
                    font-size: 16px;
                    margin: 20px 0;
                  }
                  .feature {
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                    margin: 16px 0;
                    padding: 12px;
                    background: #f8f8f8;
                    border-radius: 8px;
                  }
                  .feature-icon {
                    font-size: 20px;
                  }
                  .footer {
                    margin-top: 30px;
                    padding-top: 20px;
                    border-top: 1px solid #eee;
                    color: #666;
                    font-size: 13px;
                    text-align: center;
                  }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="card">
                    <div class="logo">
                      <span>WZRD Studio</span>
                    </div>
                    <h1>Welcome to the future of AI creativity!</h1>
                    <p>Thanks for subscribing to WZRD Studio updates. Here's what you can expect:</p>

                    <div class="feature">
                      <span class="feature-icon">✨</span>
                      <div>
                        <strong>New AI Models</strong>
                        <p style="margin: 4px 0 0; color: #666; font-size: 14px;">
                          Be the first to know when we add cutting-edge AI models.
                        </p>
                      </div>
                    </div>

                    <div class="feature">
                      <span class="feature-icon">🎨</span>
                      <div>
                        <strong>Creative Tips</strong>
                        <p style="margin: 4px 0 0; color: #666; font-size: 14px;">
                          Learn prompting techniques and workflow best practices.
                        </p>
                      </div>
                    </div>

                    <div class="feature">
                      <span class="feature-icon">🚀</span>
                      <div>
                        <strong>Feature Updates</strong>
                        <p style="margin: 4px 0 0; color: #666; font-size: 14px;">
                          Get early access to new features and improvements.
                        </p>
                      </div>
                    </div>

                    <p style="text-align: center;">
                      <a href="${appUrl}" class="button">Start Creating</a>
                    </p>

                    <div class="footer">
                      <p>You're receiving this because you subscribed to WZRD Studio.</p>
                      <p>
                        <a href="${appUrl}/unsubscribe?email=${encodeURIComponent(normalizedEmail)}" style="color: #666;">
                          Unsubscribe
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
              </body>
              </html>
            `,
          }),
        });
      } catch (emailError) {
        console.error('Welcome email error:', emailError);
        // Don't fail the subscription if email fails
      }
    }

    return successResponse({
      success: true,
      message: 'Successfully subscribed',
      subscriberId: subscriber.id,
    });

  } catch (error) {
    console.error('Newsletter subscribe error:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Failed to subscribe',
      500
    );
  }
});
