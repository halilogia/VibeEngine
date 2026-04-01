import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

/**
 * 🏛️ VibeEngine - Sovereign i18n System
 * Multi-language support for Elite development.
 */

const resources = {
  en: {
    translation: {
      launcher: {
        title: 'VibeEngine',
        subtitle: 'Projector: Ignite the Game Universe',
        library: 'Your Library',
        import: 'Import Project Folder',
        start_engine: 'LAUNCH ENGINE',
        status_ready: 'GAME READY',
        status_active: 'Active.',
        status_description: 'All subsystems and domain logic connected.',
      },
      menu: {
        file: 'File',
        build: 'Build',
        save: 'SAVE',
        new_scene: 'New Scene',
        open_scene: 'Open Scene...',
        save_scene: 'Save Scene',
        manage_projects: 'Manage Projects',
      },
      copilot: {
        title: 'NEURAL COPILOT',
        placeholder: 'Ask Neural Copilot or use / commands...',
        engines_found: 'NEURAL ENGINES FOUND',
        select_engine: 'SELECT ENGINE',
        stop: 'STOP NEURAL LINK',
        ready: 'VIBEENGINE NEURAL LINK READY',
      },
      panels: {
        hierarchy: 'HIERARCHY',
        inspector: 'INSPECTOR',
        assets: 'ASSETS',
        console: 'CONSOLE',
      }
    }
  },
  tr: {
    translation: {
      launcher: {
        title: 'VibeEngine',
        subtitle: 'Projektör: Oyun Evrenini Başlatın',
        library: 'Kitaplığınız',
        import: 'Proje Klasörü Aktar',
        search_placeholder: 'Varlıklarda ara...',
        start_engine: 'MOTORU BAŞLAT',
        status_ready: 'OYUN HAZIR',
        status_active: 'aktif.',
        status_description: 'Tüm alt sistemler ve domain logic bağlandı.',
      },
      menu: {
        file: 'Dosya',
        build: 'Derle',
        save: 'KAYDET',
        new_scene: 'Yeni Sahne',
        open_scene: 'Sahne Aç...',
        save_scene: 'Sahneyi Kaydet',
        manage_projects: 'Projeleri Yönet',
      },
      copilot: {
        title: 'NEURAL COPILOT',
        placeholder: "Neural Copilot'a sor veya / komut kullan...",
        engines_found: 'YAPAY ZEKA MOTORU BULUNDU',
        select_engine: 'MOTOR SEÇ',
        stop: 'BAĞLANTIYI DURDUR',
        ready: 'VIBEENGINE NEURAL LINK HAZIR',
      },
      panels: {
        hierarchy: 'Hiyerarşi',
        inspector: 'Müfettiş',
        assets: 'Varlıklar',
        console: 'Konsol',
        ai_copilot: 'Neural Copilot'
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'tr',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    }
  });

export default i18n;
