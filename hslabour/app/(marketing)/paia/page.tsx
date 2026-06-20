import type { Metadata } from "next";
import Link from "next/link";
import LegalLayout from "@/components/site/LegalLayout";

export const metadata: Metadata = {
  title: "PAIA & Access to Information",
  description:
    "How to request access to records held by H&S Labour Brokers under the Promotion of Access to Information Act (PAIA).",
  alternates: { canonical: "/paia" },
};

export default function PaiaPage() {
  return (
    <LegalLayout
      title="PAIA & Access to Information"
      intro="Information on how to request access to records we hold, in terms of the Promotion of Access to Information Act, 2000 (PAIA)."
      updated="20 June 2026"
    >
      <h2>1. About PAIA</h2>
      <p>
        The Promotion of Access to Information Act, 2000 (PAIA) gives everyone
        the right to request access to records held by private and public
        bodies, subject to certain limitations. This page explains how to make
        such a request to H&amp;S Labour Brokers cc.
      </p>

      <h2>2. Particulars of the body</h2>
      <ul>
        <li>Name: H&amp;S Labour Brokers cc</li>
        <li>Registration number: [company registration number]</li>
        <li>Physical address: [registered physical address]</li>
        <li>
          Email:{" "}
          <a href="mailto:info@hslabour.co.za">info@hslabour.co.za</a>
        </li>
        <li>
          Telephone: <a href="tel:0114684192">011 468 4192</a>
        </li>
      </ul>

      <h2>3. Information Officer</h2>
      <p>
        Requests for access to information must be directed to our Information
        Officer, [Information Officer name], at{" "}
        <a href="mailto:info@hslabour.co.za">info@hslabour.co.za</a>.
      </p>

      <h2>4. How to request access to a record</h2>
      <p>
        To request a record, complete the prescribed PAIA request form and
        submit it to our Information Officer at the contact details above. Your
        request should:
      </p>
      <ul>
        <li>Provide sufficient detail to identify the record requested.</li>
        <li>Identify the right you are seeking to exercise or protect, and explain why the record is required.</li>
        <li>Specify the form of access and how you would like to be notified.</li>
        <li>Include your contact details.</li>
      </ul>
      <p>
        A prescribed request fee and access fee may be payable. We will respond
        within the period required by PAIA and may grant or refuse access in
        accordance with the grounds set out in the Act.
      </p>

      <h2>5. PAIA Manual</h2>
      <p>
        Our PAIA manual, which describes the categories of records we hold and
        the procedure for requesting them, is available on request from our
        Information Officer. A guide on how to use PAIA is also available from
        the Information Regulator.
      </p>

      <h2>6. The Information Regulator</h2>
      <p>
        You may contact or lodge a complaint with the Information Regulator
        (South Africa):
      </p>
      <ul>
        <li>
          Website:{" "}
          <a
            href="https://inforegulator.org.za"
            target="_blank"
            rel="noopener noreferrer"
          >
            inforegulator.org.za
          </a>
        </li>
        <li>
          Email:{" "}
          <a href="mailto:PAIAComplaints@inforegulator.org.za">
            PAIAComplaints@inforegulator.org.za
          </a>
        </li>
        <li>Address: JD House, 27 Stiemens Street, Braamfontein, Johannesburg, 2001</li>
      </ul>

      <h2>7. Related</h2>
      <p>
        For how we handle your personal information, see our{" "}
        <Link href="/privacy-policy">Privacy Policy</Link>.
      </p>
    </LegalLayout>
  );
}
