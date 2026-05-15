const fallbackPrompts = [
  'Can you elaborate on that?',
  'What are you sensing now?',
  'Tell us something unexpected.'
];

export async function generatePromptSuggestions(context: string): Promise<string[]> {
  const key = (globalThis as any).OPENAI_API_KEY as string | undefined;
  if (!key) return fallbackPrompts;
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You generate concise follow-up prompts.' },
          { role: 'user', content: `Provide three follow-up prompts for: ${context}` }
        ]
      })
    });
    const json = await res.json();
    const text: string = json?.choices?.[0]?.message?.content || '';
    const lines = text.split('\n').map((l: string) => l.replace(/^[-*\d\.\s]+/, '').trim()).filter(Boolean);
    return lines.length ? lines.slice(0, 3) : fallbackPrompts;
  } catch (err) {
    console.warn('prompt generation failed', err);
    return fallbackPrompts;
  }
}
