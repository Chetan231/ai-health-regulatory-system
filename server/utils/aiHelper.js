// AI Helper - Uses OpenAI API or falls back to mock responses

const mockResponses = {
  symptomCheck: (symptoms) => {
    const conditions = [
      { condition: 'Common Cold', probability: 'High', severity: 'Mild', description: 'Viral infection of the upper respiratory tract' },
      { condition: 'Seasonal Allergies', probability: 'Medium', severity: 'Mild', description: 'Immune response to environmental allergens' },
      { condition: 'Influenza', probability: 'Low', severity: 'Moderate', description: 'Viral infection requiring rest and fluids' },
    ];
    return {
      analysis: `Based on the symptoms described: "${symptoms}", here is a preliminary assessment. This is NOT a medical diagnosis. Please consult a healthcare professional.`,
      possibleConditions: conditions,
      recommendations: [
        'Schedule an appointment with your doctor',
        'Rest and stay hydrated',
        'Monitor your symptoms for changes',
        'Take over-the-counter medication for symptom relief if needed',
      ],
      urgency: 'non-urgent',
      disclaimer: 'This AI analysis is for informational purposes only and should not replace professional medical advice.',
    };
  },

  reportSummary: (report) => {
    const abnormal = report.results?.filter(r => r.status !== 'normal') || [];
    return {
      summary: `Report "${report.title}" contains ${report.results?.length || 0} parameters. ${abnormal.length} values are outside normal range.`,
      highlights: abnormal.map(r => `${r.parameter}: ${r.value} ${r.unit} (${r.status})`),
      overallAssessment: abnormal.length === 0
        ? 'All values are within normal range. No immediate concerns detected.'
        : `${abnormal.length} parameter(s) require attention. Please consult with your doctor for a thorough evaluation.`,
      recommendations: abnormal.length > 0
        ? ['Follow up with your doctor regarding abnormal values', 'Consider lifestyle modifications', 'Schedule a re-test in the recommended timeframe']
        : ['Continue maintaining your current health routine', 'Schedule regular check-ups'],
    };
  },

  healthRisk: (patientData) => {
    return {
      overallRisk: 'Moderate',
      riskScore: 35,
      factors: [
        { factor: 'Cardiovascular', risk: 'Low', score: 20, details: 'Based on available vitals and history' },
        { factor: 'Metabolic', risk: 'Moderate', score: 40, details: 'Monitor blood glucose levels regularly' },
        { factor: 'Respiratory', risk: 'Low', score: 15, details: 'No significant respiratory concerns' },
        { factor: 'Lifestyle', risk: 'Moderate', score: 45, details: 'Consider increasing physical activity' },
      ],
      recommendations: [
        'Maintain a balanced diet rich in fruits and vegetables',
        'Exercise at least 150 minutes per week',
        'Schedule regular health check-ups',
        'Monitor blood pressure and glucose levels',
        'Ensure adequate sleep (7-9 hours)',
      ],
      disclaimer: 'This risk assessment is AI-generated and for informational purposes only.',
    };
  },
};

export const analyzeSymptoms = async (symptoms) => {
  // TODO: Integrate OpenAI API when key is available
  // For now, return mock response
  return mockResponses.symptomCheck(symptoms);
};

export const summarizeReport = async (report) => {
  return mockResponses.reportSummary(report);
};

export const predictHealthRisk = async (patientData) => {
  return mockResponses.healthRisk(patientData);
};
