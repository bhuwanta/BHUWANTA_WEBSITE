'use client'

import { motion } from 'framer-motion'
import { ShieldCheck, Target, Heart, Scale, MapPin, Users, Award, MoveRight, Eye } from 'lucide-react'
import Image from 'next/image'

export default function AboutClientPage() {
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  }

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  }

  return (
    <div className="overflow-hidden bg-[#ffffff]">
      {/* HERO SECTION - COMPANY INTRODUCTION */}
      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-32 bg-[#0f1d33] text-white">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-[30%] -right-[10%] w-[70%] h-[70%] rounded-full bg-[#1e3a5f]/40 blur-[120px]" />
          <div className="absolute -bottom-[30%] -left-[10%] w-[60%] h-[60%] rounded-full bg-[#c4a55a]/10 blur-[120px]" />
          <div className="absolute inset-0 noise-overlay opacity-30 mix-blend-overlay"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-4xl mx-auto text-center"
          >
            <motion.span variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1e3a5f]/50 border border-[#1e3a5f] text-[#c4a55a] text-sm font-semibold tracking-widest uppercase mb-8">
              <span className="w-2 h-2 rounded-full bg-[#c4a55a] shadow-[0_0_8px_#c4a55a] animate-pulse" />
              Company Introduction
            </motion.span>

            <motion.h1 variants={fadeInUp} className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 leading-tight">
              Building a Future <span className="text-[#c4a55a]">Founded on Trust</span>
            </motion.h1>

            <motion.p variants={fadeInUp} className="text-lg md:text-xl text-[#f7f8fa]/80 mb-6 leading-relaxed">
              BHUWANTA is one of Hyderabad's trusted names in HMDA and DTCP approved open plot ventures. We were built on a straightforward belief that land ownership should be simple, safe, and accessible for every family.
            </motion.p>

            <motion.p variants={fadeInUp} className="text-lg md:text-xl text-[#f7f8fa]/80 mb-6 leading-relaxed">
              We specialize in legally verified open plots across Hyderabad, with projects spanning prime growth corridors approved by HMDA and DTCP. Every plot we sell is thoroughly verified, well-connected, and priced to match real market value, not inflated expectations.
            </motion.p>

            <motion.p variants={fadeInUp} className="text-lg md:text-xl text-[#f7f8fa]/80 leading-relaxed">
              Whether you're buying your first plot or expanding an investment portfolio, you'll find the process with us refreshingly clear. No jargon, no hidden charges, no last-minute surprises. Land isn't just a financial decision. For most families, it's a long-term commitment, something passed down, built upon, and remembered. That's exactly how we treat every transaction at BHUWANTA.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* VISION & MISSION SECTION */}
      <section className="py-32 bg-[#f7f8fa] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#c4a55a]/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#1e3a5f]/5 rounded-full blur-[100px]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">

            {/* VISION CARD */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInUp}
              className="h-full bg-white rounded-[2rem] p-10 md:p-14 shadow-xl shadow-[#0f1d33]/5 border border-[#e8ecf2] relative overflow-hidden group hover:border-[#c4a55a]/50 transition-all duration-500 hover:-translate-y-2 flex flex-col"
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-[#f7f8fa] to-white rounded-bl-full -mr-4 -mt-4 opacity-50 transition-transform duration-500 group-hover:scale-110" />
              <div className="w-16 h-16 rounded-2xl bg-[#0f1d33] flex items-center justify-center mb-10 shadow-lg shadow-[#0f1d33]/10 text-[#c4a55a] transform group-hover:rotate-6 transition-transform duration-500 relative z-10">
                <Eye className="w-8 h-8" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#0f1d33] mb-8 relative z-10">Vision Statement</h2>
              <div className="bg-[#f7f8fa] p-6 rounded-xl border border-[#e8ecf2] mb-8 relative z-10 shadow-inner">
                <p className="text-xl font-medium text-[#c4a55a] italic leading-relaxed">
                  "To make property ownership accessible to every Indian family - Land Today. Landmark Tomorrow."
                </p>
              </div>
              <p className="text-lg text-[#5a6a82] leading-relaxed relative z-10">
                We envision a Hyderabad where land investment is no longer a complex, confusing process reserved for the privileged few — but a clear, confident decision available to all. BHUWANTA is building toward a future where every family can own a piece of this city's growth story.
              </p>
            </motion.div>

            {/* MISSION CARD */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              className="h-full bg-[#0f1d33] rounded-[2rem] p-10 md:p-14 shadow-xl shadow-[#0f1d33]/20 border border-[#1e3a5f] relative overflow-hidden text-white group hover:border-[#c4a55a]/50 transition-all duration-500 hover:-translate-y-2 flex flex-col"
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-[#1e3a5f] to-[#0f1d33] rounded-bl-full -mr-4 -mt-4 opacity-50 transition-transform duration-500 group-hover:scale-110" />
              <div className="relative z-10 flex-grow flex flex-col">
                <div className="flex items-center gap-5 mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-[#c4a55a] transform group-hover:-rotate-6 transition-transform duration-500 border border-white/5 flex-shrink-0">
                    <Target className="w-8 h-8" />
                  </div>
                  <div>
                    <span className="text-[#c4a55a] font-semibold tracking-wider uppercase text-sm block mb-1">Our Purpose</span>
                    <h2 className="text-3xl md:text-4xl font-bold text-white">Mission Statement</h2>
                  </div>
                </div>
                
                <p className="text-lg text-[#f7f8fa]/80 mb-10 leading-relaxed border-b border-white/10 pb-8">
                  At BHUWANTA, our mission is driven by three core commitments. Every decision we make as a company flows through these because when our customers win, BHUWANTA grows.
                </p>

                <div className="space-y-8 flex-grow">
                  {[
                    { icon: Scale, title: 'Legal Safety First', desc: 'Every plot we offer is HMDA and DTCP approved, fully documented, and legally verified so buyers can invest without worry.' },
                    { icon: Heart, title: 'Affordable for Every Family', desc: 'We believe premium locations should not come with unaffordable price tags. We work hard to bridge that gap.' },
                    { icon: ShieldCheck, title: 'Connecting Buyers to Their Dream', desc: 'From site visits to registration, we guide our customers at every step so they feel confident, informed, and excited about their investment.' }
                  ].map((item, i) => (
                    <motion.div key={i} variants={fadeInUp} className="flex gap-5 group/item">
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#1e3a5f] border border-white/10 flex items-center justify-center text-[#c4a55a] transition-all duration-300 group-hover/item:bg-[#c4a55a] group-hover/item:text-white shadow-lg">
                        <item.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                        <p className="text-[#f7f8fa]/70 leading-relaxed text-sm sm:text-base">{item.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* LEGAL TRANSPARENCY & JOURNEY SECTION */}
      <section className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-[#0f1d33] mb-6">Legal Transparency & Core Values</h2>
            <p className="text-lg text-[#5a6a82] leading-relaxed">
              Every plot listed by BHUWANTA carries full HMDA and DTCP approval, clear title documentation, and zero hidden charges. We believe an informed buyer is a confident buyer, which is why we share all legal documents upfront before any transaction begins.
            </p>
            <p className="text-lg font-semibold text-[#1e3a5f] mt-6">
              When you invest with BHUWANTA, you invest with complete clarity. No surprises. No fine print. Just land that is legally safe and ready to build your future on.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInUp}
              className="bg-[#1e3a5f] rounded-2xl p-10 text-white relative overflow-hidden"
            >
              <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-white/5 rounded-full blur-[50px]"></div>
              <MapPin className="w-10 h-10 text-[#c4a55a] mb-6" />
              <h3 className="text-2xl font-bold mb-4">Our Journey</h3>
              <p className="text-[#f7f8fa]/80 leading-relaxed mb-6">
                BHUWANTA may be new to the market, but the vision behind it has been years in the making. Born from a deep understanding of Hyderabad's real estate landscape, we launched with one mission - to give buyers a trustworthy alternative in a market often clouded by misinformation and unapproved ventures.
              </p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInUp}
              className="bg-[#f7f8fa] border border-[#e8ecf2] rounded-2xl p-10 relative overflow-hidden"
            >
              <Target className="w-10 h-10 text-[#1e3a5f] mb-6" />
              <h3 className="text-2xl font-bold text-[#0f1d33] mb-4">Where We Are Headed</h3>
              <p className="text-[#5a6a82] leading-relaxed">
                We are actively expanding our plot portfolio across high-growth corridors in Hyderabad and the wider Telangana region. Our roadmap includes gated community ventures, township projects, and investment-grade plots in emerging micro-markets - all under BHUWANTA's guarantee of legal safety and fair pricing.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* LEADERSHIP SECTION */}
      <section className="py-24 bg-[#0f1d33] text-white relative">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-[20%] right-[10%] w-[500px] h-[500px] rounded-full bg-[#c4a55a]/5 blur-[100px]" />
          <div className="absolute bottom-[10%] left-[5%] w-[400px] h-[400px] rounded-full bg-[#1e3a5f]/30 blur-[100px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <span className="text-[#c4a55a] font-semibold tracking-wider uppercase text-sm mb-3 block">Company Founders</span>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Leadership Profiles</h2>
            <p className="text-lg text-[#f7f8fa]/80 leading-relaxed">
              Behind every plot at BHUWANTA is a team that believes in what it sells. Our leadership combines decades of real estate experience with a commitment to putting buyers first - always.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

            {/* Founder 1 */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInUp}
              className="bg-white/5 border border-white/10 rounded-2xl p-8 sm:p-10 backdrop-blur-sm hover:bg-white/10 transition-colors duration-500"
            >
              <div className="flex flex-col sm:flex-row gap-8 items-center sm:items-start mb-10 pb-8 border-b border-white/10 text-center sm:text-left">
                <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-full border border-[#1e3a5f] p-2 flex-shrink-0 bg-gradient-to-br from-[#c4a55a]/10 to-transparent relative group-hover:from-[#c4a55a]/30 transition-all duration-700 shadow-2xl shadow-[#c4a55a]/10 group-hover:shadow-[#c4a55a]/30 transform group-hover:-translate-y-2 group-hover:scale-105">
                  <div className="w-full h-full rounded-full bg-[#0f1d33] border border-[#c4a55a]/30 relative overflow-hidden group-hover:border-[#c4a55a] transition-colors duration-700">
                    {/* You can replace this inner div with an <Image /> tag later */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-[#c4a55a]/50 text-xs font-bold uppercase tracking-widest px-2">
                      <Users className="w-10 h-10 mb-2 opacity-50 transform group-hover:scale-110 transition-transform duration-700" />
                      Image
                    </div>
                  </div>
                </div>
                <div className="mt-2 sm:mt-8">
                  <h3 className="text-3xl sm:text-4xl font-bold text-white mb-3">S. Shiva Kumar</h3>
                  <p className="text-[#c4a55a] font-medium text-xl">Founder & Managing Director (MD)</p>
                </div>
              </div>

              <ul className="space-y-6">
                {[
                  { title: "15+ Years of Mastery", desc: "Built from the ground up across Hyderabad's most demanding real estate cycles." },
                  { title: "Legal-First Leadership", desc: "Every Bhuwanta venture is personally vetted for HMDA & DTCP compliance before a single plot is sold." },
                  { title: "Zero-Compromise Standards", desc: "Title assurance and full approval documentation are non-negotiable under Mr. Shiva Kumar's watch." },
                  { title: "Long-Term Vision", desc: "Structures every project for asset appreciation, not just immediate sales." }
                ].map((item, i) => (
                  <li key={i} className="flex gap-4">
                    <div className="mt-1 flex-shrink-0 w-6 h-6 rounded-full bg-[#1e3a5f] flex items-center justify-center text-[#c4a55a]">
                      <Award className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <strong className="text-white block mb-1">{item.title}</strong>
                      <span className="text-[#f7f8fa]/70 leading-relaxed">{item.desc}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Founder 2 */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInUp}
              className="bg-white/5 border border-white/10 rounded-2xl p-8 sm:p-10 backdrop-blur-sm hover:bg-white/10 transition-colors duration-500"
            >
              <div className="flex flex-col sm:flex-row gap-8 items-center sm:items-start mb-10 pb-8 border-b border-white/10 text-center sm:text-left">
                <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-full border border-[#1e3a5f] p-2 flex-shrink-0 bg-gradient-to-br from-[#c4a55a]/10 to-transparent relative group-hover:from-[#c4a55a]/30 transition-all duration-700 shadow-2xl shadow-[#c4a55a]/10 group-hover:shadow-[#c4a55a]/30 transform group-hover:-translate-y-2 group-hover:scale-105">
                  <div className="w-full h-full rounded-full bg-[#0f1d33] border border-[#c4a55a]/30 relative overflow-hidden group-hover:border-[#c4a55a] transition-colors duration-700">
                    {/* You can replace this inner div with an <Image /> tag later */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-[#c4a55a]/50 text-xs font-bold uppercase tracking-widest px-2">
                      <Users className="w-10 h-10 mb-2 opacity-50 transform group-hover:scale-110 transition-transform duration-700" />
                      Image
                    </div>
                  </div>
                </div>
                <div className="mt-2 sm:mt-8">
                  <h3 className="text-3xl sm:text-4xl font-bold text-white mb-3">RamaKrishna Reddy</h3>
                  <p className="text-[#c4a55a] font-medium text-xl">Co-Founder & Managing Director (MD)</p>
                </div>
              </div>

              <ul className="space-y-6">
                {[
                  { title: "12+ Years of Market Intelligence", desc: "Deep knowledge of Hyderabad's highest-growth corridors and emerging investment zones." },
                  { title: "Acquisition Edge", desc: "Identifies land with the highest long-term value before the market catches on." },
                  { title: "Customer-First DNA", desc: "Turns first-time buyers into confident investors through transparent, guided decisions." },
                  { title: "Sales Architecture", desc: "Builds systems that scale trust, not just transactions." }
                ].map((item, i) => (
                  <li key={i} className="flex gap-4">
                    <div className="mt-1 flex-shrink-0 w-6 h-6 rounded-full bg-[#1e3a5f] flex items-center justify-center text-[#c4a55a]">
                      <Users className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <strong className="text-white block mb-1">{item.title}</strong>
                      <span className="text-[#f7f8fa]/70 leading-relaxed">{item.desc}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </motion.div>

          </div>
        </div>
      </section>

      {/* FINAL CTA CTA */}
      <section className="py-24 bg-[#f7f8fa] text-center border-t border-[#e8ecf2]">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
          >
            <h2 className="text-3xl md:text-5xl font-bold text-[#0f1d33] mb-6">Ready to Build Your Future?</h2>
            <p className="text-xl text-[#5a6a82] mb-10">
              Join hundreds of confident families who have found their perfect piece of land with BHUWANTA.
            </p>
            <a
              href="/projects"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#c4a55a] to-[#d4b76a] text-white font-bold rounded-xl shadow-lg shadow-[#c4a55a]/20 hover:shadow-xl hover:shadow-[#c4a55a]/30 hover:-translate-y-1 transition-all duration-300"
            >
              Explore Our Projects
              <MoveRight className="w-5 h-5" />
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
