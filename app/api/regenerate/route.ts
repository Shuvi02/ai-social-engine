import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import Groq from 'groq-sdk';
import { createServerClient } from '@supabase/ssr';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

export async function POST(request: Request) {
  try {
    const { campaignId, platform } = await request.json();

    if (!campaignId || !platform) {
      return NextResponse.json({ error: "Missing campaignId or platform" }, { status: 400 });
    }

    const cookieStore = await cookies();

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

    // 1. Fetch the original campaign
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('goal, input_data')
      .eq('id', campaignId)
      .single();

    if (campaignError || !campaign) {
      return NextResponse.json({ error: "Campaign not found in database" }, { status: 404 });
    }

    // 2. Set Platform Instructions dynamically
    let platformInstruction = "";
    switch (platform) {
      case "linkedin":
        platformInstruction = "LinkedIn: Professional tone, use bullet points, statistics, thought leadership angle, include relevant emojis sparingly.";
        break;
      case "instagram":
        platformInstruction = "Instagram: Very casual, fun, heavy emojis, storytelling style, strong CTA, line breaks for readability.";
        break;
      case "twitter":
        platformInstruction = "Twitter: Punchy one-liner, maximum impact in minimum words, trending hashtags style.";
        break;
      case "telegram":
        platformInstruction = "Telegram: Conversational, friendly, moderate emojis.";
        break;
      default:
        platformInstruction = "Create an engaging social media post.";
    }

    // 3. Prompt Groq for regeneration mapping
    const userPrompt = `
You are a social media expert. Generate a single highly creative, engaging social media post based on the following input.
Even if the input data is vague, be creative and fill in the gaps intelligently to create compelling content.

Goal: ${campaign.goal}
Details: ${JSON.stringify(campaign.input_data, null, 2)}

Platform requirements:
${platformInstruction}

IMPORTANT CRITERIA: Make this version significantly more creative and engaging than the previous one! Take a slightly different creative angle, incorporate a stronger hook, and ensure it commands attention perfectly tailored to this platform.

You must return the response ONLY as a JSON object with this exact structure:
{
  "content": "The regenerated post content...",
  "hashtags": ["#tag1", "#tag2"]
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

    // 4. Update the DB record correctly via upsert logic implicitly updated
    const { error: updateError } = await supabase
      .from('generated_posts')
      .update({
        content: generatedData.content,
        hashtags: generatedData.hashtags || []
      })
      .eq('campaign_id', campaignId)
      .eq('platform', platform);

    if (updateError) {
      console.error("Failed to update post in DB:", updateError);
      return NextResponse.json({ error: "Failed to push updated campaign data to database." }, { status: 500 });
    }

    // 5. Send updated platform content directly natively mapped to the UI caller
    return NextResponse.json({
      content: generatedData.content,
      hashtags: generatedData.hashtags || []
    });

  } catch (error: any) {
    console.error("System Error (Regenerate API):", error);
    return NextResponse.json(
      { error: error?.message || "An unexpected error occurred during partial campaign regeneration." },
      { status: 500 }
    );
  }
}
