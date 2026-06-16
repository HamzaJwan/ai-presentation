import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import defaultMediaMap from '../data/mediaMap.js';
import { oneHourSlideIds, slides, speakerName } from '../data/slides.js';
import useSiteConfig from '../hooks/useSiteConfig.js';
import AnimatedBackground from './AnimatedBackground.jsx';
import Lightbox from './Lightbox.jsx';
import LogoMark from './LogoMark.jsx';
import MediaManager from './MediaManager.jsx';
import OverviewMode from './OverviewMode.jsx';
import PresenterDashboard from './PresenterDashboard.jsx';
import ProgressBar from './ProgressBar.jsx';
import SlideControls from './SlideControls.jsx';
import SlideRenderer from './SlideRenderer.jsx';

const defaultSettings = {
  logoSrc: '',
  logoVisible: false,
  logoPosition: 'top-left',
  logoSize: 'medium',
  logoOpacity: 0.86,
  logoScope: 'all',
  reduceMotion: false,
  particles: true,
  animatedBackground: true,
  imageGlow: 'medium',
  defaultFit: 'cover',
  slideScale: 'normal',
  notesFontSize: 28,
  blankAudience: false
};

function useStoredState(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      if (!stored) return initialValue;
      const parsed = JSON.parse(stored);
      if (
        initialValue &&
        typeof initialValue === 'object' &&
        !Array.isArray(initialValue) &&
        parsed &&
        typeof parsed === 'object' &&
        !Array.isArray(parsed)
      ) {
        return { ...initialValue, ...parsed };
      }
      return parsed;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // localStorage may reject very large video uploads; folder convention remains the better option.
    }
  }, [key, value]);

  return [value, setValue];
}

export default function PresentationShell() {
  const params = new URLSearchParams(window.location.search);
  const view = params.get('view') || 'main';
  const fullscreenHint = params.get('fs') === '1';
  const runtime = useSiteConfig(params);
  const channelId = useRef(Math.random().toString(36).slice(2));
  const channel = useRef(null);
  const audienceWindow = useRef(null);

  const [compactMode, setCompactMode] = useStoredState('ai-workshop-mode', true);
  const [currentIndex, setCurrentIndex] = useStoredState('ai-workshop-slide-index', 0);
  const [settings, setSettings] = useStoredState('ai-workshop-settings', defaultSettings);
  const [mediaMap, setMediaMap] = useStoredState('ai-workshop-media-map', {});
  const [overviewOpen, setOverviewOpen] = useState(false);
  const [mediaOpen, setMediaOpen] = useState(false);
  const [lightboxMedia, setLightboxMedia] = useState(null);
  const [showFullscreenPrompt, setShowFullscreenPrompt] = useState(fullscreenHint);

  const activeSlides = useMemo(() => {
    if (!compactMode) return slides;
    return slides.filter((slide) => oneHourSlideIds.includes(slide.id));
  }, [compactMode]);

  const safeIndex = Math.max(0, Math.min(currentIndex, activeSlides.length - 1));
  const currentSlide = activeSlides[safeIndex] || activeSlides[0];
  const nextSlide = activeSlides[safeIndex + 1];
  const isAudience = view === 'audience';
  const isPresenter = view === 'presenter';
  const effectiveMediaMap = useMemo(() => ({ ...defaultMediaMap, ...mediaMap }), [mediaMap]);
  const runtimeLogoPath = runtime.brandConfig?.logoPath || '';
  const runtimeLogo = runtime.siteConfig.logo || {};
  const effectiveSettings = useMemo(
    () => ({
      ...settings,
      logoSrc: settings.logoSrc || runtimeLogoPath || '',
      logoVisible: settings.logoSrc ? settings.logoVisible : Boolean(runtimeLogo.show && runtimeLogoPath),
      logoPosition: settings.logoPosition || runtimeLogo.position || 'top-right',
      logoSize: settings.logoSize || runtimeLogo.size || 'medium',
      logoOpacity: settings.logoOpacity ?? runtimeLogo.opacity ?? 0.9
    }),
    [runtimeLogo.opacity, runtimeLogo.position, runtimeLogo.show, runtimeLogo.size, runtimeLogoPath, settings]
  );

  const broadcast = useCallback((payload) => {
    channel.current?.postMessage({ ...payload, origin: channelId.current });
  }, []);

  const goTo = useCallback(
    (index) => {
      const nextIndex = Math.max(0, Math.min(index, activeSlides.length - 1));
      setCurrentIndex(nextIndex);
      setOverviewOpen(false);
      broadcast({ type: 'state', currentIndex: nextIndex, compactMode, settings, mediaMap });
    },
    [activeSlides.length, broadcast, compactMode, mediaMap, setCurrentIndex, settings]
  );

  const next = useCallback(() => goTo(safeIndex + 1), [safeIndex, goTo]);
  const prev = useCallback(() => goTo(safeIndex - 1), [safeIndex, goTo]);

  const toggleMode = useCallback(() => {
    setCompactMode((value) => {
      const nextMode = !value;
      broadcast({ type: 'state', currentIndex: 0, compactMode: nextMode, settings, mediaMap });
      return nextMode;
    });
    setCurrentIndex(0);
  }, [broadcast, mediaMap, setCompactMode, setCurrentIndex, settings]);

  const jumpToDemo = useCallback(() => {
    const demoIndex = activeSlides.findIndex((slide) => slide.type === 'demo');
    if (demoIndex >= 0) goTo(demoIndex);
  }, [activeSlides, goTo]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }, []);

  const openAudience = useCallback(async () => {
    const nextParams = new URLSearchParams(window.location.search);
    nextParams.set('view', 'audience');
    nextParams.set('fs', '1');
    const url = `${window.location.origin}${window.location.pathname}?${nextParams.toString()}`;
    const width = window.screen?.availWidth || 1400;
    const height = window.screen?.availHeight || 850;
    audienceWindow.current = window.open(
      url,
      'ai-workshop-audience',
      `popup=yes,toolbar=no,location=no,menubar=no,status=no,scrollbars=no,width=${width},height=${height},left=0,top=0`
    );
    broadcast({ type: 'state', currentIndex: safeIndex, compactMode, settings, mediaMap });
  }, [broadcast, compactMode, mediaMap, safeIndex, settings]);

  const openPresenter = useCallback(() => {
    const nextParams = new URLSearchParams(window.location.search);
    nextParams.set('view', 'presenter');
    const url = `${window.location.origin}${window.location.pathname}?${nextParams.toString()}`;
    window.open(url, 'ai-workshop-presenter', 'popup=yes,width=1500,height=950,left=120,top=80');
    broadcast({ type: 'state', currentIndex: safeIndex, compactMode, settings, mediaMap });
  }, [broadcast, compactMode, mediaMap, safeIndex, settings]);

  useEffect(() => {
    channel.current = new BroadcastChannel('ai-workshop-presentation');
    channel.current.onmessage = (event) => {
      const data = event.data;
      if (!data || data.origin === channelId.current) return;
      if (data.type === 'state') {
        if (typeof data.currentIndex === 'number') setCurrentIndex(data.currentIndex);
        if (typeof data.compactMode === 'boolean') setCompactMode(data.compactMode);
        if (data.settings) setSettings((value) => ({ ...value, ...data.settings }));
        if (data.mediaMap) setMediaMap(data.mediaMap);
      }
      if (data.type === 'media') setMediaMap(data.mediaMap || {});
      if (data.type === 'settings') setSettings((value) => ({ ...value, ...data.settings }));
      if (data.type === 'fullscreen-audience' && isAudience) setShowFullscreenPrompt(true);
    };
    return () => channel.current?.close();
  }, [isAudience, setCompactMode, setCurrentIndex, setMediaMap, setSettings, toggleFullscreen]);

  useEffect(() => {
    if (!settings.logoSrc) {
      fetch('/media/logo.png', { method: 'HEAD' })
        .then((response) => {
          const type = response.headers.get('content-type') || '';
          if (response.ok && type.startsWith('image/')) {
            setSettings((value) => ({ ...value, logoSrc: '/media/logo.png', logoVisible: true }));
          }
        })
        .catch(() => {});
    }
  }, [setSettings, settings.logoSrc]);

  useEffect(() => {
    const handler = (event) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;
      if (['ArrowRight', ' ', 'PageDown'].includes(event.key)) {
        event.preventDefault();
        next();
      }
      if (['ArrowLeft', 'PageUp'].includes(event.key)) {
        event.preventDefault();
        prev();
      }
      if (event.key === 'Home') goTo(0);
      if (event.key === 'End') goTo(activeSlides.length - 1);
      if (event.key.toLowerCase() === 'f') toggleFullscreen();
      if (event.key.toLowerCase() === 'o') setOverviewOpen((value) => !value);
      if (event.key.toLowerCase() === 'p' && runtime.presenterEnabled) openPresenter();
      if (event.key.toLowerCase() === 'd') jumpToDemo();
      if (event.key.toLowerCase() === 'm') toggleMode();
      if (event.key === 'Escape') {
        setOverviewOpen(false);
        setMediaOpen(false);
        setLightboxMedia(null);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [activeSlides.length, goTo, jumpToDemo, next, openPresenter, prev, runtime.presenterEnabled, toggleFullscreen, toggleMode]);

  function updateSettings(updater) {
    setSettings((value) => {
      const nextSettings = typeof updater === 'function' ? updater(value) : updater;
      broadcast({ type: 'settings', settings: nextSettings });
      return nextSettings;
    });
  }

  function updateMediaMap(updater) {
    setMediaMap((value) => {
      const nextMap = typeof updater === 'function' ? updater(value) : updater;
      broadcast({ type: 'media', mediaMap: nextMap });
      return nextMap;
    });
  }

  if (isPresenter) {
    return (
      <>
        <PresenterDashboard
          slide={currentSlide}
          nextSlide={nextSlide}
          index={safeIndex}
          total={activeSlides.length}
          compactMode={compactMode}
          settings={effectiveSettings}
          mediaMap={effectiveMediaMap}
          speakerName={runtime.speakerName}
          brandText={runtime.brandConfig?.footerText}
          showEditorTools={runtime.showEditorTools}
          onNext={next}
          onPrev={prev}
          onJump={goTo}
          onOpenAudience={openAudience}
          onOpenMedia={() => runtime.showEditorTools && setMediaOpen(true)}
          onToggleBlank={() => updateSettings((value) => ({ ...value, blankAudience: !value.blankAudience }))}
          onToggleLogo={() => updateSettings((value) => ({ ...value, logoVisible: !value.logoVisible }))}
          onFullscreenAudience={() => broadcast({ type: 'fullscreen-audience' })}
        />
        {mediaOpen && runtime.showEditorTools && (
          <MediaManager
            slides={activeSlides}
            mediaMap={mediaMap}
            defaultMediaMap={defaultMediaMap}
            effectiveMediaMap={effectiveMediaMap}
            setMediaMap={updateMediaMap}
            settings={settings}
            setSettings={updateSettings}
            onClose={() => setMediaOpen(false)}
          />
        )}
      </>
    );
  }

  return (
    <div className={`presentation-app scale-${effectiveSettings.slideScale || 'normal'} ${effectiveSettings.reduceMotion ? 'reduce-motion' : ''} ${isAudience ? 'audience-view' : ''}`}>
      <AnimatedBackground enabled={effectiveSettings.particles && effectiveSettings.animatedBackground !== false} />
      {settings.blankAudience && isAudience && <div className="blank-screen">الشاشة معتمة مؤقتًا</div>}
      {isAudience && showFullscreenPrompt && (
        <button
          type="button"
          className="audience-fullscreen-prompt"
          onClick={() => {
            document.documentElement.requestFullscreen?.();
            setShowFullscreenPrompt(false);
          }}
        >
          دخول ملء الشاشة وإخفاء المتصفح
          <small>اضغط هنا مرة واحدة من شاشة الجمهور</small>
        </button>
      )}
      <LogoMark settings={effectiveSettings} slide={currentSlide} />

      <main className="deck" aria-live="polite">
        <SlideRenderer
          slide={currentSlide}
          mediaMap={effectiveMediaMap}
          settings={effectiveSettings}
          onOpenLightbox={setLightboxMedia}
        />

        <footer className="deck-footer">
          <div>
            <strong>{runtime.speakerName || speakerName}</strong>
            <span>{runtime.brandConfig?.footerText || (compactMode ? 'الوضع المختصر' : 'الوضع الكامل')}</span>
          </div>
          <ProgressBar index={safeIndex} total={activeSlides.length} />
          <div className="slide-number">
            {String(safeIndex + 1).padStart(2, '0')} / {String(activeSlides.length).padStart(2, '0')}
          </div>
        </footer>
      </main>

      {!isAudience && (
        <SlideControls
          onNext={next}
          onPrev={prev}
          onOverview={() => setOverviewOpen(true)}
          onPresenter={runtime.presenterEnabled ? openPresenter : null}
          onAudience={openAudience}
          onMedia={() => runtime.showEditorTools && setMediaOpen(true)}
          onFullscreen={toggleFullscreen}
          onMode={toggleMode}
          onPrint={() => window.print()}
          modeLabel={compactMode ? 'الوضع المختصر' : 'الوضع الكامل'}
          showEditorTools={runtime.showEditorTools}
          presenterEnabled={runtime.presenterEnabled}
        />
      )}

      {overviewOpen && (
        <OverviewMode
          slides={activeSlides}
          currentIndex={safeIndex}
          mediaMap={effectiveMediaMap}
          showEditorTools={runtime.showEditorTools}
          onEditMedia={(slideId) => {
            if (!runtime.showEditorTools) return;
            setCurrentIndex(activeSlides.findIndex((slide) => slide.id === slideId));
            setOverviewOpen(false);
            setMediaOpen(true);
          }}
          onJump={goTo}
          onClose={() => setOverviewOpen(false)}
        />
      )}

      {mediaOpen && runtime.showEditorTools && (
        <MediaManager
          slides={activeSlides}
          mediaMap={mediaMap}
          defaultMediaMap={defaultMediaMap}
          effectiveMediaMap={effectiveMediaMap}
          setMediaMap={updateMediaMap}
          settings={settings}
          setSettings={updateSettings}
          onClose={() => setMediaOpen(false)}
        />
      )}

      <Lightbox media={lightboxMedia} onClose={() => setLightboxMedia(null)} />
    </div>
  );
}
