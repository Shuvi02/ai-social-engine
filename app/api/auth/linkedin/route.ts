import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const campaignId = searchParams.get('campaignId');
  
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const redirectUri = `${baseUrl}/api/auth/linkedin/callback`;
  const scope = "openid profile email w_member_social";

  if (!clientId) {
    return NextResponse.json(
      { error: "LinkedIn OAuth environment variables missing LINKEDIN_CLIENT_ID." }, 
      { status: 500 }
    );
  }

  // Use state to pass campaignId back through the OAuth flow
  const state = campaignId ? `campaignId:${campaignId}` : Math.random().toString(36).substring(7);

  const linkedinAuthUrl = new URL('https://www.linkedin.com/oauth/v2/authorization');
  linkedinAuthUrl.searchParams.append('response_type', 'code');
  linkedinAuthUrl.searchParams.append('client_id', clientId);
  linkedinAuthUrl.searchParams.append('redirect_uri', redirectUri);
  linkedinAuthUrl.searchParams.append('state', state);
  linkedinAuthUrl.searchParams.append('scope', scope);
  linkedinAuthUrl.searchParams.append('prompt', 'login');

  return NextResponse.redirect(linkedinAuthUrl.toString());
}
