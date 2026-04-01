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
        about_engine: 'About VibeEngine',
        app_settings: 'App Settings',
        quit: 'Quit Studio',
        export_html: 'Export HTML'
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
      },
      settings: {
        title: 'STUDIO CONFIG',
        game_info: 'Game Info',
        interface: 'Interface',
        input: 'Input Options',
        rendering: 'Rendering',
        neural: 'Neural Intelligence',
        apply: 'Apply Settings',
        cancel: 'Cancel',
        autosave: 'Changes auto-save to vibe_config.json',
        config_desc_game: 'Configuration for the active game subsystem.',
        config_desc: 'Configuration for the {{tab}} subsystem.',
        game_metadata: 'Game Metadata',
        active_game_title: 'Active Game Title',
        studio_org: 'Studio Organization',
        bundle_id: 'Bundle Identifier',
        target_version: 'Target Build Version',
        system_architecture: 'System Architecture',
        core_engine: 'Core Engine',
        neural_link: 'Neural Link',
        render_backend: 'Rendering Backend',
        editor_version: 'Editor Version'
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
        about_engine: 'VibeEngine Hakkında',
        app_settings: 'Uygulama Ayarları',
        quit: 'Stüdyodan Çık',
        export_html: 'HTML Dışa Aktar'
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
      },
      settings: {
        title: 'STÜDYO YAPILANDIRMASI',
        game_info: 'Oyun Bilgisi',
        interface: 'Arayüz',
        input: 'Girdi Seçenekleri',
        rendering: 'Görüntüleme',
        neural: 'Yapay Zeka (Neural)',
        apply: 'Ayarları Uygula',
        cancel: 'İptal',
        autosave: 'Değişiklikler vibe_config.json dosyasına kaydedilir.',
        config_desc_game: 'Aktif oyun alt sistemi için yapılandırma.',
        config_desc: '{{tab}} alt sistemi için yapılandırma.',
        game_metadata: 'Oyun Üstverisi',
        active_game_title: 'Aktif Oyun Adı',
        studio_org: 'Stüdyo / Organizasyon',
        bundle_id: 'Paket (Bundle) Kimliği',
        target_version: 'Hedef Derleme Sürümü',
        system_architecture: 'Sistem Mimarisi',
        core_engine: 'Çekirdek Motor (Core Engine)',
        neural_link: 'Yapay Zeka (Neural Link)',
        render_backend: 'Görüntü İşleyici (Renderer)',
        editor_version: 'Editör Sürümü'
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
