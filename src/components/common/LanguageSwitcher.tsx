import React from 'react';
import { useTranslation } from 'react-i18next';
import { Languages } from 'lucide-react';

export const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'id' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium transition-colors rounded-lg bg-bg-secondary hover:bg-bg-tertiary border border-border-primary"
      title="Switch Language"
    >
      <Languages size={16} className="text-text-secondary" />
      <span className="uppercase">{i18n.language}</span>
    </button>
  );
};
