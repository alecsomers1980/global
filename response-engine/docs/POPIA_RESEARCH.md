# POPIA + AI Research — Response Engine

*Compiled 2026-07-08 from primary sources (statute text + vendor documentation). **Not legal advice** — this is research to inform the design and the conversation with H&S Labour's POPIA advisor. Verify final positions with a qualified privacy attorney.*

---

## Bottom line (the correction to our earlier assumption)

Samantha was told the AI/overseas issue is a hard blocker. The research says it is **a manageable compliance problem, not a ban** — but our earlier "just run Claude in Cape Town and data never leaves SA" was **too optimistic**. The accurate position:

1. **Cross-border transfer to an overseas AI is lawful under POPIA §72 IF** there's a binding agreement giving adequate protection (a data-transfer / operator agreement — DPA) **or** the data subject consents. It is *not* prohibited outright.
2. **BUT** the cleanest, most sellable posture is to **minimise the personal information that reaches any AI at all** (pseudonymise + strip special data), and prefer in-country processing where practical.
3. **"Claude in AWS Cape Town" does NOT automatically keep data in South Africa.** The Claude 4.5 access from `af-south-1` is via a *global* inference profile that AWS explicitly says routes requests to regions **worldwide** and flags for POPIA review (see §4). So Bedrock-Cape-Town is not, by itself, a data-residency guarantee for the latest Claude models.

---

## 1. §72 — Cross-border transfers ("the overseas thing")

A responsible party in SA **may not** transfer personal information to a third party in a foreign country **unless one of these applies** (verbatim grounds):

- **(a)** the recipient is subject to a law, binding corporate rules, or **binding agreement** providing an **adequate level of protection** substantially similar to POPIA (and restricting onward transfer);
- **(b)** the **data subject consents** to the transfer;
- **(c)** transfer is **necessary for performance of a contract** between the data subject and the responsible party, or for **pre-contractual measures taken at the data subject's request**;
- **(d)** transfer is necessary for a contract concluded in the data subject's interest between the responsible party and a third party;
- **(e)** transfer is for the data subject's benefit and consent isn't reasonably practicable but would likely be given.

**What this means for us:** Using a US-hosted LLM (Claude API, OpenAI, Gemini) = a cross-border transfer. It's lawful via **(a)** a signed DPA/data-transfer agreement (all major AI vendors offer POPIA/GDPR-grade DPAs) and/or **(b)** candidate consent in the application form. Ground **(c)** is also arguable since a candidate applying is requesting pre-contractual steps — but don't lean on it alone. **Takeaway: the "we can't send it overseas" belief is beatable with the right contract + consent, but avoiding/minimising the transfer is the stronger sell.**

Source: popia.co.za/section-72 · michalsons.com (transfers outside SA)

## 2. §26 / §27 — Special personal information (what Samantha wants redacted)

**§26 prohibits** processing "special personal information," which is defined as:
- **race or ethnic origin**, religious/philosophical beliefs, political persuasion, trade-union membership,
- **health or sex life**, **biometric information**,
- **criminal behaviour** (alleged offences / proceedings).

("Disabilities" and "medical history" fall under **health**; **age** and **contact numbers** are ordinary personal information, not special — still protected, but not under the §26 prohibition.)

**§27 exceptions** — the §26 prohibition falls away if:
- the **data subject consents**;
- processing is necessary for **establishment/exercise/defence of a right or obligation in law**;
- obligation of international public law; historical/statistical/research; or
- the info was **deliberately made public** by the data subject; or specific §28–33 conditions are met.

**What this means for us:** Samantha's instinct is right — race, health, and disability are **special** categories with a higher bar. Best practice for the AI step: **strip special personal information before it reaches the model**, and where any special data must be handled, do it under **explicit consent** (§27(a)). This is also good bias-safe hiring (don't let a model see race/health when assessing suitability).

Source: popia.co.za/section-26 & /section-27 · Information Regulator Guidance Note on Special Personal Information (inforegulator.org.za)

## 3. §71 — Automated decision-making (matters for shortlisting, Phase 3)

A data subject **may not be subject to a decision with legal or similarly significant effects based *solely* on automated processing** intended to profile them (e.g. work performance, reliability), **unless** (§71(2)): it's in connection with a contract that's been requested/performed **with appropriate safeguards**, or a law/code of conduct provides safeguards — and the person can make representations.

**What this means for us:** Automatic **shortlisting must not be fully automated.** Build a **human-in-the-loop** step — the system *ranks/filters and recommends*, a person *decides*. Keep an explainable audit trail of why a candidate was included/excluded. (Capture in Phase 1 is not a "decision," so this bites mainly at Phase 3.)

Source: popia.co.za/section-71 · Juta "Vetting and Screening Data Subjects under POPIA"

## 4. Data-residency options — with the real caveats

| Option | Keeps data in SA? | Reality |
|---|---|---|
| **AWS Bedrock (Claude 4.5) from Cape Town `af-south-1`** | ⚠️ **No, not by default** | Access is via a **global inference profile** that "routes requests to supported commercial Regions **worldwide**." AWS itself says it's "recommended for use-cases that **don't** have data-residency needs" and to "evaluate… including POPIA." Only logs (CloudWatch/CloudTrail) stay in `af-south-1`. Their *geographic* profiles that do pin a region only cover US/EU/Australia/Japan — **not** SA. So this is throughput-in-SA, not residency-in-SA. |
| **Azure OpenAI, *Standard/regional* deployment** | ✅ if the model is available in the SA geography | Microsoft: "Prompts and responses are processed **within the customer-specified geography** (unless you use a Global or DataZone deployment)." Data not used for training; not shared with OpenAI. **Caveat to confirm:** whether the specific GPT models are offered as regional deployments in **South Africa North (Johannesburg)** — OpenAI model availability there is limited and must be checked. `Global`/`DataZone` deployments process elsewhere → avoid those for residency. |
| **Azure Document Intelligence (Form Recognizer) in SA North** | ✅ likely | For the *capture/OCR* step (extracting fields from CVs/Z83s) this is far more widely region-available than the LLMs and keeps extraction in-region under the Microsoft DPA. |
| **Local OCR (Tesseract / on-prem) for capture** | ✅ fully | No third party at all for the mechanical extraction step. Heavier on accuracy tuning but maximal control. |
| **Self-hosted open model (Llama etc.) on SA infra** | ✅ fully | Strongest residency story; no vendor transfer. More build/ops effort — a later option, not Phase 1. |

**Note on "even if we have the Claude Team one":** Anthropic's Team/Enterprise (and Azure/OpenAI enterprise) give **no-training + zero/short retention + a DPA** — that squarely addresses the "they'll train on our data" fear and satisfies §72(1)(a)'s *contract* limb. But the **processing location is still overseas**, so it's a *lawful* cross-border transfer, not an *avoided* one. If the client's advisor insists on true in-country processing, that's Azure-SA / local-OCR / self-host territory.

## 5. Recommended compliance-by-design posture

1. **Split the pipeline by sensitivity:**
   - **Capture/extraction** (mechanical): keep **in-region or local** (Azure Document Intelligence SA North, or local OCR). This is where the raw CV/ID lives — minimise its exposure.
   - **Reasoning** (competency understanding, later shortlisting): **de-identify first** — pseudonymise name/ID to a token (mapping kept in SA), **strip §26 special data** — *then* send to the LLM under a signed DPA. The model judges on skills, not identity or protected attributes.
2. **Consent in the application form** — cover §72(b) cross-border, §27(a) special-info, and §71 automated-processing consent in clear language. (Government Z83 channel may not allow this — hence lean harder on in-region/local + DPA there.)
3. **Human-in-the-loop on any shortlisting decision** (§71) with an explainable trail.
4. **Per-campaign isolation, retention timer, and a dated deletion certificate** (already core to the plan) — these are your POPIA selling points.
5. **Operator agreements** with every processor (AI vendor, hosting) per §20/§21.

## 6. Questions for H&S Labour's POPIA advisor

1. Is the objection **any overseas processing**, or specifically overseas processing **without a DPA/consent**? (Decides whether a DPA + consent unblocks us, or whether we must stay strictly in-country.)
2. Would they accept **de-identified data** (name/ID tokenised, special data stripped) going to an LLM under a signed operator agreement?
3. **ID numbers** — confirmed as personal information to protect (yes). We'll pseudonymise for the AI step and keep the mapping in SA. Agreed?
4. For the **government/Z83 channel**, is candidate consent to automated processing obtainable, or must that channel be fully in-country/local-only?
5. Do they already have a **POPIA operator agreement template** we should slot into?

## Sources
- POPIA §72: https://popia.co.za/section-72-transfers-of-personal-information-outside-republic/
- POPIA §26: https://popia.co.za/section-26-prohibition-on-processing-of-special-personal-information/
- POPIA §27: https://popia.co.za/section-27-general-authorisation-concerning-special-personal-information/
- POPIA §71: https://popia.co.za/section-71-automated-decision-making/
- Information Regulator — Guidance Note on Special Personal Information (PDF)
- AWS Bedrock global cross-Region inference in af-south-1 (Claude 4.5): https://aws.amazon.com/blogs/machine-learning/scale-ai-in-south-africa-using-amazon-bedrock-global-cross-region-inference-with-anthropic-claude-4-5-models/
- Azure OpenAI data, privacy & security: https://learn.microsoft.com/en-us/azure/foundry/responsible-ai/openai/data-privacy
- Michalsons — transfers of personal information outside SA
