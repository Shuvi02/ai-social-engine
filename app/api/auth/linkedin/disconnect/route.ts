import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export async function DELETE() {
  try {
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
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { error: dbError } = await supabase
      .from('connected_accounts')
      .delete()
      .eq('user_id', user.id)
      .eq('platform', 'linkedin');

    if (dbError) throw new Error(`Failed to disconnect LinkedIn: ${dbError.message}`);

    return NextResponse.json({ success: true, message: 'LinkedIn account disconnected.' });

  } catch (error: any) {
    console.error('LinkedIn disconnect error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
