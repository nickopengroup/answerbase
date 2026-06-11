# Golden Set Results

Run against the seeded Ledgerly Assistant bot. In-scope questions must be
answered with the correct fact and source; out-of-scope questions must be
refused honestly (which also logs a gap in the live app).

**In-scope: 15/15 · Out-of-scope: 5/5**

| # | Question | Result | Top similarity | Sources | Pass |
|---|---|---|---|---|---|
| 1 | How much does your basic plan cost? | answered | 0.69 | Owner answers, Client FAQ.pdf, Billing and Payment Terms.md, Services and Pricing.pdf | ✅ |
| 2 | What's included in the Growth plan? | answered | 0.69 | Services and Pricing.pdf, Client FAQ.pdf, Billing and Payment Terms.md, Owner answers | ✅ |
| 3 | Do you do tax returns? | answered | 0.68 | Tax Season Calendar.pdf, Client FAQ.pdf, Services and Pricing.pdf, Document Submission Policy.md, Owner answers | ✅ |
| 4 | When do I need to send you my documents each month? | answered | 0.84 | Document Submission Policy.md, Client FAQ.pdf, Tax Season Calendar.pdf, Billing and Payment Terms.md, Owner answers | ✅ |
| 5 | When will I get my monthly reports? | answered | 0.72 | Document Submission Policy.md, Client FAQ.pdf, Billing and Payment Terms.md, Tax Season Calendar.pdf, Owner answers | ✅ |
| 6 | How fast do you reply to questions? | answered | 0.63 | Client FAQ.pdf, Billing and Payment Terms.md, Owner answers, Document Submission Policy.md | ✅ |
| 7 | What do you need from me to get started? | answered | 0.68 | Onboarding Guide.pdf, Client FAQ.pdf, Document Submission Policy.md, Billing and Payment Terms.md, Services and Pricing.pdf | ✅ |
| 8 | How long does onboarding take? | answered | 0.69 | Onboarding Guide.pdf, Client FAQ.pdf, Billing and Payment Terms.md, Document Submission Policy.md, Owner answers | ✅ |
| 9 | When is the S-corp filing deadline? | answered | 0.74 | Tax Season Calendar.pdf, Document Submission Policy.md, Client FAQ.pdf, Billing and Payment Terms.md, Owner answers | ✅ |
| 10 | When are quarterly estimated taxes due? | answered | 0.78 | Tax Season Calendar.pdf, Document Submission Policy.md, Client FAQ.pdf, Billing and Payment Terms.md, Owner answers | ✅ |
| 11 | Does an extension delay my tax payment? | answered | 0.72 | Tax Season Calendar.pdf, Owner answers, Billing and Payment Terms.md, Client FAQ.pdf | ✅ |
| 12 | How does billing work? | answered | 0.78 | Billing and Payment Terms.md, Client FAQ.pdf, Owner answers, Services and Pricing.pdf | ✅ |
| 13 | What happens if I'm late on payment? | answered | 0.72 | Billing and Payment Terms.md, Owner answers, Client FAQ.pdf, Document Submission Policy.md | ✅ |
| 14 | How do I cancel? | answered | 0.67 | Billing and Payment Terms.md, Client FAQ.pdf, Owner answers, Document Submission Policy.md | ✅ |
| 15 | I'm 6 months behind on my books — can you help? | answered | 0.75 | Client FAQ.pdf, Services and Pricing.pdf, Onboarding Guide.pdf, Document Submission Policy.md, Tax Season Calendar.pdf | ✅ |
| 16 | Can you recommend a business bank account? | refused ✓ | 0.60 | — | ✅ |
| 17 | What's your office address? | refused ✓ | 0.61 | — | ✅ |
| 18 | Do you support Xero? | refused ✓ | 0.68 | — | ✅ |
| 19 | How much do you charge for CFO advisory services? | refused ✓ | 0.71 | — | ✅ |
| 20 | What are the tax deadlines in Canada? | refused ✓ | 0.71 | — | ✅ |

_Threshold: see SIMILARITY_THRESHOLD in lib/rag.ts. top_similarity is persisted
on every message, so this can be recalibrated from real traffic._
