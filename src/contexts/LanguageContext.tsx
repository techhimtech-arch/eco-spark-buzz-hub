import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

type Language = 'en' | 'hi';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (text: string) => string;
  translateTexts: (texts: string[]) => Promise<string[]>;
  isTranslating: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Static translations for UI elements
const staticTranslations: Record<string, Record<Language, string>> = {
  // Navigation
  'Home': { en: 'Home', hi: 'होम' },
  'Dashboard': { en: 'Dashboard', hi: 'डैशबोर्ड' },
  'Leaderboard': { en: 'Leaderboard', hi: 'लीडरबोर्ड' },
  'Profile': { en: 'Profile', hi: 'प्रोफ़ाइल' },
  'Admin': { en: 'Admin', hi: 'एडमिन' },
  'Login': { en: 'Login', hi: 'लॉग इन' },
  'Sign Up': { en: 'Sign Up', hi: 'साइन अप' },
  'Logout': { en: 'Logout', hi: 'लॉग आउट' },
  
  // Hero section
  'Learn Sustainability': { en: 'Learn Sustainability', hi: 'सस्टेनेबिलिटी सीखें' },
  'Join our community': { en: 'Join our community', hi: 'हमारी कम्युनिटी से जुड़ें' },
  'Start Learning': { en: 'Start Learning', hi: 'सीखना शुरू करें' },
  'Take Quiz': { en: 'Take Quiz', hi: 'क्विज़ दें' },
  
  // Quiz section
  'Eco Quiz': { en: 'Eco Quiz', hi: 'इको क्विज़' },
  'Test your knowledge': { en: 'Test your knowledge', hi: 'अपना ज्ञान परखें' },
  'Easy': { en: 'Easy', hi: 'आसान' },
  'Medium': { en: 'Medium', hi: 'मध्यम' },
  'Hard': { en: 'Hard', hi: 'कठिन' },
  'Start Quiz': { en: 'Start Quiz', hi: 'क्विज़ शुरू करें' },
  'Next Question': { en: 'Next Question', hi: 'अगला सवाल' },
  'Submit Answer': { en: 'Submit Answer', hi: 'जवाब जमा करें' },
  'Score': { en: 'Score', hi: 'स्कोर' },
  'Correct!': { en: 'Correct!', hi: 'सही!' },
  'Incorrect': { en: 'Incorrect', hi: 'गलत' },
  'Quiz Complete': { en: 'Quiz Complete', hi: 'क्विज़ पूरा हुआ' },
  'Play Again': { en: 'Play Again', hi: 'फिर से खेलें' },
  
  // Sections
  'Events': { en: 'Events', hi: 'इवेंट्स' },
  'Blogs': { en: 'Blogs', hi: 'ब्लॉग' },
  'News': { en: 'News', hi: 'समाचार' },
  'Education': { en: 'Education', hi: 'शिक्षा' },
  'Daily Tips': { en: 'Daily Tips', hi: 'दैनिक टिप्स' },
  'Mini Tasks': { en: 'Mini Tasks', hi: 'छोटे टास्क' },
  'Challenges': { en: 'Challenges', hi: 'चुनौतियां' },
  'Achievements': { en: 'Achievements', hi: 'उपलब्धियां' },
  
  // Common actions
  'Read More': { en: 'Read More', hi: 'और पढ़ें' },
  'View All': { en: 'View All', hi: 'सभी देखें' },
  'Complete': { en: 'Complete', hi: 'पूरा करें' },
  'Completed': { en: 'Completed', hi: 'पूरा हो गया' },
  'Loading...': { en: 'Loading...', hi: 'लोड हो रहा है...' },
  'Save': { en: 'Save', hi: 'सेव करें' },
  'Cancel': { en: 'Cancel', hi: 'रद्द करें' },
  'Delete': { en: 'Delete', hi: 'हटाएं' },
  'Edit': { en: 'Edit', hi: 'संपादित करें' },
  'Add': { en: 'Add', hi: 'जोड़ें' },
  
  // Points & Badges
  'Points': { en: 'Points', hi: 'पॉइंट्स' },
  'Badges': { en: 'Badges', hi: 'बैज' },
  'Level': { en: 'Level', hi: 'लेवल' },
  'Rank': { en: 'Rank', hi: 'रैंक' },
  
  // Impact
  'Your Impact': { en: 'Your Impact', hi: 'आपका प्रभाव' },
  'CO2 Saved': { en: 'CO2 Saved', hi: 'CO2 बचाया' },
  'Trees Equivalent': { en: 'Trees Equivalent', hi: 'पेड़ों के बराबर' },
  
  // Auth
  'Email': { en: 'Email', hi: 'ईमेल' },
  'Password': { en: 'Password', hi: 'पासवर्ड' },
  'Full Name': { en: 'Full Name', hi: 'पूरा नाम' },
  'Sign in': { en: 'Sign in', hi: 'साइन इन' },
  'Create account': { en: 'Create account', hi: 'अकाउंट बनाएं' },
  
  // Misc
  'Welcome': { en: 'Welcome', hi: 'स्वागत है' },
  'Today': { en: 'Today', hi: 'आज' },
  'This Week': { en: 'This Week', hi: 'इस हफ्ते' },
  'This Month': { en: 'This Month', hi: 'इस महीने' },
};

// Translation cache for dynamic content
const translationCache: Record<string, string> = {};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('app-language');
    return (saved as Language) || 'en';
  });
  const [isTranslating, setIsTranslating] = useState(false);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app-language', lang);
  }, []);

  // Translate static text
  const t = useCallback((text: string): string => {
    if (language === 'en') return text;
    
    // Check static translations first
    if (staticTranslations[text]) {
      return staticTranslations[text][language];
    }
    
    // Check cache for dynamic translations
    const cacheKey = `${language}:${text}`;
    if (translationCache[cacheKey]) {
      return translationCache[cacheKey];
    }
    
    return text;
  }, [language]);

  // Translate dynamic content via API
  const translateTexts = useCallback(async (texts: string[]): Promise<string[]> => {
    if (language === 'en' || texts.length === 0) return texts;

    // Filter out already cached translations
    const uncachedTexts: string[] = [];
    const uncachedIndices: number[] = [];
    
    texts.forEach((text, i) => {
      const cacheKey = `${language}:${text}`;
      if (!translationCache[cacheKey]) {
        uncachedTexts.push(text);
        uncachedIndices.push(i);
      }
    });

    if (uncachedTexts.length === 0) {
      // All translations are cached
      return texts.map(text => translationCache[`${language}:${text}`] || text);
    }

    setIsTranslating(true);
    try {
      const { data, error } = await supabase.functions.invoke('translate', {
        body: { texts: uncachedTexts, targetLang: language }
      });

      if (error) {
        console.error('Translation error:', error);
        return texts;
      }

      // Cache the translations
      data.translations.forEach((translation: string, i: number) => {
        const cacheKey = `${language}:${uncachedTexts[i]}`;
        translationCache[cacheKey] = translation;
      });

      // Return full results combining cached and new translations
      return texts.map(text => translationCache[`${language}:${text}`] || text);
    } catch (error) {
      console.error('Translation failed:', error);
      return texts;
    } finally {
      setIsTranslating(false);
    }
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, translateTexts, isTranslating }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
