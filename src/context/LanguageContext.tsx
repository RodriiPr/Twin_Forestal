import React, { createContext, useContext, useEffect, useState } from 'react';

export type Language = 'es' | 'en';

export interface Translations {
  // Brand & Header
  appTitle: string;
  appSubtitle: string;
  gediSync: string;
  assimilationActive: string;
  pauseStream: string;
  selectRegion: string;
  lat: string;
  lon: string;
  themeToggleDark: string;
  themeToggleLight: string;
  languageSelect: string;

  // Tabs
  tabLandscape2D: string;
  tabCanopy3D: string;
  tab3PGPhysio: string;
  tabHybridDL: string;
  tabWildfireRisk: string;
  tabScenarios: string;
  tabValidation: string;
  tabDeliverables: string;
  tabAIAdvisor: string;

  // Footer & Navigation Shortcuts
  dashboard: string;
  scenarios: string;
  dataLake: string;
  export: string;
  horizon: string;
  rewind5y: string;
  forward5y: string;
  coreVersion: string;

  // UI Common
  lightMode: string;
  darkMode: string;
  spanish: string;
  english: string;
}

const translations: Record<Language, Translations> = {
  es: {
    appTitle: 'SylvaTwin Digitalis',
    appSubtitle: 'Gemelo Digital Ecológico v4.0.2 • IPCC Nivel 3',
    gediSync: 'SINCRONIZACIÓN GEDI EN VIVO',
    assimilationActive: 'Asimilación Activa',
    pauseStream: 'Pausar Flujo',
    selectRegion: 'Seleccionar Región',
    lat: 'LAT',
    lon: 'LON',
    themeToggleDark: 'Cambiar a Modo Claro',
    themeToggleLight: 'Cambiar a Modo Oscuro',
    languageSelect: 'Idioma / Language',

    tabLandscape2D: 'Cubo 2D & Satélite',
    tabCanopy3D: 'Estructura 3D GEDI',
    tab3PGPhysio: 'Modelo 3-PG',
    tabHybridDL: 'Deep Learning Híbrido',
    tabWildfireRisk: 'Riesgo de Incendio',
    tabScenarios: 'Manejo Adaptativo (50a)',
    tabValidation: 'Validación & Incertidumbre',
    tabDeliverables: 'Paper & Código Fuente',
    tabAIAdvisor: 'Asistente IA Gemini',

    dashboard: 'PANEL PRINCIPAL',
    scenarios: 'ESCENARIOS',
    dataLake: 'LAGO DE DATOS',
    export: 'EXPORTAR',
    horizon: 'HORIZONTE:',
    rewind5y: 'Retroceder 5 años',
    forward5y: 'Avanzar 5 años',
    coreVersion: 'Núcleo SylvaTwin',

    lightMode: 'Modo Claro',
    darkMode: 'Modo Oscuro',
    spanish: 'Español',
    english: 'English',
  },
  en: {
    appTitle: 'SylvaTwin Digitalis',
    appSubtitle: 'Ecological Digital Twin v4.0.2 • IPCC Tier 3',
    gediSync: 'LIVE GEDI SYNC',
    assimilationActive: 'Active Assimilation',
    pauseStream: 'Pause Stream',
    selectRegion: 'Select Region',
    lat: 'LAT',
    lon: 'LON',
    themeToggleDark: 'Switch to Light Mode',
    themeToggleLight: 'Switch to Dark Mode',
    languageSelect: 'Language / Idioma',

    tabLandscape2D: '2D Cube & Satellite',
    tabCanopy3D: '3D GEDI Structure',
    tab3PGPhysio: '3-PG Model',
    tabHybridDL: 'Hybrid Deep Learning',
    tabWildfireRisk: 'Wildfire Risk',
    tabScenarios: 'Adaptive Management (50y)',
    tabValidation: 'Validation & Uncertainty',
    tabDeliverables: 'Paper & Source Code',
    tabAIAdvisor: 'Gemini AI Assistant',

    dashboard: 'DASHBOARD',
    scenarios: 'SCENARIOS',
    dataLake: 'DATA LAKE',
    export: 'EXPORT',
    horizon: 'HORIZON:',
    rewind5y: 'Rewind 5 years',
    forward5y: 'Fast forward 5 years',
    coreVersion: 'SylvaTwin Core',

    lightMode: 'Light Mode',
    darkMode: 'Dark Mode',
    spanish: 'Español',
    english: 'English',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('sylvatwin_lang');
    if (saved === 'es' || saved === 'en') return saved;
    return 'es'; // Default to Spanish as requested
  });

  useEffect(() => {
    localStorage.setItem('sylvatwin_lang', language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: translations[language] }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
