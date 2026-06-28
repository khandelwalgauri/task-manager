const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const suggestEstimate = async (req, res) => {
  try {
    const { title, description } = req.body;

    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
    });

    const prompt = `
You are a project manager.

Based on the task title and description, estimate:

1. Estimated effort in hours.
2. Suggested due date in days.

Task Title: ${title}
Task Description: ${description}

Return only:

Estimated Effort: X hours
Suggested Due Date: X days
`;

    const result = await model.generateContent(prompt);

    const text = result.response.text();

    res.json({
      suggestion: text,
    });
  } catch (error) {
    console.log('Gemini Error:', error);

    res.status(500).json({
      message: 'AI service failed',
    });
  }
};

module.exports = {
  suggestEstimate,
};
