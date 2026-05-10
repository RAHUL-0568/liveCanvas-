const { GoogleGenerativeAI } = require("@google/generative-ai");

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return;

  const genAI = new GoogleGenerativeAI(apiKey);
  try {
    // The SDK might not have listModels exposed directly in the same way
    // Let's try to use the REST API directly to see what's wrong.
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    console.log("Available Models:", JSON.stringify(data, null, 2));
  } catch (e) {
    console.log("Error listing models:", e.message);
  }
}

listModels();
