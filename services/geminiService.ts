import { GoogleGenAI } from "@google/genai";

// Mapping user request for "Nano Banana 2" to the specific model ID
export const generateInfographic = async (
  topic: string, 
  styleDescription: string, 
  aspectRatio: string, 
  modelName: string,
  watermarkText?: string,
  showWatermark: boolean = true
): Promise<string> => {
  // Always create a new instance to ensure we pick up the latest API key from the environment
  // or the selection dialog if updated.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const watermarkInstruction = `5. Watermark: DO NOT include any watermarks, logos, or signatures on the image. The image should be clean of any branding or credits.`;

  const prompt = `
    Create a high-quality, educational infographic image.
    Topic: ${topic}
    
    VISUAL STYLE INSTRUCTIONS:
    ${styleDescription}
    
    CRITICAL REQUIREMENTS:
    1. Language: All text MUST be in RUSSIAN language (Русский язык).
    2. Accuracy: Ensure spelling and grammar are perfect.
    3. Accessibility: The content must be easy to understand for all ages.
    4. Layout: Clear hierarchy, using icons and large text for key points.
    5. Temporal Context: The current year is 2026. If the topic implies current events or dates, ensure the visual context aligns with the year 2026. Do not use outdated years unless historically relevant.
    ${watermarkInstruction}
    
    Do not produce photorealistic images unless the style specifically requests it. Focus on graphic design, clarity, and the requested aesthetic.
  `;

  let attempts = 0;
  const maxAttempts = 4;
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  while (attempts < maxAttempts) {
    try {
      // Слегка варьируем промпт при повторных попытках, чтобы изменить хэш запроса на бэкенде
      const variedPrompt = attempts > 0 
        ? `${prompt}\n\n(Variation: ${Math.random().toString(36).substring(7)})` 
        : prompt;

      // На последних попытках пробуем уменьшить разрешение, если это Flash модель
      const currentImageSize = (attempts >= 2 && modelName.includes('flash')) ? "512px" : "1K";

      const response = await ai.models.generateContent({
        model: modelName,
        contents: {
          parts: [
            {
              text: variedPrompt,
            },
          ],
        },
        config: {
          imageConfig: {
            aspectRatio: aspectRatio,
            imageSize: currentImageSize as any,
          },
        },
      });

      const candidate = response.candidates?.[0];
      
      if (!candidate) {
        throw new Error("Модель не вернула ни одного варианта ответа.");
      }

      const finishReason = candidate.finishReason;
      
      // Если это временная ошибка IMAGE_OTHER, пробуем еще раз с экспоненциальной задержкой
      if (finishReason === 'IMAGE_OTHER' && attempts < maxAttempts - 1) {
        attempts++;
        const backoffDelay = Math.pow(2, attempts) * 1000;
        console.warn(`Попытка ${attempts} не удалась (IMAGE_OTHER), повторяю через ${backoffDelay/1000} сек...`);
        await delay(backoffDelay);
        continue; 
      }

      if (finishReason === 'SAFETY') {
        throw new Error("Запрос заблокирован фильтрами безопасности. Попробуйте изменить тему или описание.");
      }
      if (finishReason === 'RECITATION') {
        throw new Error("Запрос заблокирован из-за обнаружения защищенного авторским правом контента.");
      }

      const parts = candidate.content?.parts;
      
      if (!parts || parts.length === 0) {
        if (finishReason && finishReason !== 'STOP') {
          throw new Error(`Генерация прервана. Причина: ${finishReason}`);
        }
        throw new Error("Модель вернула пустой ответ (нет данных изображения).");
      }

      let textFeedback = "";
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          const base64EncodeString = part.inlineData.data;
          const mimeType = part.inlineData.mimeType || 'image/png';
          return `data:${mimeType};base64,${base64EncodeString}`;
        }
        if (part.text) {
          textFeedback += part.text + " ";
        }
      }

      if (textFeedback.trim()) {
        throw new Error(`Изображение не создано. Ответ модели: ${textFeedback.trim()}`);
      }

      throw new Error("Данные изображения не найдены в ответе модели.");

    } catch (error: any) {
      // Если это последняя попытка или ошибка не связана с IMAGE_OTHER, выбрасываем её
      const isImageOther = error.message && error.message.includes("IMAGE_OTHER");
      
      if (attempts >= maxAttempts - 1 || !isImageOther) {
        console.error("Gemini API Error:", error);
        if (error.message && error.message.includes("Requested entity was not found")) {
          throw new Error("Ошибка API ключа: Пожалуйста, выберите валидный проект/ключ.");
        }
        throw new Error(error.message || "Не удалось создать инфографику.");
      }
      
      attempts++;
      const backoffDelay = Math.pow(2, attempts) * 1000;
      console.warn(`Попытка ${attempts} не удалась, повторяю через ${backoffDelay/1000} сек...`, error);
      await delay(backoffDelay);
    }
  }
  
  throw new Error("Не удалось создать изображение после нескольких попыток.");
};

export const rewriteText = async (text: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Ты профессиональный редактор. Твоя задача - переписать (сделать рерайт) предоставленного текста на русском языке.
      
      Контекст времени: Сейчас 2026 год. Учитывай это при редактировании текста, если в нем упоминаются текущие события, даты или относительное время (например, "в прошлом году", "сейчас").
      
      Требования:
      1. Полностью сохрани исходный смысл и факты.
      2. Сделай текст более читаемым, грамотным и стилистически согласованным.
      3. Убери тавтологию и словесный мусор.
      4. НЕ добавляй отсебятину, вступления (типа "Вот ваш текст") или заключения. Верни ТОЛЬКО переписанный текст.
      
      Исходный текст:
      ${text}`,
    });

    if (!response.text) {
      throw new Error("Пустой ответ от нейросети при переписывании текста.");
    }

    return response.text;
  } catch (error: any) {
    console.error("Rewrite Error:", error);
    if (error.message && error.message.includes("Requested entity was not found")) {
      throw new Error("Ошибка API ключа: Пожалуйста, выберите валидный проект/ключ.");
    }
    throw new Error(error.message || "Не удалось переписать текст.");
  }
};

export const checkApiKeySelection = async (): Promise<boolean> => {
  if (window.aistudio && window.aistudio.hasSelectedApiKey) {
    return await window.aistudio.hasSelectedApiKey();
  }
  // If running outside the specific environment that supports this, assume true or handle differently
  // ideally, this app expects the specific environment.
  return !!process.env.API_KEY; 
};

export const openApiKeySelection = async (): Promise<void> => {
  if (window.aistudio && window.aistudio.openSelectKey) {
    await window.aistudio.openSelectKey();
  }
};