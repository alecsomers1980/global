import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Privacy Policy | Aloe Signs',
    description: 'Privacy Policy for Aloe Signs, compliant with the Protection of Personal Information Act (POPIA).',
};

export default function PrivacyPolicy() {
    return (
        <div className="bg-bg-grey min-h-screen py-12">
            <div className="max-w-4xl mx-auto px-6 bg-white p-8 md:p-12 rounded-lg shadow-sm">
                <h1 className="text-3xl font-bold text-charcoal mb-8">Privacy Policy</h1>

                <div className="prose prose-slate max-w-none text-medium-grey">
                    <p className="mb-4">Last Updated: {new Date().toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

                    <h2 className="text-xl font-bold text-charcoal mt-6 mb-3">1. Introduction</h2>
                    <p>
                        Aloe Signs ("we", "us", "our") is committed to protecting your privacy and complying with the Protection of Personal Information Act 4 of 2013 ("POPIA") and the Promotion of Access to Information Act 2 of 2000 ("PAIA"). This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website aloesigns.co.za.
                    </p>

                    <h2 className="text-xl font-bold text-charcoal mt-6 mb-3">2. Information We Collect</h2>
                    <p>We may collect personal information that you voluntarily provide to us when you:</p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>Place an order for our products or services.</li>
                        <li>Contact us via our contact form or email.</li>
                        <li>Subscribe to our newsletter.</li>
                    </ul>
                    <p className="mt-2">This information may include:</p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>Name and Surname</li>
                        <li>Email Address</li>
                        <li>Phone Number</li>
                        <li>Billing and Delivery Address</li>
                        <li>Payment Information (processed securely by PayFast)</li>
                    </ul>

                    <h2 className="text-xl font-bold text-charcoal mt-6 mb-3">3. How We Use Your Information</h2>
                    <p>We use your personal information to:</p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>Process and fulfill your orders.</li>
                        <li>Communicate with you regarding your order status.</li>
                        <li>Respond to your inquiries and support requests.</li>
                        <li>Send you promotional information (if you have opted in).</li>
                        <li>Comply with legal obligations.</li>
                    </ul>

                    <h2 className="text-xl font-bold text-charcoal mt-6 mb-3">4. Information Sharing</h2>
                    <p>
                        We do not sell or rent your personal information to third parties. We may share your information with trusted third-party service providers who assist us in operating our website, conducting our business, or servicing you, such as:
                    </p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>Payment Gateways (PayFast)</li>
                        <li>Delivery Services (Couriers)</li>
                    </ul>
                    <p className="mt-2">These parties are obligated to keep your information confidential and use it only for the purposes for which we disclose it to them.</p>

                    <h2 className="text-xl font-bold text-charcoal mt-6 mb-3">5. Data Security</h2>
                    <p>
                        We implement appropriate technical and organisational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, please be aware that no transmission of data over the internet is completely secure.
                    </p>

                    <h2 className="text-xl font-bold text-charcoal mt-6 mb-3">6. Your Rights</h2>
                    <p>Under POPIA, you have the right to:</p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>Request access to the personal information we hold about you.</li>
                        <li>Request the correction or deletion of your personal information.</li>
                        <li>Object to the processing of your personal information.</li>
                        <li>Lodge a complaint with the Information Regulator.</li>
                    </ul>

                    <h2 className="text-xl font-bold text-charcoal mt-6 mb-3">7. Cookies</h2>
                    <p>
                        Our website uses cookies to enhance your browsing experience. You can choose to disable cookies through your browser settings, but this may affect the functionality of usage of the website.
                    </p>

                    <h2 className="text-xl font-bold text-charcoal mt-6 mb-3">8. Contact Us</h2>
                    <p>
                        If you have any questions about this Privacy Policy or wish to exercise your rights, please contact our Information Officer at:
                    </p>
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
