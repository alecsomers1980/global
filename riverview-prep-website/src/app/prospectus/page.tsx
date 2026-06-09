import React from "react";
import Image from "next/image";
import { Heart, Shield, Star, Trophy, Music, BookOpen, Compass, FileText, CreditCard, ClipboardCheck, CheckCircle2, Leaf, Globe, MapPin, Phone, Mail, Sparkles } from "lucide-react";
import PrintBar from "./PrintBar";
import "./prospectus.css";

export const metadata = {
  title: "Discover Riverview | Prospectus",
  description: "Riverview Preparatory School prospectus — printable.",
};

/*
  Page-as-prospectus. Each <Spread> is one A4-landscape sheet.
  Browser-print to PDF: File → Print → Destination: Save as PDF,
  Layout: Landscape, Paper: A4, Margins: None, Background graphics: ON.
*/

const Spread = ({ children, page, className = "" }: { children: React.ReactNode; page: number; className?: string }) => (
  <div className={`spread relative bg-white overflow-hidden shadow-2xl print:shadow-none ${className}`}>
    {children}
    <div className="absolute bottom-3 left-6 right-6 flex items-center justify-between text-[9px] uppercase tracking-[0.25em] text-brand-green/40 font-bold">
      <span>{page}</span>
      <span>Discover Riverview</span>
    </div>
  </div>
);

const SideTab = ({ label, color = "bg-brand-green" }: { label: string; color?: string }) => (
  <div className={`absolute right-0 top-12 ${color} text-white px-2.5 py-6 origin-top-right`}>
    <span className="block text-[10px] uppercase tracking-[0.4em] font-bold [writing-mode:vertical-rl]">{label}</span>
  </div>
);

const CaptionBox = ({ children, position = "top-right" }: { children: React.ReactNode; position?: "top-right" | "top-left" | "bottom-right" }) => {
  const pos = {
    "top-right": "top-10 right-10",
    "top-left": "top-10 left-10",
    "bottom-right": "bottom-16 right-10",
  }[position];
  return (
    <div className={`absolute ${pos} bg-brand-green text-white p-7 max-w-[280px] leading-relaxed text-[12px]`}>
      {children}
    </div>
  );
};

const HeadCard = ({ name, role, image, qrLabel }: { name: string; role: string; image: string; qrLabel?: string }) => (
  <div className="bg-brand-green text-white">
    <div className="relative aspect-square w-full">
      <Image loading="eager" src={image} alt={name} fill className="object-cover object-top" />
    </div>
    <div className="px-5 py-4">
      <p className="font-bold text-sm leading-snug">{role}</p>
      <p className="text-white/80 text-sm">{name}</p>
      {qrLabel && (
        <div className="mt-4 flex gap-3 items-start">
          <img
            loading="eager"
            src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent("https://riverviewprep.org" + (qrLabel.includes("/") ? qrLabel : ""))}`}
            alt="QR"
            className="w-14 h-14 bg-white p-1"
          />
          <p className="text-[10px] leading-tight text-white/80">Scan the QR code to learn more about Riverview</p>
        </div>
      )}
    </div>
  </div>
);

export default function ProspectusPage() {
  return (
    <main className="bg-neutral-200 min-h-screen print:bg-white">

      {/* Floating print bar (screen only) */}
      <PrintBar />

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* SPREAD 1 — COVER                                                    */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <Spread page={1} className="!bg-[#0d2e14]">
        {/* Full-bleed photograph */}
        <div className="absolute inset-0">
          <Image loading="eager" src="/images/banner.jpg" alt="Riverview campus" fill className="object-cover" priority />
          {/* Soft scrim — keeps sky & building visible, anchors text at the base */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d2e14] via-[#0d2e14]/45 to-[#0d2e14]/10" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-transparent" />
        </div>

        {/* Premium inset double-frame */}
        <div className="absolute inset-6 border border-brand-gold/70 z-20 pointer-events-none" />
        <div className="absolute inset-[26px] border border-brand-gold/25 z-20 pointer-events-none" />

        {/* Top label */}
        <div className="absolute top-12 left-0 right-0 text-center z-30">
          <p className="text-white/80 text-[10px] uppercase tracking-[0.55em] font-bold">Riverview Preparatory School</p>
        </div>

        {/* QR — tucked into bottom-right corner */}
        <div className="absolute bottom-11 right-12 z-30 flex flex-col items-center gap-1.5">
          <img
            loading="eager"
            src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=https%3A%2F%2Friverviewprep.org"
            alt="QR"
            className="w-16 h-16 bg-white/95 p-1.5"
          />
          <p className="text-white/70 text-[8px] uppercase tracking-[0.35em] font-bold">Scan to Visit</p>
        </div>

        {/* Hero masthead, anchored to the base */}
        <div className="absolute bottom-0 left-0 right-0 z-30 px-16 pb-[4.5rem] flex flex-col items-center text-center">
          <Image loading="eager" src="/images/logo.png" alt="Riverview crest" width={88} height={88} className="mb-5 drop-shadow-[0_2px_10px_rgba(0,0,0,0.4)]" />
          <p className="text-brand-gold text-[11px] uppercase tracking-[0.5em] font-bold mb-4">Established 1996</p>
          <p className="text-white/85 text-[15px] uppercase tracking-[0.7em] font-light mb-1 pl-[0.7em]">Discover</p>
          <h1 className="font-serif text-white text-8xl leading-[0.9] drop-shadow-[0_2px_16px_rgba(0,0,0,0.45)]">Riverview</h1>
          <div className="flex items-center gap-5 my-6">
            <div className="h-px w-20 bg-gradient-to-r from-transparent to-brand-gold/80" />
            <span className="text-brand-gold text-sm">&#9670;</span>
            <div className="h-px w-20 bg-gradient-to-l from-transparent to-brand-gold/80" />
          </div>
          <p className="font-serif italic text-2xl text-white mb-5">A small school with a vast horizon.</p>
          <p className="text-brand-gold/90 text-[10px] uppercase tracking-[0.45em] font-bold">
            Pre-School &middot; Preparatory &middot; Co-Curriculum &middot; Christian Ethos
          </p>
        </div>
      </Spread>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* SPREAD 2 — AERIAL / INTRO                                           */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <Spread page={2}>
        <div className="absolute inset-0">
          <Image loading="eager" src="/images/banner.jpg" alt="Riverview campus" fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-transparent to-transparent" />
        </div>
        <div className="absolute top-12 right-12 bg-brand-green/95 text-white p-10 max-w-[340px] backdrop-blur-sm">
          <p className="chapter-mark text-brand-gold mb-4">· CHAPTER ONE ·</p>
          <h2 className="font-serif italic text-3xl text-white mb-6 leading-tight">A place to begin.</h2>
          <div className="space-y-4 text-[11.5px] leading-[1.75] text-white/90">
            <p>
              Long before the first bell rings, the Lowveld is already awake. Dust lifts in the citrus orchards, the
              Lebombo mountains catch the early sun, and somewhere a hadeda announces the morning.
            </p>
            <p>
              Into this landscape, in 1996, a group of families set a small school. They wanted something different
              for their children. Christian. Excellent. Personal. Rooted in this remarkable place.
            </p>
            <p>
              Twenty-five years on, the school they began at Tulloh Farm is home to nearly three hundred children —
              from eighteen-month-old Cubs to the leadership of Grade 7. We are small enough that every child is
              known by name, and serious enough about education that our leavers thrive at the country&apos;s best
              high schools.
            </p>
            <p className="pullquote text-[14px] text-brand-gold pt-3 border-t border-white/20">
              Welcome to Riverview.
            </p>
          </div>
        </div>
      </Spread>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* SPREAD 3 — HEADMASTER'S WELCOME                                     */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <Spread page={3}>
        <div className="grid grid-cols-12 h-full">
          <div className="col-span-4 bg-neutral-100 flex flex-col justify-end relative">
            <div className="relative h-3/5">
              <Image loading="eager" src="/images/headmaster.jpg" alt="Mr Murray Johnson" fill className="object-cover object-top" />
            </div>
            <div className="bg-brand-green text-white p-6 h-2/5">
              <p className="text-[10px] uppercase tracking-[0.3em] text-brand-gold mb-2">Headmaster</p>
              <p className="font-bold text-2xl leading-tight">Mr Murray Johnson</p>
              <div className="mt-5 flex gap-3 items-start">
                <img
                  loading="eager"
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=https%3A%2F%2Friverviewprep.org%2Fabout`}
                  alt="QR"
                  className="w-16 h-16 bg-white p-1"
                />
                <p className="text-[10px] leading-snug text-white/80">Scan the QR code to learn more about Riverview</p>
              </div>
            </div>
          </div>
          <div className="col-span-8 p-14 flex flex-col ivory-bg">
            <p className="chapter-mark mb-3">· A LETTER FROM THE HEADMASTER ·</p>
            <h2 className="font-serif text-5xl text-brand-green mb-1 leading-[1.05]">A Word of Welcome,</h2>
            <p className="font-serif italic text-3xl text-brand-gold mb-7">from our family to yours.</p>
            <div className="gold-rule mb-7" />
            <div className="grid grid-cols-2 gap-9 text-[11.5px] leading-[1.7] text-brand-green/85">
              <div className="space-y-4">
                <p className="dropcap">
                  Choosing a school for your child is one of the most important decisions a family will make. We do not
                  take lightly the trust you place in us when you walk through our gates. From the moment you arrive at
                  Riverview, we hope you will feel what hundreds of families before you have felt: that this is a place
                  where children belong.
                </p>
                <p>
                  Riverview was founded in 1996 by parents who wanted something rare — an English-medium, Christian
                  preparatory school in the Lowveld where excellence and warmth were not in tension but in harmony.
                  Twenty-five years later, that founding conviction still shapes everything we do.
                </p>
                <p>
                  Our classes are small, never exceeding twenty-five pupils. That single decision changes everything.
                  It means a teacher can know your child — their gifts, their fears, the way they think — and respond
                  to them as an individual rather than as a number on a register.
                </p>
              </div>
              <div className="space-y-4">
                <p>
                  We are unashamedly anchored in the Christian faith and in our school motto, <em>Integrity</em>. We
                  believe character is formed early and that the daily life of a school — its honesty, its kindness,
                  its standards — teaches more than any lesson plan ever could.
                </p>
                <p>
                  Children leave us in Grade 7 with confidence, curiosity and a steady moral compass. They are
                  consistently top performers in national benchmarking assessments, regularly awarded scholarships to
                  leading high schools, and — more importantly — they are themselves. Whole, kind, courageous and
                  prepared for the world they will inherit.
                </p>
                <p className="pullquote text-[15px] pt-2">
                  The best way to know Riverview is to walk it. Come, and see for yourself.
                </p>
                <div className="pt-4 mt-2 border-t border-brand-green/15">
                  <p className="font-serif italic text-2xl text-brand-green/75">Mr Murray Johnson</p>
                  <p className="text-[9px] uppercase tracking-[0.3em] text-brand-gold mt-1 font-bold">Headmaster · Riverview Preparatory School</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Spread>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* SPREAD 4 — OUR STORY / HERITAGE                                     */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <Spread page={4}>
        <div className="grid grid-cols-12 h-full">
          <div className="col-span-7 p-14 ivory-bg">
            <p className="chapter-mark mb-3">· CHAPTER TWO · OUR STORY ·</p>
            <h2 className="font-serif text-6xl text-brand-green leading-none mb-1">Our Journey</h2>
            <p className="font-serif italic text-3xl text-brand-gold mb-8">Since 1996.</p>
            <div className="gold-rule mb-8" />

            <div className="space-y-5 text-[12px] leading-[1.75] text-brand-green/85">
              <p className="dropcap">
                Every school has a beginning. Ours began at a kitchen table. In 1996, a group of Lowveld parents
                gathered at Tulloh Farm with a quiet conviction — that the children of the Onderberg deserved an
                English-medium, Christian education that they did not have to leave the valley to find.
              </p>
              <p>
                On 14 January 1997, fifty-seven pioneering children walked through the door of a converted farmhouse,
                where they were welcomed by four founding teachers and a community determined to do this well. Within
                the year, the school had outgrown the farmhouse. A working agricultural farm was acquired in 1998 and,
                in just three remarkable months, transformed into the campus that still anchors us today — purpose-
                built classrooms, libraries, sports fields and offices.
              </p>
              <p>
                Today, Riverview is home to nearly three hundred pupils, from Cubs through to Grade 7. Some of our
                current parents were among those first fifty-seven children. The names on our class lists are
                familiar, repeated across generations of families who chose us once and have chosen us again. Small
                enough that every child is known. Established enough to give them everything they need.
              </p>
            </div>

            <div className="grid grid-cols-4 gap-4 mt-9 pt-7 border-t border-brand-gold/40">
              {[
                { label: "Founded", value: "1996" },
                { label: "Pupils", value: "280+" },
                { label: "Class Cap", value: "25" },
                { label: "Grades", value: "Cubs–7" },
              ].map((s) => (
                <div key={s.label}>
                  <p className="font-serif text-4xl text-brand-gold">{s.value}</p>
                  <p className="text-[9px] uppercase tracking-[0.3em] text-brand-green/50 mt-1 font-bold">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="col-span-5 relative">
            <Image loading="eager" src="/images/Gallery/Academics/IMG_5317.jpg" alt="Heritage" fill className="object-cover" />
          </div>
        </div>
      </Spread>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* SPREAD 5 — MISSION, MOTTO, VALUES                                   */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <Spread page={5}>
        <div className="h-full flex flex-col ivory-bg">
          {/* Top: Mission + Motto band */}
          <div className="deep-cream-bg p-10 border-b border-brand-gold/30">
            <div className="grid grid-cols-3 gap-10 items-center">
              <div className="col-span-2">
                <p className="chapter-mark mb-2">· OUR MISSION ·</p>
                <h2 className="font-serif text-4xl text-brand-green mb-4 leading-tight">To Strive for Excellence.</h2>
                <p className="pullquote text-[13px] leading-[1.6] text-brand-green/80">
                  We strive for educational excellence guided by Christian principles — developing pupils who are
                  universally competitive, guardians of their environment, heritage and social well-being, and who
                  contribute meaningfully to the welfare of their community.
                </p>
              </div>
              <div className="border-l-2 border-brand-gold/40 pl-8">
                <p className="ornament mb-2">· · ·</p>
                <p className="text-[10px] uppercase tracking-[0.3em] text-brand-green/50 font-bold">Our Motto</p>
                <p className="font-serif italic text-5xl text-brand-green leading-none mt-1">Integrity</p>
                <p className="text-[10px] text-brand-green/60 italic mt-2">One word. Every day.</p>
              </div>
            </div>
          </div>

          {/* Bottom: 3 values */}
          <div className="flex-1 p-10">
            <div className="text-center mb-7">
              <p className="chapter-mark mb-2">· OUR CHARTER ·</p>
              <h2 className="font-serif text-4xl text-brand-green">Built on <span className="italic text-brand-gold">Values.</span></h2>
              <p className="text-[11px] text-brand-green/60 mt-2 max-w-xl mx-auto leading-relaxed">
                Three words anchor us. They are written above our doors, spoken in our chapel, and lived in our classrooms.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-5">
              {[
                {
                  name: "Love",
                  icon: <Heart className="w-6 h-6" />,
                  iconColor: "text-rose-500",
                  subValues: ["Self-Worth & Growth", "Motivation", "Humour"],
                  desc: "A child who feels loved learns to learn. We greet each pupil by name, celebrate their gifts, and create a culture of warmth, generosity and humour.",
                },
                {
                  name: "Faith",
                  icon: <Star className="w-6 h-6" />,
                  iconColor: "text-brand-gold",
                  subValues: ["Consistency", "Loyalty", "Hard Work"],
                  desc: "Anchored in Christian principle, faith for us is a daily practice — chapel, prayer, gratitude and the steady habits of hard work and loyalty to one another.",
                },
                {
                  name: "Integrity",
                  icon: <Shield className="w-6 h-6" />,
                  iconColor: "text-brand-green",
                  subValues: ["Dignity & Respect", "Transparency", "Trustworthiness", "Fairness"],
                  desc: "Our motto. The courage to do what is right when no one is watching. A child of integrity is one we are proud to have known.",
                },
              ].map((v) => (
                <div key={v.name} className="p-6 border border-brand-gold/20 rounded-2xl bg-white/80 flex flex-col">
                  <div className={`w-11 h-11 rounded-full bg-brand-cream flex items-center justify-center mb-4 ${v.iconColor} shadow-sm`}>
                    {v.icon}
                  </div>
                  <h3 className="font-serif text-3xl text-brand-green mb-3">{v.name}</h3>
                  <p className="text-[10.5px] text-brand-green/75 leading-[1.65] mb-4 italic">{v.desc}</p>
                  <div className="flex flex-wrap gap-1.5 mt-auto pt-3 border-t border-brand-gold/20">
                    {v.subValues.map((sv) => (
                      <span key={sv} className="text-[8px] font-bold uppercase tracking-[0.18em] px-2 py-1 rounded-full bg-brand-green/10 text-brand-green">
                        {sv}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Spread>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* SPREAD 6 — PRE-SCHOOL DIVIDER + INTRO                              */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <Spread page={6}>
        <SideTab label="Pre-School" color="bg-amber-500" />
        <div className="h-full flex flex-col">
          {/* Photo strip top */}
          <div className="grid grid-cols-5 h-[42%] gap-0">
            <div className="bg-brand-green text-white p-5 flex flex-col">
              <div className="flex-1 relative">
                <Image loading="eager" src="/images/Staff/Lezanne-Nel.jpg" alt="Pre-School Head" fill className="object-cover object-top" />
              </div>
              <div className="pt-3">
                <p className="text-[9px] uppercase tracking-[0.25em] text-brand-gold">Pre-School Lead</p>
                <p className="font-bold text-sm leading-snug mt-1">Mrs Lezanne Nel</p>
                <p className="text-[10px] text-white/70 mt-0.5">Grade 000</p>
              </div>
            </div>
            {["/images/Gallery/Pre School/IMG_9216.JPG", "/images/Gallery/Pre School/IMG_9293.JPG", "/images/Gallery/Pre School/IMG_9509.JPG", "/images/Gallery/Pre School/IMG_9246.JPG"].map((src, i) => (
              <div key={i} className="relative">
                <Image loading="eager" src={src} alt="" fill className="object-cover" />
              </div>
            ))}
          </div>
          {/* Bottom text */}
          <div className="flex-1 p-10 pr-16 ivory-bg">
            <p className="chapter-mark mb-2">· CHAPTER THREE · PRE-SCHOOL ·</p>
            <h2 className="font-serif text-5xl text-brand-green leading-none mb-1">Every child <span className="italic text-brand-gold">is an explorer.</span></h2>
            <div className="gold-rule mt-4 mb-6" />
            <div className="grid grid-cols-4 gap-6 text-[11px] leading-[1.7] text-brand-green/85">
              <p className="dropcap">
                A four-year-old at Riverview begins her morning in a garden. There is a sandpit, a tree to climb, a
                veggie patch with her name on a wooden stake. By the time the formal lesson begins, she has already
                explored, negotiated and laughed.
              </p>
              <p>
                This is not accident; it is design. We follow a play-based, Reggio-inspired approach because we know
                how young children actually learn — through their hands, their friendships and their imagination. Our
                classrooms are stimulating, our teachers gentle, our pace unhurried.
              </p>
              <p>
                We balance exploration with structure. By the end of the year your child will know her letters, her
                numbers and her favourite books. But she will also know how to wait her turn, how to be kind to a
                friend who is sad, and how to ask a brave question.
              </p>
              <p>
                Above all, we partner with you. Pre-school is the first chapter, not the whole book — and the warmth
                between home and school is the foundation on which everything else is built. We will know your child.
                You will know us. Together we will give her a wonderful start.
              </p>
            </div>
          </div>
        </div>
      </Spread>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* SPREAD 7 — HOLISTIC EDUCATION APPROACH                              */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <Spread page={7}>
        <SideTab label="Pre-School" color="bg-amber-500" />
        <div className="grid grid-cols-12 h-full">
          <div className="col-span-5 relative">
            <Image loading="eager" src="/images/Gallery/Pre School/IMG_9230.JPG" alt="Pre-school art" fill className="object-cover" />
            <CaptionBox position="bottom-right">
              <p>
                &ldquo;Children are at the heart of what we do, and our wish is for them to develop the life skills that
                will see them thrive in an ever-changing world.&rdquo;
              </p>
            </CaptionBox>
          </div>
          <div className="col-span-7 p-12 pr-16 ivory-bg">
            <p className="chapter-mark mb-2">· OUR APPROACH ·</p>
            <h2 className="font-serif text-4xl text-brand-green leading-tight">A holistic <span className="italic text-brand-gold">education.</span></h2>
            <div className="gold-rule mt-4 mb-6" />
            <p className="text-[11.5px] text-brand-green/85 leading-[1.7] mb-7 italic">
              A child is not a vessel to be filled; she is a small person to be known. Our programme is shaped around
              six dimensions of a child&apos;s development — and our teachers attend to all of them, every day.
            </p>

            <div className="grid grid-cols-2 gap-x-7 gap-y-5 text-[10.5px] leading-[1.7]">
              {[
                { num: "I", title: "Physical Development", body: "Outdoor play, climbing, balancing, pencil grip and fine motor work. A strong, coordinated body that knows where it is in space." },
                { num: "II", title: "Social & Emotional", body: "Circle time, sharing, conflict resolution. Children learn the language of friendship — how to listen, take turns, and recover from disappointment." },
                { num: "III", title: "Communication & Language", body: "Story-telling, song, dramatic play and conversation. Confident speakers, attentive listeners, and a deep early love of language and books." },
                { num: "IV", title: "Mathematical Literacy", body: "Patterns, shapes, sorting, counting. Concrete materials before abstract symbols — a Singapore-Maths-inspired bedrock for primary school." },
                { num: "V", title: "Cultural Arts", body: "Colour, music, movement and creative expression. Our children paint, sing, dance and dress up — every day is a small production." },
                { num: "VI", title: "Knowledge of the World", body: "Bugs in the garden, the seasons, our country and our place in it. A first sense of belonging — to family, school, community and creation." },
              ].map((item) => (
                <div key={item.title} className="border-l-2 border-brand-gold/40 pl-4">
                  <p className="chapter-mark text-[9px] mb-1">{item.num}</p>
                  <p className="font-bold text-brand-green text-[11px] mb-1">{item.title}</p>
                  <p className="text-brand-green/70">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Spread>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* SPREAD 8 — PRE-SCHOOL DEVELOPMENT GRIDS                             */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <Spread page={8}>
        <SideTab label="Pre-School" color="bg-amber-500" />
        <div className="grid grid-cols-12 h-full">
          <div className="col-span-7 p-12 pr-16 ivory-bg">
            <p className="chapter-mark mb-2">· THE EARLY YEARS ·</p>
            <h2 className="font-serif text-4xl text-brand-green leading-tight mb-1">From first steps</h2>
            <p className="font-serif italic text-3xl text-brand-gold mb-6">to school-ready.</p>
            <div className="gold-rule mb-6" />

            <div className="space-y-4">
              {[
                { grade: "Cubs", age: "18 months – 3 years", desc: "A gentle introduction to school life. Sensory play, songs and stories, supervised social moments — and the comfort of a teacher who quickly becomes a trusted second-mother." },
                { grade: "Grade 000", age: "3 – 4 years", desc: "The world widens. Through pretend play, art, music and small-group activity, children build confidence, language and the early habits of curiosity." },
                { grade: "Grade 00", age: "4 – 5 years", desc: "Intentional learning takes shape. Independence, focus and the joy of being part of a class — the year your child becomes a learner in earnest." },
                { grade: "Grade 0", age: "5 – 6 years", desc: "A purposeful year of school readiness. Pre-literacy, foundational numeracy, the rhythm of a school day. By December your child is ready, and so are you." },
              ].map((p, i) => (
                <div key={i} className="flex items-start gap-5 p-4 bg-white/70 rounded-2xl border border-brand-gold/20">
                  <div className="w-12 h-12 bg-brand-green rounded-xl flex items-center justify-center font-serif italic text-brand-gold text-2xl shrink-0">
                    {i + 1}
                  </div>
                  <div>
                    <p className="font-bold text-brand-green">{p.grade} <span className="text-[10px] text-brand-gold italic font-normal">— {p.age}</span></p>
                    <p className="text-brand-green/70 text-[10.5px] mt-1 leading-[1.6]">{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-7 pt-5 border-t border-brand-gold/30 text-[10.5px] text-brand-green/75 leading-[1.65] italic">
              <p>
                <span className="font-bold text-brand-green not-italic">Flexible options.</span> Cubs runs three- or
                five-day weeks. Grade 000 onwards is full programme. We meet each family where they are — and we are
                only ever a phone call away.
              </p>
            </div>
          </div>
          <div className="col-span-5 relative">
            <Image loading="eager" src="/images/Gallery/Pre School/IMG_9293.JPG" alt="Pre-school play" fill className="object-cover" />
            <CaptionBox position="top-right">
              <p>
                Our well-balanced, culturally-enriched and play-based programme builds self-confidence in all our
                children and inspires them always to inquire and develop a lifelong love of learning.
              </p>
            </CaptionBox>
          </div>
        </div>
      </Spread>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* SPREAD 9 — PRIMARY SCHOOL DIVIDER                                   */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <Spread page={9}>
        <SideTab label="Preparatory" color="bg-brand-green" />
        <div className="h-full flex flex-col">
          <div className="grid grid-cols-12 px-10 pt-10 pb-6 gap-6 items-end">
            <div className="col-span-3">
              <Image loading="eager" src="/images/headmaster.jpg" alt="Headmaster" width={240} height={300} className="w-full h-auto object-cover rounded-lg" />
            </div>
            <div className="col-span-9">
              <p className="chapter-mark mb-2">· CHAPTER FOUR · PREPARATORY ·</p>
              <h2 className="font-serif text-5xl text-brand-green leading-[1.05] mb-1">Excellence <span className="italic text-brand-gold">with character.</span></h2>
              <div className="gold-rule mt-4 mb-5" />
              <div className="grid grid-cols-2 gap-7 text-[11px] leading-[1.7] text-brand-green/85">
                <p className="dropcap">
                  The years between Grade 1 and Grade 7 are the years a child decides what kind of learner they will
                  be. At Riverview these years are deliberate, joyful and intellectually serious. With never more than
                  twenty-five learners in a class, every child is taught — not just told.
                </p>
                <p>
                  As an ISASA member school, our pupils consistently sit at the top of national benchmarking
                  assessments. Many are awarded scholarships to the country&apos;s leading high schools — Penryn,
                  Uplands, Hilton, Michaelhouse, St Anne&apos;s. But marks are never the whole story. We are forming
                  the kind of children other parents hope their children will befriend.
                </p>
              </div>
            </div>
          </div>
          <div className="flex-1 grid grid-cols-4 gap-0">
            <div className="relative">
              <Image loading="eager" src="/images/Gallery/Academics/IMG_5302 (2).jpg" alt="" fill className="object-cover" />
            </div>
            <div className="relative">
              <Image loading="eager" src="/images/Gallery/Academics/IMG_5264.jpg" alt="" fill className="object-cover" />
            </div>
            <div className="relative">
              <Image loading="eager" src="/images/Gallery/Academics/IMG_5365.jpg" alt="" fill className="object-cover" />
            </div>
            <div className="relative">
              <Image loading="eager" src="/images/Gallery/Academics/IMG_5385.jpg" alt="" fill className="object-cover" />
            </div>
          </div>
        </div>
      </Spread>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* SPREAD 10 — CORE ACADEMIC PROGRAMME                                 */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <Spread page={10}>
        <SideTab label="Preparatory" color="bg-brand-green" />
        <div className="p-12 pr-16 h-full ivory-bg">
          <p className="chapter-mark mb-2">· OUR CURRICULUM ·</p>
          <h2 className="font-serif text-4xl text-brand-green leading-tight">A serious academic <span className="italic text-brand-gold">programme.</span></h2>
          <div className="gold-rule mt-4 mb-7" />
          <p className="text-[11px] text-brand-green/75 leading-[1.7] italic mb-7 max-w-3xl">
            We follow the South African IEB-aligned curriculum, enriched with international best-practice
            methodologies. The intention is simple: that our pupils leave us with the academic depth, study habits and
            love of learning that will serve them for the rest of their schooling — and beyond.
          </p>

          <div className="grid grid-cols-2 gap-8 h-[calc(100%-12rem)]">
            {/* Foundation Phase */}
            <div className="bg-white/80 rounded-2xl p-7 flex flex-col border border-brand-gold/30">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-full bg-brand-gold/15 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-brand-gold" />
                </div>
                <div>
                  <p className="chapter-mark text-[9px]">FOUNDATION PHASE</p>
                  <p className="font-serif text-2xl text-brand-green">Grades 1 – 3</p>
                </div>
              </div>
              <p className="text-[11px] text-brand-green/80 leading-[1.7] mb-4">
                The foundation phase is the most important phase in a child&apos;s schooling. Reading. Writing. Number
                sense. The habits of attention. We take it seriously. Singapore Maths builds true mathematical
                understanding. Jolly Phonics gives children the keys to reading by the end of Grade 1. Lessons spill
                outside — into the garden, the library, the chapel — because young children learn best when their
                bodies are part of the lesson.
              </p>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-gold mb-2">Subjects</p>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {["English", "Afrikaans", "isiZulu", "Mathematics", "Life Skills", "Music", "PE", "IT", "Library"].map((s) => (
                  <span key={s} className="text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-full bg-brand-cream text-brand-green border border-brand-green/10">{s}</span>
                ))}
              </div>
              <p className="text-[10.5px] text-brand-green/70 mt-auto pt-3 border-t border-brand-gold/30 italic">
                <span className="font-bold text-brand-green not-italic">Methodologies:</span> Singapore Maths · Jolly
                Phonics · Phonsense · Reading Eggs · Mathletics.
              </p>
            </div>

            {/* Senior Phase */}
            <div className="bg-brand-green rounded-2xl p-7 text-white flex flex-col">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-full bg-brand-gold/25 flex items-center justify-center">
                  <Compass className="w-5 h-5 text-brand-gold" />
                </div>
                <div>
                  <p className="chapter-mark text-[9px] text-brand-gold">SENIOR PHASE</p>
                  <p className="font-serif text-2xl">Grades 4 – 7</p>
                </div>
              </div>
              <p className="text-[11px] leading-[1.7] mb-4 text-white/90">
                The work deepens, the curiosity sharpens. To the core subjects we add History, Geography, Natural
                Science, Art and Economic Management Sciences. Technology is purposeful — apps and devices used as
                tools for inquiry, not toys. Pupils sit national benchmark tests (ANA, Conquesta, ASSET) and
                international assessments, and consistently perform in the upper percentiles. By Grade 7, our pupils
                are leading assemblies, mentoring younger children, and ready for the rigour of high school.
              </p>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-gold mb-2">Subjects & Disciplines</p>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {["English", "Afrikaans", "isiZulu", "Mathematics", "Science", "History", "Geography", "EMS", "Art", "IT", "Music"].map((s) => (
                  <span key={s} className="text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-full bg-white/10 text-white border border-white/20">{s}</span>
                ))}
              </div>
              <p className="text-[10.5px] text-white/75 mt-auto pt-3 border-t border-white/20 italic">
                <span className="font-bold text-brand-gold not-italic">Grade 7 focus:</span> leadership, public
                speaking, mentorship of younger children, and a culminating outdoor camp.
              </p>
            </div>
          </div>
        </div>
      </Spread>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* SPREAD 11 — SPORT                                                   */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <Spread page={11}>
        <SideTab label="Co-Curriculum" color="bg-rose-600" />
        <div className="grid grid-cols-12 h-full">
          <div className="col-span-7 p-12 pr-16 ivory-bg">
            <p className="chapter-mark mb-2">· CHAPTER FIVE · SPORT ·</p>
            <h2 className="font-serif text-4xl text-brand-green leading-tight mb-1">Effort over <span className="italic text-brand-gold">outcome.</span></h2>
            <div className="gold-rule mt-3 mb-6" />

            <p className="pullquote text-[14px] leading-[1.55] text-brand-green/85 mb-7 border-l-2 border-brand-gold pl-5">
              At Riverview, sport is not about winning. It is about teaching a child that her body is hers, that hard
              work is rewarding, and that losing well is its own kind of victory.
            </p>

            <p className="text-[11px] text-brand-green/75 leading-[1.7] mb-6">
              We are committed to the <em>Personal Best</em> philosophy. Every child plays. Every child is coached.
              Every child is celebrated for the effort, not the outcome. The result is a school full of children who
              are confident in their bodies, healthy in their habits, and unafraid to try.
            </p>

            <p className="chapter-mark text-[9px] mb-3">· SPORTS BY TERM ·</p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { name: "Athletics", terms: "Terms 1 & 4" },
                { name: "Swimming", terms: "Terms 1 & 4" },
                { name: "Rugby", terms: "Term 2 (Sr)" },
                { name: "Soccer", terms: "Term 2" },
                { name: "Netball", terms: "Term 2" },
                { name: "Hockey", terms: "Term 3" },
                { name: "Cricket", terms: "Terms 3 & 4" },
                { name: "Tri-Biathlon", terms: "Term 4" },
                { name: "Cross Country", terms: "Term 4" },
              ].map((s) => (
                <div key={s.name} className="flex items-center gap-2.5 p-3 bg-white/70 rounded-xl border border-brand-gold/20">
                  <Trophy className="w-4 h-4 text-brand-gold shrink-0" />
                  <div>
                    <p className="font-bold text-brand-green text-[11px] leading-tight">{s.name}</p>
                    <p className="text-brand-green/50 text-[9px] italic">{s.terms}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="col-span-5 grid grid-rows-3 gap-0">
            <div className="relative"><Image loading="eager" src="/images/Gallery/Sport/IMG_5742.jpg" alt="" fill className="object-cover" /></div>
            <div className="relative"><Image loading="eager" src="/images/Gallery/Sport/IMG_8757.JPG" alt="" fill className="object-cover" /></div>
            <div className="relative"><Image loading="eager" src="/images/Gallery/Sport/Cricket 1st vs Baberton.jpg" alt="" fill className="object-cover" /></div>
          </div>
        </div>
      </Spread>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* SPREAD 12 — CULTURE & EXTRA-MURAL                                   */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <Spread page={12}>
        <SideTab label="Co-Curriculum" color="bg-rose-600" />
        <div className="grid grid-cols-12 h-full">
          <div className="col-span-5 grid grid-rows-2 gap-0">
            <div className="relative"><Image loading="eager" src="/images/Gallery/Culture/IMG_6444.jpg" alt="" fill className="object-cover" /></div>
            <div className="relative"><Image loading="eager" src="/images/Gallery/Culture/IMG_9472.JPG" alt="" fill className="object-cover" /></div>
          </div>
          <div className="col-span-7 p-12 pr-16 ivory-bg">
            <p className="chapter-mark mb-2">· CULTURE & BEYOND THE CLASSROOM ·</p>
            <h2 className="font-serif text-4xl text-brand-green leading-tight mb-1">A stage for <span className="italic text-brand-gold">every child.</span></h2>
            <div className="gold-rule mt-3 mb-6" />

            <p className="text-[11px] text-brand-green/85 leading-[1.7] mb-7">
              A school year at Riverview is also a cultural calendar. Annual school productions in which every grade
              takes part. A choir that performs at chapel, eisteddfods and community events. Public-speaking
              competitions, art exhibitions, instrumental recitals. There is room here for the natural performer, and
              equally for the quiet child who finds their voice on stage for the first time.
            </p>

            <div className="grid grid-cols-2 gap-7">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Music className="w-4 h-4 text-brand-gold" />
                  <p className="chapter-mark text-[10px]">CULTURAL LIFE</p>
                </div>
                <ul className="space-y-2 text-[10.5px] text-brand-green/80 leading-[1.6]">
                  <li className="border-l border-brand-gold/40 pl-3">School Choir & Vocal Ensemble</li>
                  <li className="border-l border-brand-gold/40 pl-3">Annual School Production & Drama</li>
                  <li className="border-l border-brand-gold/40 pl-3">Eisteddfods & Speech Festivals</li>
                  <li className="border-l border-brand-gold/40 pl-3">Visual Arts, Pottery & Studio</li>
                  <li className="border-l border-brand-gold/40 pl-3">Public Speaking & Debating</li>
                  <li className="border-l border-brand-gold/40 pl-3">Individual Music Tuition (Piano, Guitar, Strings, Voice)</li>
                </ul>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-brand-gold" />
                  <p className="chapter-mark text-[10px]">AFTER-HOURS</p>
                </div>
                <ul className="space-y-2 text-[10.5px] text-brand-green/80 leading-[1.6]">
                  <li className="border-l border-brand-gold/40 pl-3">Chess Club & Tournaments</li>
                  <li className="border-l border-brand-gold/40 pl-3">Coding, Robotics & Maker Space</li>
                  <li className="border-l border-brand-gold/40 pl-3">Eco-Club & Environmental Action</li>
                  <li className="border-l border-brand-gold/40 pl-3">Wildlife Outings & Conservation Days</li>
                  <li className="border-l border-brand-gold/40 pl-3">Reading & Library Club</li>
                  <li className="border-l border-brand-gold/40 pl-3">Aftercare & Supervised Prep until 17:00</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Spread>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* SPREAD 13 — FAITH / CHRISTIAN ETHOS                                 */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <Spread page={13}>
        <SideTab label="Faith" color="bg-indigo-700" />
        <div className="grid grid-cols-12 h-full">
          <div className="col-span-7 p-12 pr-16 ivory-bg">
            <p className="chapter-mark mb-2">· CHAPTER SIX · FAITH ·</p>
            <h2 className="font-serif text-4xl text-brand-green leading-tight mb-1">A school <span className="italic text-brand-gold">that prays.</span></h2>
            <div className="gold-rule mt-3 mb-6" />

            <div className="space-y-4 text-[11.5px] leading-[1.75] text-brand-green/85">
              <p className="dropcap">
                Riverview is a Christian school. We say so plainly, and we are grateful when families choose us
                because of it. But what we mean by &lsquo;Christian&rsquo; is best understood not as doctrine but as
                practice. It is the way we begin each week with chapel; the way we say grace before lunch; the way a
                teacher kneels beside a struggling child and reminds her she is loved.
              </p>
              <p>
                Faith here is gentle and woven through everything. The pursuit of truth and justice. The kindness of
                neighbour to neighbour. The honesty of admitting when one is wrong and the grace of being forgiven.
                These are not Sunday lessons; they are Tuesday-afternoon habits.
              </p>
              <p>
                We welcome families of every background. We do not require statements of belief. What we ask is simply
                that you are happy for your child to be raised, alongside her classmates, in a community where the
                Christian story is honoured and the values it carries — love, grace, integrity, service — are taken
                seriously. Many of our most loyal families are those who came for the academic excellence and stayed
                for what they found in our chapel.
              </p>
            </div>
          </div>
          <div className="col-span-5 relative">
            <Image loading="eager" src="/images/Gallery/Culture/IMG_6388.jpg" alt="Faith" fill className="object-cover" />
            <CaptionBox position="top-right">
              <p>
                &ldquo;A consistent thread of Christian principle runs through every classroom, every assembly and every
                relationship at Riverview.&rdquo;
              </p>
            </CaptionBox>
          </div>
        </div>
      </Spread>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* SPREAD 14 — PASTORAL CARE                                           */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <Spread page={14}>
        <SideTab label="Pastoral Care" color="bg-amber-600" />
        <div className="h-full flex flex-col">
          <div className="grid grid-cols-5 h-[38%]">
            {[
              "/images/Staff/Brokensha.jpg",
              "/images/Staff/Bianca.jpg",
              "/images/Staff/Doanda-Meyers.jpg",
              "/images/Staff/Kotze.jpg",
              "/images/Staff/Wolmarans.jpg",
            ].map((src, i) => (
              <div key={i} className="relative">
                <Image loading="eager" src={src} alt="Staff" fill className="object-cover object-top" />
              </div>
            ))}
          </div>
          <div className="flex-1 p-12 pr-16 ivory-bg">
            <p className="chapter-mark mb-2">· PASTORAL CARE ·</p>
            <h2 className="font-serif text-4xl text-brand-green leading-tight mb-1">Known by name. <span className="italic text-brand-gold">Held with care.</span></h2>
            <div className="gold-rule mt-3 mb-6" />
            <div className="grid grid-cols-3 gap-8 text-[11px] leading-[1.7] text-brand-green/80">
              <p className="dropcap">
                Ask any Riverview parent what makes us different and they will say the same thing — that the teachers
                know their child. Truly know them. The shape of their thinking, the friends they keep, the things that
                make them laugh and the things that make them anxious. Small classes are the means; deep relationship
                is the end.
              </p>
              <p>
                When a child needs more, we have more to give. Our on-site <span className="font-bold text-brand-green">Occupational
                and Speech Therapists</span> work alongside class teachers and families, offering early intervention,
                screening and support. Concerns are noticed early — when they are small — and met with skill,
                compassion and a clear plan.
              </p>
              <p>
                Behind it all is our Honour Code — a simple, visible commitment to be kind, to be honest, and to look
                after one another. The Code is spoken in chapel, lived in the corridors and reinforced daily. It is
                why our pupils, even at five years old, can articulate what it means to do the right thing.
              </p>
            </div>

            <div className="mt-7 pt-5 border-t border-brand-gold/30 grid grid-cols-4 gap-5 text-[10px]">
              {[
                { who: "Class Teachers", note: "Cubs to Grade 7. The first and steady hand of care, every day." },
                { who: "Occupational Therapy", note: "Mrs Alexa Kotze. On-site, by appointment and through screening." },
                { who: "Speech & Language", note: "Mrs Leandri Wolmarans. Communication, articulation and confidence." },
                { who: "Sports & Wellness", note: "Mrs Lize-Marie Dreyer. PE for every body, every ability." },
              ].map((row) => (
                <div key={row.who} className="border-l-2 border-brand-gold/40 pl-3">
                  <p className="font-bold text-brand-green text-[10.5px]">{row.who}</p>
                  <p className="text-brand-green/60 mt-1 italic">{row.note}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Spread>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* SPREAD 15 — THE LOWVELD SETTING + ECO                              */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <Spread page={15}>
        <div className="absolute inset-0">
          <Image loading="eager" src="/images/banner.jpg" alt="Lowveld" fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
        </div>
        <div className="absolute top-10 right-10 bg-brand-green/95 backdrop-blur-sm text-white p-8 max-w-[330px]">
          <p className="chapter-mark text-brand-gold mb-3">· OUR PLACE ·</p>
          <h3 className="font-serif italic text-2xl mb-4 leading-tight">A classroom <span className="text-brand-gold">without walls.</span></h3>
          <div className="space-y-3 text-[11px] leading-[1.7] text-white/90">
            <p>
              Most schools have a campus. We have a setting. Riverview sits within the citrus estates of the Onderberg,
              cradled by the Lebombo mountains, an hour&apos;s drive from the Kruger National Park.
            </p>
            <p>
              Our children spend a remarkable amount of time outside — barefoot on grass, hands in soil, eyes on the
              sky. The Lowveld itself is part of what we teach: the seasons, the wildlife, the long view of a child
              growing up in one of South Africa&apos;s most beautiful corners.
            </p>
          </div>
        </div>
        <div className="absolute bottom-10 left-10 ivory-bg p-7 max-w-[420px] shadow-xl">
          <div className="flex items-center gap-2 mb-3">
            <Leaf className="w-4 h-4 text-brand-gold" />
            <p className="chapter-mark text-[10px]">· GUARDIANS OF OUR ENVIRONMENT ·</p>
          </div>
          <p className="text-[11.5px] text-brand-green leading-[1.7] mb-3">
            We are proud <strong>Eco-Schools</strong> and <strong>WESSA</strong> members. Environmental stewardship is
            not an after-school club but a way of seeing — woven into our curriculum, our gardens, our recycling, and
            the way we teach our children to belong to creation, not above it.
          </p>
          <div className="flex items-center gap-4 pt-3 border-t border-brand-gold/30">
            <Image loading="eager" src="/images/assoc/echo school.jpg" alt="Eco-Schools" width={48} height={48} className="object-contain" />
            <Image loading="eager" src="/images/assoc/wessa.jpg" alt="WESSA" width={48} height={48} className="object-contain" />
            <p className="text-[9px] uppercase tracking-[0.25em] text-brand-green/55 font-bold leading-tight">Eco-Schools<br />& WESSA Member</p>
          </div>
        </div>
      </Spread>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* SPREAD 16 — PARENT VOICES                                           */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <Spread page={16}>
        <div className="absolute inset-0">
          <Image loading="eager" src="/images/Gallery/Pre School/IMG_9246.JPG" alt="" fill className="object-cover" />
          <div className="absolute inset-0 bg-brand-green/85" />
        </div>
        <div className="relative h-full p-14 flex flex-col">
          <div className="text-center mb-9">
            <p className="chapter-mark text-brand-gold mb-2">· COMMUNITY VOICES ·</p>
            <h2 className="font-serif text-5xl text-white leading-tight">In their own <span className="italic text-brand-gold">words.</span></h2>
            <div className="gold-rule-full max-w-[120px] mx-auto mt-4 opacity-60" />
          </div>
          <div className="grid grid-cols-2 gap-10 flex-1 items-center">
            {[
              {
                quote: "We moved from Joburg three years ago and were nervous about schooling. From the very first morning the teachers knew our daughter's name. She has thrived here in ways we did not expect — academically, yes, but also socially. She is more herself than she has ever been.",
                name: "Mrs S. Fourie",
                role: "Parent · Grade 4",
                initials: "SF",
              },
              {
                quote: "Two of our boys came through Riverview. The eldest is now at Penryn on an academic scholarship. The youngest is in Grade 6 and reads three books a week. The teachers love them, challenge them, and have helped shape them into kind young men. We could not have asked for more.",
                name: "Mr T. Van der Berg",
                role: "Parent · Grade 6 (and Riverview alumnus)",
                initials: "TV",
              },
            ].map((t, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm p-9 rounded-3xl border border-white/20 text-white relative">
                <div className="text-brand-gold text-8xl font-serif absolute -top-3 left-5 opacity-50 leading-none">&ldquo;</div>
                <p className="text-white text-[13px] leading-[1.7] mb-7 relative z-10 pt-7 font-light italic" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                  {t.quote}
                </p>
                <div className="flex items-center gap-4 pt-4 border-t border-white/20">
                  <div className="w-11 h-11 rounded-full bg-brand-gold/30 flex items-center justify-center text-brand-gold font-serif italic text-base">{t.initials}</div>
                  <div>
                    <p className="font-bold text-sm text-white">{t.name}</p>
                    <p className="text-[10px] text-white/80 italic">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-white/55 text-[10px] uppercase tracking-[0.35em] mt-7 font-bold italic">
            The best advertisement for a school is its pupils — and the families who love them.
          </p>
        </div>
      </Spread>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* SPREAD 17 — ADMISSIONS JOURNEY                                      */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <Spread page={17}>
        <div className="p-12 pr-16 h-full flex flex-col ivory-bg">
          <p className="chapter-mark mb-2">· JOIN OUR COMMUNITY ·</p>
          <h2 className="font-serif text-5xl text-brand-green leading-tight mb-1">Come and <span className="italic text-brand-gold">visit us.</span></h2>
          <div className="gold-rule mt-3 mb-3" />
          <p className="text-[11px] text-brand-green/75 italic leading-[1.7] mb-8 max-w-3xl">
            We mean it when we say that the best way to know Riverview is to walk it. Pick a morning. Come and see
            chapel, watch a Grade 2 reading lesson, sit on the bench under the marula tree. We&apos;ll make tea.
          </p>

          <div className="grid grid-cols-4 gap-5 mb-8">
            {[
              { title: "Begin the Conversation", desc: "Book a personal tour, request a prospectus, or simply call our office. No commitment, no application fee yet — just a warm welcome.", icon: <FileText className="w-5 h-5" /> },
              { title: "Submit the Application", desc: "Once your family is ready, complete our online or paper application with birth certificate, clinic card and latest report. R200 fee per form.", icon: <CreditCard className="w-5 h-5" /> },
              { title: "Meet & Evaluate", desc: "We arrange an age-appropriate visit so we can spend time with your child. It is gentle, observational and, for most, rather fun.", icon: <ClipboardCheck className="w-5 h-5" /> },
              { title: "Welcome to Riverview", desc: "Final outcomes are reviewed by our admissions panel and communicated clearly. We then walk you through orientation, uniforms and Day One.", icon: <CheckCircle2 className="w-5 h-5" /> },
            ].map((s, i) => (
              <div key={i} className="bg-white/80 p-5 rounded-2xl border border-brand-gold/25 relative">
                <p className="font-serif italic text-brand-gold text-2xl absolute top-3 right-4">0{i + 1}</p>
                <div className="w-10 h-10 bg-brand-cream rounded-xl flex items-center justify-center text-brand-green mb-3 shadow-sm">{s.icon}</div>
                <p className="font-bold text-brand-green text-[12px] mb-1.5">{s.title}</p>
                <p className="text-[10px] text-brand-green/70 leading-[1.6]">{s.desc}</p>
              </div>
            ))}
          </div>

          <div className="bg-brand-green text-white p-8 rounded-3xl flex items-center gap-10 flex-1">
            <div className="flex-1">
              <p className="chapter-mark text-brand-gold mb-3">· READY TO BEGIN? ·</p>
              <h3 className="font-serif text-3xl mb-1 leading-tight">Your child&apos;s story</h3>
              <p className="font-serif italic text-3xl text-brand-gold mb-4">could begin here.</p>
              <p className="text-[11.5px] text-white/85 leading-[1.7] max-w-md mb-5">
                Apply online in minutes, or scan the code to start a conversation. If you would prefer a personal
                tour first — we would much rather that. Call us.
              </p>
              <div className="grid grid-cols-3 gap-5 text-[11px]">
                <div>
                  <Phone className="w-4 h-4 text-brand-gold mb-1" />
                  <p className="text-white/60 text-[9px] uppercase tracking-[0.25em] font-bold">Call</p>
                  <p className="font-bold">+27 (0)13 790 0000</p>
                </div>
                <div>
                  <Mail className="w-4 h-4 text-brand-gold mb-1" />
                  <p className="text-white/60 text-[9px] uppercase tracking-[0.25em] font-bold">Email</p>
                  <p className="font-bold">info@riverviewprep.org</p>
                </div>
                <div>
                  <MapPin className="w-4 h-4 text-brand-gold mb-1" />
                  <p className="text-white/60 text-[9px] uppercase tracking-[0.25em] font-bold">Visit</p>
                  <p className="font-bold">Malelane, Mpumalanga</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <img
                loading="eager"
                src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https%3A%2F%2Friverviewprep.org%2Fadmissions%2Fapply`}
                alt="Apply QR"
                className="w-32 h-32 bg-white p-2 rounded-xl"
              />
              <p className="chapter-mark text-brand-gold">· SCAN TO APPLY ·</p>
            </div>
          </div>
        </div>
      </Spread>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* SPREAD 18 — BACK COVER                                              */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <Spread page={18}>
        <div className="h-full flex flex-col items-center justify-center ivory-bg p-14">
          <p className="ornament mb-6">· · · · ·</p>
          <div className="flex-1 flex flex-col items-center justify-center">
            <Image loading="eager" src="/images/logo.png" alt="Riverview crest" width={170} height={170} />
            <p className="chapter-mark mt-8">· EST. 1996 ·</p>
            <p className="font-serif italic text-3xl text-brand-green mt-3">Heart, mind &amp; future.</p>
            <div className="gold-rule-full max-w-[160px] mt-5" />
            <p className="text-[11px] text-brand-green/70 italic mt-5 max-w-md text-center leading-[1.7]">
              We hope, more than anything, that you will come and see us. A school is best understood in person — on
              a sunny Lowveld morning, walking the gardens with a cup of tea in hand.
            </p>
          </div>

          <div className="w-full bg-brand-green text-white p-7 rounded-2xl mt-6">
            <div className="grid grid-cols-3 gap-8 text-center">
              <div>
                <MapPin className="w-5 h-5 text-brand-gold mx-auto mb-2" />
                <p className="chapter-mark text-brand-gold text-[9px] mb-1">· VISIT ·</p>
                <p className="text-[11px] leading-[1.55] italic">Riverview Preparatory School<br />Malelane, Mpumalanga<br />South Africa</p>
              </div>
              <div>
                <Phone className="w-5 h-5 text-brand-gold mx-auto mb-2" />
                <p className="chapter-mark text-brand-gold text-[9px] mb-1">· CALL & WRITE ·</p>
                <p className="text-[11px] leading-[1.55]">+27 (0)13 790 0000<br />info@riverviewprep.org<br />riverviewprep.org</p>
              </div>
              <div>
                <Globe className="w-5 h-5 text-brand-gold mx-auto mb-2" />
                <p className="chapter-mark text-brand-gold text-[9px] mb-1">· FOLLOW ·</p>
                <p className="text-[11px] leading-[1.55]">Facebook · RiverviewPrep<br />Instagram · @riverviewprep<br />YouTube · RiverviewSchool</p>
              </div>
            </div>
          </div>

          <div className="w-full pt-5 mt-5 border-t border-brand-gold/30">
            <p className="text-center chapter-mark mb-4">· PROUD MEMBER OF ·</p>
            <div className="flex items-center justify-center gap-9">
              {[
                { src: "/images/assoc/isasa.jpg", name: "ISASA" },
                { src: "/images/assoc/iqaa.jpg", name: "IQAA" },
                { src: "/images/assoc/echo school.jpg", name: "Eco-Schools" },
                { src: "/images/assoc/my school.jpg", name: "MySchool" },
                { src: "/images/assoc/wessa.jpg", name: "WESSA" },
              ].map((a) => (
                <div key={a.name} className="flex flex-col items-center gap-1">
                  <Image loading="eager" src={a.src} alt={a.name} width={52} height={52} className="object-contain grayscale" />
                  <p className="text-[8px] uppercase tracking-[0.2em] text-brand-green/50 font-bold">{a.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Spread>
    </main>
  );
}
