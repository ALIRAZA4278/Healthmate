import OpenAI from 'openai';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.warn('Warning: OPENAI_API_KEY is not defined. AI analysis will not work.');
}

const client = OPENAI_API_KEY ? new OpenAI({ apiKey: OPENAI_API_KEY }) : null;

const ANALYSIS_PROMPT = `You are a highly experienced medical assistant helping Pakistani patients understand their test results. Your goal is to provide a thorough, empathetic, and deeply actionable analysis that empowers patients to take charge of their health.

IMPORTANT: Respond ONLY with a valid JSON object. No markdown, no code blocks, no extra text outside the JSON.

Analyze the medical report thoroughly and return this exact JSON structure:

{
  "urgencyLevel": "normal",
  "urgencyReason": "One clear sentence explaining why this urgency level was assigned",

  "summaryEnglish": "Write 4-5 detailed paragraphs: (1) What this test/report is and what it measures in the body. (2) Your overall health status based on these results — reassure where appropriate. (3) Walk through each value found — what it means, whether it is normal or not. (4) Explain what any abnormal values may indicate clinically, what body systems are affected, and why it matters. (5) Overall picture and clear next steps the patient should take. Use simple language and explain every medical term right after you use it.",

  "summaryUrdu": "Exactly the same 4-5 paragraph summary fully written in Roman Urdu (never Arabic script, never Nastaliq). Use simple everyday words any Pakistani family can understand. Common words: khoon (blood), dil (heart), gurda (kidney), jiggar (liver), haemoglobin (haemoglobin), sugar (blood sugar), wajan (weight), dawai (medicine), doctor se zaroor milein (must see a doctor). Start with 'Yeh report...' or 'Is jaanch mein...'",

  "keyFindings": [
    "One sentence per important finding — both normal and abnormal — e.g. 'Hemoglobin is low at 10.2 g/dL, suggesting possible anemia'"
  ],

  "abnormalValues": [
    "ValueName: ActualResult units (Normal Range: X–Y units) — HIGH/LOW — This value is [high/low] because [brief clinical reason]; it may indicate [condition]; watch for [symptom]"
  ],

  "normalValues": [
    "ValueName: ActualResult units (Normal Range: X–Y units) — NORMAL — Brief reassurance note"
  ],

  "questionsToAsk": [
    {"question": "Specific, detailed question based on the exact findings in this report that will help the patient get the most out of their doctor visit"}
  ],

  "foodRecommendations": {
    "recommended": [
      "Food name: specific quantity and frequency — Reason: exactly how this food helps the values found in this report"
    ],
    "avoid": [
      "Food name — Reason: exactly how this food worsens the values found in this report"
    ]
  },

  "homeRemedies": [
    {
      "remedy": "Remedy name",
      "description": "Step-by-step preparation and use: ingredients, amounts, method, timing, duration, expected benefit, and any caution or contraindication"
    }
  ],

  "lifestyleRecommendations": [
    "Specific, actionable lifestyle change directly tied to these results — include how often, for how long, and the expected benefit"
  ],

  "warningSignsToWatch": [
    "Specific symptom or sign that — given these results — should prompt the patient to seek urgent medical care; explain why it is dangerous"
  ],

  "followUpRecommendations": "Specific advice: which test to repeat, after how many weeks/months, which specialist to consult (e.g. cardiologist, endocrinologist), and what target values to aim for."
}

Rules for content depth:
- urgencyLevel must be exactly one of: "normal", "monitor", or "urgent"
- keyFindings: 4–8 bullet points covering all major values
- abnormalValues: list EVERY value outside normal range with full detail
- normalValues: list the 3–5 most important normal values to reassure the patient
- questionsToAsk: minimum 6 highly specific questions if any abnormal values exist; 4 if all normal
- foodRecommendations.recommended: 7–9 specific foods with quantities and reasons
- foodRecommendations.avoid: 5–7 specific foods/drinks with reasons
- homeRemedies: 4–5 remedies with complete step-by-step instructions
- lifestyleRecommendations: 5–7 specific changes (exercise, sleep, stress, hydration, etc.)
- warningSignsToWatch: 5–6 red-flag symptoms specific to these results
- followUpRecommendations: 3–4 sentences with a concrete plan

Tone:
- Warm, empathetic, never alarming — patients are often anxious
- Frame concerns as "important to discuss with your doctor" not as diagnoses
- Celebrate normal values — reassurance is powerful
- The Urdu summary must be natural-sounding, not a word-for-word translation`;

/**
 * Analyze a medical report using OpenAI GPT-4o
 * @param {Buffer} fileBuffer - The file buffer to analyze
 * @param {string} mimeType - The MIME type of the file
 * @param {string} fileType - The type of medical report
 * @returns {Promise<Object>} AI analysis result
 */
export async function analyzeMedicalReport(fileBuffer, mimeType, fileType = 'medical report') {
  if (!client) {
    throw new Error('OpenAI is not configured. Please set OPENAI_API_KEY.');
  }

  try {
    let messages;

    if (mimeType === 'application/pdf') {
      // PDF: upload to OpenAI Files API for native PDF reading
      const fileBlob = new File([fileBuffer], 'medical_report.pdf', { type: 'application/pdf' });
      const uploadedFile = await client.files.create({
        file: fileBlob,
        purpose: 'user_data',
      });

      messages = [
        {
          role: 'user',
          content: [
            {
              type: 'file',
              file: { file_id: uploadedFile.id },
            },
            {
              type: 'text',
              text: `${ANALYSIS_PROMPT}\n\nAnalyze this ${fileType} and provide the JSON response.`,
            },
          ],
        },
      ];

      const response = await client.chat.completions.create({
        model: 'gpt-4o',
        messages,
        max_tokens: 8192,
      });

      // Clean up the uploaded file
      await client.files.delete(uploadedFile.id).catch(() => {});

      return parseAndEnrich(response.choices[0].message.content, fileType);
    } else {
      // Images (JPEG, PNG, WebP): use vision API with base64
      const base64Data = fileBuffer.toString('base64');

      messages = [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${base64Data}`,
                detail: 'high',
              },
            },
            {
              type: 'text',
              text: `${ANALYSIS_PROMPT}\n\nAnalyze this ${fileType} and provide the JSON response.`,
            },
          ],
        },
      ];

      const response = await client.chat.completions.create({
        model: 'gpt-4o',
        messages,
        max_tokens: 8192,
      });

      return parseAndEnrich(response.choices[0].message.content, fileType);
    }
  } catch (error) {
    console.error('OpenAI analysis error:', error);
    console.error('Error details:', {
      message: error.message,
      status: error.status,
      name: error.name,
    });

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
 * Parse JSON response and add disclaimer
 */
function parseAndEnrich(rawText, fileType) {
  let text = rawText || '';
  text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

  const analysis = JSON.parse(text);
  analysis.disclaimer =
    'This AI analysis is for informational purposes only and should not replace professional medical advice. Please consult with your healthcare provider for proper diagnosis and treatment.';
  return analysis;
}

/**
 * Analyze a medical report from a Cloudinary URL
 * @param {string} fileUrl - The Cloudinary URL of the file
 * @param {string} mimeType - The MIME type of the file
 * @param {string} fileType - The type of medical report
 * @returns {Promise<Object>} AI analysis result
 */
export async function analyzeMedicalReportFromUrl(fileUrl, mimeType, fileType = 'medical report') {
  if (!client) {
    throw new Error('OpenAI is not configured. Please set OPENAI_API_KEY.');
  }

  try {
    const response = await fetch(fileUrl);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const resolvedMimeType = mimeType || response.headers.get('content-type') || 'image/jpeg';

    return analyzeMedicalReport(buffer, resolvedMimeType, fileType);
  } catch (error) {
    console.error('Error analyzing from URL:', error);
    throw error;
  }
}
