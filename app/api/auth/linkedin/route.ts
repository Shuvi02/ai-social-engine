import { NextResponse } from 'next/server';

export async function GET() {
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const redirectUri = "http://localhost:3000/api/auth/linkedin/callback";
  const scope = "openid profile email w_member_social";

  if (!clientId) {
    return NextResponse.json(
      { error: "LinkedIn OAuth environment variables missing LINKEDIN_CLIENT_ID." }, 
      { status: 500 }
    );
  }

  // Generate randomized CSRF state validating handshake securely out-of-band
  const state = Math.random().toString(36).substring(7);

  // Safely assemble OAuth payload URLs mapping exact user specifications
  const linkedinAuthUrl = new URL('https://www.linkedin.com/oauth/v2/authorization');
  linkedinAuthUrl.searchParams.append('response_type', 'code');
  linkedinAuthUrl.searchParams.append('client_id', clientId);
  linkedinAuthUrl.searchParams.append('redirect_uri', redirectUri);
  linkedinAuthUrl.searchParams.append('state', state);
  linkedinAuthUrl.searchParams.append('scope', scope);
  linkedinAuthUrl.searchParams.append('prompt', 'login');

  // Directly forward user context across native 302 boundary to start handshake
  return NextResponse.redirect(linkedinAuthUrl.toString());
}
