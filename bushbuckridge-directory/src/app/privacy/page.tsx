import SecondaryHeader from "@/components/SecondaryHeader";

export const metadata = {
  title: "Privacy Policy",
  description:
    "Privacy Policy for Doing Business in Bushbuckridge (DBiB) – how we collect, use and protect your personal information in compliance with POPIA.",
};

export default function PrivacyPage() {
  return (
    <>
      <SecondaryHeader
        title="Privacy Policy"
        subtitle="How we collect, use and protect your personal information."
        badge="POPIA"
      />

      <div className="container mx-auto px-4 py-12 max-w-3xl">
        {/* Placeholder notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-900 mb-10">
          <strong>⚠️ Important:</strong> This privacy policy must be finalised
          with your legal entity details and Information Officer appointment
          before go-live. All placeholders indicated in{" "}
          <span className="font-mono bg-amber-100 px-1 rounded">
            [square brackets]
          </span>{" "}
          need to be replaced with your actual information.
        </div>

        {/* 1. Introduction & who we are */}
        <h2 className="text-2xl font-black text-primary mt-10 mb-3">
          1. Introduction &amp; who we are
        </h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          This privacy policy applies to the website Doing Business in
          Bushbuckridge (DBiB), a business directory and listing platform
          accessible at [WEBSITE URL]. The website is operated by{" "}
          <strong>[COMPANY LEGAL NAME]</strong> (Registration number:{" "}
          <strong>[COMPANY REGISTRATION NUMBER]</strong>), the responsible party
          under the Protection of Personal Information Act 4 of 2013 (POPIA). Our
          registered physical address is <strong>[PHYSICAL ADDRESS]</strong>.
        </p>
        <p className="text-muted-foreground leading-relaxed mb-4">
          We are committed to protecting your personal information and processing
          it lawfully, fairly and transparently. This policy explains what
          information we collect, how we use it, and the steps we take to
          safeguard it.
        </p>

        {/* 2. Information Officer */}
        <h2 className="text-2xl font-black text-primary mt-10 mb-3">
          2. Information Officer
        </h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          We have appointed an Information Officer responsible for all matters
          relating to the processing of personal information and the handling of
          requests under POPIA and the Promotion of Access to Information Act
          (PAIA). You can contact our Information Officer using the details below:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
          <li>
            <strong>Name:</strong> [INFORMATION OFFICER NAME]
          </li>
          <li>
            <strong>Email:</strong> [INFORMATION OFFICER EMAIL]
          </li>
        </ul>

        {/* 3. What personal information we collect */}
        <h2 className="text-2xl font-black text-primary mt-10 mb-3">
          3. What personal information we collect
        </h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Depending on how you interact with DBiB, we may collect the following
          categories of personal information:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
          <li>
            <strong>Identity &amp; contact information</strong> – your name,
            surname, email address, telephone number, and the physical or postal
            address you provide.
          </li>
          <li>
            <strong>Business listing details</strong> – business name,
            description, category, operating hours, location, contact information
            and any images or content you submit.
          </li>
          <li>
            <strong>Account credentials</strong> – a username and encrypted
            password you create when registering for an account.
          </li>
          <li>
            <strong>Payment information</strong> – billing details and payment
            method. Note: we do not store or process full card numbers ourselves.
            Card payments are processed securely by our payment partner Yoco. We
            only retain a transaction reference for verification purposes.
          </li>
          <li>
            <strong>Enquiry &amp; job‑posting content</strong> – any messages,
            attachments or details you include when you use our contact forms or
            submit a job posting.
          </li>
          <li>
            <strong>Technical data</strong> – when you visit our website we
            automatically collect your IP address, browser type and version,
            device information, operating system, pages viewed, time spent on
            pages, and referring website addresses for first‑party analytics
            purposes.
          </li>
        </ul>

        {/* 4. How we collect it */}
        <h2 className="text-2xl font-black text-primary mt-10 mb-3">
          4. How we collect your information
        </h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          We collect personal information in the following ways:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
          <li>
            <strong>Directly from you</strong> – when you register an account,
            fill in a listing form, submit an enquiry, or otherwise provide
            information through the website.
          </li>
          <li>
            <strong>Automatically</strong> – when you navigate the site, certain
            technical data is collected through standard web logs (see Section 6
            below).
          </li>
        </ul>

        {/* 5. Purpose & lawful basis for processing */}
        <h2 className="text-2xl font-black text-primary mt-10 mb-3">
          5. Purpose &amp; lawful basis for processing
        </h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          We process your personal information for specific, clearly defined
          purposes and rely on one or more lawful bases as required by POPIA.
        </p>
        <p className="text-muted-foreground leading-relaxed mb-4">
          <strong>Purposes of processing:</strong>
        </p>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
          <li>To provide, operate and maintain the business directory and your account.</li>
          <li>To manage business listings and display them to directory visitors.</li>
          <li>To process payments for listings or other paid services.</li>
          <li>To send you service‑related communications such as payment receipts, renewal reminders, and important account updates.</li>
          <li>To respond to your enquiries, support requests or job‑posting submissions.</li>
          <li>To analyse website usage and improve the functionality and user experience of DBiB (first‑party analytics only).</li>
        </ul>
        <p className="text-muted-foreground leading-relaxed mb-4">
          <strong>Lawful bases (POPIA section 11):</strong>
        </p>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
          <li>
            <em>Performance of a contract</em> – processing is necessary to
            provide the services you request (e.g., account creation, listing
            management, payment processing).
          </li>
          <li>
            <em>Legitimate interests of the responsible party</em> – for
            first‑party analytics and site improvement, provided these
            interests do not override your rights and freedoms.
          </li>
          <li>
            <em>Consent</em> – where we rely on consent, you have the right to
            withdraw it at any time.
          </li>
          <li>
            <em>Compliance with a legal obligation</em> – where necessary to
            meet statutory requirements.
          </li>
        </ul>

        {/* 6. Cookies & similar technologies */}
        <h2 className="text-2xl font-black text-primary mt-10 mb-3">
          6. Cookies &amp; similar technologies
        </h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Our website uses the following:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
          <li>
            <strong>Strictly necessary (session/authentication) cookies</strong>{" "}
            – essential to keep you signed in when you move between pages and to
            maintain the security of your session.
          </li>
          <li>
            <strong>First‑party analytics</strong> – we record basic listing and
            page view information on our own systems (server‑side) to understand
            how the directory is used and to improve it. We do{" "}
            <strong>not</strong> use third‑party advertising or cross‑site
            tracking cookies, and we do not sell personal information to anyone.
          </li>
        </ul>
        <p className="text-muted-foreground leading-relaxed mb-4">
          You can control cookie preferences through your browser settings.
          Blocking the strictly necessary cookies may prevent you from signing in
          or using certain features of the website.
        </p>

        {/* 7. Sharing & third parties / operators */}
        <h2 className="text-2xl font-black text-primary mt-10 mb-3">
          7. Sharing &amp; third parties / operators
        </h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          We only share personal information with trusted third parties who
          process data on our behalf (operators) under agreements that impose
          security and confidentiality obligations consistent with POPIA. These
          operators are:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
          <li>
            <strong>Payment processing:</strong> Yoco – processes payment card
            data securely. We do not have access to full card numbers.
          </li>
          <li>
            <strong>Website hosting and database:</strong> Vercel and PocketBase
            – host the website and store user data.
          </li>
          <li>
            <strong>Email delivery provider:</strong> [EMAIL PROVIDER NAME] – used
            to send transactional and service emails.
          </li>
        </ul>
        <p className="text-muted-foreground leading-relaxed mb-4">
          We do not sell, rent or trade your personal information to any third
          party for their own marketing purposes.
        </p>

        {/* 8. Cross‑border transfers */}
        <h2 className="text-2xl font-black text-primary mt-10 mb-3">
          8. Cross‑border transfers of personal information
        </h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Some of our third‑party operators may store or process data on servers
          located outside South Africa. Where personal information is transferred
          across borders, we take appropriate safeguards in accordance with POPIA
          (sections 72 and 73), such as ensuring the operator is subject to
          comparable data protection obligations or that the transfer is
          necessary for the performance of a contract between you and us.
        </p>

        {/* 9. Security safeguards */}
        <h2 className="text-2xl font-black text-primary mt-10 mb-3">
          9. Security safeguards
        </h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          We implement reasonable technical and organisational measures to
          protect your personal information against accidental or unlawful
          destruction, loss, alteration, unauthorised disclosure or access. These
          measures include encryption of data in transit (TLS), secure password
          hashing, access controls, and regular security reviews. No method of
          transmission over the Internet is 100% secure, but we strive to
          continuously improve our safeguards.
        </p>

        {/* 10. Retention */}
        <h2 className="text-2xl font-black text-primary mt-10 mb-3">
          10. Data retention
        </h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          We retain personal information only for as long as necessary to fulfil
          the purposes described in this policy, or as required by applicable
          law. When information is no longer needed, we securely delete or
          anonymise it. Specific retention periods depend on the type of data:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
          <li>
            <strong>Account information:</strong> retained while your account is
            active and for a reasonable period after closure to comply with legal
            obligations and resolve disputes.
          </li>
          <li>
            <strong>Payment records:</strong> retained for the period required by
            tax and financial regulations (typically 5 years).
          </li>
          <li>
            <strong>Enquiries and job postings:</strong> kept for up to 12 months
            after the last interaction, unless a longer period is required.
          </li>
        </ul>

        {/* 11. Your rights under POPIA */}
        <h2 className="text-2xl font-black text-primary mt-10 mb-3">
          11. Your rights under POPIA
        </h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          As a data subject, you have the following rights regarding your
          personal information:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
          <li>
            <strong>Right to access</strong> – you may request confirmation of
            whether we hold personal information about you and obtain a copy of
            that information.
          </li>
          <li>
            <strong>Right to correction or deletion</strong> – you may ask us to
            correct inaccurate, irrelevant, excessive or incomplete information,
            or to delete information that we are no longer authorised to keep.
          </li>
          <li>
            <strong>Right to object</strong> – you may object, on reasonable
            grounds, to the processing of your personal information. Where we
            process based on legitimate interests, you can object and we will
            stop processing unless we have compelling legitimate grounds.
          </li>
          <li>
            <strong>Right to withdraw consent</strong> – where processing is
            based on consent, you may withdraw it at any time.
          </li>
          <li>
            <strong>Right to lodge a complaint</strong> – you have the right to
            lodge a complaint with the Information Regulator (South Africa) if
            you believe we have interfered with the protection of your personal
            information. Contact details:
            <ul className="list-disc pl-6 space-y-1 mt-1 text-muted-foreground">
              <li>
                Email:{" "}
                <a
                  href="mailto:POPIAComplaints@inforegulator.org.za"
                  className="underline text-primary"
                >
                  POPIAComplaints@inforegulator.org.za
                </a>
              </li>
              <li>
                Website:{" "}
                <a
                  href="https://inforegulator.org.za"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-primary"
                >
                  https://inforegulator.org.za
                </a>
              </li>
            </ul>
          </li>
        </ul>
        <p className="text-muted-foreground leading-relaxed mb-4">
          To exercise any of your rights, please contact our Information Officer
          using the details in Section 2 above.
        </p>

        {/* 12. Changes to this policy */}
        <h2 className="text-2xl font-black text-primary mt-10 mb-3">
          12. Changes to this privacy policy
        </h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          We may update this policy from time to time to reflect changes in our
          practices, legal requirements or operational needs. The latest version
          will always be available on our website, and we will indicate the date
          it was last updated. We encourage you to review this page periodically.
          Where changes are material, we may also notify you via email or a
          prominent notice on the site.
        </p>

        {/* 13. How to contact us */}
        <h2 className="text-2xl font-black text-primary mt-10 mb-3">
          13. How to contact us
        </h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          If you have any questions, concerns or requests regarding this privacy
          policy or our handling of your personal information, please contact us:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
          <li>
            <strong>Email:</strong> [CONTACT EMAIL]
          </li>
          <li>
            <strong>Phone:</strong> [CONTACT PHONE]
          </li>
          <li>
            <strong>Post:</strong> The Information Officer, [COMPANY LEGAL NAME],
            [PHYSICAL ADDRESS]
          </li>
        </ul>

        <p className="text-sm text-muted-foreground italic mt-10">
          This policy was last updated on: <strong>[LAST UPDATED DATE]</strong>.
        </p>
      </div>
    </>
  );
}
