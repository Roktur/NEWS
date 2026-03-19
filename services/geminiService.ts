import { AIModel } from '../types';

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

export const DEFAULT_MODELS: AIModel[] = [
  { id: 'nano-banana-2', label: 'Nano Banana 2 (Быстрая)', model: 'google/gemini-3.1-flash-image-preview' },
  { id: 'nano-banana-pro', label: 'Nano Banana Pro (Качественная)', model: 'google/gemini-3-pro-image-preview' },
];

export const validateApiKey = async (key: string): Promise<boolean> => {
  try {
    const res = await fetch(`${OPENROUTER_BASE_URL}/auth/key`, {
      headers: { Authorization: `Bearer ${key}` },
    });
    return res.ok;
  } catch {
    return false;
  }
};

export const generateInfographic = async (
  apiKey: string,
  topic: string,
  styleDescription: string,
  aspectRatio: string,
  modelName: string,
  watermarkText?: string,
  showWatermark: boolean = true,
  watermarkPosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' = 'bottom-right'
): Promise<string> => {
  const positionLabels = {
    'top-left':     'top-left corner',
    'top-right':    'top-right corner',
    'bottom-left':  'bottom-left corner',
    'bottom-right': 'bottom-right corner',
  };
  const watermarkInstruction = showWatermark && watermarkText
    ? `Watermark: Place the text "${watermarkText}" as a subtle semi-transparent watermark in the ${positionLabels[watermarkPosition]} of the image. Use small font size.`
    : `Watermark: DO NOT include any watermarks, logos, or signatures on the image. The image must be completely clean of any branding or credits.`;

  const aspectRatioMap: Record<string, string> = {
    '1:1':  'Square (1:1) — equal width and height.',
    '3:4':  'Portrait (3:4) — taller than wide, like a vertical post or story card.',
    '9:16': 'Vertical Stories (9:16) — tall narrow format, like Instagram/VK Stories.',
    '16:9': 'Landscape (16:9) — wide horizontal format, like a YouTube thumbnail or banner.',
  };
  const ratioInstruction = aspectRatioMap[aspectRatio] || `Aspect ratio: ${aspectRatio}.`;

  const prompt = `Create a high-quality, educational infographic image.
Topic: ${topic}

IMAGE FORMAT: ${ratioInstruction} STRICTLY follow this aspect ratio — the canvas must match this proportion exactly.

VISUAL STYLE INSTRUCTIONS:
${styleDescription}

CRITICAL REQUIREMENTS:
1. RUSSIAN LANGUAGE — MANDATORY: Every single word, letter, and character on the image MUST be in correct, literary Russian (Русский язык). This is the most important requirement.
2. GRAMMAR & SPELLING — ZERO ERRORS ALLOWED: Apply strict Russian grammar rules. Check every word for correct spelling, declension, conjugation, punctuation, and stress. Do NOT transliterate. Do NOT mix languages. Proofread every text element before rendering.
3. Accessibility: The content must be easy to understand for all ages.
4. Layout: Clear hierarchy, using icons and large text for key points. Adapt the layout to the specified aspect ratio.
5. Temporal Context: The current year is 2026. Use this ONLY for background context. DO NOT explicitly write "2026" on the image unless the user's topic specifically includes it. Do not invent dates.
6. Text Additions: You MUST include the main text provided in the "Topic". You MAY add short, punchy extra text (like labels, callouts, reactions, or short facts) IF AND ONLY IF it is highly relevant to the topic and directly enhances the message. DO NOT add random, meaningless, or hallucinated text just to fill space.
7. ${watermarkInstruction}

Do not produce photorealistic images unless the style specifically requests it. Focus on graphic design, clarity, and the requested aesthetic.`;

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  const maxAttempts = 4;

  for (let attempts = 0; attempts < maxAttempts; attempts++) {
    try {
      const variedPrompt = attempts > 0
        ? `${prompt}\n\n(Variation: ${Math.random().toString(36).substring(7)})`
        : prompt;

      const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://news-reggions.app',
          'X-Title': 'News Reggions Infographics',
        },
        body: JSON.stringify({
          model: modelName,
          messages: [{ role: 'user', content: variedPrompt }],
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        const errMsg = (errData as any)?.error?.message || response.statusText;
        if (response.status === 401) throw new Error('Неверный API ключ OpenRouter.');
        if (response.status === 429) {
          if (attempts < maxAttempts - 1) {
            await delay(Math.pow(2, attempts + 1) * 1000);
            continue;
          }
          throw new Error('Превышен лимит запросов. Попробуйте позже.');
        }
        throw new Error(errMsg || `Ошибка API: ${response.status}`);
      }

      const data = await response.json();
      const message = data?.choices?.[0]?.message;

      if (!message) throw new Error('Модель не вернула ответа.');

      // 1. message.images — OpenRouter field for image generation models
      // Format: [{ type: "image_url", image_url: { url: "data:image/..." } }]
      const images = message.images;
      if (Array.isArray(images) && images.length > 0) {
        for (const img of images) {
          if (typeof img === 'string') return img.startsWith('data:image/') ? img : `data:image/png;base64,${img}`;
          if (img?.image_url?.url) return img.image_url.url;
          if (img?.url) return img.url;
          if (img?.b64_json) return `data:image/png;base64,${img.b64_json}`;
        }
      }

      // 2. message.content as array of parts
      const content = message.content;
      if (Array.isArray(content)) {
        for (const part of content) {
          if (part.type === 'image_url' && part.image_url?.url) return part.image_url.url;
          if (part.type === 'image' && part.source?.data) return `data:${part.source.media_type || 'image/png'};base64,${part.source.data}`;
          if (part.type === 'inline_data' && part.inline_data?.data) return `data:${part.inline_data.mime_type || 'image/png'};base64,${part.inline_data.data}`;
          if (part.type === 'text' && typeof part.text === 'string' && part.text.startsWith('data:image/')) return part.text;
        }
        const textParts = content.filter((p: any) => p.type === 'text').map((p: any) => p.text).join(' ');
        if (textParts) throw new Error(`Изображение не создано. Ответ модели: ${textParts.substring(0, 300)}`);
      }

      // 3. message.content as plain string
      if (typeof content === 'string' && content.trim()) {
        if (content.startsWith('data:image/')) return content;
        throw new Error(`Изображение не создано. Ответ модели: ${content.substring(0, 300)}`);
      }

      // Retry on empty response
      if (attempts < maxAttempts - 1) {
        await delay(Math.pow(2, attempts + 1) * 1000);
        continue;
      }

      throw new Error('Данные изображения не найдены в ответе модели.');
    } catch (error: any) {
      if (attempts >= maxAttempts - 1) {
        throw new Error(error.message || 'Не удалось создать инфографику.');
      }
      await delay(Math.pow(2, attempts + 1) * 1000);
    }
  }

  throw new Error('Не удалось создать изображение после нескольких попыток.');
};

export const rewriteText = async (apiKey: string, text: string): Promise<string> => {
  const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://news-reggions.app',
      'X-Title': 'News Reggions Infographics',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.0-flash-001',
      messages: [
        {
          role: 'user',
          content: `Ты профессиональный редактор. Твоя задача — сделать рерайт предоставленного текста на русском языке.

Требования:
1. Полностью сохрани исходный смысл и факты.
2. Сделай текст более читаемым, грамотным и стилистически согласованным.
3. Убери тавтологию и словесный мусор.
4. НЕ добавляй отсебятину, вступления или заключения. Верни ТОЛЬКО переписанный текст.

Исходный текст:
${text}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const errMsg = (errData as any)?.error?.message || response.statusText;
    if (response.status === 401) throw new Error('Неверный API ключ OpenRouter.');
    throw new Error(errMsg || 'Не удалось переписать текст.');
  }

  const data = await response.json();
  const result = data?.choices?.[0]?.message?.content;

  if (!result || typeof result !== 'string') {
    throw new Error('Пустой ответ от нейросети при переписывании текста.');
  }

  return result;
};
