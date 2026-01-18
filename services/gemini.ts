import { GoogleGenAI, FunctionDeclaration, Type } from "@google/genai";
import { ChatMessage, DiaryEntry } from "../types";

// Initialize Gemini Client with specific key
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Define Tools
const addDiaryEntryTool: FunctionDeclaration = {
  name: 'addDiaryEntry',
  description: 'Add a new entry to the user\'s diary (Fact Stream or Life Stream).',
  parameters: {
    type: Type.OBJECT,
    properties: {
      date: { type: Type.STRING, description: 'The date of the entry (YYYY-MM-DD).' },
      type: { type: Type.STRING, description: 'Type of entry: "FACT" or "LIFE".' },
      content: { type: Type.STRING, description: 'The content of the diary entry.' },
    },
    required: ['date', 'type', 'content'],
  },
};

const createMissionTool: FunctionDeclaration = {
  name: 'createMission',
  description: 'Create a new mission or task for the user.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: 'Title of the mission.' },
      category: { type: Type.STRING, description: 'Category: "EVERYDAY" or "FINITE".' },
      description: { type: Type.STRING, description: 'Details about the mission.' },
      deadline: { type: Type.STRING, description: 'Optional deadline.' },
    },
    required: ['title', 'category'],
  },
};

const addToToDoTool: FunctionDeclaration = {
  name: 'addToToDo',
  description: 'Add a simple item to the To-Do list.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      task: { type: Type.STRING, description: 'The task description.' },
    },
    required: ['task'],
  },
};

const createDocumentTool: FunctionDeclaration = {
  name: 'createDocument',
  description: 'Create a new document (e.g., Meal Plan, Project Plan).',
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: 'Title of the document.' },
      content: { type: Type.STRING, description: 'Full content of the document.' },
      type: { type: Type.STRING, description: 'Type: "PROJECT", "MEAL_PLAN", "OTHER".' },
    },
    required: ['title', 'content'],
  },
};

export const sendMessageToGemini = async (
  history: ChatMessage[], 
  newMessage: string,
  userContext: string
) => {
  // Use Pro model for better quality
  const model = 'gemini-3-pro-preview';
  
  const systemInstruction = `
    You are BasePulse, an intelligent and proactive life assistant for the app LifeBM.
    Your goal is to help the user manage their life, diary, missions, and documents.
    
    User Context:
    ${userContext}

    Capabilities:
    1. You can add entries to the user's diary (Fact Stream or Life Stream).
    2. You can create missions (tasks) for the user.
    3. You can add items to a simple To-Do list.
    4. You can generate documents (Meal plans, guides) and save them to NoteBM.
    
    Style:
    - Be concise, helpful, and friendly.
    - Use the provided tools whenever specific actions (like adding a mission or diary entry) are requested.
    - If the user provides a raw story, offer to organize it into a Life Stream.
    - If the user mentions a specific event, log it as a Fact Stream.
    - If the user is idle, you can suggest actions based on their history (simulated by proactive messages).
  `;

  try {
    const chat = ai.chats.create({
      model,
      config: {
        systemInstruction,
        tools: [{ functionDeclarations: [addDiaryEntryTool, createMissionTool, addToToDoTool, createDocumentTool] }],
      },
      history: history.map(h => ({
        role: h.role,
        parts: [{ text: h.text }],
      })),
    });

    const response = await chat.sendMessage({ message: newMessage });
    
    const functionCalls = response.functionCalls;
    
    if (functionCalls && functionCalls.length > 0) {
      return {
        text: null,
        toolCall: functionCalls[0]
      };
    }

    return {
      text: response.text,
      toolCall: null
    };

  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      text: "I'm having trouble connecting to the BasePulse network right now. Please check your API key or try again later.",
      toolCall: null
    };
  }
};

export const generateProactiveMessage = async (userContext: string) => {
    const prompt = `Based on the user context: "${userContext}", generate a short, one-sentence proactive question or reminder for the user. Do not be repetitive.`;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: prompt
        });
        return response.text;
    } catch (e) {
        return "How is your day going so far?";
    }
}

export const analyzeDay = async (entries: DiaryEntry[], date: string) => {
    if (entries.length === 0) return "No data available for this day to analyze.";

    const content = entries.map(e => `[${e.type}] ${e.content}`).join('\n');
    const prompt = `
        Analyze the following diary entries for ${date}. 
        Provide a brief psychological summary, emotional tone analysis, and one constructive piece of advice.
        
        Entries:
        ${content}
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: prompt
        });
        return response.text;
    } catch (e) {
        return "Unable to analyze streams at the moment.";
    }
}