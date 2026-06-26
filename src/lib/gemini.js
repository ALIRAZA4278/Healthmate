import OpenAI from 'openai';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.warn('Warning: OPENAI_API_KEY is not defined. AI analysis will not work.');
}

// Initialize OpenAI
const openai = OPENAI_API_KEY ? new OpenAI({ apiKey: OPENAI_API_KEY }) : null;

/**
 * Analyze a medical report using OpenAI Vision API
 * @param {Buffer} fileBuffer - The file buffer to analyze
 * @param {string} mimeType - The MIME type of the file (e.g., 'image/jpeg', 'application/pdf')
 * @param {string} fileType - The type of medical report (e.g., 'lab_report', 'CBC', 'prescription')
 * @returns {Promise<Object>} AI analysis result
 */
export async function analyzeMedicalReport(fileBuffer, mimeType, fileType = 'medical report') {
  if (!openai) {
    throw new Error('OpenAI is not configured. Please set OPENAI_API_KEY.');
  }

  try {
    // Convert buffer to base64
    const base64Data = fileBuffer.toString('base64');

    const prompt = `You are a helpful medical assistant. Analyze this ${fileType} and provide a comprehensive but easy-to-understand summary.

IMPORTANT: Respond ONLY with a valid JSON object. Do not include any markdown formatting, code blocks, or extra text.

The JSON must have exactly this structure:
{
  "summaryEnglish": "A clear, patient-friendly summary in English explaining what the report shows, what the results mean, and any concerns (2-3 paragraphs)",
  "summaryUrdu": "Same summary in Roman Urdu (not Arabic script) for patients who prefer Urdu. Example: 'Yeh report aapke khoon ki jaanch hai...'",
  "abnormalValues": ["List each abnormal value with its name, actual value, and normal range. Example: 'Hemoglobin: 10.2 g/dL (Normal: 12-16 g/dL) - LOW'"],
  "questionsToAsk": [{"question": "Important questions the patient should ask their doctor based on these results"}],
  "foodRecommendations": {
    "avoid": ["Foods to avoid based on the report findings"],
    "recommended": ["Foods that may help improve the health metrics shown"]
  },
  "homeRemedies": [{"remedy": "Natural remedy name", "description": "How to use it and expected benefits"}]
}

Guidelines:
- Be empathetic and reassuring while being accurate
- Explain medical terms in simple language
- If values are normal, mention that clearly
- For abnormal values, explain what they might indicate without causing alarm
- Provide practical, actionable advice
- Include a gentle reminder to consult with their doctor for proper diagnosis`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt,
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${base64Data}`,
              },
            },
          ],
        },
      ],
      max_tokens: 2000,
    });

    let text = response.choices[0].message.content;

    // Clean up the response - remove markdown code blocks if present
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    // Parse JSON response
    const analysis = JSON.parse(text);

    // Add disclaimer
    analysis.disclaimer = 'This AI analysis is for informational purposes only and should not replace professional medical advice. Please consult with your healthcare provider for proper diagnosis and treatment.';

    return analysis;
  } catch (error) {
    console.error('OpenAI analysis error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });

    // Return a default response if AI fails with detailed error
    return {
      summaryEnglish: `Unable to analyze the report at this time. Error: ${error.message}. Please consult with your healthcare provider for a detailed analysis.`,
      summaryUrdu: 'Is waqt report ka analysis mumkin nahi hai. Behtar hoga ke aap apne doctor se baat karein.',
      abnormalValues: [],
      questionsToAsk: [{ question: 'Please review this report with me and explain any concerns.' }],
      foodRecommendations: { avoid: [], recommended: [] },
      homeRemedies: [],
      disclaimer: 'AI analysis was not available. Please consult with your healthcare provider.',
      error: error.message,
    };
  }
}

/**
 * Analyze a medical report from a URL
 * @param {string} imageUrl - The URL of the image to analyze
 * @param {string} fileType - The type of medical report
 * @returns {Promise<Object>} AI analysis result
 */
export async function analyzeMedicalReportFromUrl(imageUrl, fileType = 'medical report') {
  if (!openai) {
    throw new Error('OpenAI is not configured. Please set OPENAI_API_KEY.');
  }

  try {
    const prompt = `You are a helpful medical assistant. Analyze this ${fileType} and provide a comprehensive but easy-to-understand summary.

IMPORTANT: Respond ONLY with a valid JSON object. Do not include any markdown formatting, code blocks, or extra text.

The JSON must have exactly this structure:
{
  "summaryEnglish": "A clear, patient-friendly summary in English explaining what the report shows, what the results mean, and any concerns (2-3 paragraphs)",
  "summaryUrdu": "Same summary in Roman Urdu (not Arabic script) for patients who prefer Urdu. Example: 'Yeh report aapke khoon ki jaanch hai...'",
  "abnormalValues": ["List each abnormal value with its name, actual value, and normal range. Example: 'Hemoglobin: 10.2 g/dL (Normal: 12-16 g/dL) - LOW'"],
  "questionsToAsk": [{"question": "Important questions the patient should ask their doctor based on these results"}],
  "foodRecommendations": {
    "avoid": ["Foods to avoid based on the report findings"],
    "recommended": ["Foods that may help improve the health metrics shown"]
  },
  "homeRemedies": [{"remedy": "Natural remedy name", "description": "How to use it and expected benefits"}]
}

Guidelines:
- Be empathetic and reassuring while being accurate
- Explain medical terms in simple language
- If values are normal, mention that clearly
- For abnormal values, explain what they might indicate without causing alarm
- Provide practical, actionable advice
- Include a gentle reminder to consult with their doctor for proper diagnosis`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt,
            },
            {
              type: 'image_url',
              image_url: {
                url: imageUrl,
              },
            },
          ],
        },
      ],
      max_tokens: 2000,
    });

    let text = response.choices[0].message.content;

    // Clean up the response
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    const analysis = JSON.parse(text);
    analysis.disclaimer = 'This AI analysis is for informational purposes only and should not replace professional medical advice. Please consult with your healthcare provider for proper diagnosis and treatment.';

    return analysis;
  } catch (error) {
    console.error('Error analyzing from URL:', error);
    throw error;
  }
}
