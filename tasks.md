# URL Phishing Detection Tool — Implementation Guide

## Project Overview
A client-side web app that analyzes URLs for phishing indicators using heuristic rules. Users paste a URL and receive a risk assessment based on URL length, HTTPS status, suspicious characters, and domain age.

---

## Phase 1: Design System & Layout Shell
**Goal:** Establish visual identity and page structure.

- [ ] Define a cyber-security-themed design system (dark background, neon accent colors — green/cyan for safe, red/orange for danger)
- [ ] Create `Header` component with app logo/title ("PhishGuard" or similar)
- [ ] Create `Footer` component with project credits
- [ ] Build the main `Index` page layout with a centered URL input area and results section placeholder

---

## Phase 2: URL Input & Core Analysis Engine
**Goal:** Accept a URL and run client-side heuristic checks.

- [ ] Create `UrlInput` component — text input + "Scan" button with validation
- [ ] Create `src/lib/phishingAnalyzer.ts` — pure functions for all detection logic:
  - **URL Length Analysis**
    - < 54 chars → Legitimate (score 0)
    - 54–75 chars → Suspicious (score 1)
    - > 75 chars → High Risk (score 2)
  - **HTTPS Check**
    - `https://` → Low Risk (score 0)
    - `http://` or none → High Risk (score 2)
  - **Suspicious Characters Scan**
    - Presence of `@` symbol → +1
    - Multiple consecutive hyphens (`--`) → +1
    - IP address instead of domain → +2
    - Excessive subdomains (> 3 dots) → +1
  - **Overall Risk Score** = sum of individual scores
    - 0–1 → ✅ Legitimate
    - 2–3 → ⚠️ Suspicious
    - 4+  → 🚨 Phishing

---

## Phase 3: Results Dashboard UI
**Goal:** Display scan results in a clear, visual dashboard.

- [ ] Create `ScanResult` component — card-based layout showing:
  - Overall verdict badge (Legitimate / Suspicious / Phishing) with color coding
  - Risk score gauge or progress bar
- [ ] Create `ParameterCard` component — individual check result display:
  - Icon + label + status (pass/warn/fail)
  - Used for: URL Length, HTTPS, Suspicious Chars, Domain Age
- [ ] Add animated transitions when results appear

---

## Phase 4: Domain Age Check (API Integration)
**Goal:** Retrieve domain registration age via a WHOIS-style API.

- [ ] Integrate a free WHOIS/domain-age API (e.g., `whoisxml` or similar)
  - Since we're client-side only, use a CORS-friendly API or a Supabase Edge Function as proxy
- [ ] Parse domain creation date and compute age
- [ ] Apply domain age rules:
  - > 1 year → Legitimate (score 0)
  - 6–12 months → Suspicious (score 1)
  - < 6 months → High Risk (score 2)
- [ ] Integrate into the overall risk score

---

## Phase 5: Scan History & Local Persistence
**Goal:** Let users see past scans.

- [ ] Create `ScanHistory` component — table/list of previous scans
- [ ] Store scan results in `localStorage` (url, timestamp, verdict, score)
- [ ] Add "Clear History" button
- [ ] Show history below the main scan area

---

## Phase 6: Polish & Edge Cases
**Goal:** Harden UX and handle edge cases.

- [ ] Validate URL format before scanning (show inline error for malformed URLs)
- [ ] Handle loading state during domain age API call
- [ ] Add tooltip explanations for each parameter ("Why does URL length matter?")
- [ ] Responsive design for mobile
- [ ] Add a sample/demo URL button for quick testing
- [ ] SEO: title, meta description, JSON-LD

---

## Tech Stack (as per synopsis)
| Layer            | Technology              |
|------------------|------------------------|
| Frontend         | React 18 + TypeScript  |
| Styling          | Tailwind CSS + shadcn  |
| URL Parsing      | Built-in `URL` API     |
| Domain Age       | WHOIS API (TBD)        |
| Persistence      | localStorage           |
| Build Tool       | Vite                   |

---

## Detection Parameters Summary

| Parameter           | Legitimate    | Suspicious   | High Risk     |
|---------------------|---------------|--------------|---------------|
| URL Length           | < 54 chars    | 54–75 chars  | > 75 chars    |
| HTTPS               | Present       | —            | Absent        |
| Suspicious Chars    | None found    | 1 indicator  | 2+ indicators |
| Domain Age          | > 1 year      | 6–12 months  | < 6 months    |

## Scoring
- **0–1** → ✅ Legitimate
- **2–3** → ⚠️ Suspicious  
- **4+**  → 🚨 Phishing
