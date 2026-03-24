import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function testGemini() {
    const apiKey = process.env.GEMINI_API_KEY;
    console.log("🔍 Checking API Key environment variable:", apiKey ? "Found" : "NOT FOUND");
    
    if (!apiKey) {
        console.error("❌ Error: GEMINI_API_KEY is missing in .env");
        return;
    }

    const versions = ["v1", "v1beta"];
    const models = ["gemini-1.5-flash", "gemini-1.5-flash-latest", "gemini-pro", "gemini-2.0-flash"];

    console.log("📡 Starting comprehensive connection test...");

    for (const apiVersion of versions) {
        console.log(`\n🌐 Testing API Version: ${apiVersion}`);
        const ai = new GoogleGenAI({ apiKey, apiVersion });

        for (const modelName of models) {
            try {
                process.stdout.write(`   - Testing ${modelName}... `);
                const response = await ai.models.generateContent({
                    model: modelName,
                    contents: "Hi"
                });
                console.log("✅ SUCCESS!");
                console.log(`\n🎉 WORKING CONFIGURATION FOUND:`);
                console.log(`   API Version: ${apiVersion}`);
                console.log(`   Model: ${modelName}`);
                console.log(`\n👉 Please tell Antigravity this configuration worked!`);
                return; 
            } catch (err) {
                console.log(`❌ FAILED (${err.status || 'Error'}): ${err.message.substring(0, 50)}...`);
            }
        }
    }

    console.error("\n❌ ALL COMBINATIONS FAILED.");
    console.log("💡 TRIPLE CHECK: Have you added your API KEY to the .env file? It should look like: GEMINI_API_KEY=AIza...");
    console.log("🔗 Get a key here: https://aistudio.google.com/");
}

testGemini();
