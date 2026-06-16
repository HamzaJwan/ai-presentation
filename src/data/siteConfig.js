export const fallbackSiteConfig = {
  appName: 'AI Workshop Presentation',
  publicUrl: 'https://ai.juanspace.org',
  defaultProfile: 'general',
  defaultBrand: 'generic',
  enableEditorTools: false,
  enablePresenterMode: true,
  enableMediaManager: false,
  enableLogoManager: false,
  speakerProfiles: {
    'engineer-officer': 'المقدم مهندس / حمزة عبدالله جوان',
    'officer-only': 'المقدم / حمزة عبدالله جوان',
    general: 'م. حمزة جوان'
  },
  brands: {
    'air-defense': {
      footerText: 'كلية الدفاع الجوي - 2026',
      logoPath: '/media/logo-air-defense.png'
    },
    waha: {
      footerText: 'الواحة نت',
      logoPath: '/media/logo-waha.png'
    },
    generic: {
      footerText: 'AI Workshop | م. حمزة جوان',
      logoPath: ''
    }
  },
  logo: {
    show: false,
    position: 'top-right',
    size: 'medium',
    opacity: 0.9
  }
};

export function mergeSiteConfig(config = {}) {
  return {
    ...fallbackSiteConfig,
    ...config,
    speakerProfiles: {
      ...fallbackSiteConfig.speakerProfiles,
      ...(config.speakerProfiles || {})
    },
    brands: {
      ...fallbackSiteConfig.brands,
      ...(config.brands || {})
    },
    logo: {
      ...fallbackSiteConfig.logo,
      ...(config.logo || {})
    }
  };
}
