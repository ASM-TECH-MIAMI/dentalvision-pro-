import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { imageDataUrl, analysisType } = await request.json();

    // Extract base64 from data URL
    const base64Data = imageDataUrl.split(',')[1];
    const mediaType = imageDataUrl.split(';')[0].split(':')[1]; // e.g. "image/jpeg"

    let prompt: string;

    if (analysisType === 'dental-analysis') {
      prompt = `You are an expert cosmetic dentist AI assistant for DentalVision Pro, a smile design platform used by Dr. Sam Saleh at Ora Dentistry Spa in Beverly Hills.

Analyze this dental/facial photo and provide a detailed clinical assessment. Return your analysis as JSON with this exact structure:

{
  "summary": "Brief 1-2 sentence overall assessment",
  "facial_analysis": {
    "symmetry_score": <number 0-100>,
    "symmetry_notes": "description of facial symmetry",
    "profile_type": "Class I" | "Class II" | "Class III",
    "lip_line": "high" | "medium" | "low",
    "smile_line": "consonant" | "flat" | "reverse"
  },
  "dental_observations": [
    {
      "tooth_region": "upper anterior" | "lower anterior" | "upper posterior" | "lower posterior",
      "observation": "detailed observation",
      "severity": "mild" | "moderate" | "significant"
    }
  ],
  "shade_assessment": {
    "estimated_current_shade": "VITA shade code like A2, A3, B1",
    "recommended_target_shade": "VITA shade code",
    "notes": "shade-related notes"
  },
  "treatment_suggestions": [
    {
      "procedure": "procedure name",
      "teeth": "tooth numbers or region",
      "rationale": "why this is recommended",
      "priority": "high" | "medium" | "low"
    }
  ],
  "smile_design_notes": "Detailed notes about smile design considerations including tooth proportions, gingival display, midline alignment, etc.",
  "confidence": <number 0-100>
}

Be specific, clinical, and professional. Reference specific teeth by FDI Universal numbering. If the image is not a dental photo, still try to analyze facial proportions and provide a smile assessment. Always return valid JSON.`;
    } else if (analysisType === 'treatment-narrative') {
      prompt = `You are an expert cosmetic dentist AI. Based on this dental photo, write a professional treatment plan narrative suitable for presenting to a patient at a luxury Beverly Hills dental spa.

Include:
1. Current assessment (what you observe)
2. Recommended procedures with rationale
3. Expected outcomes
4. Timeline estimate

Write in a warm, professional tone befitting Dr. Sam Saleh's practice at Ora Dentistry Spa. Be specific but reassuring. Keep it to 3-4 paragraphs.

Return as JSON:
{
  "narrative": "the full treatment narrative text",
  "headline": "short 5-8 word headline for the treatment plan",
  "estimated_procedures": <number>,
  "complexity": "straightforward" | "moderate" | "complex"
}`;
    } else {
      prompt = 'Describe what you see in this dental/facial photo in detail, focusing on the teeth, smile, and facial proportions.';
    }

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
                data: base64Data,
              },
            },
            {
              type: 'text',
              text: prompt,
            },
          ],
        },
      ],
    });

    // Extract text content
    const textBlock = message.content.find((block) => block.type === 'text');
    const responseText = textBlock?.type === 'text' ? textBlock.text : '';

    // Try to parse as JSON
    let parsed;
    try {
      // Find JSON in the response (it might be wrapped in markdown code blocks)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { raw: responseText };
    } catch {
      parsed = { raw: responseText };
    }

    return NextResponse.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Claude Vision API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Analysis failed' },
      { status: 500 }
    );
  }
}
