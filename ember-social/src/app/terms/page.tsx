import Link from 'next/link'
import { ArrowLeft, FileText } from 'lucide-react'

export const metadata = {
    title: 'Terms of Service | Ember Social Automation',
    description: 'Terms of Service for Ember Social Automation',
}

export default function TermsOfServicePage() {
    return (
        <div className="min-h-screen bg-[#0a0a0f] text-[#e2e2f0]" style={{ fontFamily: 'var(--font-sans)', padding: '40px 20px' }}>
            <div className="max-w-3xl mx-auto space-y-8">

                <div className="flex items-center gap-4 mb-10">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center ember-glow"
                        style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}>
                        <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white leading-none mb-1">Terms of Service</h1>
                        <p className="text-sm" style={{ color: '#8a8aaa' }}>Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                </div>

                <div className="glass-card p-8 space-y-8 text-sm leading-relaxed" style={{ color: '#a0a0c0' }}>

                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-white">1. Acceptance of Terms</h2>
                        <p>
                            These Terms of Service ("Terms") govern your access to and use of the Ember Social Media Automation platform ("Service"), operated by Ember Automations ("we", "our", or "us").
                            By creating an account or using the Service, you agree to be bound by these Terms.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-white">2. Description of Service</h2>
                        <p>
                            Ember Social allows agencies and businesses to connect their social media accounts (including TikTok, Facebook, Instagram, LinkedIn, and YouTube) in order to plan, schedule, and publish content,
                            review AI-assisted post suggestions, and view performance analytics from a single dashboard.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-white">3. Account Responsibilities</h2>
                        <p>You are responsible for:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Maintaining the confidentiality of your login credentials.</li>
                            <li>Ensuring you have the right to connect and publish to any social media account linked to the Service.</li>
                            <li>All content submitted, scheduled, or published through your account.</li>
                        </ul>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-white">4. Connected Third-Party Platforms</h2>
                        <p>
                            The Service integrates with third-party platforms (including TikTok, Meta, Google, and LinkedIn) via their official APIs. Your use of those platforms remains subject to their own terms of service.
                            We are not responsible for outages, API changes, content removal, or account actions taken by those third-party platforms.
                            You may disconnect any linked account at any time from within the Service, which revokes our access to that account.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-white">5. Acceptable Use</h2>
                        <p>You agree not to use the Service to:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Publish content that is unlawful, infringing, or violates the terms of any connected platform.</li>
                            <li>Attempt to gain unauthorized access to the Service or other users&apos; accounts or data.</li>
                            <li>Use the Service to send spam or engage in automated behavior prohibited by a connected platform&apos;s policies.</li>
                        </ul>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-white">6. Content Ownership</h2>
                        <p>
                            You retain all ownership rights to the content you create, upload, or schedule through the Service. We do not claim ownership over your content.
                            By scheduling or publishing content, you grant us a limited license to store, process, and transmit that content as necessary to provide the Service, including delivering it to the social media platforms you have connected.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-white">7. Disclaimer of Warranties</h2>
                        <p>
                            The Service is provided "as is" and "as available" without warranties of any kind, express or implied. We do not guarantee that the Service will be uninterrupted, error-free, or that any AI-generated content will be accurate or suitable for every purpose.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-white">8. Limitation of Liability</h2>
                        <p>
                            To the maximum extent permitted by law, Ember Automations shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Service, including loss of data, revenue, or access to a connected social media account.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-white">9. Termination</h2>
                        <p>
                            We may suspend or terminate access to the Service at our discretion, including for violation of these Terms. You may stop using the Service and disconnect your accounts at any time.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-white">10. Governing Law</h2>
                        <p>
                            These Terms are governed by the laws of the Republic of South Africa.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-white">11. Contact Us</h2>
                        <p>
                            If you have questions about these Terms, you may email us at:<br />
                            <strong>info@emberautomations.com</strong>
                        </p>
                    </section>
                </div>

                <div className="text-center">
                    <Link href="/login" className="inline-flex items-center gap-2 text-sm text-[#8a8aaa] hover:text-white transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Return to Login
                    </Link>
                </div>
            </div>
        </div>
    )
}
