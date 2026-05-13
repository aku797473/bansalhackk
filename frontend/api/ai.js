const Groq = require('groq-sdk');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  const { landSize, cropType, soilType, location, budget } = req.body;
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ success: false, message: 'GROQ_API_KEY is not configured in environment variables.' });
  }

  const groq = new Groq({ apiKey });

  try {
    const prompt = `
      You are an expert Agricultural Economic Advisor. 
      Analyze the following farm data and provide a detailed profit prediction and optimization strategy in Hinglish (Hindi + English mix) so an Indian farmer can understand easily.
      
      Farm Data:
      - Land Size: ${landSize} Acres
      - Current/Planned Crop: ${cropType}
      - Soil Type: ${soilType}
      - Location: ${location}
      - Investment Budget: ₹${budget}
      
      Please provide:
      1. Estimated Profit Potential (Percentage or Range).
      2. 3 Specific steps to increase yield.
      3. Risk assessment (Weather, Pests, Market).
      4. Recommendation: Should they stick to this crop or switch?
      
      Keep the tone professional yet accessible. Use bullet points.
    `;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama3-8b-8192',
      temperature: 0.7,
      max_tokens: 1024,
    });

    const response = chatCompletion.choices[0].message.content;
    return res.json({ success: true, data: response });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
