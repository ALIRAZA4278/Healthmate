'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Home() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const testimonials = [
    {
      name: "Ahmed Hassan",
      role: "Teacher",
      image: "👨‍🏫",
      text: "HealthMate ne meri medical reports ko samajhna bahut aasan kar diya. Roman Urdu summaries bohot helpful hain!"
    },
    {
      name: "Fatima Khan",
      role: "Student",
      image: "👩‍🎓",
      text: "Ab mujhe doctor se milne se pehle pata hota hai ke kaunse questions poochne hain. Very useful app!"
    },
    {
      name: "Ali Raza",
      role: "Professional",
      image: "👨‍💼",
      text: "Vitals tracking feature is amazing. I can now monitor my BP and sugar levels easily."
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-white/90 backdrop-blur-lg border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white text-xl font-bold">H</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                HealthMate
              </span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors">
                Features
              </a>
              <a href="#how-it-works" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors">
                How It Works
              </a>
              <a href="#testimonials" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors">
                Testimonials
              </a>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="text-gray-700 hover:text-indigo-600 font-medium transition-colors"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2.5 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 font-medium"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-6 animate-bounce">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              AI-Powered Health Companion • 100% Free
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 mb-6 leading-tight">
              <span className="block">HealthMate</span>
              <span className="block bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Sehat ka Smart Dost
              </span>
            </h1>

            <p className="text-xl sm:text-2xl text-gray-600 mb-4 max-w-3xl mx-auto font-medium">
              Your AI-Powered Personal Health Companion
            </p>
            <p className="text-lg text-gray-500 mb-10 max-w-2xl mx-auto">
              Aapki medical reports ko samajhna ab hua aasaan – bilingual summaries, abnormal value detection, food recommendations aur doctor questions
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
              <Link
                href="/register"
                className="group relative px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-lg font-semibold hover:shadow-2xl hover:scale-105 transition-all duration-200"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Start Free Today
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-700 to-purple-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </Link>
              <Link
                href="/login"
                className="px-8 py-4 bg-white text-indigo-600 rounded-xl text-lg font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 border-2 border-indigo-600"
              >
                Sign In
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">100% Free Forever</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Secure & Private</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Gemini 2.5 AI Powered</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Bilingual Support</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white border-b">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="p-6">
              <div className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                100%
              </div>
              <div className="text-gray-600 font-medium">Free to Use</div>
            </div>
            <div className="p-6">
              <div className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                2 Lang
              </div>
              <div className="text-gray-600 font-medium">English + Roman Urdu</div>
            </div>
            <div className="p-6">
              <div className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                AI
              </div>
              <div className="text-gray-600 font-medium">Gemini 2.5 Powered</div>
            </div>
            <div className="p-6">
              <div className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                ∞
              </div>
              <div className="text-gray-600 font-medium">Unlimited Reports</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Powerful Features for Better Health Management
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to understand and track your health
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group relative bg-white p-8 rounded-2xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-bl-full opacity-50"></div>
              <div className="text-5xl mb-6">📄</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Upload Medical Reports
              </h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Upload all your medical reports, prescriptions, X-rays, ultrasounds, and test results in one secure, organized place
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  PDF, Images supported
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Secure cloud storage
                </li>
              </ul>
            </div>

            {/* Feature 2 */}
            <div className="group relative bg-white p-8 rounded-2xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-bl-full opacity-50"></div>
              <div className="text-5xl mb-6">🤖</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                AI-Powered Analysis
              </h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Get instant AI-powered explanations in both English and Roman Urdu using Google Gemini 2.5 Flash AI
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Bilingual summaries
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Abnormal value detection
                </li>
              </ul>
            </div>

            {/* Feature 3 */}
            <div className="group relative bg-white p-8 rounded-2xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-green-100 to-emerald-100 rounded-bl-full opacity-50"></div>
              <div className="text-5xl mb-6">📊</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Track Vitals & Timeline
              </h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Manually add and track BP, blood sugar, weight, and other vital signs over time with timeline view
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Easy vitals tracking
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Historical timeline
                </li>
              </ul>
            </div>

            {/* Feature 4 */}
            <div className="group relative bg-white p-8 rounded-2xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-bl-full opacity-50"></div>
              <div className="text-5xl mb-6">❓</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Doctor Questions
              </h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                AI generates 3-5 important questions you should ask your doctor based on your report findings
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Relevant questions
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Better consultations
                </li>
              </ul>
            </div>

            {/* Feature 5 */}
            <div className="group relative bg-white p-8 rounded-2xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-red-100 to-pink-100 rounded-bl-full opacity-50"></div>
              <div className="text-5xl mb-6">🍎</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Food Recommendations
              </h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Get personalized food suggestions - what to eat and what to avoid based on your health reports
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Foods to eat
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Foods to avoid
                </li>
              </ul>
            </div>

            {/* Feature 6 */}
            <div className="group relative bg-white p-8 rounded-2xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-bl-full opacity-50"></div>
              <div className="text-5xl mb-6">🏠</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Home Remedies
              </h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Safe, general home remedies that may help improve your condition naturally
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Natural remedies
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Safe suggestions
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How HealthMate Works
            </h2>
            <p className="text-xl text-gray-600">
              3 simple steps to understand your health reports
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="relative inline-block mb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-xl">
                  1
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-pulse"></div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Upload Report</h3>
              <p className="text-gray-600">
                Simply upload your medical report, prescription, or any test result in PDF or image format
              </p>
            </div>

            <div className="text-center">
              <div className="relative inline-block mb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-xl">
                  2
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-pulse"></div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">AI Analysis</h3>
              <p className="text-gray-600">
                Our Gemini AI analyzes your report and generates bilingual summaries with abnormal values highlighted
              </p>
            </div>

            <div className="text-center">
              <div className="relative inline-block mb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-xl">
                  3
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-pulse"></div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Get Insights</h3>
              <p className="text-gray-600">
                View detailed insights, food recommendations, doctor questions, and home remedies instantly
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl p-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">
              What HealthMate Provides
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                { icon: '📝', title: 'Simple Summaries', desc: 'Easy-to-understand explanations in both English and Roman Urdu' },
                { icon: '⚠️', title: 'Highlight Abnormal Values', desc: 'Quickly identify which values are out of normal range with color coding' },
                { icon: '❓', title: 'Questions for Doctor', desc: 'Get 3-5 important, relevant questions to ask your doctor' },
                { icon: '🍎', title: 'Food Recommendations', desc: 'Personalized suggestions for foods to eat and avoid based on your reports' },
                { icon: '🏠', title: 'Home Remedies', desc: 'Safe, general home remedies that may help improve your condition' },
                { icon: '📅', title: 'Medical Timeline', desc: 'View your entire health history in one organized, chronological timeline' },
              ].map((benefit, index) => (
                <div key={index} className="flex items-start gap-4 p-6 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100">
                  <div className="text-4xl">{benefit.icon}</div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg mb-2">{benefit.title}</h4>
                    <p className="text-gray-600">{benefit.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              What Our Users Say
            </h2>
            <p className="text-xl text-gray-600">
              Trusted by students, professionals, and families
            </p>
          </div>

          <div className="relative">
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl p-12 shadow-xl">
              <div className="text-center">
                <div className="text-6xl mb-6">{testimonials[activeTestimonial].image}</div>
                <p className="text-xl text-gray-700 mb-6 italic">
                  &ldquo;{testimonials[activeTestimonial].text}&rdquo;
                </p>
                <h4 className="text-lg font-bold text-gray-900">
                  {testimonials[activeTestimonial].name}
                </h4>
                <p className="text-gray-600">{testimonials[activeTestimonial].role}</p>
              </div>
            </div>

            {/* Navigation Dots */}
            <div className="flex justify-center gap-2 mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    activeTestimonial === index
                      ? 'bg-indigo-600 w-8'
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Ready to Take Control of Your Health?
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            Join HealthMate today and start understanding your medical reports better
          </p>
          <Link
            href="/register"
            className="inline-block px-10 py-4 bg-white text-indigo-600 rounded-xl text-lg font-semibold hover:shadow-2xl hover:scale-105 transition-all duration-200"
          >
            Get Started Free - No Credit Card Required
          </Link>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-yellow-50 border-y border-yellow-200">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-800 font-semibold mb-2">
                <strong>Important Disclaimer:</strong> HealthMate&apos;s AI analysis is for informational and educational purposes only. It is NOT a substitute for professional medical advice, diagnosis, or treatment. Always consult your doctor or qualified healthcare provider before making any medical decisions.
              </p>
              <p className="text-sm text-gray-700">
                <strong>اہم خبردار:</strong> HealthMate ka AI sirf samajhne aur seekhne ke liye hai. Yeh kisi bhi medical advice, diagnosis, ya ilaaj ka substitute nahi hai. Hamesha apne doctor ya qualified healthcare provider se consult karein pehle koi medical decision lene se.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">H</span>
                </div>
                <span className="text-xl font-bold text-white">HealthMate</span>
              </div>
              <p className="text-gray-400 mb-4">
                Your AI-Powered Personal Health Companion
              </p>
              <p className="text-sm text-gray-500">
                Helping you understand your medical reports better with AI-powered bilingual analysis.
              </p>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-indigo-400 transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-indigo-400 transition-colors">How It Works</a></li>
                <li><a href="#testimonials" className="hover:text-indigo-400 transition-colors">Testimonials</a></li>
                <li><Link href="/register" className="hover:text-indigo-400 transition-colors">Get Started</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/login" className="hover:text-indigo-400 transition-colors">Login</Link></li>
                <li><Link href="/register" className="hover:text-indigo-400 transition-colors">Register</Link></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-sm text-gray-500">
              Built with ❤️ by   Students | Powered by Gemini 2.5 AI
            </p>
            <p className="text-sm text-gray-500 mt-2">
              © 2025 HealthMate. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
