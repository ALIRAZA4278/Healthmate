import OpenAI from 'openai';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const openai = OPENAI_API_KEY ? new OpenAI({ apiKey: OPENAI_API_KEY }) : null;

const ANALYSIS_PROMPT = (fileType) => `You are a helpful medical assistant. Analyze this ${fileType} and provide a comprehensive but easy-to-understand summary.

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
- Provide practical, actionable advice`;

function parseAnalysisResponse(text) {
  text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  const analysis = JSON.parse(text);
  analysis.disclaimer = 'This AI analysis is for informational purposes only and should not replace professional medical advice.';
  return analysis;
}

async function extractPdfText(buffer) {
  try {
    // Dynamic require to avoid ESM issues with pdf-parse
    const pdfParse = (await import('pdf-parse/lib/pdf-parse.js')).default;
    const data = await pdfParse(buffer);
    return data.text?.trim() || '';
  } catch {
    return '';
  }
}

/**
 * Analyze a medical report — handles images (Vision API) and PDFs (text extraction)
 */
export async function analyzeMedicalReport(fileBuffer, mimeType, fileType = 'medical report') {
  if (!openai) throw new Error('OpenAI is not configured.');

  const isPdf = mimeType === 'application/pdf' || mimeType?.includes('pdf');

  try {
    let messages;

    if (isPdf) {
      // Try to extract text from PDF
      const pdfText = await extractPdfText(fileBuffer);

      if (pdfText && pdfText.length > 30) {
        // Text-based PDF — send content as text
        messages = [{
          role: 'user',
          content: `${ANALYSIS_PROMPT(fileType)}\n\nMedical Report Content:\n${pdfText.substring(0, 4000)}`,
        }];
      } else {
        // Scanned/image-based PDF — no text, ask for general guidance
        messages = [{
          role: 'user',
          content: `${ANALYSIS_PROMPT(fileType)}\n\nThis is a scanned ${fileType} PDF. Based on the report type, provide relevant medical guidance and common things to watch for in such reports.`,
        }];
      }
    } else {
      // Image file — use Vision API
      const base64Data = fileBuffer.toString('base64');
      messages = [{
        role: 'user',
        content: [
          { type: 'text', text: ANALYSIS_PROMPT(fileType) },
          { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64Data}` } },
        ],
      }];
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      max_tokens: 2000,
    });

    return parseAnalysisResponse(response.choices[0].message.content);
  } catch (error) {
    console.error('OpenAI analysis error:', error.message);
    return {
      summaryEnglish: 'Unable to analyze the report automatically. Please consult with your healthcare provider.',
      summaryUrdu: 'Report ka automatic analysis mumkin nahi hua. Apne doctor se rabta karein.',
      abnormalValues: [],
      questionsToAsk: [{ question: 'Please review this report with me and explain any concerns.' }],
      foodRecommendations: { avoid: [], recommended: [] },
      homeRemedies: [],
      disclaimer: 'AI analysis was not available. Please consult with your healthcare provider.',
    };
  }
}

/**
 * Analyze from a Cloudinary URL
 */
export async function analyzeMedicalReportFromUrl(fileUrl, fileType = 'medical report') {
  if (!openai) throw new Error('OpenAI is not configured.');

  const fetchResponse = await fetch(fileUrl);
  if (!fetchResponse.ok) throw new Error('Failed to download file');

  const contentType = fetchResponse.headers.get('content-type') || 'image/jpeg';
  const buffer = Buffer.from(await fetchResponse.arrayBuffer());

  return analyzeMedicalReport(buffer, contentType, fileType);
}
