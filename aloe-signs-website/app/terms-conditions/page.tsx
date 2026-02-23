import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Terms and Conditions | Aloe Signs',
    description: 'Terms and Conditions for Aloe Signs.',
};

export default function TermsConditions() {
    return (
        <div className="bg-bg-grey min-h-screen py-12">
            <div className="max-w-4xl mx-auto px-6 bg-white p-8 md:p-12 rounded-lg shadow-sm">
                <h1 className="text-3xl font-bold text-charcoal mb-8">Terms and Conditions</h1>

                <div className="prose prose-slate max-w-none text-medium-grey">
                    <p className="mb-4">Last Updated: {new Date().toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

                    <h2 className="text-xl font-bold text-charcoal mt-6 mb-3">1. Detailed Description of Goods and Services</h2>
                    <p>
                        Aloe Signs is a business in the signage industry that provides custom signage solutions, including vehicle branding, building signage, estate agent boards, and safety signs.
                    </p>

                    <h2 className="text-xl font-bold text-charcoal mt-6 mb-3">2. Delivery Policy</h2>
                    <p>
                        Subject to availability and receipt of payment, requests will be processed within 5-7 working days and delivery confirmed by way of email. Delivery costs are calculated at checkout based on the delivery location and order size.
                    </p>

                    <h2 className="text-xl font-bold text-charcoal mt-6 mb-3">3. Export Restrictions</h2>
                    <p>
                        The offering on this website is available to South African clients only.
                    </p>

                    <h2 className="text-xl font-bold text-charcoal mt-6 mb-3">4. Return and Refunds Policy</h2>
                    <p>
                        The provision of goods and services by Aloe Signs is subject to availability. In cases of unavailability, Aloe Signs will refund the client in full within 30 days. Cancellation of orders by the client will attract a 10% administration fee. Please refer to our Refund Policy page for more detailed information.
                    </p>

                    <h2 className="text-xl font-bold text-charcoal mt-6 mb-3">5. Customer Privacy Policy</h2>
                    <p>
                        Aloe Signs shall take all reasonable steps to protect the personal information of users. For the purpose of this clause, "personal information" shall be defined as detailed in the Promotion of Access to Information Act 2 of 2000 (PAIA). The full Privacy Policy can be found on our website.
                    </p>

                    <h2 className="text-xl font-bold text-charcoal mt-6 mb-3">6. Payment Options Accepted</h2>
                    <p>
                        Payment may be made via Visa, MasterCard, Diners or American Express Cards or by bank transfer into the Aloe Signs bank account, the details of which will be provided on request.
                    </p>

                    <h2 className="text-xl font-bold text-charcoal mt-6 mb-3">7. Card Acquiring and Security</h2>
                    <p>
                        Card transactions will be acquired for Aloe Signs via PayFast (Pty) Ltd who are the approved payment gateway for all South African Acquiring Banks. PayFast uses the strictest form of encryption, namely Secure Socket Layer 3 (SSL3) and no Card details are stored on the website. Users may go to www.payfast.co.za to view their security certificate and security policy.
                    </p>

                    <h2 className="text-xl font-bold text-charcoal mt-6 mb-3">8. Merchant Outlet Country and Transaction Currency</h2>
                    <p>
                        The merchant outlet country at the time of presenting payment options to the cardholder is South Africa. Transaction currency is South African Rand (ZAR).
                    </p>

                    <h2 className="text-xl font-bold text-charcoal mt-6 mb-3">9. Responsibility</h2>
                    <p>
                        Aloe Signs takes responsibility for all aspects relating to the transaction including sale of goods and services sold on this website, customer service and support, dispute resolution and delivery of goods.
                    </p>

                    <h2 className="text-xl font-bold text-charcoal mt-6 mb-3">10. Country of Domicile</h2>
                    <p>
                        This website is governed by the laws of South Africa and Aloe Signs chooses as its domicilium citandi et executandi for all purposes under this agreement, whether in respect of court process, notice, or other documents or communication of whatsoever nature.
                    </p>

                    <h2 className="text-xl font-bold text-charcoal mt-6 mb-3">11. Variation</h2>
                    <p>
                        Aloe Signs may, in its sole discretion, change this agreement or any part thereof at any time without notice.
                    </p>

                    <h2 className="text-xl font-bold text-charcoal mt-6 mb-3">12. Company Information</h2>
                    <p className="mt-2 text-charcoal font-semibold">
                        Aloe Signs<br />
                        Email: team@aloesigns.co.za<br />
                        Phone: 011 693 2600
                    </p>
                </div>
            </div>
        </div>
    );
}
