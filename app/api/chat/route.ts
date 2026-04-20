import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';

const client = new OpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey: process.env.DEEPSEEK_API_KEY,
});

export async function POST(req: NextRequest) {
    const { messages, temperature = 0.7 } = await req.json();

    try {
        const completion = await client.chat.completions.create({
            model: 'deepseek-chat',
            messages,
            temperature,
        });

        return NextResponse.json(completion);
    } catch (error: any) {
        console.error('DeepSeek error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
