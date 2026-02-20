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

export const chatResponse = async (message, history) => {
  const msg = message.toLowerCase().trim();

  // Greeting
  if (/^(hi|hello|hey|namaste|hlo|hii|namaskar)/.test(msg)) {
    return { reply: 'Namaste! 🙏 Main aapka AI Health Assistant hu. Aap mujhse health se related koi bhi sawaal pooch sakte hain. Kaise madad kar sakta hu?', type: 'greeting' };
  }

  // Thanks
  if (/^(thanks|thank you|dhanyawad|shukriya|ok thanks)/.test(msg)) {
    return { reply: 'Aapka swagat hai! 😊 Agar koi aur sawaal ho to zaroor poochein. Apna khayal rakhein! 🏥', type: 'thanks' };
  }

  // Fever
  if (/fever|bukhar|temperature|badan garam|tapman/.test(msg)) {
    return {
      reply: '🤒 **Bukhar ke baare mein:**\n\n• Normal body temperature: 98.6°F (37°C)\n• Halka bukhar: 99-100.4°F — Paracetamol lein, aaram karein\n• Tez bukhar: 100.4°F+ — Doctor se milein\n• Bahut tez bukhar: 103°F+ — Turant medical help lein\n\n**Ghar pe kya karein:**\n• Paani zyada peeyein\n• Halka khana khayein\n• Aaram karein\n• Thande paani ki patti rakhein\n\n⚠️ Agar bukhar 3 din se zyada hai, to doctor se zaroor milein.',
      type: 'medical',
    };
  }

  // Headache
  if (/headache|sir dard|sar dard|migraine|head pain|sir me dard/.test(msg)) {
    return {
      reply: '🤕 **Sir Dard (Headache):**\n\n**Common Causes:**\n• Tension/stress\n• Neend ki kami\n• Dehydration (paani kam peena)\n• Screen pe zyada time\n• Eye strain\n\n**Ghar pe ilaj:**\n• Paani peeyein (kam se kam 8 glass daily)\n• Aankhon ko aaram dein\n• Thanda ya garam compress lagayein\n• Halki neend lein\n• Paracetamol le sakte hain\n\n⚠️ Agar sir dard bahut tez hai, roz hota hai, ya ulti ke saath hai — to doctor se milein.',
      type: 'medical',
    };
  }

  // Cold/Cough
  if (/cold|cough|khansi|sardi|jukham|naak|runny nose|sneez|छींक/.test(msg)) {
    return {
      reply: '🤧 **Sardi-Khansi:**\n\n**Ghar pe ilaj:**\n• Garam paani mein shahad aur nimbu\n• Bhap lein (steam inhalation)\n• Haldi wala doodh raat ko\n• Adrak ki chai\n• Garam paani ke gargle\n• Aaram karein\n\n**Kab doctor ke paas jaayein:**\n• 7 din se zyada ho\n• Tez bukhar ho saath mein\n• Saans lene mein dikkat ho\n• Chest mein dard ho\n\n💊 Over-the-counter: Cetirizine ya Sinarest le sakte hain.',
      type: 'medical',
    };
  }

  // Stomach
  if (/stomach|pet|dard|acidity|gas|constipation|diarrhea|loose motion|ulti|vomit|nausea|pet dard|kabz/.test(msg)) {
    return {
      reply: '🤢 **Pet ki Samasya:**\n\n**Acidity/Gas:**\n• Khane ke baad turant na letein\n• Masaledaar khana kam karein\n• Jeera paani peeyein\n• Antacid le sakte hain\n\n**Constipation (Kabz):**\n• Fiber wala khana (sabzi, fruits)\n• Paani zyada peeyein\n• Subah garam paani peeyein\n• Isabgol le sakte hain\n\n**Loose Motion:**\n• ORS ghol peeyein\n• Dahi-chawal khayein\n• Paani zyada peeyein\n• Oily khana avoid karein\n\n⚠️ Agar khoon aaye, 2 din se zyada ho, ya bahut zyada ho — turant doctor ke paas jaayein.',
      type: 'medical',
    };
  }

  // BP / Blood Pressure
  if (/blood pressure|bp|high bp|low bp|hypertension|raktchap/.test(msg)) {
    return {
      reply: '💓 **Blood Pressure (BP):**\n\n**Normal BP:** 120/80 mmHg\n**High BP:** 140/90+ mmHg\n**Low BP:** 90/60 se neeche\n\n**High BP control karein:**\n• Namak kam khayein\n• Daily 30 min walk\n• Stress kam karein\n• Weight control karein\n• Dawai time pe lein\n\n**Low BP ke liye:**\n• Paani zyada peeyein\n• Namak thoda zyada lein\n• Chhote-chhote meals lein\n• Achanak na uthein\n\n⚠️ Regular BP check karwayein. Dawai bina doctor ki salah ke na bandh karein.',
      type: 'medical',
    };
  }

  // Diabetes / Sugar
  if (/diabetes|sugar|madhumeh|blood sugar|glucose|insulin/.test(msg)) {
    return {
      reply: '🩸 **Diabetes (Sugar):**\n\n**Normal Levels:**\n• Fasting: 70-100 mg/dL\n• After meal: Below 140 mg/dL\n• HbA1c: Below 5.7%\n\n**Control kaise karein:**\n• Meetha aur maida kam khayein\n• Roti chapati (wheat) khayein\n• Sabzi aur salad zyada\n• Daily exercise (30 min walk)\n• Dawai samay pe lein\n• Regular sugar check karein\n\n**Kya khayein:** Karela, methi, jamun, oats, daliya\n**Kya na khayein:** Cold drinks, mithai, white rice zyada\n\n⚠️ Sugar bahut kam ya bahut zyada ho to turant doctor se milein.',
      type: 'medical',
    };
  }

  // Heart
  if (/heart|dil|chest pain|seene me dard|cardiac|heart attack/.test(msg)) {
    return {
      reply: '❤️ **Dil ki Sehat:**\n\n**Heart Attack ke Symptoms:**\n🚨 Seene mein tez dard ya dabav\n🚨 Baayein haath mein dard\n🚨 Saans lene mein dikkat\n🚨 Pasina aana, chakkar\n\n**⚠️ Ye symptoms hain to TURANT 108 call karein!**\n\n**Dil ko healthy rakhein:**\n• Daily 30 min exercise\n• Oily/fried kam khayein\n• Smoking/alcohol chhod dein\n• Stress management\n• Regular checkup\n• BP aur cholesterol check karwayein\n\n💚 Healthy diet: fruits, sabzi, dry fruits, fish',
      type: 'emergency',
    };
  }

  // Sleep
  if (/sleep|neend|insomnia|sone|nind nahi|neend nahi/.test(msg)) {
    return {
      reply: '😴 **Neend ki Samasya:**\n\n**Acchi neend ke liye:**\n• Roz ek hi time pe soyein aur uthein\n• Sone se 1 ghanta pehle phone band karein\n• Kamre ko andhera aur thanda rakhein\n• Sone se pehle garam doodh peeyein\n• Caffeine (chai/coffee) shaam ke baad na lein\n• Dinner halka aur jaldi karein\n• Din mein exercise karein\n\n**Kitni neend chahiye:**\n• Adults: 7-9 ghante\n• Teenagers: 8-10 ghante\n• Bachche: 9-12 ghante\n\n⚠️ Agar 2 hafte se zyada neend nahi aa rahi to doctor se milein.',
      type: 'medical',
    };
  }

  // Skin
  if (/skin|twacha|pimple|acne|rash|khujli|itching|allergy|daad/.test(msg)) {
    return {
      reply: '🧴 **Skin Problems:**\n\n**Pimples/Acne:**\n• Face din mein 2 baar dhoyein\n• Oily khana kam khayein\n• Paani zyada peeyein\n• Face ko baar baar na chhuyein\n\n**Khujli/Rash:**\n• Calamine lotion lagayein\n• Neem ka paani se dhoyein\n• Tight kapde na pehnein\n• Antihistamine (Cetirizine) le sakte hain\n\n**Daad (Fungal):**\n• Jagah ko sukhha rakhein\n• Antifungal cream lagayein\n• Doosron ka towel na use karein\n\n⚠️ Agar rash badh raha hai ya bukhar ke saath hai to doctor ke paas jaayein.',
      type: 'medical',
    };
  }

  // Weight
  if (/weight|wajan|mota|patla|obesity|weight loss|weight gain|vajan/.test(msg)) {
    return {
      reply: '⚖️ **Weight Management:**\n\n**Weight Kam Karna:**\n• Din mein 3 meals + 2 chhote snacks\n• Maida, meetha, cold drinks bandh\n• Roti 2-3, sabzi zyada\n• Daily 45 min exercise\n• Paani 3-4 litre daily\n• Raat ka khana 8 baje se pehle\n\n**Weight Badhana:**\n• Protein zyada (daal, paneer, eggs, chicken)\n• Dry fruits daily\n• Banana shake\n• 5-6 baar khana\n• Weight training karein\n\n**BMI Check:**\n• Normal: 18.5-24.9\n• Underweight: <18.5\n• Overweight: 25-29.9\n• Obese: 30+',
      type: 'medical',
    };
  }

  // Mental health
  if (/stress|tension|anxiety|depression|mental|sad|udaas|pareshan|chinta/.test(msg)) {
    return {
      reply: '🧠 **Mental Health:**\n\n**Stress/Anxiety kam karein:**\n• Deep breathing (4-7-8 technique)\n• Daily 30 min walk/exercise\n• Music sunein\n• Kisi se baat karein\n• Social media kam use karein\n• Meditation/yoga karein\n• 7-8 ghante neend lein\n\n**Kab professional help lein:**\n• Roz udaas rehna\n• Neend mein bahut problem\n• Kisi kaam mein man na lagna\n• Har waqt thakaan\n• Negative thoughts aana\n\n📞 **Helpline:** Vandrevala Foundation: 1860-2662-345\n\n💚 Mental health bhi physical health jitni important hai. Madad maangne mein koi sharm nahi hai.',
      type: 'medical',
    };
  }

  // Pregnancy
  if (/pregnancy|pregnant|garbhwati|periods|mahwari|pcod|pcos/.test(msg)) {
    return {
      reply: '🤰 **Women\'s Health:**\n\n**Pregnancy care:**\n• Regular checkup karwayein\n• Folic acid lein\n• Iron aur calcium ki tablet\n• Balanced diet lein\n• Halki exercise karein\n• Stress se bachein\n\n**Periods related:**\n• Irregular periods: Doctor se milein\n• Period cramps: Garam paani ki bottle rakhein\n• Heavy bleeding: Iron rich food lein\n\n**PCOD/PCOS:**\n• Weight control karein\n• Exercise daily\n• Sugar aur maida kam\n• Metformin (doctor ki salah se)\n\n⚠️ Ye general information hai. Apne gynecologist se zaroor consult karein.',
      type: 'medical',
    };
  }

  // COVID
  if (/covid|corona|omicron|pandemic/.test(msg)) {
    return {
      reply: '😷 **COVID-19 Guide:**\n\n**Symptoms:**\n• Bukhar, khansi, thakaan\n• Saans mein dikkat\n• Smell/taste na aana\n• Gala kharab\n\n**Kya karein:**\n• Test karwayein (RT-PCR/RAT)\n• Isolate ho jayein\n• Paani aur fluids zyada lein\n• Paracetamol bukhar ke liye\n• SpO2 monitor karein (95+ normal)\n\n**⚠️ Emergency:** SpO2 93 se neeche, saans lene mein bahut dikkat → Hospital jayein\n\n**Prevention:** Mask, haath dhona, vaccination complete karein',
      type: 'medical',
    };
  }

  // Eye
  if (/eye|aankh|nazar|vision|glasses|chasma/.test(msg)) {
    return {
      reply: '👁️ **Aankhon ki Dekhbhal:**\n\n**Digital Eye Strain:**\n• 20-20-20 rule: Har 20 min mein, 20 feet door, 20 sec tak dekhein\n• Screen brightness adjust karein\n• Blue light filter use karein\n• Aankhein baar baar jhapkayein\n\n**Aankhon ke liye:**\n• Gajar, palak, aamla khayein\n• Dhoop mein sunglasses lagayein\n• Roz aankhein paani se dhoyein\n• Saal mein ek baar eye checkup\n\n⚠️ Achanak nazar kamzor ho, dard ho, ya laal ho to turant eye doctor ke paas jaayein.',
      type: 'medical',
    };
  }

  // Emergency
  if (/emergency|ambulance|108|hospital|turant|urgent/.test(msg)) {
    return {
      reply: '🚨 **Emergency Numbers:**\n\n📞 **Ambulance:** 108\n📞 **Emergency:** 112\n📞 **Poison Helpline:** 1800-11-6117\n📞 **Mental Health:** 1860-2662-345\n\n**Kab emergency hai:**\n• Chest pain / heart attack symptoms\n• Saans band ho rahi ho\n• Bahut zyada bleeding\n• Stroke symptoms (face droop, arm weakness)\n• Serious accident/injury\n• Behoshi\n\n⚠️ **Emergency mein pehle 108 call karein, phir first aid dein!**',
      type: 'emergency',
    };
  }

  // Default - general health query
  return {
    reply: `🤖 Main aapki baat samajh raha hu. Aapne "${message}" ke baare mein poocha.\n\nMain aapko kuch general advice de sakta hu:\n\n• **Healthy Diet:** Sabzi, fruits, daal, roti balanced khayein\n• **Exercise:** Din mein 30 min walk ya exercise\n• **Paani:** Kam se kam 8 glass paani daily\n• **Neend:** 7-8 ghante ki neend zaruri hai\n• **Checkup:** Saal mein ek baar full body checkup karwayein\n\nKya aap kisi specific problem ke baare mein jaanna chahte hain? Jaise:\n• Bukhar, sardi, khansi\n• Pet dard, acidity\n• BP, sugar, heart\n• Skin problems\n• Mental health\n• Weight management\n\nMujhe detail mein batayein! 😊`,
    type: 'general',
  };
};
