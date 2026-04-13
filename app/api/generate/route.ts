import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import Groq from 'groq-sdk';
import { createServerClient } from '@supabase/ssr';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

export async function POST(request: Request) {
  try {
    const { goal, formData } = await request.json();

    if (!goal || !formData) {
      return NextResponse.json({ error: "Missing goal or formData" }, { status: 400 });
    }

    // 1. Generate the social media posts using Groq
    const userPrompt = `
Generate a highly creative, engaging social media campaign based on the following input. Even if the input data is vague, be creative and fill in the gaps intelligently to create compelling content.

Goal: ${goal}
Details: ${JSON.stringify(formData, null, 2)}

Please generate exactly four versions of a post based on the goal and details above. Make each platform feel completely different and native to that platform:
1. LinkedIn: Professional tone, use bullet points, statistics, thought leadership angle, include relevant emojis sparingly.
2. Instagram: Very casual, fun, heavy emojis, storytelling style, strong CTA, line breaks for readability.
3. Twitter: Punchy one-liner, maximum impact in minimum words, trending hashtags style.
4. Telegram: Conversational, friendly, moderate emojis.

Each version must include relevant hashtags.
Return the response ONLY as a JSON object with this exact structure:
{
  "linkedin": { "content": "The post content...", "hashtags": ["#tag1", "#tag2"] },
  "instagram": { "content": "The post content...", "hashtags": ["#tag1", "#tag2"] },
  "twitter": { "content": "The post content...", "hashtags": ["#tag1", "#tag2"] },
  "telegram": { "content": "The post content...", "hashtags": ["#tag1", "#tag2"] }
}`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { 
          role: "system", 
          content: "You are a social media content expert." 
        },
        { 
          role: "user", 
          content: userPrompt 
        }
      ],
      response_format: { type: "json_object" }
    });

    const resultText = completion.choices[0]?.message?.content;
    
    if (!resultText) {
      throw new Error("No response received from Groq API.");
    }

    const generatedData = JSON.parse(resultText);

    // 2. Save the campaign and generated results to Supabase securely 
    const cookieStore = await cookies();

    // Use the modern Server Client provided by @supabase/ssr package automatically handling tokens
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    // Retrieve the active user tied directly to the backend cookie
    const { data: { user } } = await supabase.auth.getUser();

    console.log('Inserting campaign:', { user_id: user?.id, goal, input_data: formData });

    // Insert into 'campaigns' table
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .insert({ 
        goal, 
        input_data: formData,
        ...(user ? { user_id: user.id } : {}) 
      })
      .select('id')
      .single();

    console.log('Supabase error:', campaignError);
    console.log('Supabase data:', campaign);

    if (campaignError) {
      return NextResponse.json({ error: "Campaign insert failed", details: campaignError }, { status: 500 });
    }

    // Insert into 'generated_posts' table
    const postsToInsert = [
      {
        campaign_id: campaign.id,
        platform: 'linkedin',
        content: generatedData.linkedin?.content,
        hashtags: generatedData.linkedin?.hashtags || [],
      },
      {
        campaign_id: campaign.id,
        platform: 'instagram',
        content: generatedData.instagram?.content,
        hashtags: generatedData.instagram?.hashtags || [],
      },
      {
        campaign_id: campaign.id,
        platform: 'twitter',
        content: generatedData.twitter?.content,
        hashtags: generatedData.twitter?.hashtags || [],
      },
      {
        campaign_id: campaign.id,
        platform: 'telegram',
        content: generatedData.telegram?.content,
        hashtags: generatedData.telegram?.hashtags || [],
      }
    ];

    const { error: postsError } = await supabase
      .from('generated_posts')
      .insert(postsToInsert);

    if (postsError) {
      console.error("Post Mapping Error:", postsError);
      throw new Error("Failed to append the associated generated posts into mapping table.");
    }

    // Push the parsed results payload straight to the UI alongside the newly generated campaign mapping ID
    return NextResponse.json({ 
      ...generatedData, 
      campaignId: campaign.id 
    });

  } catch (error: any) {
    console.error("System Error (Server):", error);
    return NextResponse.json(
      { error: error?.message || "An unexpected error occurred during campaign output." },
      { status: 500 }
    );
  }
}
