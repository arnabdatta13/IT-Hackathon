import { createContext, useContext, useState, useEffect } from 'react';

// Create the language context
const LanguageContext = createContext({
  language: 'en',
  setLanguage: () => {},
  t: (key) => key, // translation function
});

// Translation data
const translations = {
  en: {
    // Hero section
    "hero.title": "Learn English with AI",
    "hero.subtitle": "Master English through interactive conversations and personalized feedback",
    "hero.cta": "Get Started",
    "hero.scrollToExplore": "Scroll to explore",
    
    // Features section
    "features.title": "Our Features",
    "features.subtitle": "Powerful tools to enhance your learning experience",
    "features.conversationPractice.title": "English Conversation Practice",
    "features.conversationPractice.description": "Practice English conversations with our AI assistant and receive instant feedback on your pronunciation and grammar.",
    "features.scienceTopics.title": "Science Topics in Bengali",
    "features.scienceTopics.description": "Learn complex science concepts explained in Bengali through interactive conversations with our AI assistant.",
    "features.personalizedLearning.title": "Personalized Learning",
    "features.personalizedLearning.description": "Get a customized learning experience based on your proficiency level, interests, and learning goals.",
    
    // How it works section
    "howItWorks.title": "How It Works",
    "howItWorks.subtitle": "Simple steps to start your learning journey",
    "howItWorks.step1.title": "Create an Account",
    "howItWorks.step1.description": "Sign up for free and set up your profile with your learning preferences.",
    "howItWorks.step2.title": "Choose Your Topic",
    "howItWorks.step2.description": "Select from a variety of English conversation topics or science subjects.",
    "howItWorks.step3.title": "Start Learning",
    "howItWorks.step3.description": "Engage in interactive conversations and receive personalized feedback.",
    
    // Navigation
    "nav.home": "Home",
    "nav.features": "Features",
    "nav.howItWorks": "How It Works",
    "nav.login": "Login",
    "nav.signup": "Sign Up",
    "nav.switchToBangla": "বাংলা",
    
    // CTA section
    "cta.title": "Ready to Start Learning?",
    "cta.subtitle": "Join thousands of students improving their English and science knowledge",
    "cta.button": "Get Started Now",
  },
  bn: {
    // Hero section
    "hero.title": "এআই এর সাহায্যে ইংরেজি শিখুন",
    "hero.subtitle": "ইন্টারেক্টিভ কথোপকথন এবং ব্যক্তিগতকৃত প্রতিক্রিয়ার মাধ্যমে ইংরেজি আয়ত্ত করুন",
    "hero.cta": "শুরু করুন",
    "hero.scrollToExplore": "অন্বেষণ করতে স্ক্রোল করুন",
    
    // Features section
    "features.title": "আমাদের বৈশিষ্ট্য",
    "features.subtitle": "আপনার শিক্ষার অভিজ্ঞতা বাড়ানোর জন্য শক্তিশালী টুল",
    "features.conversationPractice.title": "ইংরেজি কথোপকথন অনুশীলন",
    "features.conversationPractice.description": "আমাদের এআই সহকারীর সাথে ইংরেজি কথোপকথন অনুশীলন করুন এবং আপনার উচ্চারণ ও ব্যাকরণে তাৎক্ষণিক প্রতিক্রিয়া পান।",
    "features.scienceTopics.title": "বাংলায় বিজ্ঞান বিষয়",
    "features.scienceTopics.description": "আমাদের এআই সহকারীর সাথে ইন্টারেক্টিভ কথোপকথনের মাধ্যমে বাংলায় ব্যাখ্যা করা জটিল বিজ্ঞান ধারণাগুলি শিখুন।",
    "features.personalizedLearning.title": "ব্যক্তিগতকৃত শিক্ষা",
    "features.personalizedLearning.description": "আপনার দক্ষতার স্তর, আগ্রহ এবং শিক্ষার লক্ষ্যের উপর ভিত্তি করে একটি কাস্টমাইজড শিক্ষার অভিজ্ঞতা পান।",
    
    // How it works section
    "howItWorks.title": "এটি কীভাবে কাজ করে",
    "howItWorks.subtitle": "আপনার শিক্ষার যাত্রা শুরু করার সহজ পদক্ষেপ",
    "howItWorks.step1.title": "একটি অ্যাকাউন্ট তৈরি করুন",
    "howItWorks.step1.description": "বিনামূল্যে সাইন আপ করুন এবং আপনার শিক্ষার পছন্দগুলি সহ আপনার প্রোফাইল সেট আপ করুন।",
    "howItWorks.step2.title": "আপনার বিষয় চয়ন করুন",
    "howItWorks.step2.description": "বিভিন্ন ইংরেজি কথোপকথনের বিষয় বা বিজ্ঞান বিষয়গুলি থেকে নির্বাচন করুন।",
    "howItWorks.step3.title": "শিক্ষা শুরু করুন",
    "howItWorks.step3.description": "ইন্টারেক্টিভ কথোপকথনে অংশগ্রহণ করুন এবং ব্যক্তিগতকৃত প্রতিক্রিয়া পান।",
    
    // Navigation
    "nav.home": "হোম",
    "nav.features": "বৈশিষ্ট্য",
    "nav.howItWorks": "এটি কীভাবে কাজ করে",
    "nav.login": "লগইন",
    "nav.signup": "সাইন আপ",
    "nav.switchToEnglish": "English",
    
    // CTA section
    "cta.title": "শিখতে শুরু করতে প্রস্তুত?",
    "cta.subtitle": "হাজার হাজার শিক্ষার্থীদের সাথে যোগ দিন যারা তাদের ইংরেজি এবং বিজ্ঞান জ্ঞান উন্নত করছে",
    "cta.button": "এখনই শুরু করুন",
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    // Try to get the language from localStorage
    const savedLanguage = localStorage.getItem('language');
    return savedLanguage || 'en';
  });

  // Update localStorage when language changes
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  // Translation function
  const t = (key) => {
    if (!translations[language]) {
      return key;
    }
    
    return translations[language][key] || translations['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
