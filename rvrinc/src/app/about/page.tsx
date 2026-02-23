import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Shield, Zap, Heart, TrendingUp, Award, MapPin, Users, Scale, Clock, CheckCircle2 } from "lucide-react";

const pretoriaTeam = [
    { name: "Tanya Zandberg", role: "Director & Sole Owner", image: "/images/Pretoria/Tanya.jpg" },
    { name: "Karmi", role: "Legal Professional", image: "/images/Pretoria/Karmi.jpg" },
    { name: "Karyn", role: "Legal Professional", image: "/images/Pretoria/Karyn.jpg" },
    { name: "Roxanne", role: "Legal Professional", image: "/images/Pretoria/Roxanne.jpg" },
    { name: "Sara", role: "Legal Professional", image: "/images/Pretoria/Sara.jpg" },
    { name: "Tricia", role: "Legal Professional", image: "/images/Pretoria/Tricia.jpg" },
    { name: "Werner", role: "Legal Professional", image: "/images/Pretoria/Werner.jpg" },
    { name: "Nieuwoudt", role: "Legal Professional", image: "/images/Pretoria/Nieuwoudt.jpg" },
    { name: "George", role: "Legal Professional", image: "/images/Pretoria/George.jpg" },
    { name: "Lizzy", role: "Legal Professional", image: "/images/Pretoria/Lizzy.jpg" },
    { name: "Minah", role: "Legal Professional", image: "/images/Pretoria/Minah.jpg" },
];

const marbleHallTeam = [
    { name: "Martie", role: "Office Manager", image: "/images/Marble Hall/Martie.jpg" },
    { name: "Alwyn", role: "Legal Professional", image: "/images/Marble Hall/Alwyn.jpg" },
    { name: "Joel", role: "Legal Professional", image: "/images/Marble Hall/Joel.jpg" },
    { name: "Lineque", role: "Legal Professional", image: "/images/Marble Hall/Lineque.jpg" },
    { name: "Olgah", role: "Legal Professional", image: "/images/Marble Hall/Olgah.jpg" },
    { name: "Yolande", role: "Legal Professional", image: "/images/Marble Hall/Yolande.jpg" },
];

export default function AboutPage() {
    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">

                {/* Hero */}
                <section className="bg-brand-navy py-20 text-center text-white relative overflow-hidden">
                    <div className="absolute inset-0 z-0">
                        <Image src="/images/header3.jpg" alt="Law Office" fill className="object-cover object-right opacity-15 mix-blend-overlay" priority />
                        <div className="absolute inset-0 bg-brand-navy/70 mix-blend-multiply" />
                    </div>
                    <div className="container relative z-10">
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <div className="h-px w-12 bg-brand-gold/50" />
                            <span className="text-brand-gold text-xs font-semibold tracking-[0.3em] uppercase">About Us</span>
                            <div className="h-px w-12 bg-brand-gold/50" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Roets & Van Rensburg Inc.</h1>
                        <p className="text-gray-300 max-w-2xl mx-auto text-lg">
                            A legacy of over 25 years. A future of dedicated advocacy.
                        </p>
                    </div>
                </section>

                {/* History */}
                <section className="py-20 bg-white">
                    <div className="container max-w-4xl space-y-8">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-1 h-10 bg-brand-gold rounded-full" />
                            <h2 className="text-3xl font-serif font-bold text-brand-navy">Our History</h2>
                        </div>
                        <div className="prose prose-lg text-gray-600 leading-relaxed max-w-none">
                            <p>
                                Founded in 2000 by Lanie-Marie Roets and Lobry van Rensburg, Roets & Van Rensburg began as a dual-office practice spanning Pretoria and Marble Hall. Built on a foundation of specialized Road Accident Fund (RAF) litigation, the firm has spent over two decades securing justice for road accident victims.
                            </p>
                            <p>
                                The firm&apos;s leadership evolved in 2009 with the arrival of Tanya Louise Zandberg. After becoming a director in 2012 and expanding our footprint back into Pretoria in 2017 through modern leadership with decades of experience, Tanya stepped into sole ownership in 2023. Today, headquartered in Pretoria and branch office in Marble Hall, the firm remains a dedicated force in RAF claims, carrying forward a legacy of legal excellence.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Vision & Mission */}
                <section className="py-20 bg-brand-cream">
                    <div className="container max-w-5xl grid md:grid-cols-2 gap-12">
                        {/* Vision */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-brand-gold/10 flex items-center justify-center">
                                    <Shield className="w-5 h-5 text-brand-gold" />
                                </div>
                                <h2 className="text-2xl font-serif font-bold text-brand-navy">Our Vision</h2>
                            </div>
                            <div className="prose text-gray-600 leading-relaxed">
                                <p>
                                    To bridge the gap between injury and justice. We envision a future where every road accident victim has access to elite, strategic legal representation that prioritizes their recovery and secures their financial future through proven expertise.
                                </p>
                                <p>
                                    We aim to be the leading voice for road accident victims, turning legal complexity into life-changing results. By empowering our team with a culture of excellence, we ensure our clients receive the sophisticated representation and compassionate care they need to move forward with confidence.
                                </p>
                            </div>
                        </div>

                        {/* Mission */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-brand-gold/10 flex items-center justify-center">
                                    <Scale className="w-5 h-5 text-brand-gold" />
                                </div>
                                <h2 className="text-2xl font-serif font-bold text-brand-navy">Our Mission</h2>
                            </div>
                            <div className="prose text-gray-600 leading-relaxed">
                                <p>
                                    At Roets & Van Rensburg, our foundation is built on two things: deep legal expertise and an unwavering commitment to our clients. We don&apos;t just process claims; we engineer legal solutions.
                                </p>
                            </div>
                            <ul className="space-y-4">
                                {[
                                    { icon: Users, title: "Collaborative Excellence", desc: "Our team works as a single, cohesive unit to ensure your claim is handled with collective intelligence and care." },
                                    { icon: Zap, title: "Strategic Speed", desc: "We utilize our deep legal knowledge to resolve claims as efficiently as possible without compromising on quality." },
                                    { icon: Heart, title: "Unwavering Dignity", desc: "Every client, regardless of the size of their claim, is a priority. We protect your confidentiality and honor your story with respect." },
                                    { icon: TrendingUp, title: "Evolving Advocacy", desc: "As the legal landscape shifts, we grow." },
                                ].map((item) => (
                                    <li key={item.title} className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-full bg-brand-navy/5 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <item.icon className="w-4 h-4 text-brand-gold" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-brand-navy text-sm">{item.title}</p>
                                            <p className="text-gray-500 text-sm">{item.desc}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <div className="container max-w-5xl mt-12">
                        <div className="bg-brand-navy rounded-xl p-8 text-center">
                            <p className="text-brand-gold font-serif text-xl font-semibold italic">
                                &ldquo;A legacy of over 25 years. A future of dedicated advocacy. We don&apos;t just pursue claims — we restore lives.&rdquo;
                            </p>
                        </div>
                    </div>
                </section>

                {/* Our Team - Intro */}
                <section id="team" className="py-20 bg-white scroll-mt-20">
                    <div className="container max-w-4xl text-center space-y-6">
                        <div className="flex items-center justify-center gap-3 mb-2">
                            <div className="h-px w-12 bg-brand-gold/50" />
                            <span className="text-brand-gold text-xs font-semibold tracking-[0.3em] uppercase">Our Team</span>
                            <div className="h-px w-12 bg-brand-gold/50" />
                        </div>
                        <h2 className="text-3xl md:text-4xl font-serif font-bold text-brand-navy">
                            Driven by Results, Defined by Persistence
                        </h2>
                        <p className="text-gray-600 leading-relaxed max-w-3xl mx-auto">
                            Success in Road Accident Fund litigation isn&apos;t accidental; it&apos;s engineered. Our team is a diverse powerhouse of legal strategists who thrive on the complexities that others avoid. We don&apos;t just accept challenges — we deconstruct them. From our administrative experts to our lead litigators, every member of Roets & Van Rensburg operates with a high-performance mindset. We work relentlessly behind the scenes to navigate the complex hurdles of the RAF, ensuring that every case is met with the tactical precision and tireless effort required to secure the results our clients depend on.
                        </p>
                    </div>
                </section>

                {/* Meet the Director */}
                <section className="py-20 bg-brand-cream">
                    <div className="container max-w-5xl">
                        <div className="grid md:grid-cols-5 gap-12 items-start">
                            {/* Photo */}
                            <div className="md:col-span-2 flex flex-col items-center">
                                <div className="relative w-64 h-80 rounded-xl overflow-hidden shadow-xl border-4 border-white">
                                    <Image
                                        src="/images/Pretoria/Tanya.jpg"
                                        alt="Tanya Louise Zandberg"
                                        fill
                                        className="object-cover object-top"
                                    />
                                </div>
                                <div className="mt-4 text-center">
                                    <h3 className="text-xl font-serif font-bold text-brand-navy">Tanya Louise Zandberg</h3>
                                    <p className="text-brand-gold font-medium text-sm">Director & Sole Owner</p>
                                </div>
                            </div>

                            {/* Bio */}
                            <div className="md:col-span-3 space-y-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-1 h-10 bg-brand-gold rounded-full" />
                                    <h2 className="text-3xl font-serif font-bold text-brand-navy">Meet the Director</h2>
                                </div>
                                <div className="prose text-gray-600 leading-relaxed">
                                    <p>
                                        Tanya Louise Zandberg is the visionary leader behind Roets & Van Rensburg. Since joining the firm in 2009, Tanya has dedicated her career to the ever-changing field of Road Accident Fund (RAF) litigation, becoming a Director in 2012 and taking full ownership in 2023.
                                    </p>
                                    <p>
                                        With over 15 years of hands-on experience in the Marble Hall and Pretoria legal landscapes, Tanya has built a reputation for being a meticulous strategist and a tireless advocate for her clients. She understands that behind every RAF claim is a person whose life has been overturned, and she prides herself on providing legal assistance that is as compassionate as it is effective.
                                    </p>
                                    <p>
                                        Under her leadership, the firm moved its head office to Pretoria in 2023, modernizing its operations to ensure that every claimant receives the high-level attention and specialized expertise required to navigate the complexities of South African personal injury law.
                                    </p>
                                </div>
                                <div className="bg-brand-navy rounded-xl p-6 mt-6">
                                    <p className="text-brand-gold font-serif italic text-lg leading-relaxed">
                                        &ldquo;My goal is simple: to turn the tide for road accident victims. We take on the legal burden so our clients can focus on what truly matters — their recovery and their families.&rdquo;
                                    </p>
                                    <p className="text-gray-400 text-sm mt-3">— Tanya Louise Zandberg</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Office Teams */}
                <section className="py-20 bg-white">
                    <div className="container max-w-6xl">
                        <div className="grid md:grid-cols-2 gap-16">
                            {/* Pretoria Office */}
                            <div>
                                <div className="flex items-center gap-3 mb-8">
                                    <MapPin className="w-5 h-5 text-brand-gold" />
                                    <h3 className="text-2xl font-serif font-bold text-brand-navy">Pretoria Office</h3>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    {pretoriaTeam.map((member) => (
                                        <div key={member.name} className="text-center group">
                                            <div className="relative aspect-[3/4] rounded-lg overflow-hidden shadow-md mb-2 bg-gray-100">
                                                <Image
                                                    src={member.image}
                                                    alt={member.name}
                                                    fill
                                                    className="object-cover object-top group-hover:scale-105 transition-transform duration-300"
                                                />
                                            </div>
                                            <p className="font-semibold text-brand-navy text-xs">{member.name}</p>
                                            <p className="text-gray-400 text-[10px]">{member.role}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Marble Hall Office */}
                            <div>
                                <div className="flex items-center gap-3 mb-8">
                                    <MapPin className="w-5 h-5 text-brand-gold" />
                                    <h3 className="text-2xl font-serif font-bold text-brand-navy">Marble Hall Office</h3>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    {marbleHallTeam.map((member) => (
                                        <div key={member.name} className="text-center group">
                                            <div className="relative aspect-[3/4] rounded-lg overflow-hidden shadow-md mb-2 bg-gray-100">
                                                <Image
                                                    src={member.image}
                                                    alt={member.name}
                                                    fill
                                                    className="object-cover object-top group-hover:scale-105 transition-transform duration-300"
                                                />
                                            </div>
                                            <p className="font-semibold text-brand-navy text-xs">{member.name}</p>
                                            <p className="text-gray-400 text-[10px]">{member.role}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Group Photos */}
                        <div className="grid md:grid-cols-2 gap-8 mt-16">
                            <div className="relative aspect-[16/9] rounded-xl overflow-hidden shadow-lg">
                                <Image src="/images/Ptagroup.png" alt="Pretoria Office Team" fill className="object-cover" />
                                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-brand-navy/80 to-transparent p-4">
                                    <p className="text-white font-semibold text-sm">Pretoria Team</p>
                                </div>
                            </div>
                            <div className="relative aspect-[16/9] rounded-xl overflow-hidden shadow-lg">
                                <Image src="/images/Marble Hall/Mhgroup.jpg" alt="Marble Hall Office Team" fill className="object-cover" />
                                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-brand-navy/80 to-transparent p-4">
                                    <p className="text-white font-semibold text-sm">Marble Hall Team</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Why Choose Us */}
                <section className="py-20 bg-brand-navy text-white">
                    <div className="container max-w-5xl">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">Why Choose Roets & Van Rensburg?</h2>
                            <p className="text-brand-gold text-lg font-medium">Turning Legal Complexity into Life-Changing Results</p>
                            <p className="text-gray-400 mt-4 max-w-2xl mx-auto">
                                Choosing the right legal representative is the most important decision you will make after an accident. Here is why claimants have trusted us for over two decades:
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[
                                {
                                    icon: Award,
                                    title: "23+ Years of Specialized Expertise",
                                    desc: "Since 2000, we have focused specifically on Road Accident Fund litigation. We don't just \"handle\" RAF claims; we master them."
                                },
                                {
                                    icon: Shield,
                                    title: "Results-Driven Advocacy",
                                    desc: "Our team is built on a culture of persistence. We accept the toughest challenges and navigate the most complex administrative hurdles."
                                },
                                {
                                    icon: Heart,
                                    title: "A Human-First Approach",
                                    desc: "You aren't just a case number to us. We prioritize dignity, respect, and transparent communication."
                                },
                                {
                                    icon: MapPin,
                                    title: "Local Roots, Province-Wide Reach",
                                    desc: "With our deep history in both Marble Hall and Pretoria, we combine local accessibility with major city resources."
                                },
                                {
                                    icon: Clock,
                                    title: "Proven Success & Efficiency",
                                    desc: "We leverage collaborative teamwork to move claims forward as quickly as possible. No detail missed, no timeline ignored."
                                },
                                {
                                    icon: CheckCircle2,
                                    title: "Maximum Compensation",
                                    desc: "We ensure you receive the maximum compensation allowed by law through strategic, calculated legal structures."
                                },
                            ].map((item) => (
                                <div key={item.title} className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-brand-gold/30 transition-colors">
                                    <item.icon className="w-8 h-8 text-brand-gold mb-4" />
                                    <h3 className="font-bold text-white text-lg mb-2">{item.title}</h3>
                                    <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Areas of Expertise */}
                <section id="expertise" className="py-20 bg-white scroll-mt-20">
                    <div className="container max-w-4xl">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-1 h-10 bg-brand-gold rounded-full" />
                            <h2 className="text-3xl font-serif font-bold text-brand-navy">Areas of Expertise</h2>
                        </div>
                        <div className="prose prose-lg text-gray-600 leading-relaxed max-w-none">
                            <p>
                                The Road Accident Fund landscape is constantly evolving. By specializing almost exclusively in RAF matters, Roets & Van Rensburg remains at the cutting edge of legislative changes and judicial precedents. Our deep-rooted expertise means we don&apos;t just process claims — we build bulletproof cases designed to withstand the scrutiny of the Fund, ensuring our clients receive the maximum compensation they are legally entitled to.
                            </p>
                            <p>
                                While our core strength lies in the Road Accident Fund, our team&apos;s formidable litigation experience extends to general litigation, providing our clients with a robust defense in some other legal disputes.
                            </p>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4 mt-8">
                            {[
                                "Personal Claims",
                                "Loss of Support Claims",
                                "Under Settlements",
                                "Direct Claims",
                                "General Litigation",
                                "Road Accident Fund Matters"
                            ].map((item) => (
                                <div key={item} className="flex items-center gap-3 p-4 bg-brand-cream rounded-lg border border-gray-100">
                                    <CheckCircle2 className="w-5 h-5 text-brand-gold flex-shrink-0" />
                                    <span className="font-medium text-brand-navy">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="bg-brand-cream py-16 text-center">
                    <div className="container">
                        <h2 className="text-2xl font-serif font-bold text-brand-navy mb-4">Need Legal Assistance?</h2>
                        <p className="text-gray-500 mb-6">Take the first step toward your recovery.</p>
                        <Link href="/contact">
                            <Button size="lg" variant="brand">Contact Us Today</Button>
                        </Link>
                    </div>
                </section>

            </main>
            <Footer />
        </div>
    );
}
