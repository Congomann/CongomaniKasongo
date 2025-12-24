// SECURITY NOTE: This file is deprecated for direct API calls
// All AI requests should now go through the secure backend endpoint: /api/ai/generate
// The frontend should NEVER have direct access to API keys

import { Lead, ProductType } from '../types';

export interface ChatHistoryItem {
  role: 'user' | 'model';
  parts: { text: string }[];
}

// Secure backend API call
const callBackendAI = async (prompt: string, context?: string): Promise<string> => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ prompt, context })
    });

    if (!response.ok) {
      throw new Error('AI service unavailable');
    }

    const data = await response.json();
    return data.text || 'Could not generate response.';
  } catch (error) {
    console.error('AI backend error:', error);
    return 'AI Analysis currently unavailable.';
  }
};

export const analyzeLead = async (lead: Lead): Promise<string> => {
  const prompt = `
    You are a senior financial advisor assistant. Analyze the following lead for New Holland Financial Group.
    
    Lead Name: ${lead.name}
    Interest: ${lead.interest}
    Message: "${lead.message}"
    
    Provide a structured strategic analysis:
    
    1. **Deal Potential**: Estimate value (Low/Medium/High) based on interest type and message tone.
    2. **Immediate Action**: Suggest the precise next step for the advisor.
    3. **Cross-Selling Opportunity**: Based on their interest in ${lead.interest}, suggest specific complementary products (e.g., if Life, suggest Annuities or IUL; if Business, suggest Key Person or Cyber Liability).
    4. **Risk Assessment**: Identify potential red flags, underwriting risks, or compliance concerns evident in the request.
    
    Keep the tone professional, insightful, and actionable. Limit response to 150 words.
  `;

  return callBackendAI(prompt);
};

export const getChatResponse = async (
  history: ChatHistoryItem[],
  currentMessage: string,
  context: string
): Promise<{ text: string, leadData?: any }> => {
  const systemInstruction = `
    You are a helpful and professional AI assistant for New Holland Financial Group.
    
    **CORE INSTRUCTIONS:**
    1. **Language Detection:** Detect the user's language (English, Swahili, Spanish) and reply in that language.
    2. **Lead Intake Goal:** Your primary goal is to collect contact info to have an advisor reach out. 
       - politely ask for: **Name**, **Phone**, **Email**, **City/State**, and **Product Interest**.
       - Do not ask for everything at once. Make it a natural conversation.
    3. **Tone:** Professional, welcoming, and informative.
    
    **COMPANY INFORMATION:**
    ${context}
    
    **GUIDELINES:**
    - If the user asks for a quote, explain that you need their contact info to have a licensed advisor prepare one.
    - Do not give specific financial advice or binding quotes.
    - If the user speaks Swahili, use polite and formal Swahili (Kiswahili sanifu).
  `;

  const historyText = history.map(h => `${h.role}: ${h.parts[0].text}`).join('\n');
  const fullPrompt = `${systemInstruction}\n\nConversation History:\n${historyText}\n\nUser: ${currentMessage}\n\nAssistant:`;

  const responseText = await callBackendAI(fullPrompt, context);
  
  return { text: responseText };
};
