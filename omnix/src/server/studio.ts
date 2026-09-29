import { GoogleGenAI } from "@google/genai";
import { Request, Response } from "express";

export const handleStudioTools = async (req: Request, res: Response) => {
  const { action, prompt, imageBase64, mimeType } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "API key required" });
  }

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
  });

  try {
    if (action === 'generate_image') {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.1-flash-lite-image',
          contents: prompt,
          config: {
            imageConfig: { aspectRatio: "1:1", imageSize: "1K" }
          }
        });
        for (const part of response.candidates?.[0]?.content?.parts || []) {
          if (part.inlineData) {
            return res.json({ result: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}` });
          }
        }
        return res.status(500).json({ error: "Failed to generate image" });
      } catch (err: any) {
        if (err.status === 429 || err.status === 'RESOURCE_EXHAUSTED' || (err.message && err.message.includes('429'))) {
          console.warn("Quota exceeded for gemini-3.1-flash-lite-image. Returning fallback image.");
          return res.json({ result: `https://picsum.photos/seed/${encodeURIComponent(prompt || 'fallback')}/1024/1024` });
        }
        throw err;
      }
    }

    if (action === 'remove_background') {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.1-flash-lite-image',
          contents: {
            parts: [
              { inlineData: { data: imageBase64, mimeType } },
              { text: "Remove the background from this image. Keep only the main subject and make the background completely transparent." }
            ]
          }
        });
        for (const part of response.candidates?.[0]?.content?.parts || []) {
          if (part.inlineData) {
            return res.json({ result: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}` });
          }
        }
        return res.status(500).json({ error: "Failed to remove background" });
      } catch (err: any) {
        if (err.status === 429 || err.status === 'RESOURCE_EXHAUSTED' || (err.message && err.message.includes('429'))) {
          console.warn("Quota exceeded for remove_background. Returning original image.");
          return res.json({ result: `data:${mimeType};base64,${imageBase64}` });
        }
        throw err;
      }
    }

    if (action === 'enhance_image') {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.1-flash-lite-image',
          contents: {
            parts: [
              { inlineData: { data: imageBase64, mimeType } },
              { text: "Enhance this image, upscale it, improve the quality, and reduce blur." }
            ]
          }
        });
        for (const part of response.candidates?.[0]?.content?.parts || []) {
          if (part.inlineData) {
            return res.json({ result: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}` });
          }
        }
        return res.status(500).json({ error: "Failed to enhance image" });
      } catch (err: any) {
        if (err.status === 429 || err.status === 'RESOURCE_EXHAUSTED' || (err.message && err.message.includes('429'))) {
          console.warn("Quota exceeded for enhance_image. Returning original image.");
          return res.json({ result: `data:${mimeType};base64,${imageBase64}` });
        }
        throw err;
      }
    }

    if (action === 'translate') {
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: `Translate the following text into the most appropriate language, or if specified, the requested language. Preserve the original formatting perfectly.\n\nText:\n${prompt}`
      });
      return res.json({ result: response.text });
    }

    if (action === 'ocr') {
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: {
          parts: [
            { inlineData: { data: imageBase64, mimeType } },
            { text: "Extract all text from this image exactly as it appears. Preserve the formatting. Detect the languages used and indicate them at the top in brackets like [Language: English, Spanish]. If there is no text, say 'No text detected'." }
          ]
        }
      });
      return res.json({ result: response.text });
    }

    if (action === 'generate_caption') {
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: `Generate a highly engaging social media caption based on this topic/prompt: "${prompt}". Make it catchy, include a few emojis, and format it nicely.`
      });
      return res.json({ result: response.text });
    }

    if (action === 'generate_hashtags') {
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: `Generate a list of trending and highly relevant hashtags (around 10-15) based on this topic or caption: "${prompt}". Return ONLY the hashtags, separated by spaces.`
      });
      return res.json({ result: response.text });
    }

    if (action === 'content_suggestions') {
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: `As an expert content strategist, generate 5 highly creative and viral post ideas for a content creator. The creator's niche/topic is: "${prompt}". For each idea, provide a catchy title, a short description, and recommended format (e.g. video, story, post).`
      });
      return res.json({ result: response.text });
    }

    if (action === 'detect_trends') {
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: `Analyze the current social media landscape and detect top viral trends, sounds, and challenges for content creators in the niche: "${prompt}". Provide actionable insights on how the creator can jump on these trends.`
      });
      return res.json({ result: response.text });
    }

    if (action === 'engagement_tips') {
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: `Provide 5 tailored and actionable tips to increase viewer engagement (likes, comments, shares, saves) for a creator focused on: "${prompt}".`
      });
      return res.json({ result: response.text });
    }

    return res.status(400).json({ error: "Invalid action" });
  } catch (error: any) {
    console.error("Studio Tool Error:", error);
    res.status(500).json({ error: error.message || "Failed to process request" });
  }
};
