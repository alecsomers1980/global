import React from "react";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Heart, Shield, Feather, Leaf } from "lucide-react";
import SecondaryBanner from "@/components/SecondaryBanner";

export const metadata = {
  title: "About Riverview Preparatory School | Heritage & Christian Values",
  description: "Learn about our history, mission, and Christian-guided education in Malelane. Nurturing universally competitive learners with integrity since 1997.",
};

// Removed timelineEvents array


const staffMembers = [
  { name: "Mr Murray Johnson", role: "Headmaster", image: "/images/headmaster.jpg" },
  { name: "Mrs Ann-Marie Rutherford", role: "Secretary", image: "/images/Staff/Rutherford.jpg" },
  { name: "Mrs Jacomin Ferreira", role: "Bursar", image: "/images/Staff/Mrs-Jacomin-Ferreira.JPG" },
  { name: "Mrs Chanelle de Kock", role: "Marketing", image: "/images/Staff/De-Kock.jpg" },
  { name: "Mrs Jenny Bhana", role: "Cubs", image: "/images/Staff/Bhana.jpg" },
  { name: "Mrs Lezanne Nel", role: "Grade 000", image: "/images/Staff/Lezanne-Nel.jpg" },
  { name: "Mrs Amoré Stander", role: "Grade 00", image: "/images/Staff/Amoré-Stander.jpg" },
  { name: "Mrs Debbie Tapson", role: "Grade 0", image: "/images/Staff/Tapson.jpg" },
  { name: "Mrs Wendy McKinnon", role: "Grade 1", image: "/images/Staff/McKinnon.jpg" },
  { name: "Ms Megan Swart", role: "Grade 2", image: "/images/Staff/Swart.jpg" },
  { name: "Mrs Michelle Johnson", role: "Grade 3", image: "/images/Staff/Johnson.jpg" },
  { name: "Mrs Karen Kaligan", role: "IT & Library", image: "/images/Staff/Karen-Kaligan.jpg" },
  { name: "Mrs Bronwyn Thomson", role: "Grade 4", image: "/images/Staff/Bronwyn-Thomson.jpg" },
  { name: "Mrs Doanda Meyers", role: "Grade 5", image: "/images/Staff/Doanda-Meyers.jpg" },
  { name: "Mrs Bianca Nieuwenhuizen", role: "Grade 6", image: "/images/Staff/Bianca.jpg" },
  { name: "Mrs Gill Brokensha", role: "Grade 7", image: "/images/Staff/Brokensha.jpg" },
  { name: "Mrs Grace Sutherland", role: "Science", image: "/images/Staff/Grace-Sutherland.jpg" },
  { name: "Mrs Lize-Marie Dreyer", role: "Sports Coordinator", image: "/images/Staff/Dreyer.jpg" },
  { name: "Mr Eric Vilakazi", role: "Sports Intern", image: "/images/Staff/Vilakati.jpg" },
  { name: "Mr Andre Els", role: "Estate Manager", image: "/images/Staff/Andre-Els.jpg" },
  { name: "Mrs Alexa Kotze", role: "Occupational Therapist", image: "/images/Staff/Kotze.jpg" },
  { name: "Mrs Leandri Wolmarans", role: "Speech Therapist", image: "/images/Staff/Wolmarans.jpg" },
  { name: "Mrs Janet Jeary", role: "Music / Admin", image: "/images/Staff/Janet-Jeary.JPG" },
];

export default function AboutPage() {
  return (
    <main className="relative min-h-screen">
      <Header />

      {/* ── 1. Hero ─────────────────────────────────────────────────────── */}
      <SecondaryBanner 
        title="Heritage, Faith & Excellence" 
        subtitle="OUR FOUNDATION" 
        image="/images/banner.jpg" 
      />

      {/* ── 2. Mission & Motto ────────────────────────────────────────────── */}
      <section className="py-24 bg-brand-cream relative">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto bg-white rounded-[3rem] p-12 md:p-16 shadow-xl border border-brand-green/5 relative overflow-hidden">
            {/* Background Accent */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-gold/5 blur-3xl rounded-full" />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-center">
              <div className="md:col-span-2 space-y-6">
                <div className="telemetry-monospace text-brand-green">OUR MISSION</div>
                <h2 className="text-3xl font-bold text-brand-green">To Strive for Excellence</h2>
                <p className="text-brand-green/80 italic text-xl leading-relaxed">
                  &ldquo;We strive for educational excellence guided by Christian principles, while developing pupils who are universally competitive, guardians of their environment, heritage, social well-being and who contribute to the welfare of the community.&rdquo;
                </p>
              </div>
              <div className="flex flex-col items-center justify-center border-l border-brand-green/10 md:pl-12">
                <Shield className="w-16 h-16 text-brand-gold mb-4" />
                <div className="telemetry-monospace text-brand-green/40 text-xs tracking-widest">OUR MOTTO</div>
                <div className="text-4xl font-black text-brand-green tracking-tight font-serif">Integrity</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Timeline / History ─────────────────────────────────────────── */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <div className="telemetry-monospace text-brand-green mb-4">MILESTONES</div>
            <h2 className="text-3xl md:text-5xl font-bold">
              Our <span className="drama-text text-brand-gold">Journey.</span>
            </h2>
          </div>

          <div className="relative max-w-4xl mx-auto text-center space-y-6">
            <p className="text-brand-green/80 text-lg leading-relaxed">
              Riverview Preparatory School was born in 1996 from a community need for English-medium Christian education in the Onderberg region. A group of visionary parents gathered at Tulloh Farm to lay the foundations of what would become a nurturing home for young minds.
            </p>
            <p className="text-brand-green/80 text-lg leading-relaxed">
              On January 14, 1997, the school welcomed its first 57 pioneering students in a farmhouse setting, guided by a dedicated team of four founding teachers. To support rapid growth, a local agricultural farm was acquired in 1998 and transformed in just three months into custom classrooms, libraries, and offices supporting a full primary school curriculum.
            </p>
          </div>
        </div>
      </section>

      {/* ── 4. Our Staff ─────────────────────────────────────────────────── */}
      <section className="py-24 bg-brand-cream relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <div className="telemetry-monospace text-brand-green mb-4">OUR TEAM</div>
            <h2 className="text-3xl md:text-5xl font-bold text-brand-green">
              Meet Our <span className="drama-text text-brand-gold">Staff.</span>
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 justify-center max-w-6xl mx-auto">
            {staffMembers.map((member) => (
              <div key={member.name} className="flex flex-col items-center text-center group w-full max-w-xs mx-auto">
                {/* Premium Image Frame */}
                <div className="relative w-full aspect-[4/5] mb-6">
                  {/* Background decorative square */}
                  <div className="absolute -top-3 -right-3 w-full h-full border border-brand-gold/20 rounded-2xl -z-10 transition-transform duration-700 group-hover:translate-x-1 group-hover:-translate-y-1" />
                  
                  {/* Accent Glow */}
                  <div className="absolute -bottom-4 -left-4 w-1/2 h-1/2 bg-brand-green/5 rounded-2xl -z-10 blur-xl" />

                  {/* Main Image Container */}
                  <div className="relative w-full h-full rounded-tr-[3rem] rounded-bl-[3rem] overflow-hidden shadow-xl border-2 border-white bg-transparent transition-all duration-700 group-hover:scale-[1.03] group-hover:shadow-2xl">
                    <Image
                      src={member.image || "/images/placeholder.jpg"}
                      alt={member.name}
                      fill
                      className="object-cover object-top scale-110 hover:scale-115 transition-transform duration-1000"
                      sizes="(max-width: 768px) 100vw, 25vw"
                    />
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-brand-green">{member.name}</h3>
                <span className="text-brand-gold font-medium uppercase text-xs tracking-wider mb-2 block">{member.role}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. School Song ─────────────────────────────────────────────────── */}
      <section className="py-24 bg-brand-green text-white relative">
        {/* Background Texture */}
        <div className="absolute inset-0 opacity-5">
          <Image src="/images/banner.jpg" alt="Background" fill className="object-cover" />
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-2xl mx-auto text-center">
            <Feather className="w-12 h-12 text-brand-gold mx-auto mb-6 opacity-80" />
            <div className="telemetry-monospace text-brand-gold mb-4">OUR ANTHEM</div>
            <h2 className="text-3xl md:text-5xl font-bold mb-12">The School Song</h2>
            
            <div className="font-serif italic text-lg md:text-xl leading-loose space-y-6 text-white/90 bg-white/5 p-10 rounded-[3rem] border border-white/10 shadow-inner backdrop-blur-sm">
              <p>
                The mighty river flowing the mountains standing tall<br />
                The trees in summer splendour, the lonely eagle’s call<br />
                The silent voice of God in the wind, the earth, the sky<br />
                Teach me to believe that I can lift my wings and fly
              </p>
              
              <div className="py-4 text-brand-gold font-bold uppercase tracking-wider text-sm not-italic">
                — CHORUS —
              </div>
              
              <p className="font-bold">
                To be true as the river on it’s journey to the sea<br />
                As faithful as the mountains through all eternity<br />
                To stand tall as the fig tree beneath the azure sun<br />
                To hold on to my integrity and to know the power of One
              </p>
              
              <p>
                To be honest as the sunrise as pure as the clouds above<br />
                To fill my world with laughter, my integrity, my love<br />
                To soar like an eagle and to be the best I can<br />
                To have the freedom of the wind and believe in who I am.
              </p>
              
              <div className="py-4 text-brand-gold font-bold uppercase tracking-wider text-sm not-italic">
                — CHORUS —
              </div>

              <div className="pt-6 border-t border-white/10 mt-8">
                <p className="text-xs uppercase tracking-widest opacity-60 not-italic">Written and composed by</p>
                <p className="text-sm font-bold text-brand-gold not-italic mt-1">Coco van Aardt, March 1997</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. Community & Eco ─────────────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Eco School */}
            <div className="group p-10 rounded-3xl border border-brand-green/5 bg-brand-cream hover:border-brand-gold/30 hover:bg-white hover:shadow-xl transition-all duration-500 text-center">
              <Leaf className="w-12 h-12 text-emerald-600 mx-auto mb-6 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-2xl mb-4 text-brand-green">Eco-School Ethics</h3>
              <p className="text-brand-green/70 text-sm leading-relaxed">
                As a proud &quot;Green Flag&quot; school, we instil a deep respect for the environment and a commitment to sustainable living and conservation.
              </p>
            </div>

            {/* Parents Association */}
            <div className="group p-10 rounded-3xl border border-brand-green/5 bg-brand-cream hover:border-brand-gold/30 hover:bg-white hover:shadow-xl transition-all duration-500 text-center">
              <Heart className="w-12 h-12 text-rose-500 mx-auto mb-6 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-2xl mb-4 text-brand-green">Our Parents Association</h3>
              <p className="text-brand-green/70 text-sm leading-relaxed">
                A vital pillar of our community, organising fundraisers and social gatherings that tighten the bond between home and campus.
              </p>
            </div>

            {/* Governing Body */}
            <div className="group p-10 rounded-3xl border border-brand-green/5 bg-brand-cream hover:border-brand-gold/30 hover:bg-white hover:shadow-xl transition-all duration-500 text-center">
              <Shield className="w-12 h-12 text-blue-500 mx-auto mb-6 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-2xl mb-4 text-brand-green">Our Governing Body</h3>
              <p className="text-brand-green/70 text-sm leading-relaxed">
                Riverview Preparatory School is a non-profit organisation run by a Board of Governors elected annually by our parent community. The Board administers assets in trust to safeguard the collective equity of our students and families.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
