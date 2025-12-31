import { GoogleGenAI, Type } from "@google/genai";
import { GEMINI_MODEL } from "../constants";
import { Task, Priority } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Break down a complex task into subtasks
export const breakdownTask = async (taskTitle: string): Promise<string[]> => {
  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: `Break down this task into 3-5 smaller, actionable steps: "${taskTitle}". Keep them concise.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            steps: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["steps"]
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    return result.steps || [];
  } catch (error) {
    console.error("Gemini breakdown error:", error);
    return [];
  }
};

// Suggest priority based on task description and due date
export const suggestPriority = async (taskTitle: string, dueDate: string | null): Promise<Priority> => {
  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: `Given the task "${taskTitle}" and due date "${dueDate || 'none'}", suggest a priority level (Low, Medium, or High).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            priority: {
              type: Type.STRING,
              enum: ["Low", "Medium", "High"]
            }
          }
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    return (result.priority as Priority) || Priority.MEDIUM;
  } catch (error) {
    console.error("Gemini priority error:", error);
    return Priority.MEDIUM;
  }
};

// Organize/Prioritize a list of tasks
export const smartPlan = async (tasks: Task[]): Promise<{ taskId: string; reason: string }[]> => {
  if (tasks.length === 0) return [];

  const taskSummaries = tasks.map(t => ({ id: t.id, title: t.title, due: t.dueDate, priority: t.priority }));
  
  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: `Review these tasks and suggest an execution order to be most effective. Provide a short reason for the top 3 recommendations. Tasks: ${JSON.stringify(taskSummaries)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            plan: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  taskId: { type: Type.STRING },
                  reason: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    return result.plan || [];
  } catch (error) {
    console.error("Gemini smart plan error:", error);
    return [];
  }
};
