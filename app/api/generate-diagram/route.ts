import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const model = genAI.getGenerativeModel({ 
      model: "gemini-flash-latest",
      generationConfig: { responseMimeType: "application/json" }
    });

    const systemPrompt = `You are an expert Cloud/System Architect. 
Convert the user's request into a professional architecture graph.

CRITICAL: For every node, identify the specific technology and provide:
1. \`tech\`: A slug for the technology (e.g., 'amazons3', 'amazoncomputecloud', 'react', 'postgresql', 'mongodb', 'nginx'). Use simpleicons.org slugs.
2. \`color\`: The official brand color hex code.
3. \`gridX\` and \`gridY\`: Integer coordinates for a balanced 2D layout.

OUTPUT FORMAT:
{
  "nodes": [
    { "id": "n1", "label": "React Frontend", "type": "client", "tech": "react", "color": "#61DAFB", "gridX": 0, "gridY": 1 },
    { "id": "n2", "label": "AWS Gateway", "type": "server", "tech": "amazonapi-gateway", "color": "#FF9900", "gridX": 1, "gridY": 1 },
    { "id": "n3", "label": "Node.js API", "type": "server", "tech": "node.js", "color": "#339933", "gridX": 2, "gridY": 1 },
    { "id": "n4", "label": "PostgreSQL", "type": "database", "tech": "postgresql", "color": "#4169E1", "gridX": 3, "gridY": 1 }
  ],
  "edges": [
    { "from": "n1", "to": "n2", "label": "HTTPS" },
    { "from": "n2", "to": "n3", "label": "Proxy" },
    { "from": "n3", "to": "n4", "label": "SQL" }
  ]
}

DIRECTIONS:
- Space out the grid logic.
- Use 'client', 'server', 'database', 'queue', 'storage' for types.
- Output ONLY raw JSON.

User Request: ${prompt}`;

    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json(JSON.parse(text));
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate diagram" },
      { status: 500 }
    );
  }
}
