import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface ParsedReceiptItem {
  name: string;
  quantity?: number;
  unit?: string;
  originalText: string;
}

export interface ParsedReceipt {
  establishment: string;
  items: ParsedReceiptItem[];
  rawText: string;
  confidence: number;
}

export class ReceiptOCRService {
  async parseReceiptImage(base64Image: string): Promise<ParsedReceipt> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: `You are a receipt parsing expert. Extract food items from receipt images with high accuracy.

INSTRUCTIONS:
1. Extract the establishment/restaurant name
2. Identify all food items (ignore drinks, taxes, tips, etc.)
3. Extract quantities when clearly visible
4. Return structured JSON data
5. Focus on actual food items, not service charges or non-food items

OUTPUT FORMAT (JSON):
{
  "establishment": "Restaurant Name",
  "items": [
    {
      "name": "Food Item Name",
      "quantity": 1,
      "unit": "each",
      "originalText": "Original text from receipt"
    }
  ],
  "confidence": 0.95
}

RULES:
- Only include actual food items
- If quantity is unclear, use 1 as default
- Clean up item names (remove codes, prices, etc.)
- Use "each" as default unit
- Confidence should reflect how clearly you can read the receipt`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Please parse this receipt and extract all food items with their quantities. Return only JSON."
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`
                }
              }
            ]
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 1000,
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error("No content received from OpenAI");
      }

      const parsed = JSON.parse(content);
      
      // Validate and clean the response
      const result: ParsedReceipt = {
        establishment: parsed.establishment || "Unknown Restaurant",
        items: (parsed.items || []).map((item: any) => ({
          name: item.name || "Unknown Item",
          quantity: item.quantity || 1,
          unit: item.unit || "each",
          originalText: item.originalText || item.name || "Unknown"
        })),
        rawText: content,
        confidence: parsed.confidence || 0.8
      };

      return result;
    } catch (error) {
      console.error("Error parsing receipt:", error);
      throw new Error("Failed to parse receipt image");
    }
  }

  async parseReceiptText(receiptText: string): Promise<ParsedReceipt> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: `You are a receipt parsing expert. Extract food items from receipt text with high accuracy.

INSTRUCTIONS:
1. Extract the establishment/restaurant name
2. Identify all food items (ignore drinks, taxes, tips, etc.)
3. Extract quantities when clearly visible
4. Return structured JSON data
5. Focus on actual food items, not service charges or non-food items

OUTPUT FORMAT (JSON):
{
  "establishment": "Restaurant Name",
  "items": [
    {
      "name": "Food Item Name",
      "quantity": 1,
      "unit": "each",
      "originalText": "Original text from receipt"
    }
  ],
  "confidence": 0.95
}

RULES:
- Only include actual food items
- If quantity is unclear, use 1 as default
- Clean up item names (remove codes, prices, etc.)
- Use "each" as default unit
- Confidence should reflect parsing accuracy`
          },
          {
            role: "user",
            content: `Please parse this receipt text and extract all food items with their quantities. Return only JSON.

Receipt text:
${receiptText}`
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 1000,
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error("No content received from OpenAI");
      }

      const parsed = JSON.parse(content);
      
      // Validate and clean the response
      const result: ParsedReceipt = {
        establishment: parsed.establishment || "Unknown Restaurant",
        items: (parsed.items || []).map((item: any) => ({
          name: item.name || "Unknown Item",
          quantity: item.quantity || 1,
          unit: item.unit || "each",
          originalText: item.originalText || item.name || "Unknown"
        })),
        rawText: receiptText,
        confidence: parsed.confidence || 0.8
      };

      return result;
    } catch (error) {
      console.error("Error parsing receipt text:", error);
      throw new Error("Failed to parse receipt text");
    }
  }
}

export const receiptOCRService = new ReceiptOCRService();