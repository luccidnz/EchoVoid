export const PROMPT_THEMES: Record<string, string[]> = {
  identity: [
    'Who are you?',
    'What is your name?',
    'Are you human?',
  ],
  presence: [
    'Are you here with us?',
    'Why are you here?',
    'Can you show a sign?'
  ],
  time: [
    'What year is it for you?',
    'How long have you been here?',
    'Do you remember the day you left?'
  ],
};

const FLAT_PROMPTS = Object.values(PROMPT_THEMES).flat();
let promptIndex = 0;

export function nextPrompt(): string {
  if (FLAT_PROMPTS.length === 0) return '';
  const q = FLAT_PROMPTS[promptIndex % FLAT_PROMPTS.length];
  promptIndex += 1;
  return q;
}

