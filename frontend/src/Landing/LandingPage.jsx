"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Link } from "react-router-dom"
import { useAuth } from "../contexts/auth-context"
import { useLanguage } from "../contexts/language-context"
import logoImage from "../assets/images/logo.png"
import {
  ChevronRight,
  BookOpen,
  Mic,
  Beaker,
  Atom,
  Dna,
  Calculator,
  ArrowRight,
  CheckCircle,
  Menu,
  X,
} from "lucide-react"

export default function LandingPage() {
  const { user } = useAuth()
  const { language, setLanguage, t } = useLanguage()
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Track scroll position for header styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "bn" : "en")
  }

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: (i = 0) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.6,
        ease: [0.43, 0.13, 0.23, 0.96],
      },
    }),
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a192f] to-[#164e63] text-white overflow-hidden">
      {/* Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? "bg-[#0a192f]/90 backdrop-blur-md py-3 shadow-lg" : "bg-transparent py-6"
        }`}
      >
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img src={logoImage} alt="OpenLearn Logo" className="h-16 w-auto" />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <nav>
              <ul className="flex gap-6">
                <li>
                  <a href="#features" className="text-gray-300 hover:text-teal-400 transition-colors">
                    {t('nav.features')}
                  </a>
                </li>
                <li>
                  <a href="#how-it-works" className="text-gray-300 hover:text-teal-400 transition-colors">
                    {t('nav.howItWorks')}
                  </a>
                </li>
                <li>
                  <a href="#benefits" className="text-gray-300 hover:text-teal-400 transition-colors">
                    Benefits
                  </a>
                </li>
              </ul>
            </nav>

            {user ? (
              <Link
                to="/dashboard"
                className="bg-teal-500 hover:bg-teal-600 text-white transition-colors px-4 py-2 rounded-md flex items-center"
              >
                Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/auth"
                  className="border border-teal-400 text-teal-400 hover:bg-teal-400/10 transition-colors px-4 py-2 rounded-md"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  to="/auth?tab=signup"
                  className="bg-teal-500 hover:bg-teal-600 text-white transition-colors px-4 py-2 rounded-md"
                >
                  {t('nav.signup')}
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden text-white" onClick={toggleMobileMenu} aria-label="Toggle mobile menu">
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              className="md:hidden absolute top-full left-0 right-0 bg-[#0a192f]/95 backdrop-blur-md"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <div className="container mx-auto px-4 py-6 flex flex-col gap-4">
                <nav>
                  <ul className="flex flex-col gap-4">
                    <li>
                      <a
                        href="#features"
                        className="text-gray-300 hover:text-teal-400 transition-colors block py-2"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Features
                      </a>
                    </li>
                    <li>
                      <a
                        href="#how-it-works"
                        className="text-gray-300 hover:text-teal-400 transition-colors block py-2"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        How It Works
                      </a>
                    </li>
                    <li>
                      <a
                        href="#benefits"
                        className="text-gray-300 hover:text-teal-400 transition-colors block py-2"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Benefits
                      </a>
                    </li>
                  </ul>
                </nav>

                <button
                  className="text-white hover:text-teal-400 transition-colors py-2 text-left"
                  onClick={() => {
                    toggleLanguage()
                    setMobileMenuOpen(false)
                  }}
                >
                  {language === "en" ? "বাংলা" : "English"}
                </button>

                <div className="flex flex-col gap-3 mt-2">
                  <a
                    href="/auth"
                    className="border border-teal-400 text-teal-400 hover:bg-teal-400/10 transition-colors px-4 py-2 rounded-md text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </a>

                  <a
                    href="/auth?tab=signup"
                    className="bg-teal-500 hover:bg-teal-600 transition-colors text-white px-4 py-2 rounded-md text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign Up
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-24 px-4">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-3xl"></div>
          <div className="absolute top-[30%] -left-40 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-blue-500/5 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div initial="hidden" animate="visible" variants={fadeIn}>
              <motion.h1
                className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight"
                variants={fadeIn}
                custom={0}
              >
                {t('hero.title')}
              </motion.h1>

              <motion.p
                className="text-lg sm:text-xl text-gray-300 mb-10 max-w-2xl mx-auto"
                variants={fadeIn}
                custom={1}
              >
                {t('hero.subtitle')}
              </motion.p>

              <motion.div className="flex flex-col sm:flex-row gap-5 justify-center" variants={fadeIn} custom={2}>
                <Link 
                  to="/chatbot" 
                  className="group bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white px-8 py-4 text-lg rounded-md flex items-center justify-center shadow-lg shadow-teal-900/20 transform transition-all duration-300 hover:translate-y-[-2px] hover:shadow-xl hover:shadow-teal-900/30"
                >
                  Start Science Learning
                  <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link 
                  to="/english" 
                  className="group border-2 border-purple-400 text-purple-300 hover:text-purple-200 hover:border-purple-300 hover:bg-purple-400/10 px-8 py-4 text-lg rounded-md flex items-center justify-center shadow-lg shadow-purple-900/10 transform transition-all duration-300 hover:translate-y-[-2px] hover:shadow-xl hover:shadow-purple-900/20"
                >
                  Practice English
                  <Mic className="ml-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                </Link>
              </motion.div>
            </motion.div>

            <motion.div
              className="mt-20 flex justify-center"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
            >

            </motion.div>
          </div>
        </div>

        <div className="absolute bottom-8 left-0 right-0 mx-auto w-full flex justify-center items-center animate-bounce">
          <div className="flex flex-col items-center">
            <span className="text-sm text-gray-400 mb-2">{t('hero.scrollToExplore')}</span>
            <ArrowRight className="h-5 w-5 text-gray-400 transform rotate-90" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto py-24 px-4">
        <div className="text-center mb-16">
          <motion.span
            className="inline-block px-3 py-1 text-sm bg-teal-500/20 text-teal-400 rounded-full mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            {t('features.title')}
          </motion.span>
          <motion.h2
            className="text-3xl sm:text-4xl font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Innovative Learning Tools
          </motion.h2>
          <motion.p
            className="text-gray-300 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Our platform offers cutting-edge educational tools designed specifically for Bengali-speaking students who
            want to excel in science and English.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 gap-10">
          {/* Bengali Science Chatbot */}
          <motion.div
            className="group bg-gradient-to-br from-[#1e293b]/70 to-[#1e293b]/40 border border-gray-700/50 backdrop-blur-sm overflow-hidden rounded-xl shadow-xl relative"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            whileHover={{ translateY: -5 }}
          >
            <div className="absolute inset-0 bg-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="p-8">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-teal-500/30 to-teal-400/10 flex items-center justify-center mb-6 shadow-lg shadow-teal-900/10">
                <Beaker className="h-8 w-8 text-teal-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4 group-hover:text-teal-400 transition-colors">
                Bengali Science Chatbot
              </h3>
              <p className="text-gray-300 mb-6">
                Learn complex science concepts in Bengali. Our AI chatbot explains Physics, Chemistry, Biology, and Math
                in simple terms that are easy to understand.
              </p>
              <div className="flex flex-wrap gap-3 mb-6">
                <div className="flex items-center gap-2 bg-[#164e63]/50 px-3 py-2 rounded-full">
                  <Atom className="h-4 w-4 text-teal-400" />
                  <span className="text-sm">Physics</span>
                </div>
                <div className="flex items-center gap-2 bg-[#164e63]/50 px-3 py-2 rounded-full">
                  <Beaker className="h-4 w-4 text-teal-400" />
                  <span className="text-sm">Chemistry</span>
                </div>
                <div className="flex items-center gap-2 bg-[#164e63]/50 px-3 py-2 rounded-full">
                  <Dna className="h-4 w-4 text-teal-400" />
                  <span className="text-sm">Biology</span>
                </div>
                <div className="flex items-center gap-2 bg-[#164e63]/50 px-3 py-2 rounded-full">
                  <Calculator className="h-4 w-4 text-teal-400" />
                  <span className="text-sm">Math</span>
                </div>
              </div>
              <button className="group bg-teal-500 hover:bg-teal-600 text-white px-5 py-2.5 rounded-lg flex items-center shadow-md shadow-teal-900/20 transition-all duration-300">
                Try Now
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>

          {/* English Practice Conversation Tool */}
          <motion.div
            className="group bg-gradient-to-br from-[#1e293b]/70 to-[#1e293b]/40 border border-gray-700/50 backdrop-blur-sm overflow-hidden rounded-xl shadow-xl relative"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            whileHover={{ translateY: -5 }}
          >
            <div className="absolute inset-0 bg-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="p-8">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-500/30 to-purple-400/10 flex items-center justify-center mb-6 shadow-lg shadow-purple-900/10">
                <Mic className="h-8 w-8 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4 group-hover:text-purple-400 transition-colors">
                English Conversation Practice
              </h3>
              <p className="text-gray-300 mb-6">
                Improve your English speaking skills with our AI conversation partner. Practice pronunciation,
                vocabulary, and grammar in real-time with personalized feedback.
              </p>
              <div className="h-16 mb-6 relative">
                <div className="absolute inset-0 flex items-center justify-center gap-1">
                  {[...Array(20)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-purple-400/80 rounded-full animate-pulse"
                      style={{
                        height: `${Math.sin(i / 2) * 30 + 10}px`,
                        animationDelay: `${i * 0.1}s`,
                        animationDuration: `${0.8 + Math.random() * 1}s`,
                      }}
                    ></div>
                  ))}
                </div>
              </div>
              <button className="group bg-purple-500 hover:bg-purple-600 text-white px-5 py-2.5 rounded-lg flex items-center shadow-md shadow-purple-900/20 transition-all duration-300">
                Try Now
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 px-4 relative">
        <div className="absolute inset-0 bg-[#0a192f] opacity-50"></div>
        <div className="container mx-auto relative z-10">
          <div className="text-center mb-16">
            <motion.span
              className="inline-block px-3 py-1 text-sm bg-blue-500/20 text-blue-400 rounded-full mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              How It Works
            </motion.span>
            <motion.h2
              className="text-3xl sm:text-4xl font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Simple Steps to Start Learning
            </motion.h2>
            <motion.p
              className="text-gray-300 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Our platform is designed to be intuitive and easy to use. Follow these simple steps to begin your learning
              journey.
            </motion.p>
          </div>

          <div className="mb-20">
            <h3 className="text-2xl font-bold text-center mb-10 text-teal-400">Bengali Science Learning</h3>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: "Ask Your Question",
                  description: "Type your science question in Bengali or English. Our AI understands both languages.",
                  icon: <BookOpen className="h-10 w-10 text-teal-400" />,
                  delay: 0,
                },
                {
                  title: "Get Clear Explanations",
                  description: "Our AI explains complex concepts in simple Bengali with examples and visuals.",
                  icon: <Beaker className="h-10 w-10 text-teal-400" />,
                  delay: 0.2,
                },
                {
                  title: "Practice & Learn",
                  description: "Solve practice problems to reinforce your learning and track your progress.",
                  icon: <CheckCircle className="h-10 w-10 text-teal-400" />,
                  delay: 0.4,
                },
              ].map((step, index) => (
                <motion.div
                  key={index}
                  className="relative"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: step.delay }}
                >
                  <div className="bg-gradient-to-br from-[#1e293b]/70 to-[#1e293b]/40 border border-teal-500/20 backdrop-blur-sm h-full rounded-xl shadow-xl overflow-hidden group hover:border-teal-500/50 transition-all duration-300">
                    <div className="p-8 flex flex-col items-center text-center">
                      <div className="h-24 w-24 rounded-full bg-gradient-to-br from-teal-500/30 to-teal-400/5 flex items-center justify-center mb-6 shadow-lg shadow-teal-900/10 group-hover:shadow-teal-900/30 transition-all duration-300">
                        {step.icon}
                      </div>
                      <div className="absolute -top-4 -left-4 h-12 w-12 rounded-full bg-teal-500 flex items-center justify-center text-white font-bold shadow-lg shadow-teal-900/20">
                        {index + 1}
                      </div>
                      <h4 className="text-xl font-bold mb-3 text-teal-400">{step.title}</h4>
                      <p className="text-gray-300">{step.description}</p>
                    </div>
                  </div>
                  {index < 2 && (
                    <div className="hidden md:block absolute top-1/2 -right-8 transform -translate-y-1/2 z-10">
                      <div className="bg-gradient-to-r from-teal-500/20 to-teal-400/10 p-3 rounded-full shadow-md">
                        <ArrowRight className="h-6 w-6 text-teal-400" />
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-bold text-center mb-10 text-purple-400">English Conversation Practice</h3>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: "Choose a Topic",
                  description:
                    "Select from various conversation topics or create your own personalized practice session.",
                  icon: <BookOpen className="h-10 w-10 text-purple-400" />,
                  delay: 0,
                },
                {
                  title: "Speak Naturally",
                  description: "Have a natural conversation with our AI assistant that adapts to your speaking level.",
                  icon: <Mic className="h-10 w-10 text-purple-400" />,
                  delay: 0.2,
                },
                {
                  title: "Get Feedback",
                  description: "Receive instant feedback on pronunciation, grammar, and vocabulary usage.",
                  icon: <CheckCircle className="h-10 w-10 text-purple-400" />,
                  delay: 0.4,
                },
              ].map((step, index) => (
                <motion.div
                  key={index}
                  className="relative"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: step.delay }}
                >
                  <div className="bg-gradient-to-br from-[#1e293b]/70 to-[#1e293b]/40 border border-purple-500/20 backdrop-blur-sm h-full rounded-xl shadow-xl overflow-hidden group hover:border-purple-500/50 transition-all duration-300">
                    <div className="p-8 flex flex-col items-center text-center">
                      <div className="h-24 w-24 rounded-full bg-gradient-to-br from-purple-500/30 to-purple-400/5 flex items-center justify-center mb-6 shadow-lg shadow-purple-900/10 group-hover:shadow-purple-900/30 transition-all duration-300">
                        {step.icon}
                      </div>
                      <div className="absolute -top-4 -left-4 h-12 w-12 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold shadow-lg shadow-purple-900/20">
                        {index + 1}
                      </div>
                      <h4 className="text-xl font-bold mb-3 text-purple-400">{step.title}</h4>
                      <p className="text-gray-300">{step.description}</p>
                    </div>
                  </div>
                  {index < 2 && (
                    <div className="hidden md:block absolute top-1/2 -right-8 transform -translate-y-1/2 z-10">
                      <div className="bg-gradient-to-r from-purple-500/20 to-purple-400/10 p-3 rounded-full shadow-md">
                        <ArrowRight className="h-6 w-6 text-purple-400" />
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="container mx-auto py-24 px-4">
        <div className="text-center mb-16">
          <motion.span
            className="inline-block px-3 py-1 text-sm bg-green-500/20 text-green-400 rounded-full mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Benefits
          </motion.span>
          <motion.h2
            className="text-3xl sm:text-4xl font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Why Choose Our Platform
          </motion.h2>
          <motion.p
            className="text-gray-300 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Our platform offers unique advantages that make learning science and English both effective and enjoyable.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center max-w-6xl mx-auto px-4">
          {[
            {
              title: "Learn in Your Language",
              description: "Understand complex science concepts explained in Bengali, making learning more accessible.",
              color: "from-teal-500/20 to-teal-500/5",
              borderColor: "border-teal-500/30",
              hoverBorderColor: "hover:border-teal-500/60",
              textColor: "text-teal-400",
              shadowColor: "shadow-teal-900/10",
              hoverShadowColor: "group-hover:shadow-teal-900/30",
              delay: 0,
            },
            {
              title: "Practice English Anytime",
              description: "Improve your English speaking skills with AI conversations available 24/7.",
              color: "from-purple-500/20 to-purple-500/5",
              borderColor: "border-purple-500/30",
              hoverBorderColor: "hover:border-purple-500/60",
              textColor: "text-purple-400",
              shadowColor: "shadow-purple-900/10",
              hoverShadowColor: "group-hover:shadow-purple-900/30",
              delay: 0.1,
            },
            {
              title: "Personalized Learning",
              description: "Get customized explanations and practice based on your understanding and progress.",
              color: "from-blue-500/20 to-blue-500/5",
              borderColor: "border-blue-500/30",
              hoverBorderColor: "hover:border-blue-500/60",
              textColor: "text-blue-400",
              shadowColor: "shadow-blue-900/10",
              hoverShadowColor: "group-hover:shadow-blue-900/30",
              delay: 0.2,
            },
          ].map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: benefit.delay }}
            >
              <div
                className={`bg-gradient-to-br from-[#1e293b]/70 to-[#1e293b]/40 border ${benefit.borderColor} ${benefit.hoverBorderColor} backdrop-blur-sm rounded-xl shadow-xl group transition-all duration-300 h-full hover:transform hover:-translate-y-1`}
              >
                <div className="p-8">
                  <div
                    className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${benefit.color} flex items-center justify-center mb-6 shadow-lg ${benefit.shadowColor} ${benefit.hoverShadowColor} transition-all duration-300`}
                  >
                    <span className={`text-2xl font-bold ${benefit.textColor}`}>{index + 1}</span>
                  </div>
                  <h3 className={`text-xl font-bold mb-3 ${benefit.textColor}`}>{benefit.title}</h3>
                  <p className="text-gray-300">{benefit.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-24 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-900/30 to-purple-900/30 backdrop-blur-sm"></div>
        <div className="container mx-auto relative z-10">
          <motion.div
            className="max-w-4xl mx-auto bg-gradient-to-br from-[#1e293b]/80 to-[#1e293b]/60 border border-gray-700/50 backdrop-blur-sm rounded-2xl p-10 md:p-14 shadow-2xl text-center"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your Learning Experience?</h2>
            <p className="text-gray-300 mb-10 max-w-2xl mx-auto">
              Join thousands of students who are already benefiting from our AI-powered educational platform. Start your
              journey today!
            </p>
            <div className="flex flex-col sm:flex-row gap-5 justify-center">
              <a
                href="/auth?tab=signup"
                className="group bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white px-8 py-4 text-lg rounded-md flex items-center justify-center shadow-lg shadow-teal-900/20 transform transition-all duration-300 hover:translate-y-[-2px] hover:shadow-xl hover:shadow-teal-900/30"
              >
                Get Started Now
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href="#features"
                className="group border-2 border-white/30 text-white hover:border-white/50 hover:bg-white/5 px-8 py-4 text-lg rounded-md flex items-center justify-center shadow-lg shadow-teal-900/10 transform transition-all duration-300 hover:translate-y-[-2px]"
              >
                Learn More
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0a192f] py-16 px-4 border-t border-gray-800">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-10">
            <div>
              <div className="flex items-center gap-2 mb-6">
              <img src={logoImage} alt="OpenLearn Logo" className="h-16 w-auto" />
              </div>
              <p className="text-gray-400 mb-6">
                AI-powered educational platform for Bengali science learning and English conversation practice.
              </p>
              <div className="flex gap-4">
                <a href="#" className="text-gray-400 hover:text-teal-400 transition-colors">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-teal-400 transition-colors">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-teal-400 transition-colors">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-6">Navigation</h4>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-gray-400 hover:text-teal-400 transition-colors">
                    Home
                  </a>
                </li>
                <li>
                  <a href="#features" className="text-gray-400 hover:text-teal-400 transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#how-it-works" className="text-gray-400 hover:text-teal-400 transition-colors">
                    How It Works
                  </a>
                </li>
                <li>
                  <a href="#benefits" className="text-gray-400 hover:text-teal-400 transition-colors">
                    Benefits
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-6">Contact</h4>
              <ul className="space-y-3">
                <li className="text-gray-400 flex items-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2 mt-1"
                  >
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                  <span>info@openlearn.com</span>
                </li>
                <li className="text-gray-400 flex items-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2 mt-1"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  <span>+880 1234 567890</span>
                </li>
                <li className="text-gray-400 flex items-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2 mt-1"
                  >
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span>Dhaka, Bangladesh</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-6">Language</h4>
              <button
                className="border border-teal-400 text-teal-400 hover:bg-teal-400/10 transition-colors px-5 py-2.5 rounded-md mb-6 w-full sm:w-auto"
                onClick={toggleLanguage}
              >
                {language === "en" ? "Switch to Bengali" : "Switch to English"}
              </button>

              
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} OpenLearn. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
