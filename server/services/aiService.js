import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const chat = async (systemPrompt, userMessage, maxTokens = 1000) => {
  // If no API key, return a simulated response
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'sk-...') {
    return getSimulatedResponse(systemPrompt, userMessage);
  }

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    max_tokens: maxTokens,
    temperature: 0.7,
  });

  return response.choices[0].message.content;
};

// Simulated responses when no API key is set
const getSimulatedResponse = (systemPrompt, userMessage) => {
  if (systemPrompt.includes('symptom')) {
    return JSON.stringify({
      possibleConditions: [
        { name: 'Common Cold', probability: 'High', description: 'A viral infection of the upper respiratory tract.' },
        { name: 'Seasonal Allergies', probability: 'Medium', description: 'An immune response to airborne allergens.' },
        { name: 'Sinusitis', probability: 'Low', description: 'Inflammation of the sinuses, often following a cold.' },
      ],
      recommendations: [
        'Rest and stay hydrated',
        'Monitor symptoms for 3-5 days',
        'Consult a doctor if symptoms worsen or fever develops',
        'Over-the-counter antihistamines may help if allergies are suspected',
      ],
      urgency: 'low',
      disclaimer: 'This is an AI-generated assessment and not a medical diagnosis. Please consult a healthcare professional.',
    });
  }

  if (systemPrompt.includes('diagnosis') || systemPrompt.includes('doctor')) {
    return JSON.stringify({
      differentialDiagnosis: [
        { condition: 'Upper Respiratory Tract Infection', likelihood: 'High', reasoning: 'Symptoms consistent with viral URTI pattern.' },
        { condition: 'Allergic Rhinitis', likelihood: 'Medium', reasoning: 'Seasonal patterns and symptom profile suggest possible allergic component.' },
      ],
      suggestedTests: ['Complete Blood Count (CBC)', 'C-Reactive Protein (CRP)'],
      treatmentSuggestions: ['Symptomatic treatment with analgesics', 'Adequate rest and hydration', 'Follow up in 5-7 days if no improvement'],
      redFlags: ['High fever >103°F', 'Difficulty breathing', 'Symptoms persisting beyond 10 days'],
    });
  }

  if (systemPrompt.includes('lab report') || systemPrompt.includes('summarize')) {
    return JSON.stringify({
      summary: 'The lab results show values within normal ranges for most parameters. A few values are slightly elevated but not at clinically significant levels.',
      keyFindings: [
        { parameter: 'Hemoglobin', value: 'Normal range', status: 'normal' },
        { parameter: 'WBC Count', value: 'Slightly elevated', status: 'watch' },
        { parameter: 'Blood Sugar', value: 'Normal range', status: 'normal' },
      ],
      recommendations: ['Repeat WBC count in 2 weeks if symptoms persist', 'Maintain healthy diet and exercise routine'],
      overallAssessment: 'Generally healthy results with minor variations that should be monitored.',
    });
  }

  if (systemPrompt.includes('risk') || systemPrompt.includes('predict')) {
    return JSON.stringify({
      riskFactors: [
        { factor: 'Cardiovascular Risk', level: 'Low', details: 'Blood pressure and heart rate are within normal ranges.' },
        { factor: 'Diabetes Risk', level: 'Low', details: 'Blood sugar levels are normal.' },
        { factor: 'Obesity Risk', level: 'Moderate', details: 'BMI trending upward over the past month.' },
      ],
      preventiveActions: [
        'Maintain regular exercise routine (30 min/day)',
        'Monitor blood pressure weekly',
        'Balanced diet with reduced sodium intake',
        'Regular health checkups every 6 months',
      ],
      overallRisk: 'Low to Moderate',
    });
  }

  if (systemPrompt.includes('health tips') || systemPrompt.includes('personalized')) {
    return JSON.stringify({
      tips: [
        { category: 'Nutrition', tip: 'Include more leafy greens and omega-3 rich foods in your diet.', priority: 'high' },
        { category: 'Exercise', tip: 'Aim for at least 150 minutes of moderate aerobic activity per week.', priority: 'high' },
        { category: 'Sleep', tip: 'Maintain a consistent sleep schedule of 7-8 hours per night.', priority: 'medium' },
        { category: 'Hydration', tip: 'Drink at least 8 glasses of water daily, more during physical activity.', priority: 'medium' },
        { category: 'Mental Health', tip: 'Practice mindfulness or meditation for 10 minutes daily to reduce stress.', priority: 'medium' },
      ],
      dailyGoals: {
        water: '8 glasses',
        steps: '10,000',
        sleep: '7-8 hours',
        exercise: '30 minutes',
      },
    });
  }

  return JSON.stringify({ message: 'AI analysis completed. Please consult a healthcare professional for medical advice.' });
};

export const analyzeSymptoms = async (symptoms, patientInfo = {}) => {
  const systemPrompt = `You are a medical AI symptom analyzer. Analyze the patient's symptoms and provide a JSON response with:
- possibleConditions: array of {name, probability (High/Medium/Low), description}
- recommendations: array of strings
- urgency: "low" | "medium" | "high" | "emergency"
- disclaimer: string
Consider the patient's age, gender, and medical history if provided. Always emphasize this is not a diagnosis.
Return ONLY valid JSON.`;

  const userMsg = `Symptoms: ${symptoms}
Patient Info: ${JSON.stringify(patientInfo)}`;

  const result = await chat(systemPrompt, userMsg);
  try { return JSON.parse(result); } catch { return { raw: result }; }
};

export const getDiagnosisSuggestions = async (symptoms, patientHistory = {}) => {
  const systemPrompt = `You are an AI assistant for doctors. Given patient symptoms and history, provide differential diagnosis suggestions as JSON:
- differentialDiagnosis: array of {condition, likelihood (High/Medium/Low), reasoning}
- suggestedTests: array of strings
- treatmentSuggestions: array of strings
- redFlags: array of warning signs to watch for
This is a clinical decision support tool, not a replacement for medical judgment.
Return ONLY valid JSON.`;

  const userMsg = `Symptoms: ${symptoms}
Patient History: ${JSON.stringify(patientHistory)}`;

  const result = await chat(systemPrompt, userMsg);
  try { return JSON.parse(result); } catch { return { raw: result }; }
};

export const summarizeLabReport = async (reportData) => {
  const systemPrompt = `You are a medical AI that summarizes lab reports for patients in simple language. Provide a JSON response:
- summary: plain language summary
- keyFindings: array of {parameter, value, status: "normal"|"watch"|"abnormal"}
- recommendations: array of strings
- overallAssessment: string
Make it understandable for non-medical people. Return ONLY valid JSON.`;

  const result = await chat(systemPrompt, `Lab Report Data: ${reportData}`);
  try { return JSON.parse(result); } catch { return { raw: result }; }
};

export const assessHealthRisk = async (vitalsHistory, patientProfile) => {
  const systemPrompt = `You are a health risk prediction AI. Analyze the patient's vitals history and profile to predict health risks. Provide JSON:
- riskFactors: array of {factor, level (Low/Moderate/High/Critical), details}
- preventiveActions: array of strings
- overallRisk: string
Return ONLY valid JSON.`;

  const userMsg = `Vitals History: ${JSON.stringify(vitalsHistory)}
Patient Profile: ${JSON.stringify(patientProfile)}`;

  const result = await chat(systemPrompt, userMsg, 1200);
  try { return JSON.parse(result); } catch { return { raw: result }; }
};

export const getHealthTips = async (patientProfile, latestVitals) => {
  const systemPrompt = `You are a personalized health advisor AI. Based on the patient's profile and latest vitals, provide tailored health tips as JSON:
- tips: array of {category, tip, priority: "high"|"medium"|"low"}
- dailyGoals: object with recommended daily targets
Return ONLY valid JSON.`;

  const userMsg = `Profile: ${JSON.stringify(patientProfile)}
Latest Vitals: ${JSON.stringify(latestVitals)}`;

  const result = await chat(systemPrompt, userMsg);
  try { return JSON.parse(result); } catch { return { raw: result }; }
};
