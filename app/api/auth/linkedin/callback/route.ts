import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: 'Missing authorization code from LinkedIn.' }, { status: 400 });
  }

  try {
    // 1. Exchange authorization code for access token
    const tokenRes = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/auth/linkedin/callback`,
        client_id: process.env.LINKEDIN_CLIENT_ID || '',
        client_secret: process.env.LINKEDIN_CLIENT_SECRET || '',
      }),
    });

    if (!tokenRes.ok) {
      const text = await tokenRes.text();
      throw new Error(`LinkedIn token exchange failed: ${text}`);
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    // 2. Fetch user profile from LinkedIn userinfo endpoint
    const profileRes = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!profileRes.ok) {
      const text = await profileRes.text();
      throw new Error(`Failed to fetch LinkedIn user profile: ${text}`);
    }

    // Profile data available if needed for future use
    await profileRes.json();

    // 3. Init Supabase SSR client
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) { return cookieStore.get(name)?.value; },
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in before connecting LinkedIn.' }, { status: 401 });
    }

    // 4. Save access token to connected_accounts
    const { error: dbError } = await supabase
      .from('connected_accounts')
      .upsert(
        { user_id: user.id, platform: 'linkedin', access_token: accessToken },
        { onConflict: 'user_id,platform' }
      );

    if (dbError) throw new Error(`Failed to save LinkedIn credentials: ${dbError.message}`);

    // 5. Redirect to preview dashboard on success
    return NextResponse.redirect(new URL('/dashboard/preview', request.url));

  } catch (error: any) {
    console.error('LinkedIn OAuth callback error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
