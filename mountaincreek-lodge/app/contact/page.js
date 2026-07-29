"use client";

import { useState } from "react";
import HeroHeader from "@/components/HeroHeader";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call for now
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitStatus("success");
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
      
      // Reset status after a few seconds
      setTimeout(() => setSubmitStatus(null), 5000);
    }, 1500);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <main className="bg-linen min-h-screen">
      <HeroHeader
        eyebrow="Get in Touch"
        title="Contact Us"
        description="Whether you are looking to book a stay, plan an event, or just have a question, we would love to hear from you."
      />

      {/* Main Content Area */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 lg:px-16 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
          
          {/* Left Column: Contact Info & Directions */}
          <div>
            <div className="mb-12">
              <h2 className="font-serif text-primary text-3xl mb-8">Reach Out Directly</h2>
              
              <div className="space-y-6">
                {/* Phone */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary/5 rounded-full flex items-center justify-center text-accent">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.896-1.596-5.25-3.95-6.847-6.847l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-sans text-xs uppercase tracking-widest text-primary/60 mb-1">Call Us</p>
                    <a href="tel:0829594643" className="block font-sans text-primary hover:text-accent transition-colors">082 959 4643</a>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary/5 rounded-full flex items-center justify-center text-accent">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-sans text-xs uppercase tracking-widest text-primary/60 mb-1">Email</p>
                    <a href="mailto:info@mountaincreeklodge.co.za" className="font-sans text-primary hover:text-accent transition-colors">
                      info@mountaincreeklodge.co.za
                    </a>
                  </div>
                </div>

                {/* Address & GPS */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary/5 rounded-full flex items-center justify-center text-accent">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-sans text-xs uppercase tracking-widest text-primary/60 mb-1">Location</p>
                    <p className="font-sans text-primary mb-1">R536 Hazyview/Sabie Road<br/>Mpumalanga, South Africa</p>
                    <p className="font-sans text-sm text-primary/70">GPS: 25 01 57.05 S | 31 02 13.01 E</p>
                  </div>
                </div>

                {/* Social Media */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary/5 rounded-full flex items-center justify-center text-accent">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-sans text-xs uppercase tracking-widest text-primary/60 mb-2">Follow Us</p>
                    <div className="flex gap-4">
                      <a href="https://www.facebook.com/profile.php?id=61564501787845" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-accent transition-colors bg-primary/5 p-2 rounded-full" aria-label="Facebook">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                      </a>
                      <a href="https://www.instagram.com/_mountaincreeklodge" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-accent transition-colors bg-primary/5 p-2 rounded-full" aria-label="Instagram">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-primary/10 my-10" />

            {/* Directions */}
            <div>
              <h3 className="font-serif text-primary text-2xl mb-4">Directions to Mountain Creek Lodge</h3>
              <div className="prose prose-sm prose-p:text-primary/70 prose-p:leading-relaxed space-y-4">
                <p>
                  From Johannesburg, take the N12 to Witbank, then continue on the N4 to Nelspruit.
                  From Nelspruit, follow the R40 through White River towards Hazyview.
                </p>
                <p>
                  <strong className="text-primary">Important:</strong> Do not turn right when leaving White River,
                  even if your GPS suggests it just past Casterbridge Lifestyle Centre. Stay on the R40 towards
                  Phalaborwa, which is the scenic route through Hazyview.
                </p>
                <p>
                  Continue through Hazyview on the R40. At the three-way stop just past Perry’s Bridge Trading Post,
                  turn left onto the R536 towards Sabie.
                </p>
                <p>
                  Mountain Creek Lodge is located 10 km along the R536, on the left-hand side.
                </p>
                <p>
                  <strong className="text-primary">GPS:</strong> We recommend using Google Maps or Waze and
                  searching for &ldquo;Mountain Creek Lodge, Hazyview&rdquo; for the most accurate directions.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div>
            <div className="bg-white p-8 md:p-12 rounded-sm shadow-[0_8px_40px_-12px_rgba(26,47,35,0.08)]">
              <h3 className="font-serif text-2xl text-primary mb-8">Send us a Message</h3>
              
              {submitStatus === "success" && (
                <div className="mb-8 p-4 bg-green-50 border border-green-200 text-green-700 rounded-sm font-sans text-sm">
                  Thank you for your message! We will get back to you shortly.
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block font-sans text-xs uppercase tracking-wider text-primary/70 mb-2">
                    Your Name (required)
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-linen/50 border border-primary/10 px-4 py-3 font-sans text-primary focus:outline-none focus:border-accent transition-colors rounded-sm"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="email" className="block font-sans text-xs uppercase tracking-wider text-primary/70 mb-2">
                      Your Email (required)
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full bg-linen/50 border border-primary/10 px-4 py-3 font-sans text-primary focus:outline-none focus:border-accent transition-colors rounded-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block font-sans text-xs uppercase tracking-wider text-primary/70 mb-2">
                      Contact Number (required)
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full bg-linen/50 border border-primary/10 px-4 py-3 font-sans text-primary focus:outline-none focus:border-accent transition-colors rounded-sm"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block font-sans text-xs uppercase tracking-wider text-primary/70 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full bg-linen/50 border border-primary/10 px-4 py-3 font-sans text-primary focus:outline-none focus:border-accent transition-colors rounded-sm"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block font-sans text-xs uppercase tracking-wider text-primary/70 mb-2">
                    Your Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    required
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full bg-linen/50 border border-primary/10 px-4 py-3 font-sans text-primary focus:outline-none focus:border-accent transition-colors rounded-sm resize-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`
                    w-full bg-primary text-linen font-sans text-sm font-semibold tracking-widest uppercase
                    px-8 py-4 rounded-sm transition-all duration-300
                    hover:bg-primary/90 hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed
                  `}
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </button>
              </form>
            </div>
          </div>

        </div>
      </section>

      {/* Full Width Google Map */}
      <section className="w-full h-[400px] md:h-[500px] bg-primary/5 relative">
        <iframe 
          width="100%" 
          height="100%" 
          style={{ border: 0 }}
          allowFullScreen="" 
          loading="lazy" 
          referrerPolicy="no-referrer-when-downgrade"
          src="https://maps.google.com/maps?q=Mountain%20Creek%20Lodge%20Hazyview&t=&z=13&ie=UTF8&iwloc=&output=embed"
          title="Mountain Creek Lodge Location Map"
          className="w-full h-full filter saturate-50 contrast-125"
        ></iframe>
      </section>
    </main>
  );
}
