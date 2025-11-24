import { NextResponse } from 'next/server';
import { chatWithAgent } from '@/lib/gemini';

export async function POST(req: Request) {
  try {
    const { message, context } = await req.json();
    const response = await chatWithAgent(context, message);
    return NextResponse.json({ response });
  } catch (error) {
    return NextResponse.json({ error: "AI Error" }, { status: 500 });
  }
}
