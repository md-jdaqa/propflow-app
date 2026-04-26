// PropFlow — Schedule E auto-categorization engine.
// Pure function. No side effects. Mirrors .claude/rules/tax-categories.md.

export interface CategorizeInput {
  amount: number;
  payee?: string;
  payer?: string;
  memo?: string;
  category?: string;
  method?: string;
}

export type TaxBadgeLiteral =
  | "DEDUCTIBLE"
  | "INCOME"
  | "NON_DEDUCTIBLE"
  | "REVIEW"
  | "UNCATEGORIZED";

export interface CategorizeOutput {
  scheduleELine: number | null;
  taxBadge: TaxBadgeLiteral;
  category: string;
  warnings: string[];
}

interface KeywordGroup {
  line: number;
  category: string;
  keywords: string[];
  // Optional override badge if we want to mark REVIEW (depreciation, etc.)
  badge?: TaxBadgeLiteral;
  reviewWarning?: string;
}

// Order matters: more specific groups first so they win the keyword race.
const KEYWORD_GROUPS: KeywordGroup[] = [
  {
    line: 11,
    category: "Management fees",
    keywords: [
      "management",
      "manager",
      "property mgr",
      "property manager",
      "joseph neff",
    ],
  },
  {
    line: 5,
    category: "Advertising",
    keywords: ["advertising", "advertisement", "listing fee", "listing", "zillow"],
  },
  {
    line: 6,
    category: "Auto & travel",
    keywords: ["travel", "mileage", "gas station", "gasoline", "fuel", "uber", "lyft"],
  },
  {
    line: 7,
    category: "Commissions",
    keywords: ["commission", "realtor fee", "realtor", "broker fee"],
  },
  {
    line: 9,
    category: "Insurance",
    keywords: ["insurance", "premium", "liability"],
  },
  {
    line: 10,
    category: "Legal & professional fees",
    keywords: ["legal", "attorney", "lawyer", "accountant", "cpa", "bookkeeper"],
  },
  {
    line: 12,
    category: "Mortgage interest",
    keywords: ["mortgage interest", "mtg interest", "loan interest"],
  },
  {
    line: 13,
    category: "Other interest",
    keywords: ["heloc", "home equity"],
  },
  {
    line: 14,
    category: "Repairs & maintenance",
    keywords: [
      "repair",
      "fix",
      "maintenance",
      "plumbing",
      "plumber",
      "electrical",
      "electrician",
      "hvac",
    ],
  },
  {
    line: 15,
    category: "Supplies",
    keywords: ["supplies", "supply", "hardware", "home depot", "lowes", "lowe's"],
  },
  {
    line: 16,
    category: "Property taxes",
    keywords: ["property tax", "tax bill", "real estate tax"],
  },
  {
    line: 17,
    category: "Utilities",
    keywords: [
      "utilities",
      "utility",
      "water bill",
      "water",
      "gas bill",
      "electric bill",
      "electric",
      "sewage",
      "sewer",
      "internet",
      "wifi",
      "national grid",
      "con ed",
      "coned",
    ],
  },
  {
    line: 18,
    category: "Depreciation",
    keywords: ["depreciation", "amortization"],
    badge: "REVIEW",
    reviewWarning:
      "Depreciation requires CPA review (cost basis / land value / 27.5-year SL).",
  },
  {
    line: 19,
    category: "Other (HOA, pest, security, landscape, software)",
    keywords: [
      "hoa",
      "pest",
      "exterminator",
      "security",
      "alarm",
      "landscape",
      "landscaping",
      "snow removal",
      "snow",
      "software",
      "subscription",
      "saas",
    ],
  },
];

const NON_DEDUCTIBLE_KEYWORDS = [
  "principal",
  "personal",
  "mortgage principal",
];

const REPAIR_KEYWORDS = [
  "repair",
  "fix",
  "maintenance",
  "plumbing",
  "plumber",
  "electrical",
  "electrician",
  "hvac",
];

const CAPITAL_REVIEW_THRESHOLD = 2500;
const CONTRACTOR_1099_THRESHOLD = 600;

function haystack(input: CategorizeInput): string {
  return [input.payee, input.payer, input.memo, input.category]
    .filter((s): s is string => typeof s === "string" && s.length > 0)
    .join(" ")
    .toLowerCase();
}

function matchesAny(text: string, keywords: string[]): string | null {
  for (const kw of keywords) {
    if (text.includes(kw.toLowerCase())) return kw;
  }
  return null;
}

export function categorize(input: CategorizeInput): CategorizeOutput {
  const warnings: string[] = [];
  const text = haystack(input);
  const absAmount = Math.abs(input.amount);

  // 1. Income (positive amount) → Schedule E line 3.
  if (input.amount > 0) {
    return {
      scheduleELine: 3,
      taxBadge: "INCOME",
      category: "Rental income",
      warnings,
    };
  }

  // 2. Non-deductible (mortgage principal / personal).
  if (matchesAny(text, NON_DEDUCTIBLE_KEYWORDS)) {
    return {
      scheduleELine: null,
      taxBadge: "NON_DEDUCTIBLE",
      category: text.includes("principal")
        ? "Mortgage principal"
        : "Personal expense",
      warnings,
    };
  }

  // 3. Large repair/maintenance → CPA review (capital improvement).
  const isRepair = matchesAny(text, REPAIR_KEYWORDS) !== null;
  if (isRepair && absAmount > CAPITAL_REVIEW_THRESHOLD) {
    warnings.push(
      "Capital improvement may need to be capitalized + depreciated (CPA review)",
    );
    return {
      scheduleELine: 14,
      taxBadge: "REVIEW",
      category: "Repairs & maintenance",
      warnings,
    };
  }

  // 4. Keyword groups (first match wins, ordered by specificity above).
  for (const group of KEYWORD_GROUPS) {
    if (matchesAny(text, group.keywords)) {
      const badge: TaxBadgeLiteral = group.badge ?? "DEDUCTIBLE";
      if (group.reviewWarning) warnings.push(group.reviewWarning);

      // Contractor 1099 warning — applies to anyone we classify as a labor/service
      // line item with payee >= $600. Cover repairs, management, legal, commissions.
      const contractorLines = [7, 10, 11, 14];
      if (
        contractorLines.includes(group.line) &&
        input.payee &&
        absAmount >= CONTRACTOR_1099_THRESHOLD
      ) {
        warnings.push(
          "Contractor will need 1099-NEC at year end if cumulative paid ≥ $600",
        );
      }

      return {
        scheduleELine: group.line,
        taxBadge: badge,
        category: group.category,
        warnings,
      };
    }
  }

  // 5. Nothing matched and amount < 0 → uncategorized.
  return {
    scheduleELine: null,
    taxBadge: "UNCATEGORIZED",
    category: "Uncategorized",
    warnings,
  };
}
