import OpenAI from "openai";

const client = new OpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey: process.env.DEEPSEEK_API_KEY,
});

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { messages, temperature = 0.7 } = req.body;

    try {
        const completion = await client.chat.completions.create({
            model: 'deepseek-chat',
            messages,
            temperature,
        });

        res.status(200).json(completion);
    } catch (error) {
        console.error('DeepSeek error:', error);
        res.status(500).json({ error: error.message });
    }
}
