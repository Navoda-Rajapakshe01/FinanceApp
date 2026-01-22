import Navbar from "../components/Navbar";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navbar />

      {/* HERO */}
      <section className="w-full min-h-[calc(100vh-4rem)] flex items-center bg-gradient-to-l from-[#F8FAFC] via-[#F0FDFA] to-[#FFF7ED]">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-6xl sm:text-5xl leading-tight">
            Master Your Money,
            <br />
            <span className="text-emerald-600">Build Your Wealth</span>
          </h1>
          <p className="mt-6 text-slate-600 max-w-2xl mx-auto">
            Take control of your finances with intelligent tracking, personalized
            insights, and expert guidance from certified financial consultants.
          </p>

          <div className="mt-20 flex items-center justify-center gap-4">
            <Link href="/register">
            <button className="rounded-[14px] bg-gradient-to-r from-[#009689] to-[#009966] text-white px-6 py-3 shadow-md hover:scale-105 cursor-pointer transition-transform duration-300 ease-in-out">
              Get Started Free →
            </button>
            </Link>
            <Link href="/login">
            <button className="rounded-[14px] bg-white shadow-lg px-5 py-3 hover:scale-105 cursor-pointer transition-transform duration-300 ease-in-out">Sign In</button>
            </Link>
          </div>

          <div className="mt-25 grid grid-cols-3 gap-20 text-center max-w-7xl mx-auto">
            <div>
              <div className="text-4xl text-emerald-600">100%</div>
              <div className="text-sm text-slate-500 mt-1">Free to Use</div>
            </div>
            <div>
              <div className="text-4xl text-emerald-600">24/7</div>
              <div className="text-sm text-slate-500 mt-1">Access Anytime</div>
            </div>
            <div>
              <div className="text-4xl text-orange-500">Secure</div>
              <div className="text-sm text-slate-500 mt-1">Bank-Level Security</div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES CARD */}
      <section className="relative z-10 px-6 mt-5">
        <div className="max-w-screen mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-4xl text-center">Everything You Need to Succeed</h2>
            <p className="text-center text-slate-500 mt-2">Powerful features designed to simplify your financial journey</p>

            <div className="mt-10 mb-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {(() => {
                const iconBgs = [
                  'bg-gradient-to-tr from-[#00BBA7] to-[#00BC7D]',
                  'bg-gradient-to-tr from-[#2B7FFF] to-[#00B8DB]',
                  'bg-gradient-to-tr from-[#00BC7D] to-[#00BBA7]',
                  'bg-gradient-to-tr from-[#FF6900] to-[#FB2C36]',
                  'bg-gradient-to-tr from-[#AD46FF] to-[#F6339A]',
                  'bg-gradient-to-tr from-[#45556C] to-[#1D293D]',
                ];

                return [
                  ["Simple Expense Tracking", "Easily record cash expenses and income with our intuitive manual entry system. Never lose track of your spending again."],
                  ["Monthly Insights", "Visualize your spending patterns with detailed charts and reports. Understand where your money goes each month."],
                  ["Smart Savings Strategies", "Receive personalized saving recommendations and investment options based on your unique financial behavior."],
                  ["Professional Consultants", "Connect with certified financial consultants for expert guidance tailored to your financial goals."],
                  ["Financial Planning", "Plan your finances effectively with comprehensive tools and insights to help you reach your goals faster."],
                  ["Secure & Private", "Your financial data is protected with industry-standard security. We prioritize your privacy and data protection."],
                ].map((item, idx) => (
                  <div key={idx} className="p-8 bg-white rounded-2xl shadow-sm">
                    <div className="flex flex-col items-start gap-4 text-left">
                      <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-lg ${iconBgs[idx]} flex items-center justify-center shadow-md flex-shrink-0`}>
                          <Image src={`/Icon${idx + 1}.png`} alt={`${item[0]} icon`} width={36} height={36} />
                        </div>
                        <h3 className="text-lg text-slate-900">{item[0]}</h3>
                      </div>
                      <p className="text-sm text-slate-500 mt-2 leading-relaxed">{item[1]}</p>
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>
      </section>

      {/* STEPS */}
      <section className="px-6 bg-gradient-to-l from-[#F8FAFC] via-[#F0FDFA] to-[#FFF7ED] py-16">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl">Get Started in Minutes</h2>
          <p className="text-slate-500 mt-2">Three simple steps to financial clarity</p>

          <div className="mt-20 relative">
            <div className="hidden sm:block absolute left-12 right-12 top-10 h-[3px] bg-gradient-to-r from-emerald-200 via-emerald-300 to-emerald-200 z-0" />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                {
                  title: 'Create Your Account',
                  desc: 'Choose between a regular user account for personal finance management or a consultant account to help others.',
                  color: 'from-[#00BBA7] to-[#00BC7D]'
                },
                {
                  title: 'Track Your Finances',
                  desc: 'Add your income and expenses manually. Our system will automatically analyze your spending patterns.',
                  color: 'from-[#00BBA7] to-[#00BC7D]'
                },
                {
                  title: 'Get Insights & Grow',
                  desc: 'Receive personalized recommendations, view detailed reports, and connect with consultants for professional advice.',
                  color: 'from-[#FF6900] to-[#FB2C36]'
                }
              ].map((s, i) => (
                <div key={i} className="relative z-10 p-6 bg-white rounded-2xl shadow-md pt-12 w-72 h-64">
                  {/* numbered badge */}
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                    <div className={`w-15 h-15 rounded-[16] bg-gradient-to-tr ${s.color} flex items-center justify-center text-white shadow`}>{i + 1}</div>
                  </div>

                  <div className="text-center justify-center flex flex-col h-full">
                    <h4 className="font-semibold text-lg">{s.title}</h4>
                    <p className="text-sm text-slate-500 mt-3">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="mt-5 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#009689] via-[#009966] to-[#00786F]  text-white py-16 px-6 sm:px-12 shadow-lg">
            {/* decorative shapes */}
            <div className="pointer-events-none absolute -top-15 -left-15 w-45 h-45 rounded-full bg-[#FFFFFF] opacity-15 " />
            <div className="pointer-events-none absolute -bottom-17 -right-17 w-56 h-56 rounded-full bg-[#FFFFFF] opacity-15" />

            <div className="text-center max-w-3xl mx-auto">
              <h3 className="text-3xl sm:text-4xl">Ready to Transform Your Financial Life?</h3>
              <p className="mt-4 text-white/90">Join the users who are already managing their finances smarter with CashSpace.</p>

              <div className="mt-8">
                <button className="inline-block bg-white text-emerald-600 px-6 py-3 rounded-xl shadow-xl hover:shadow-2xl transition">Start Your Journey →</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-16 bg-[#071427] text-slate-300">
      <div className="max-w-6xl mx-auto border-t border-slate-800 py-6">
        <div className="text-center text-sm">
          © 2025 CashSpace. All rights reserved. Your partner in financial success.
        </div>
      </div>
      </footer>
    </div>
  );
}
