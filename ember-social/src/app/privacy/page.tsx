import Link from 'next/link'
import { ArrowLeft, Shield } from 'lucide-react'

export const metadata = {
    title: 'Privacy Policy | Ember Social Automation',
    description: 'Privacy Policy and Data Handling for Ember Social Automation',
}

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-[#0a0a0f] text-[#e2e2f0]" style={{ fontFamily: 'var(--font-sans)', padding: '40px 20px' }}>
            <div className="max-w-3xl mx-auto space-y-8">

                <div className="flex items-center gap-4 mb-10">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center ember-glow"
                        style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}>
                        <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white leading-none mb-1">Privacy Policy</h1>
                        <p className="text-sm" style={{ color: '#8a8aaa' }}>Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                </div>

                <div className="glass-card p-8 space-y-8 text-sm leading-relaxed" style={{ color: '#a0a0c0' }}>

                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-white">1. Introduction</h2>
                        <p>
                            Ember Automations ("we", "our", or "us") operates the Ember Social Media Automation platform.
                            This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our application.
                            Our platform complies with the Protection of Personal Information Act (POPIA) of South Africa.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-white">2. Information We Collect</h2>
                        <h3 className="font-semibold text-white/90">A. Information you provide to us</h3>
                        <p>We may collect personal information that you voluntarily provide to us when registering at the application, expressing an interest in obtaining information about us or our products and services.</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Names and email addresses of agency admin users and clients.</li>
                            <li>Authentication tokens provided securely by third-party platforms (e.g., Meta, Google, LinkedIn) when you connect your social media accounts.</li>
                        </ul>

                        <h3 className="font-semibold text-white/90 mt-4">B. Information collected through external APIs</h3>
                        <p>
                            When you connect your social media accounts (such as Facebook or Instagram) to Ember Social, we access and store data from those platforms, including:
                        </p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Page or Profile IDs.</li>
                            <li>Publicly available profile information.</li>
                            <li>Comments and direct messages associated with the business pages you manage.</li>
                            <li>Post performance metrics (likes, impressions, shares).</li>
                        </ul>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-white">3. How We Use Your Information</h2>
                        <p>We use personal information collected via our application for a variety of business purposes described below:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li><strong>To facilitate account creation and logon process:</strong> We use the information you allowed us to collect to facilitate account creation.</li>
                            <li><strong>To publish content:</strong> We use the API tokens to publish approved content to your connected social media accounts.</li>
                            <li><strong>To provide customer support:</strong> We aggregate comments and direct messages to allow you to respond via our Unified Inbox.</li>
                            <li><strong>To generate analytics:</strong> We analyze post performance to provide you with insights and improve future content generation via AI.</li>
                        </ul>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-white">4. Data Storage and Security</h2>
                        <p>
                            We use state-of-the-art security measures to protect your personal information. Database access requires secure authentication, and all third-party API tokens are managed securely.
                            While we take reasonable steps to secure your personal information, please be aware that despite our efforts, no security measures are perfect or impenetrable.
                        </p>
                        <p>
                            If a client wishes to disconnect their account, they can do so in the platform, and their API access tokens will be immediately revoked and deleted from our active database.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-white">5. Third-Party Data Sharing</h2>
                        <p>
                            We do not sell, trade, or rent users' personal identification information to others.
                            We share data with third-party service providers only as necessary to provide the platform's core functions:
                        </p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li><strong>Supabase:</strong> For secure database hosting and user authentication.</li>
                            <li><strong>OpenAI:</strong> Anonymized business context is sent to generate post captions and strategy.</li>
                            <li><strong>Meta / Google / LinkedIn:</strong> Data is passed back and forth to publish content and read analytics.</li>
                        </ul>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-white">6. Your Rights (POPIA)</h2>
                        <p>
                            Under the Protection of Personal Information Act (POPIA), you have the right to request access to, correction of, or deletion of your personal data.
                            Please contact us using the information below to exercise these rights.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-bold text-white">7. Contact Us</h2>
                        <p>
                            If you have questions or comments about this policy, you may email us at:<br />
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
