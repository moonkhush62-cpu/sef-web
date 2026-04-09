import { supabase } from "@/integrations/supabase/client";

export interface ParameterResult {
  name: string;
  description: string;
  status: "safe" | "suspicious" | "danger";
  score: number;
  detail: string;
}

export interface ScanResultData {
  url: string;
  timestamp: number;
  parameters: ParameterResult[];
  totalScore: number;
  verdict: "Legitimate" | "Suspicious" | "Phishing";
}

function analyzeUrlLength(url: string): ParameterResult {
  const len = url.length;
  let status: ParameterResult["status"];
  let score: number;
  let detail: string;

  if (len < 54) {
    status = "safe";
    score = 0;
    detail = `${len} characters — within safe range (< 54)`;
  } else if (len <= 75) {
    status = "suspicious";
    score = 1;
    detail = `${len} characters — moderately long (54–75)`;
  } else {
    status = "danger";
    score = 2;
    detail = `${len} characters — unusually long (> 75)`;
  }

  return {
    name: "URL Length",
    description: "Phishing URLs are often excessively long to hide malicious components.",
    status,
    score,
    detail,
  };
}

function analyzeHttps(url: string): ParameterResult {
  const isHttps = url.toLowerCase().startsWith("https://");
  return {
    name: "HTTPS Status",
    description: "HTTPS encrypts traffic. Its absence is a major red flag.",
    status: isHttps ? "safe" : "danger",
    score: isHttps ? 0 : 2,
    detail: isHttps
      ? "URL uses HTTPS — connection is encrypted"
      : "URL does NOT use HTTPS — data sent in plain text",
  };
}

function analyzeSuspiciousChars(url: string): ParameterResult {
  const indicators: string[] = [];
  let score = 0;

  if (url.includes("@")) {
    indicators.push('Contains "@" symbol (possible redirect trick)');
    score += 1;
  }

  if (/--/.test(url)) {
    indicators.push("Contains consecutive hyphens (--)");
    score += 1;
  }

  const domainMatch = url.match(/^https?:\/\/([^/?#]+)/);
  if (domainMatch) {
    const host = domainMatch[1].split(":")[0];
    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) {
      indicators.push("Uses IP address instead of domain name");
      score += 2;
    }

    const dotCount = host.split(".").length - 1;
    if (dotCount > 3) {
      indicators.push(`Excessive subdomains (${dotCount} dots in domain)`);
      score += 1;
    }
  }

  const encodedCount = (url.match(/%[0-9a-fA-F]{2}/g) || []).length;
  if (encodedCount > 3) {
    indicators.push(`High number of encoded characters (${encodedCount})`);
    score += 1;
  }

  let status: ParameterResult["status"];
  if (score === 0) status = "safe";
  else if (score === 1) status = "suspicious";
  else status = "danger";

  return {
    name: "Suspicious Characters",
    description: "Phishing URLs use special characters to trick users or hide the real destination.",
    status,
    score,
    detail: indicators.length > 0 ? indicators.join("; ") : "No suspicious characters found",
  };
}

function analyzeDomainAge(ageMonths: number | null): ParameterResult {
  if (ageMonths === null) {
    return {
      name: "Domain Age",
      description: "Phishing sites are usually hosted on very new domains.",
      status: "suspicious",
      score: 1,
      detail: "Could not determine domain age — treat with caution",
    };
  }

  let status: ParameterResult["status"];
  let score: number;
  let detail: string;

  if (ageMonths > 12) {
    status = "safe";
    score = 0;
    const years = Math.floor(ageMonths / 12);
    detail = `Domain is ~${years} year${years > 1 ? "s" : ""} old — established domain`;
  } else if (ageMonths >= 6) {
    status = "suspicious";
    score = 1;
    detail = `Domain is ~${ageMonths} months old — relatively new`;
  } else {
    status = "danger";
    score = 2;
    detail = `Domain is only ~${ageMonths} month${ageMonths !== 1 ? "s" : ""} old — very new, high risk`;
  }

  return {
    name: "Domain Age",
    description: "Phishing sites are usually hosted on very new domains.",
    status,
    score,
    detail,
  };
}

function extractDomain(url: string): string | null {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, "");
  } catch {
    const match = url.match(/^https?:\/\/([^/?#]+)/);
    if (match) return match[1].split(":")[0].replace(/^www\./, "");
    return null;
  }
}

function getVerdict(totalScore: number): ScanResultData["verdict"] {
  if (totalScore <= 1) return "Legitimate";
  if (totalScore <= 3) return "Suspicious";
  return "Phishing";
}

export async function analyzeUrl(url: string): Promise<ScanResultData> {
  const parameters: ParameterResult[] = [
    analyzeUrlLength(url),
    analyzeHttps(url),
    analyzeSuspiciousChars(url),
  ];

  // Domain age check via edge function
  const domain = extractDomain(url);
  let domainAgeResult: ParameterResult;

  if (domain) {
    try {
      const { data, error } = await supabase.functions.invoke("domain-age", {
        body: { domain },
      });

      if (error) throw error;
      domainAgeResult = analyzeDomainAge(data?.ageMonths ?? null);
    } catch {
      domainAgeResult = analyzeDomainAge(null);
    }
  } else {
    domainAgeResult = analyzeDomainAge(null);
  }

  parameters.push(domainAgeResult);

  const totalScore = parameters.reduce((sum, p) => sum + p.score, 0);

  return {
    url,
    timestamp: Date.now(),
    parameters,
    totalScore,
    verdict: getVerdict(totalScore),
  };
}
