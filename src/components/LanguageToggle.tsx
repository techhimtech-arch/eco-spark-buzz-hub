import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

export const LanguageToggle = () => {
  const { language, setLanguage, isTranslating } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'hi' : 'en');
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleLanguage}
      disabled={isTranslating}
      className="flex items-center gap-2 font-medium"
    >
      <Globe className="h-4 w-4" />
      <span>{language === 'en' ? 'हिंदी' : 'English'}</span>
    </Button>
  );
};
