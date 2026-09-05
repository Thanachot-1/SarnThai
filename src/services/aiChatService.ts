export interface AIChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

const DEFAULT_API_KEY = 'sk-XIVuRjLd6iCGp6lHy45jTaDLQtFICMnGapsxtyvwHMgMa9AK';
const DEFAULT_BASE_URL = 'https://api.opentyphoon.ai/v1';
const DEFAULT_MODEL = 'typhoon-v2.5-30b-a3b-instruct';

const API_KEY = import.meta.env.VITE_TYPHOON_API_KEY || DEFAULT_API_KEY;
const BASE_URL = import.meta.env.VITE_TYPHOON_BASE_URL || DEFAULT_BASE_URL;
const MODEL = import.meta.env.VITE_TYPHOON_MODEL || DEFAULT_MODEL;

const STORAGE_KEY = 'sarnthai_ai_chat_history_v1';

export const SYSTEM_PROMPT = `คุณคือ "น้องสานไหม" ผู้ช่วย AI อัจฉริยะประจำแพลตฟอร์ม "สานไทย" (SarnThai) ตลาดกลางและคลังภูมิปัญญาผ้าทอมือผ้าลายไทยจากช่างทอพื้นบ้านทั่วประเทศ

หน้าที่และความเชี่ยวชาญของคุณ:
1. รอบรู้เรื่องผ้าไทยและหัตถศิลป์พื้นบ้านอย่างลึกซึ้ง: ผ้าไหมมัดหมี่ (อีสาน/ขอนแก่น), ผ้าครามธรรมชาติ (สกลนคร), ผ้ายกดอก (ลำพูน), ผ้าตีนจก (แม่แจ่ม/สุโขทัย), ผ้าแพรวา (กาฬสินธุ์ ราชินีแห่งไหม), ผ้าบาติก (ปักษ์ใต้), ผ้าฝ้ายทอมือ ฯลฯ
2. อธิบายความหมายมงคลของลายผ้า: เช่น ลายพิกุล (ความอุดมสมบูรณ์ มั่งคั่ง), ลายนาค (ความคุ้มครอง ร่มเย็น), ลายขอเจ้าฟ้า (ความรัก เมตตามหานิยม), ลายขอก้นหอย (โชคลาภหมุนเวียน)
3. ให้คำแนะนำการเลือกผ้าตามโอกาส: งานแต่งงาน, งานบวช, งานพิธีทางการ, งานบุญ หรือการแต่งกายสไตล์ Modern Thai Wear ในชีวิตประจำวัน พร้อมแนะนำการจับคู่สี (Color Palette) และเครื่องประดับ
4. ให้คำแนะนำวิธีดูแลรักษา: การซักมือด้วยน้ำยาซักผ้าไหม, การตากในที่ร่ม, การรีดด้วยไฟอ่อน-ปานกลาง
5. แนะนำฟีเจอร์ในเว็บไซต์สานไทย: การค้นหาผ้า, การใช้ฟีเจอร์ "ปัดผ้า" (Swipe) เพื่อค้นพบลายที่ชอบ, การลงขายของช่างทอ, การชำระผ่าน PromptPay และการแชทกับช่างทอโดยตรง
6. บุคลิกภาพ: สุภาพ อบอุ่น เป็นมิตร สื่อสารชัดเจน กระชับ ใช้ bullet points หรือจัดวรรคให้อ่านง่าย`;

export const aiChatService = {
  // Load conversation history from local storage
  getHistory(): AIChatMessage[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to load AI chat history:', e);
    }
    return [
      {
        id: 'welcome-msg',
        role: 'assistant',
        content: 'สวัสดีค่ะ! น้องสานไหม ผู้ช่วย AI ประจำสานไทย ยินดีต้อนรับค่ะ 🧵✨\n\nคุณลูกค้าสามารถสอบถามเรื่องความหมายลายผ้า แนะนำผ้าใส่ไปงานต่างๆ การดูแลรักษาผ้าไหม หรือการใช้งานเว็บไซต์สานไทยได้เลยนะคะ',
        timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  },

  // Save history
  saveHistory(messages: AIChatMessage[]) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch (e) {
      console.warn('Failed to save AI chat history:', e);
    }
  },

  // Clear history
  clearHistory() {
    localStorage.removeItem(STORAGE_KEY);
  },

  // Send message to OpenTyphoon AI with Realtime SSE Streaming
  async streamCompletion(
    conversation: AIChatMessage[],
    onDelta: (chunk: string) => void,
    onComplete: (fullText: string) => void,
    onError: (error: Error) => void
  ): Promise<() => void> {
    const controller = new AbortController();

    try {
      // Format messages payload for OpenAI compatible Typhoon API
      const formattedMessages = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...conversation
          .filter((m) => m.id !== 'welcome-msg')
          .slice(-10) // keep last 10 messages for context
          .map((m) => ({
            role: m.role,
            content: m.content,
          })),
      ];

      const response = await fetch(`${BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: MODEL,
          messages: formattedMessages,
          temperature: 0.6,
          max_completion_tokens: 800,
          top_p: 0.7,
          frequency_penalty: 0,
          stream: true,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`OpenTyphoon API error (${response.status}): ${errorBody}`);
      }

      if (!response.body) {
        throw new Error('No response body from OpenTyphoon stream');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let accumulatedText = '';
      let buffer = '';

      const processStream = async () => {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed || !trimmed.startsWith('data:')) continue;
              if (trimmed === 'data: [DONE]') {
                onComplete(accumulatedText);
                return;
              }

              try {
                const jsonStr = trimmed.replace(/^data:\s*/, '');
                const parsed = JSON.parse(jsonStr);
                const delta = parsed.choices?.[0]?.delta?.content || '';
                if (delta) {
                  accumulatedText += delta;
                  onDelta(delta);
                }
              } catch (parseErr) {
                // Ignore chunk parsing errors and continue
              }
            }
          }

          onComplete(accumulatedText);
        } catch (streamErr: any) {
          if (streamErr.name === 'AbortError') {
            onComplete(accumulatedText);
          } else {
            onError(streamErr);
          }
        }
      };

      processStream();
    } catch (err: any) {
      onError(err);
    }

    return () => controller.abort();
  },
};
