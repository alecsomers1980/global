import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { text, context } = await req.json();

    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
      You are an expert copywriter for a premium preparatory school called Riverview Preparatory School.
      Rewrite the following event description to be more engaging, professional, and optimized for SEO.
      Keep it concise but impactful. Focus on the value for parents and students.
      
      Event Context: ${context || 'General School Event'}
      Original Description: ${text}
      
      Rewritten Description:
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const rewrittenText = response.text().trim();

    return NextResponse.json({ rewrittenText });
  } catch (error: any) {
    console.error('AI Rewrite Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
