import { DreamLifeGoal, DreamGoalCategory, EstimateSourceType } from '../types';
import { calculateFutureGoalCost } from '../lib/calculator';

interface ParsedGoalRule {
  category: DreamGoalCategory;
  defaultTitle: string;
  keywords: string[];
  benchmarkCost: number; // in INR
  defaultPriority: 'essential' | 'high' | 'medium' | 'flexible';
  typicalYears: number;
}

const CATEGORY_RULES: ParsedGoalRule[] = [
  {
    category: 'property',
    defaultTitle: 'Residential Property / Home',
    keywords: ['house', 'home', 'flat', 'apartment', 'villa', 'property', 'plot', 'land'],
    benchmarkCost: 12000000, // ₹1.2 Cr typical metro benchmark
    defaultPriority: 'high',
    typicalYears: 10
  },
  {
    category: 'vehicle',
    defaultTitle: 'Personal / Family Vehicle',
    keywords: ['car', 'cars', 'vehicle', 'ev', 'suv', 'bike'],
    benchmarkCost: 1500000, // ₹15 Lakhs
    defaultPriority: 'flexible',
    typicalYears: 5
  },
  {
    category: 'investment',
    defaultTitle: 'Long-Term Investment Corpus',
    keywords: ['investment', 'investments', 'corpus', 'mutual fund', 'stocks', 'portfolio', 'wealth'],
    benchmarkCost: 20000000, // ₹2 Cr
    defaultPriority: 'high',
    typicalYears: 15
  },
  {
    category: 'business',
    defaultTitle: 'Business Startup Capital',
    keywords: ['business', 'startup', 'shop', 'venture', 'company', 'firm', 'agency', 'enterprise'],
    benchmarkCost: 3500000, // ₹35 Lakhs
    defaultPriority: 'medium',
    typicalYears: 7
  },
  {
    category: 'education',
    defaultTitle: 'Higher Education Fund',
    keywords: ['education', 'college', 'university', 'school', 'degree', 'mba', 'masters', 'study abroad'],
    benchmarkCost: 3000000, // ₹30 Lakhs
    defaultPriority: 'essential',
    typicalYears: 12
  },
  {
    category: 'retirement',
    defaultTitle: 'Retirement Independence Fund',
    keywords: ['retire', 'retirement', 'pension', 'old age', 'post-retirement'],
    benchmarkCost: 25000000, // ₹2.5 Cr
    defaultPriority: 'essential',
    typicalYears: 20
  },
  {
    category: 'travel',
    defaultTitle: 'Family Travel & World Experiences',
    keywords: ['travel', 'vacation', 'world tour', 'holiday', 'trip', 'europe', 'tour'],
    benchmarkCost: 800000, // ₹8 Lakhs
    defaultPriority: 'flexible',
    typicalYears: 4
  },
  {
    category: 'debt_repayment',
    defaultTitle: 'Complete Debt Clearance',
    keywords: ['debt', 'loan', 'mortgage', 'liability', 'emi', 'clear loan'],
    benchmarkCost: 2500000, // ₹25 Lakhs
    defaultPriority: 'essential',
    typicalYears: 5
  },
  {
    category: 'emergency_fund',
    defaultTitle: 'Liquid Emergency Reserve',
    keywords: ['emergency fund', 'contingency', 'safety net', 'emergency'],
    benchmarkCost: 600000, // ₹6 Lakhs
    defaultPriority: 'essential',
    typicalYears: 2
  }
];

export const goalExtractionService = {
  /**
   * Parses natural text or speech transcript into structured, editable DreamLifeGoal cards.
   * If a server LLM endpoint is available, queries /api/chat; otherwise executes deterministic NLP extraction.
   */
  async extractGoalsFromTranscript(
    transcript: string,
    inflationRate: number = 0.06
  ): Promise<DreamLifeGoal[]> {
    const trimmed = transcript.trim();
    if (!trimmed) return [];

    // Attempt server-side LLM extraction if configured
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Extract all distinct financial and life goals mentioned in this transcript as structured JSON array:\n"${trimmed}"\nEach item must have: category (one of: property, vehicle, investment, business, education, family, retirement, travel, debt_repayment, emergency_fund, other), title, description, targetYears (number), currentEstimatedCost (number in INR), priority (essential, high, medium, flexible), missingInfo (string or null). Return ONLY valid JSON array.`,
          language: 'en'
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.reply) {
          const match = data.reply.match(/\[\s*\{.*\}\s*\]/s);
          if (match) {
            const parsedArray = JSON.parse(match[0]);
            if (Array.isArray(parsedArray) && parsedArray.length > 0) {
              return parsedArray.map((item: any, idx: number) => {
                const cost = Number(item.currentEstimatedCost) || 1000000;
                const years = Number(item.targetYears) || 10;
                return {
                  id: `goal_llm_${Date.now()}_${idx}`,
                  category: (item.category || 'other') as DreamGoalCategory,
                  title: item.title || 'Personal Goal',
                  description: item.description || trimmed,
                  targetYears: years,
                  currentEstimatedCost: cost,
                  futureInflatedCost: calculateFutureGoalCost(cost, years, inflationRate),
                  estimateSource: 'user_supplied' as EstimateSourceType,
                  priority: item.priority || 'high',
                  missingInfo: item.missingInfo || undefined,
                  originalTranscriptSnippet: trimmed.slice(0, 80)
                };
              });
            }
          }
        }
      }
    } catch {
      // Fallback to deterministic NLP extraction below
    }

    // Deterministic Rule-Based Indian Financial NLP Extractor
    return this.deterministicExtractGoals(trimmed, inflationRate);
  },

  /**
   * Deterministic pattern recognition for Indian financial terms, crore/lakh notation,
   * timelines, and milestone categories.
   */
  deterministicExtractGoals(transcript: string, inflationRate: number = 0.06): DreamLifeGoal[] {
    const text = transcript.toLowerCase();
    const goals: DreamLifeGoal[] = [];

    // Global timeline check (e.g. "in the next ten years", "within 10 years", "20 years")
    let globalYears = 10;
    const globalYearsMatch = text.match(/(?:in|within|next|over)\s+(\d{1,2}|one|two|three|four|five|six|seven|eight|nine|ten|fifteen|twenty)\s+years?/i);
    if (globalYearsMatch) {
      globalYears = this.wordToNumber(globalYearsMatch[1]);
    }

    // Split text into clauses by commas, "and", periods, semicolons
    const clauses = text.split(/[,;\.]+|\band\b/i).map(c => c.trim()).filter(Boolean);

    for (let i = 0; i < CATEGORY_RULES.length; i++) {
      const rule = CATEGORY_RULES[i];
      // Check if any keyword matches
      const matchedKeyword = rule.keywords.find(kw => text.includes(kw));
      if (!matchedKeyword) continue;

      // Find the specific clause containing this keyword
      const relevantClause = clauses.find(c => c.includes(matchedKeyword)) || text;

      // Extract amount from relevant clause or surrounding text
      const extractedCost = this.extractAmount(relevantClause) ?? this.extractAmount(text);
      const isUserSupplied = extractedCost !== null;
      const cost = isUserSupplied ? extractedCost! : rule.benchmarkCost;

      // Extract years from clause or use globalYears / rule typicalYears
      let goalYears = globalYears;
      const localYearMatch = relevantClause.match(/(\d{1,2})\s+years?/i);
      if (localYearMatch) {
        goalYears = parseInt(localYearMatch[1], 10);
      } else if (globalYears === 10 && rule.typicalYears !== 10) {
        goalYears = rule.typicalYears;
      }

      // Quantity multiplier (e.g. "two cars", "2 flats")
      let quantity = 1;
      const qtyMatch = relevantClause.match(/(?:(\d+)|two|three|four)\s+(?:cars|houses|flats|properties)/i);
      if (qtyMatch) {
        quantity = this.wordToNumber(qtyMatch[1] || qtyMatch[0].split(' ')[0]);
      }
      const finalCost = cost * quantity;

      // Estimate source tag
      let estimateSource: EstimateSourceType = 'illustrative_assumption';
      if (isUserSupplied) {
        estimateSource = 'user_supplied';
      } else {
        estimateSource = 'reliable_benchmark';
      }

      // Missing info warning
      let missingInfo: string | undefined = undefined;
      if (!isUserSupplied) {
        missingInfo = `Cost not explicitly stated; applied typical benchmark of ${formatCurrencyCompact(finalCost)}.`;
      }

      const title = quantity > 1 
        ? `${quantity} × ${rule.defaultTitle}` 
        : rule.defaultTitle;

      goals.push({
        id: `goal_${rule.category}_${Date.now()}_${goals.length}`,
        category: rule.category,
        title,
        description: relevantClause.charAt(0).toUpperCase() + relevantClause.slice(1),
        targetYears: goalYears,
        currentEstimatedCost: finalCost,
        futureInflatedCost: calculateFutureGoalCost(finalCost, goalYears, inflationRate),
        estimateSource,
        priority: rule.defaultPriority,
        missingInfo,
        originalTranscriptSnippet: relevantClause
      });
    }

    // If no specific category matched but user provided text, create a custom milestone
    if (goals.length === 0) {
      const extractedCost = this.extractAmount(text) || 1000000;
      goals.push({
        id: `goal_custom_${Date.now()}`,
        category: 'other',
        title: 'Custom Dream Milestone',
        description: transcript,
        targetYears: globalYears,
        currentEstimatedCost: extractedCost,
        futureInflatedCost: calculateFutureGoalCost(extractedCost, globalYears, inflationRate),
        estimateSource: extractedCost !== 1000000 ? 'user_supplied' : 'illustrative_assumption',
        priority: 'high',
        missingInfo: extractedCost === 1000000 ? 'Estimated at ₹10 Lakhs baseline. Tap to customize cost & timeline.' : undefined,
        originalTranscriptSnippet: transcript
      });
    }

    return goals;
  },

  /**
   * Helper to parse Indian amounts (e.g. "1.5 crore", "1.5 cr", "50 lakh", "25l", "₹20,000", "50k")
   */
  extractAmount(clause: string): number | null {
    // 1. Crore pattern: 1.5 crore, 1.5cr, 2 crores
    const croreMatch = clause.match(/(?:₹|rs\.?|inr)?\s*([0-9]+(?:\.[0-9]+)?)\s*(?:cr|crore|crores)\b/i);
    if (croreMatch) {
      const val = parseFloat(croreMatch[1]);
      if (!isNaN(val)) return Math.round(val * 10000000);
    }

    // 2. Lakh pattern: 50 lakh, 50lakhs, 25 l, 80 lacs
    const lakhMatch = clause.match(/(?:₹|rs\.?|inr)?\s*([0-9]+(?:\.[0-9]+)?)\s*(?:lakh|lakhs|lac|lacs|l)\b/i);
    if (lakhMatch) {
      const val = parseFloat(lakhMatch[1]);
      if (!isNaN(val)) return Math.round(val * 100000);
    }

    // 3. Thousand / k pattern: 50k, 50 thousand
    const kMatch = clause.match(/(?:₹|rs\.?|inr)?\s*([0-9]+(?:\.[0-9]+)?)\s*(?:k|thousand|thousands)\b/i);
    if (kMatch) {
      const val = parseFloat(kMatch[1]);
      if (!isNaN(val)) return Math.round(val * 1000);
    }

    // 4. Raw number with currency symbol: ₹50,00,000 or 1500000
    const rawMatch = clause.match(/(?:₹|rs\.?)\s*([0-9,]{4,})/i);
    if (rawMatch) {
      const cleaned = rawMatch[1].replace(/,/g, '');
      const val = parseFloat(cleaned);
      if (!isNaN(val) && val >= 10000) return Math.round(val);
    }

    return null;
  },

  wordToNumber(word: string): number {
    const map: Record<string, number> = {
      one: 1, '1': 1,
      two: 2, '2': 2,
      three: 3, '3': 3,
      four: 4, '4': 4,
      five: 5, '5': 5,
      six: 6, '6': 6,
      seven: 7, '7': 7,
      eight: 8, '8': 8,
      nine: 9, '9': 9,
      ten: 10, '10': 10,
      fifteen: 15, '15': 15,
      twenty: 20, '20': 20
    };
    return map[word.toLowerCase()] || parseInt(word, 10) || 10;
  }
};

function formatCurrencyCompact(amount: number): string {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2).replace(/\.?0+$/, '')} Cr`;
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2).replace(/\.?0+$/, '')} Lakh`;
  }
  return `₹${amount.toLocaleString('en-IN')}`;
}
