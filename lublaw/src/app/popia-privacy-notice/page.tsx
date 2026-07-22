const SERVICES = [
  "Administration of Deceased Estates",
  "Drafting of Wills",
  "Setting up Trusts / Appointment of Trustees",
  "Estate Planning",
  "Contingency Plans for SME's",
  "Estate & Wills Related Litigation",
  "Property Transfer Cost Calculator",
  "Contracts",
  "Lease Agreements",
  "Power of Attorney",
  "Property Dispute Litigation",
  "Divorces",
  "Property Disputes",
  "Evictions",
  "Consumer Protection Act",
  "Personal Injuries",
  "High Court Applications",
  "Antenuptial (Pre-Nup) Contracts",
  "Service Level Agreements",
  "Cohabitation Agreements",
  "Partnership Agreements",
];

const GOVERNING_ACTS = [
  "Attorneys Act no.53 of 1979",
  "Auditing Professions Act No. 26 of 2005",
  "Basic Conditions of Employment Act No. 75 of 1997",
  "Broad-Based Black Economic Empowerment Act, 2003",
  "Business Act No 71 of 1991",
  "Companies Act No. 71 of 2008",
  "Compensation of Occupational Injuries and Diseases Act No. 130 of 1993",
  "Competition Act No. 71 of 2008",
  "Constitution Act No. 7 of 2008",
  "Copyright Act No. 98 of 1978",
  "Customs and Excise Act No. 91 of 1964",
  "Debt Collectors' Act No. 91 of 1964",
  "Design Act No. 195 of 1993",
  "Electronic Communications Act No. 36 of 2005",
  "Electronic Communications and Transactions Act No. 25 of 2002",
  "Employment Equity Act No. 55 of 1998",
  "Financial Advisory and Intermediary Services Act of 2002",
  "Financial Intelligence Centre Act No 38 of 2001",
  "Identification Act No. 68 of 1997",
  "Income Tax Act No. 58 of 1962",
  "Insider Trading Act No. 135 of 1998",
  "Insolvency Act No. 24 of 1936",
  "Inspection of Financial Institutions Act No. 18 of 1998",
  "Intellectual Property Laws Amendment Act 38 of 1997",
  "Labour Relations Act No. 66 of 1995",
  "Leases of Land Act No. 18 of 1969",
  "Machinery and Occupational Safety Act No. 6 of 1983",
  "National Credit Act No. 34 of 2005",
  "National Road Traffic Act 93 of 1996",
  "National Environmental Management Act No 107 of 1998",
  "Occupational Health and Safety Act No. 85 of 1993",
  "Patents Act No. 57 of 1978",
  "Pension Funds Act No. 24 of 1956",
  "Prescription Act No. 68 of 1969",
  "Prevention of Organised Crime Act No. 121 of 1998",
  "Promotion of Access to Information Act No. 2 of 2000",
  "Protection of Personal Information Act",
  "Revenue Laws Second Amendment Act No. 61 of 2008",
  "Road Transportation Act No. 74 of 1977",
  "Skills Development Levies Act No. 9 of 1999",
  "Stock Exchanges Control Act No. 1 of 1985",
  "Taxation Laws Amendment Act No. 7 of 2010",
  "Trademarks Act No. 194 of 1993",
  "Transfer Duty Act No. 40 of 1949",
  "Uncertificated Securities Tax Act No. 31 of 1998",
  "Unemployment Contributions Act 63 of 2001",
  "Unemployment Insurance Act No. 30 of 1966",
  "Value Added Tax Act 89 of 1991",
];

export default function PopiaPrivacyNoticePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="font-heading text-3xl text-maroon mb-8">POPIA Privacy Notice</h1>

      <p className="text-muted leading-relaxed mb-4">
        We understand that your personal information is important to you and that you may be apprehensive about
        disclosing it. Your privacy is just as important to us and we are committed to safeguarding and processing
        your information in a lawful manner.
      </p>
      <p className="text-muted leading-relaxed mb-6">
        We also want to make sure that you understand how and for what purpose we process your information. If for
        any reason you think that your information is not processed in a correct manner, or that your information is
        being used for a purpose other than that for what it was originally intended, you can contact our
        Information Officer.
      </p>

      <div className="rounded-2xl border border-line bg-surface p-6 mb-8">
        <p className="font-semibold text-ink mb-2">Our Information Officer&apos;s Contact Details</p>
        <p className="text-muted">Name: B Lubbe</p>
        <p className="text-muted">Contact Number: (021) 554 4882</p>
        <p className="text-muted">
          Email Address: <a href="mailto:berna@lublaw.co.za" className="text-maroon hover:underline">berna@lublaw.co.za</a>
        </p>
      </div>

      <h2 className="font-heading text-xl text-ink mb-2">Our Details</h2>
      <p className="text-muted leading-relaxed mb-6">
        B Lubbe &amp; Associate Attorneys, 9E Sandown Road, Bloubergrandt, 7441. Tel: (021) 554 4882. Email:{" "}
        <a href="mailto:legal@lublaw.co.za" className="text-maroon hover:underline">legal@lublaw.co.za</a>
      </p>

      <h2 className="font-heading text-xl text-ink mb-2">
        The organisation is a Law Firm practicing in terms of the Legal Practice Act No 28 of 2014
      </h2>
      <p className="text-muted mb-2">We render legal services in the following categories:</p>
      <ul className="list-disc list-inside text-muted mb-6 space-y-1">
        {SERVICES.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ul>

      <h2 className="font-heading text-xl text-ink mb-2">The source of collection of your personal information</h2>
      <p className="text-muted leading-relaxed mb-4">We collect personal information directly from the following data subjects:</p>
      <ul className="list-disc list-inside text-muted mb-4 space-y-1">
        <li>Prospective clients who enquire about our legal services</li>
        <li>Clients who have appointed the organisation as their representative</li>
      </ul>
      <p className="text-muted leading-relaxed mb-4">
        Personal information is collected directly from you through the completion of an application form, online
        forms, during consultations and FICA Onboarding Questionnaires and forms requested for completion by
        clients. These forms are completed either electronically or in hard copy. You may also be requested to
        provide your personal information during your consultation with a representative.
      </p>
      <p className="text-muted leading-relaxed mb-6">
        We may also collect information about you from other sources such as external third parties and from
        cookies on our website.
      </p>

      <h2 className="font-heading text-xl text-ink mb-2">Law authorising or requiring collection of personal information</h2>
      <p className="text-muted leading-relaxed mb-4">
        As an authorised legal services provider, we may be obliged in terms of legislation, to collect your personal
        information insofar as it relates to the rendering of the relevant legal services to you, including:
      </p>
      <ul className="list-disc list-inside text-muted mb-6 space-y-1 columns-1 sm:columns-2">
        {GOVERNING_ACTS.map((a) => (
          <li key={a}>{a}</li>
        ))}
      </ul>

      <h2 className="font-heading text-xl text-ink mb-2">Purpose for Processing your Information</h2>
      <p className="text-muted leading-relaxed mb-4">
        We collect, hold, use and disclose your personal information mainly to provide you with access to the
        services and products that we provide. We will only process your information for a purpose you would
        reasonably expect, including:
      </p>
      <ul className="list-disc list-inside text-muted mb-4 space-y-1">
        <li>Complying with the obligations contained in the contract concluded between yourself and B Lubbe &amp; Associate Attorneys</li>
        <li>Providing you with advice, products and services that suit your needs as requested</li>
        <li>Verifying your identity and conducting credit reference searches</li>
        <li>Issuing, administering and managing your contracts and agreements</li>
        <li>Notifying you of new products or developments that may be of interest to you</li>
        <li>Confirming, verifying and updating your details</li>
        <li>Complying with any legal and regulatory requirements</li>
      </ul>
      <p className="text-muted leading-relaxed mb-4">
        Some of your information that we hold may include your first and last name, email address, a home, postal
        or other physical address, other contact information, your title, birth date, gender, occupation,
        qualifications, past employment, residency status, your investments, assets, liabilities, insurance, income,
        expenditure, family history, medical information and your banking details.
      </p>
      <p className="text-muted leading-relaxed mb-6">
        Some of the aforementioned personal information may be mandatory to provide within the context of product
        providers&apos; requirements and disclosures. Failing to provide compulsory information may lead to our
        organisation&apos;s inability to carry out the functions necessary to perform as an authorised legal advisor.
      </p>

      <h2 className="font-heading text-xl text-ink mb-2">Third parties and your personal information</h2>
      <p className="text-muted leading-relaxed mb-4">
        We may need to share your information with third parties to provide advice, reports, products or services
        that you have requested. Where we share your information, we will take all precautions to ensure that the
        third party will treat your information with the same level of protection as required by us. These third
        parties may include:
      </p>
      <ul className="list-disc list-inside text-muted mb-6 space-y-1">
        <li>The Compliance Officer of an organisation (where applicable)</li>
        <li>Analytics and search engine providers assisting in the enhancement of our websites</li>
        <li>Information Technology specialists assisting us with data storage, security, processing, analytics, etc.</li>
        <li>Auditors of an organisation</li>
        <li>Regulatory or governmental authorities such as the Financial Sector Conduct Authority and the Prudential Authority</li>
      </ul>

      <h2 className="font-heading text-xl text-ink mb-2">The Transfer of your personal information outside of the Republic of South Africa</h2>
      <p className="text-muted leading-relaxed mb-6">
        If your information is hosted on servers managed by a third-party service provider, which may be located
        outside of South Africa, we confirm that we shall request their confirmation that the level of protection
        afforded to your personal information by that third country or international organisation is equal to the
        protection afforded by the POPI Act.
      </p>

      <h2 className="font-heading text-xl text-ink mb-2">Complaints and objections</h2>
      <p className="text-muted leading-relaxed mb-2">As a data subject, you have the right to:</p>
      <ul className="list-disc list-inside text-muted mb-6 space-y-1">
        <li>Request that we confirm whether or not we hold personal information about you</li>
        <li>Request that we provide you with a description of the personal information we hold about you, and to explain why and how it is being processed</li>
        <li>Request that we consider your objections to the processing of your personal information</li>
        <li>Lodge a complaint with the Information Regulator</li>
      </ul>

      <h2 className="font-heading text-xl text-ink mb-2">The Information Regulator</h2>
      <p className="text-muted leading-relaxed mb-4">
        In the event that your personal information has not been processed in accordance with the POPI Act and the
        principles set out above, you have the right to lodge a complaint with the Information Regulator.
      </p>
      <p className="text-muted leading-relaxed mb-6">
        The Information Regulator: Adv Pansy Tlakula. Physical Address: JD House, 27 Stiemens Street, Braamfontein,
        Johannesburg, 2001. Email:{" "}
        <a href="mailto:complaints.IR@justice.gov.za" className="text-maroon hover:underline">complaints.IR@justice.gov.za</a>.
        Website:{" "}
        <a href="https://www.justice.gov.za/inforeg/index.html" target="_blank" rel="noopener noreferrer" className="text-maroon hover:underline">
          justice.gov.za/inforeg
        </a>
      </p>

      <h2 className="font-heading text-xl text-ink mb-2">Downloads</h2>
      <ul className="space-y-1">
        <li>
          <a href="https://lublaw.co.za/wp-content/uploads/2021/09/Annexure-A-Personal-Information-Request-Form.pdf" target="_blank" rel="noopener noreferrer" className="text-maroon hover:underline">
            Annexure A: Personal Information Request Form
          </a>
        </li>
        <li>
          <a href="https://lublaw.co.za/wp-content/uploads/2021/09/Annexure-B-POPI-Complaint-Form.pdf" target="_blank" rel="noopener noreferrer" className="text-maroon hover:underline">
            Annexure B: POPI Complaint Form
          </a>
        </li>
        <li>
          <a href="https://lublaw.co.za/wp-content/uploads/2021/10/PAIA-MANUAL.pdf" target="_blank" rel="noopener noreferrer" className="text-maroon hover:underline">
            PAIA Manual
          </a>
        </li>
      </ul>
    </div>
  );
}
