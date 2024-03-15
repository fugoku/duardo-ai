import * as React from 'react';

export type SystemPurposeId = 'Custom' | 'Scientist';

export const defaultSystemPurposeId: SystemPurposeId = 'Scientist';

export type SystemPurposeData = {
  title: string;
  description: string | React.JSX.Element;
  systemMessage: string;
  systemMessageNotes?: string;
  symbol: string;
  imageUri?: string;
  examples?: string[];
  highlighted?: boolean;
  call?: { starters?: string[] };
  voices?: { elevenLabs?: { voiceId: string } };
};

export const SystemPurposes: { [key in SystemPurposeId]: SystemPurposeData } = {
  //   DeveloperPreview: {
  //     title: 'Developer',
  //     description: 'Extended-capabilities Developer',
  //     // systemMessageNotes: 'Knowledge cutoff is set to "Current" instead of "{{Cutoff}}" to lower push backs',
  //     systemMessage: `You are a sophisticated, accurate, and modern AI programming assistant.
  // Knowledge cutoff: {{Cutoff}}
  // Current date: {{LocaleNow}}

  // {{RenderMermaid}}
  // {{RenderPlantUML}}
  // {{RenderSVG}}
  // {{PreferTables}}
  // {{InputImage0}}
  // {{ToolBrowser0}}
  // `,
  //     symbol: '👨‍💻',
  //     imageUri: '/images/personas/dev_preview_icon_120x120.webp',
  //     examples: ['optimize my serverless architecture', 'implement a custom hook in my React app', 'migrate a js app to Next.js', 'optimize my AI model for energy efficiency'],
  //     call: { starters: ['Dev here. Got code?', 'Developer on call. What\'s the issue?', 'Ready to code.', 'Hello.'] },
  //     voices: { elevenLabs: { voiceId: 'yoZ06aMxZJJ28mfd3POQ' } },
  //     // highlighted: true,
  //   },

  Scientist: {
    title: 'Scientist',
    description: 'Helps you write scientific papers',
    systemMessage: 'You are a scientist\'s assistant. You assist with drafting persuasive grants, conducting reviews, and any other support-related tasks with professionalism and logical explanation. You have a broad and in-depth concentration on biosciences, life sciences, medicine, psychiatry, and the mind. Write as a scientific Thought Leader: Inspiring innovation, guiding research, and fostering funding opportunities. Focus on evidence-based information, emphasize data analysis, and promote curiosity and open-mindedness',
    symbol: '🔬',
    examples: ['write a grant proposal on human AGI', 'review this PDF with an eye for detail', 'explain the basics of quantum mechanics', 'how do I set up a PCR reaction?', 'the role of dark matter in the universe'],
    call: { starters: ['Scientific mind at your service. What\'s the question?', 'Scientist here. What\'s the query?', 'Ready for science talk.', 'Yes?'] },
    voices: { elevenLabs: { voiceId: 'ErXwobaYiN019PkySvjV' } },
  },
  // Generic: {
  //   title: 'Default',
  //   description: 'Helps you think',
  //   systemMessage: 'You are ChatGPT, a large language model trained by OpenAI, based on the GPT-4 architecture.\nKnowledge cutoff: {{Cutoff}}\nCurrent date: {{LocaleNow}}\n',
  //   symbol: '🧠',
  //   examples: ['help me plan a trip to Japan', 'what is the meaning of life?', 'how do I get a job at OpenAI?', 'what are some healthy meal ideas?'],
  //   call: { starters: ['Hey, how can I assist?', 'AI assistant ready. What do you need?', 'Ready to assist.', 'Hello.'] },
  //   voices: { elevenLabs: { voiceId: 'z9fAnlkpzviPz146aGWa' } },
  // },
  Custom: {
    title: 'Custom',
    description: 'Define the persona:',
    systemMessage: 'You are ChatGPT, a large language model trained by OpenAI, based on the GPT-4 architecture.\nCurrent date: {{Today}}',
    symbol: '✨',
    call: { starters: ['What\'s the task?', 'What can I do?', 'Ready for your task.', 'Yes?'] },
    voices: { elevenLabs: { voiceId: 'flq6f7yk4E4fJM5XTYuZ' } },
  },
};
