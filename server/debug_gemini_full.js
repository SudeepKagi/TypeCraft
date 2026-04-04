require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function test(modelName, apiVersion) {
  console.log(`Testing ${modelName} with apiVersion ${apiVersion}...`);
  try {
    const opts = apiVersion ? { apiVersion } : {};
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY, opts);
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent("Respond with the word SUCCESS");
    const response = await result.response;
    console.log(`[${modelName}] [${apiVersion || 'default'}] Result: ${response.text().trim()}`);
    return true;
  } catch (e) {
    console.error(`[${modelName}] [${apiVersion || 'default'}] Error: ${e.message}`);
    return false;
  }
}

async function run() {
  await test("gemini-2.0-flash", "v1");
  await test("gemini-1.5-flash", "v1");
  await test("gemini-2.0-flash", "v1beta");
  await test("gemini-1.5-flash", "v1beta");
  await test("gemini-flash-latest", "v1");
  await test("gemini-flash-latest", "v1beta");
}

run();
