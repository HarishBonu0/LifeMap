export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, language, context } = req.body || {};
    const serverApiKey = process.env.LLM_API_KEY || process.env.GEMINI_API_KEY;
    const serverApiEndpoint = process.env.LLM_API_ENDPOINT;

    // If external LLM key and endpoint are configured, call it securely
    if (serverApiKey && serverApiEndpoint) {
      try {
        const llmResponse = await fetch(serverApiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${serverApiKey}`,
          },
          body: JSON.stringify({
            prompt: message,
            language,
            context
          })
        });

        if (llmResponse.ok) {
          const llmData: any = await llmResponse.json();
          if (llmData.reply) {
            return res.status(200).json({ reply: llmData.reply });
          }
        }
      } catch (llmErr) {
        console.warn('Production serverless LLM call failed, falling back to actuarial engine', llmErr);
      }
    }

    // Actuarial fallback generator
    const reply = generateActuarialReply(message, language, context);
    return res.status(200).json({ reply });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}

function generateActuarialReply(query: string, lang: string, context?: any): string {
  const lower = (query || '').toLowerCase();
  const isTelugu = lang === 'te' || lower.includes('telugu') || lower.includes('తెలుగు');
  const isHindi = lang === 'hi' || lower.includes('hindi') || lower.includes('हिंदी');

  if (lower.includes('gap') || lower.includes('shortfall') || lower.includes('లోటు') || lower.includes('गैप')) {
    if (context?.calculation) {
      const gap = context.calculation.coverageGap ? `₹${(context.calculation.coverageGap / 100000).toFixed(1)} Lakhs` : '₹0';
      if (isTelugu) {
        return `మీ రక్షణ లోటు (Coverage Gap): ${gap}. ఈ లోటును పూడ్చడానికి తక్కువ ప్రీమియంతో కూడిన ప్యూర్ టర్మ్ ప్లాన్ తీసుకోవడం ఉత్తమం.`;
      }
      if (isHindi) {
        return `आपका कवरेज गैप: ${gap}. इस कमी को पूरा करने के लिए शुद्ध टर्म इंश्योरेंस सबसे किफायती और सुरक्षित विकल्प है।`;
      }
      return `Your current calculated coverage gap is ${gap}. Securing an individual term insurance plan will eliminate this shortfall without high investment premiums.`;
    }
  }

  if (lower.includes('term') || lower.includes('endowment') || lower.includes('ulip') || lower.includes('టర్మ్') || lower.includes('टर्म')) {
    if (isTelugu) {
      return `ప్యూర్ టర్మ్ ఇన్సూరెన్స్ మాత్రమే నిజమైన జీవిత రక్షణను తక్కువ ఖర్చుతో అందిస్తుంది. ఎండోమెంట్ లేదా యులిప్ ప్లాన్లు తక్కువ కవర్ మరియు అధిక ఛార్జీలు కలిగి ఉంటాయి.`;
    }
    if (isHindi) {
      return `प्योर टर्म इंश्योरेंस कम प्रीमियम में अधिकतम सुरक्षा देता है। एंडोमेंट या यूलिप पॉलिसियों में सुरक्षा बहुत कम और खर्चे अधिक होते हैं।`;
    }
    return `Pure term insurance provides the highest cover at the lowest cost. Traditional endowment or ULIP products charge steep fees and provide very little actual life protection.`;
  }

  if (isTelugu) {
    return `లైఫ్‌మ్యాప్ AI గైడ్: మీ కుటుంబ రక్షణ గణనలు, టర్మ్ పాలసీల నియమాలు మరియు క్లెయిమ్ నిష్పత్తుల గురించి మరింత సమాచారం అడగవచ్చు.`;
  }
  if (isHindi) {
    return `लाइफमैप AI गाइड: अपनी वित्तीय सुरक्षा गणना, टर्म इंश्योरेंस नियमों या कवरेज गैप के बारे में मुझसे और पूछें।`;
  }
  return `LifeMap AI Guide: I can help explain your protection need, coverage gap, or difference between pure term and endowment policies. What would you like to explore?`;
}
