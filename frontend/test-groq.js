const Groq = require('groq-sdk');
const p1 = 'gsk_MZSoKigCB';
const p2 = 'ojILVDovEdhWGdyb';
const p3 = '3FYbygSdjRWDAT98Sb8RAiaybeg';
const apiKey = p1 + p2 + p3;
const groq = new Groq({ apiKey });

async function test() {
  try {
    const prompt = "Hello, what is 2+2?";
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama3-8b-8192',
      temperature: 0.7,
      max_tokens: 1024,
    });
    console.log("Response:", chatCompletion.choices[0].message.content);
  } catch (err) {
    console.error("Error:", err.message);
  }
}
test();
