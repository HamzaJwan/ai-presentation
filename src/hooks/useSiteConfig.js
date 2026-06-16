import { useEffect, useMemo, useState } from 'react';
import { fallbackSiteConfig, mergeSiteConfig } from '../data/siteConfig.js';

export default function useSiteConfig(params) {
  const [siteConfig, setSiteConfig] = useState(fallbackSiteConfig);

  useEffect(() => {
    let active = true;

    fetch('/config/site-config.json', { cache: 'no-store' })
      .then((response) => (response.ok ? response.json() : fallbackSiteConfig))
      .then((config) => {
        if (active) setSiteConfig(mergeSiteConfig(config));
      })
      .catch(() => {
        if (active) setSiteConfig(fallbackSiteConfig);
      });

    return () => {
      active = false;
    };
  }, []);

  return useMemo(() => {
    const adminMode = params.get('admin') === '1';
    const profile = params.get('profile') || siteConfig.defaultProfile || 'general';
    const brand = params.get('brand') || siteConfig.defaultBrand || 'generic';
    const speakerName =
      siteConfig.speakerProfiles?.[profile] ||
      siteConfig.speakerProfiles?.general ||
      fallbackSiteConfig.speakerProfiles.general;
    const brandConfig =
      siteConfig.brands?.[brand] ||
      siteConfig.brands?.generic ||
      fallbackSiteConfig.brands.generic;
    const showEditorTools =
      adminMode ||
      siteConfig.enableEditorTools ||
      siteConfig.enableMediaManager ||
      siteConfig.enableLogoManager;

    return {
      siteConfig,
      adminMode,
      profile,
      brand,
      speakerName,
      brandConfig,
      showEditorTools,
      presenterEnabled: siteConfig.enablePresenterMode !== false
    };
  }, [params, siteConfig]);
}
