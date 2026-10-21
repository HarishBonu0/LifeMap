import { Language, ChatMessage, FinancialAssessmentInputs, InsuranceNeedsResult } from '../types';
import { formatIndianCurrency } from '../lib/calculator';

interface GenerateChatOptions {
  message: string;
  language: Language;
  userInputs?: FinancialAssessmentInputs;
  calculationResult?: InsuranceNeedsResult;
}

// Built-in intelligent multilingual knowledge base for fallback & instant demo mode
export const aiChatService = {
  async sendMessage(options: GenerateChatOptions): Promise<string> {
    const { message, language, userInputs, calculationResult } = options;
    const lower = message.toLowerCase();

    // 1. Attempt server-side /api/chat endpoint where LLM keys remain strictly secure on the server
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          language,
          context: {
            inputs: userInputs,
            calculation: calculationResult ? {
              totalProtectionNeed: calculationResult.totalProtectionNeed,
              coverageGap: calculationResult.coverageGap,
              existingTotalCoverage: calculationResult.existingTotalCoverage
            } : undefined
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.reply) return data.reply;
      }
    } catch {
      // Graceful fallback to deterministic knowledge engine below
    }

    // 2. Intelligent context-aware localized response generator
    return this.generateContextualResponse(lower, language, userInputs, calculationResult);
  },

  generateContextualResponse(
    query: string,
    lang: Language,
    inputs?: FinancialAssessmentInputs,
    result?: InsuranceNeedsResult
  ): string {
    const isTelugu = lang === 'te' || query.includes('telugu') || query.includes('తెలుగు');
    const isHindi = lang === 'hi' || query.includes('hindi') || query.includes('हिंदी');

    // 1. Coverage Gap / Shortfall explanation
    if (query.includes('gap') || query.includes('shortfall') || query.includes('లోటు') || query.includes('गैप') || query.includes('कमी')) {
      if (result) {
        const gapFormatted = formatIndianCurrency(result.coverageGap);
        const needFormatted = formatIndianCurrency(result.totalProtectionNeed);
        const coverFormatted = formatIndianCurrency(result.existingTotalCoverage);

        if (isTelugu) {
          return `మీ ప్రస్తుత అంచనా ప్రకారం:\n\n• **మొత్తం రక్షణ అవసరం**: ${needFormatted}\n• **ప్రస్తుత బీమా కవరేజ్**: ${coverFormatted}\n• **రక్షణ లోటు (Coverage Gap)**: ${gapFormatted}\n\nఈ లోటు ఎలా వచ్చిందంటే: మీ కుటుంబ నెలవారీ ఖర్చులు (${formatIndianCurrency(inputs?.monthlyExpenses || 0)}), మిగిలిన రుణాలు మరియు పిల్లల భవిష్యత్ అవసరాలను పరిగణనలోకి తీసుకుని లెక్కిస్తే, మీ వద్ద ఉన్న బీమా కంటే ${gapFormatted} ఎక్కువ రక్షణ మీ కుటుంబానికి అవసరమని సూచిస్తుంది.`;
        }
        if (isHindi) {
          return `आपके वर्तमान वित्तीय आकलन के अनुसार:\n\n• **कुल सुरक्षा आवश्यकता**: ${needFormatted}\n• **वर्तमान उपलब्ध बीमा कवर**: ${coverFormatted}\n• **कवरेज गैप (कमी)**: ${gapFormatted}\n\nयह अंतर इसलिए है क्योंकि आपके परिवार के मासिक खर्च (${formatIndianCurrency(inputs?.monthlyExpenses || 0)}), बकाया ऋण और बच्चों की भविष्य की शिक्षा को सुरक्षित करने के लिए मौजूदा कवर से ${gapFormatted} अधिक सुरक्षा की आवश्यकता है।`;
        }
        return `Based on your assessment:\n\n• **Total Estimated Protection Need**: ${needFormatted}\n• **Existing Total Coverage**: ${coverFormatted}\n• **Coverage Shortfall (Gap)**: ${gapFormatted}\n\nWhy this gap exists: Your family requires protection for living expenses (${formatIndianCurrency(inputs?.monthlyExpenses || 0)}/mo), outstanding liabilities, and milestones. Your existing cover leaves an estimated shortfall of ${gapFormatted} under current assumptions.`;
      }
    }

    // 2. Calculation Methodology / How is it calculated
    if (query.includes('calculate') || query.includes('how did you') || query.includes('formula') || query.includes('లెక్క') || query.includes('गणना')) {
      if (isTelugu) {
        return `లైఫ్‌మ్యాప్ రక్షణ అవసరాన్ని పారదర్శక పద్ధతిలో లెక్కిస్తుంది:\n\n1. **కుటుంబ పోషణ వ్యయం**: నెలవారీ ఖర్చులు × 12 × రక్షణ కాలం (ద్రవ్యోల్బణం 6% పరిగణించి).\n2. **+ రుణాలు & బాధ్యతలు**: హోమ్ లోన్ మరియు ఇతర అప్పులు.\n3. **+ భవిష్యత్ లక్ష్యాలు**: పిల్లల చదువులు మరియు అత్యవసర నిధులు.\n4. **- అందుబాటులో ఉన్న ఆస్తులు**: అత్యవసర పొదుపు మరియు మ్యూచువల్ ఫండ్స్.\n\nవచ్చిన మొత్తమే మీ కుటుంబానికి అవసరమైన నికర జీవిత బీమా రక్షణ (Net Protection Need).`;
      }
      if (isHindi) {
        return `लाइफमैप सुरक्षा आवश्यकता की गणना पारदर्शी तरीके से करता है:\n\n1. **परिवार के भविष्य के खर्च**: मासिक खर्च × 12 × सुरक्षा अवधि (6% मुद्रास्फीति के साथ).\n2. **+ बकाया ऋण**: होम लोन एवं अन्य देनदारियां.\n3. **+ भविष्य के लक्ष्य**: बच्चों की उच्च शिक्षा एवं अन्य प्रतिबद्धताएं.\n4. **- उपलब्ध तरल संपत्तियां**: बचत, एफडी और म्यूचुअल फंड्स.\n\nइस कुल योग से आपकी वास्तविक शुद्ध सुरक्षा आवश्यकता (Net Protection Need) निकलती है।`;
      }
      return `LifeMap uses a transparent, deterministic formula rather than arbitrary salary multipliers:\n\n1. **Future Living Expenses**: Present value of annual household expenses across dependants' support duration with inflation.\n2. **+ Outstanding Liabilities**: Principal on home loans and other debts.\n3. **+ Future Commitments**: Children's higher education and medical milestone funds.\n4. **- Available Liquid Assets**: Eligible emergency savings and investments.\n\nTotal Protection Need = (Living Needs + Debts + Commitments) - Liquid Assets.`;
    }

    // 3. Term Insurance vs Traditional Savings / ULIP / Endowment
    if (query.includes('term') || query.includes('endowment') || query.includes('ulip') || query.includes('టర్మ్') || query.includes('टर्म') || query.includes('एंडोमेंट')) {
      if (isTelugu) {
        return `**ప్యూర్ టర్మ్ ఇన్సూరెన్స్ (Pure Term Insurance) vs సాంప్రదాయ పాలసీలు (Endowment/ULIP):**\n\n• **ప్యూర్ టర్మ్ ఇన్సూరెన్స్**: తక్కువ ప్రీమియంతో అత్యధిక రక్షణ (ఉదాహరణకు ₹1 కోటి కవర్ తక్కువ వార్షిక వ్యయంతో). ఇది పాలసీదారునికి ఏదైనా జరిగితే కుటుంబానికి ఆర్థిక రక్షణ మాత్రమే ఇస్తుంది.\n• **సాంప్రదాయ/యులిప్ పాలసీలు**: బీమా మరియు పొదుపును కలిపి అధిక ప్రీమియం తీసుకుంటాయి, కానీ బీమా రక్షణ చాలా తక్కువగా (తరచుగా కేవలం ₹5-10 లక్షలు) మాత్రమే ఉంటుంది.\n\nఆర్థిక నిపుణుల సలహా: బీమాను మరియు పెట్టుబడిని ఎప్పుడూ కలపకండి. తక్కువ ఖర్చుతో పెద్ద టర్మ్ ప్లాన్ తీసుకుని, మిగిలిన మొత్తాన్ని మ్యూచువల్ ఫండ్స్ లో పెట్టుబడి పెట్టడం మంచిది.`;
      }
      if (isHindi) {
        return `**शुद्ध टर्म इंश्योरेंस (Pure Term) बनाम एंडोमेंट/यूलिप (Endowment/ULIP):**\n\n• **प्योर टर्म इंश्योरेंस**: बहुत कम प्रीमियम में अधिकतम सुरक्षा (जैसे ₹1 करोड़ का कवर उचित वार्षिक प्रीमियम पर). यह विशुद्ध सुरक्षा योजना है।\n• **एंडोमेंट/यूलिप**: बीमा और निवेश को मिलाते हैं, जिससे प्रीमियम बहुत ज्यादा होता है और वास्तविक सुरक्षा केवल ₹5-10 लाख जैसी बहुत कम मिलती है।\n\nवित्तीय नियम: बीमा को सुरक्षा के लिए रखें और निवेश को वेल्थ क्रिएशन के लिए अलग रखें।`;
      }
      return `**Pure Term Insurance vs Traditional / ULIP / Endowment Plans:**\n\n• **Pure Term Insurance**: Maximum pure financial protection at the lowest cost (e.g. ₹1 Crore coverage for a modest annual premium). No maturity bonus if you survive, but complete safety for your family.\n• **Endowment & ULIPs**: Mix investment with insurance, resulting in high premiums and very low cover (often only ₹5-10 Lakhs), failing to protect families against major financial shocks.\n\nGolden Rule: Keep protection and investments separate. Buy pure term for safety, and invest the difference in mutual funds or diversified assets.`;
    }

    // 4. Employer coverage limitations
    if (query.includes('employer') || query.includes('office') || query.includes('company') || query.includes('కంపెనీ') || query.includes('कंपनी')) {
      if (isTelugu) {
        return `**కంపెనీ (Employer) అందించే గ్రూప్ లైఫ్ కవర్ పరిమితులు:**\n\n1. మీరు ఉద్యోగం మారినప్పుడు లేదా రాజీనామా చేసినప్పుడు ఆ కవర్ తక్షణమే రద్దవుతుంది.\n2. వయస్సు పెరిగే కొద్దీ లేదా భవిష్యత్తులో ఏదైనా అనారోగ్యం వస్తే కొత్తగా వ్యక్తిగత టర్మ్ పాలసీ తీసుకోవడం కష్టమవుతుంది లేదా ప్రీమియం పెరుగుతుంది.\n3. కాబట్టి కంపెనీ కవర్‌తో సంబంధం లేకుండా మీకంటూ ఒక సొంత ఇండివిడ్యువల్ టర్మ్ ఇన్సూరెన్స్ ఉండటం అత్యంత ముఖ్యం.`;
      }
      if (isHindi) {
        return `**कंपनी (Employer) द्वारा दिए जाने वाले ग्रुप इंश्योरेंस की सीमाएं:**\n\n1. नौकरी बदलते ही, छंटनी होने पर या रिटायरमेंट के समय यह कवर तुरंत समाप्त हो जाता है।\n2. उम्र बढ़ने या बाद में कोई स्वास्थ्य समस्या आने पर नया व्यक्तिगत टर्म प्लान महंगा या कठिन हो सकता है।\n3. इसलिए केवल कंपनी कवर पर निर्भर न रहें; अपने नाम से एक व्यक्तिगत टर्म प्लान अवश्य रखें।`;
      }
      return `**Key Limitations of Employer Group Life Cover:**\n\n1. **Ceases on Job Change**: Group cover ends the day you leave the company.\n2. **Health & Age Risks**: If you wait until you leave your job, pre-existing health conditions or older age may drastically increase premiums or cause rejection.\n3. **Independent Security**: Financial planners strongly recommend owning an independent individual term policy that stays with you regardless of career shifts.`;
    }

    // 5. Home loan impact
    if (query.includes('home loan') || query.includes('loan') || query.includes('హోమ్ లోన్') || query.includes('होम लोन') || query.includes('ऋण')) {
      if (isTelugu) {
        return `మీరు గృహ రుణం (Home Loan) తీసుకున్నప్పుడు, మీ కుటుంబంపై ఆ బాధ్యత పడకుండా ఉండేందుకు మీ బీమా రక్షణను కనీసం ఆ లోన్ ప్రిన్సిపల్ మొత్తానికి సమానంగా పెంచుకోవాలి. లైఫ్‌మ్యాప్ లోని "ఫ్యూచర్ సిమ్యులేటర్" ద్వారా మీరు హోమ్ లోన్ మార్పులను ప్రత్యక్షంగా పరీక్షించవచ్చు!`;
      }
      if (isHindi) {
        return `जब आप होम लोन लेते हैं, तो परिवार पर कर्ज का बोझ न आए इसके लिए आपके बीमा कवर में कम से कम लोन की मूलधन राशि जितनी वृद्धि होनी चाहिए। आप लाइफमैप के "भविष्य सिम्युलेटर" में होम लोन प्रीसेट चुनकर इसका सीधा असर देख सकते हैं!`;
      }
      return `When taking a home loan, your life cover must increase by at least the outstanding loan principal so surviving dependants are never forced to liquidate the home to clear bank debt. Try our "Future Scenario Simulator" to test this preset interactively!`;
    }

    // Default general response
    if (isTelugu) {
      return `నమస్కారం! నేను మీ లైఫ్‌మ్యాప్ AI ఫైనాన్షియల్ గైడ్‌ని. నేను మీ బీమా రక్షణ అంచనాలు, టర్మ్ ఇన్సూరెన్స్ ప్రాముఖ్యత, కవరేజ్ గ్యాప్ మరియు భవిష్యత్ పరిస్థితుల గురించి సరళమైన తెలుగులో వివరించగలను. మీరు ఏమి తెలుసుకోవాలనుకుంటున్నారో అడగండి!`;
    }
    if (isHindi) {
      return `नमस्ते! मैं आपका लाइफमैप AI वित्तीय मार्गदर्शक हूँ। मैं आपकी बीमा सुरक्षा गणना, टर्म इंश्योरेंस के महत्व, कवरेज गैप और भविष्य के परिदृश्यों को सरल हिंदी में समझा सकता हूँ। आप क्या जानना चाहते हैं?`;
    }
    return `Hello! I am your LifeMap AI Financial Guide. I can explain your protection estimate, coverage gap calculations, differences between pure term and endowment policies, or how life events affect your safety net. How can I help you today?`;
  }
};
