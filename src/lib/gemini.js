import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.warn('Warning: GEMINI_API_KEY is not defined. AI analysis will not work.');
}

// Initialize Gemini AI
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

/**
 * Analyze a medical report using Google Gemini AI
 * @param {Buffer} fileBuffer - The file buffer to analyze
 * @param {string} mimeType - The MIME type of the file (e.g., 'image/jpeg', 'application/pdf')
 * @param {string} fileType - The type of medical report (e.g., 'lab_report', 'CBC', 'prescription')
 * @returns {Promise<Object>} AI analysis result
 */
export async function analyzeMedicalReport(fileBuffer, mimeType, fileType = 'medical report') {
  if (!genAI) {
    throw new Error('Gemini AI is not configured. Please set GEMINI_API_KEY.');
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

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

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: mimeType,
          data: base64Data,
        },
      },
    ]);

    const response = await result.response;
    let text = response.text();

    // Clean up the response - remove markdown code blocks if present
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    // Parse JSON response
    const analysis = JSON.parse(text);

    // Add disclaimer
    analysis.disclaimer = 'This AI analysis is for informational purposes only and should not replace professional medical advice. Please consult with your healthcare provider for proper diagnosis and treatment.';

    return analysis;
  } catch (error) {
    console.error('Gemini AI analysis error:', error);
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
  if (!genAI) {
    throw new Error('Gemini AI is not configured. Please set GEMINI_API_KEY.');
  }

  try {
    // Fetch the image
    const response = await fetch(imageUrl);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mimeType = response.headers.get('content-type') || 'image/jpeg';

    return analyzeMedicalReport(buffer, mimeType, fileType);
  } catch (error) {
    console.error('Error analyzing from URL:', error);
    throw error;
  }
}
