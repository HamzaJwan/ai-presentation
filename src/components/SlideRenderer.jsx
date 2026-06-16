import { AnimatePresence, motion } from 'motion/react';
import ComparisonSlide from './ComparisonSlide.jsx';
import GlassCard from './GlassCard.jsx';
import ImagePlaceholder from './ImagePlaceholder.jsx';
import WirelessDemo from './WirelessDemo.jsx';

function SlideHeader({ slide }) {
  return (
    <header className="slide-header">
      <span>{slide.section}</span>
      <h2>{slide.title}</h2>
      {slide.keyMessage && <p>{slide.keyMessage}</p>}
    </header>
  );
}

function CardGrid({ cards = [], bento = false }) {
  return (
    <div className={bento ? 'bento-grid' : 'cards-stack'}>
      {cards.map((card, index) => (
        <GlassCard key={`${card.title}-${index}`} card={card} index={index} large={bento && index === 0} />
      ))}
    </div>
  );
}

function ProcessSlide({ slide, mediaMap, settings, onOpenLightbox }) {
  const cards = (
    <div className="process-layout">
      {slide.steps.map((step, index) => (
        <GlassCard key={step.title} card={step} index={index} />
      ))}
    </div>
  );

  if (!slide.mediaSlots?.length) return cards;

  return (
    <div className="process-media-layout">
      {cards}
      <ImagePlaceholder slide={slide} mediaMap={mediaMap} settings={settings} onOpenLightbox={onOpenLightbox} />
    </div>
  );
}

function GallerySlide({ slide, mediaMap, settings, onOpenLightbox }) {
  return (
    <div className="gallery-layout">
      <CardGrid cards={slide.cards} />
      <ImagePlaceholder slide={slide} mediaMap={mediaMap} settings={settings} onOpenLightbox={onOpenLightbox} />
    </div>
  );
}

function HeroSlide({ slide }) {
  return (
    <div className="hero-slide">
      <motion.div className="hero-copy" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
        <span>{slide.section}</span>
        <h1>{slide.title}</h1>
        {slide.subtitle && <p className="hero-subtitle">{slide.subtitle}</p>}
        <p className="hero-message">{slide.keyMessage}</p>
        <small>اضغط Space للبدء</small>
      </motion.div>
      <CardGrid cards={slide.cards} />
    </div>
  );
}

function StandardSlide({ slide, bento = false, mediaMap, settings, onOpenLightbox }) {
  return (
    <>
      <SlideHeader slide={slide} />
      <div className={bento ? 'single-column' : 'split-layout'}>
        <CardGrid cards={slide.cards} bento={bento} />
        {!bento && <ImagePlaceholder slide={slide} mediaMap={mediaMap} settings={settings} onOpenLightbox={onOpenLightbox} />}
      </div>
    </>
  );
}

function OodaSlide({ slide, mediaMap, settings, onOpenLightbox }) {
  const ooda = slide.ooda || [];

  return (
    <>
      <SlideHeader slide={slide} />
      <div className="ooda-layout">
        <div className="ooda-cycle">
          {ooda.map((item, index) => (
            <motion.div
              className="ooda-step"
              key={item.term}
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.12 }}
            >
              <span>{item.term}</span>
              <strong>{item.ar}</strong>
              <p>{item.body}</p>
            </motion.div>
          ))}
          <div className="ooda-core">OODA</div>
        </div>
        <div className="ooda-side">
          <ImagePlaceholder slide={slide} mediaMap={mediaMap} settings={settings} onOpenLightbox={onOpenLightbox} />
          <div className="ooda-explainer">
            <h3>تعريف سريع</h3>
            <p>{slide.oodaMessage}</p>
          </div>
        </div>
      </div>
    </>
  );
}

export default function SlideRenderer({ slide, mediaMap = {}, settings = {}, onOpenLightbox, preview = false }) {
  return (
    <AnimatePresence mode="wait">
      <motion.section
        className={`slide slide-${slide.type} ${preview ? 'slide-preview' : ''}`}
        key={slide.id}
        initial={{ opacity: 0, rotateX: 4, y: 28 }}
        animate={{ opacity: 1, rotateX: 0, y: 0 }}
        exit={{ opacity: 0, rotateX: -3, y: -18 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
      >
        {slide.type === 'hero' && <HeroSlide slide={slide} />}
        {slide.type === 'cardImage' && (
          <StandardSlide slide={slide} mediaMap={mediaMap} settings={settings} onOpenLightbox={onOpenLightbox} />
        )}
        {slide.type === 'bento' && <StandardSlide slide={slide} bento mediaMap={mediaMap} settings={settings} />}
        {slide.type === 'comparison' && (
          <>
            <SlideHeader slide={slide} />
            <ComparisonSlide slide={slide} />
          </>
        )}
        {slide.type === 'process' && (
          slide.ooda ? (
            <OodaSlide slide={slide} mediaMap={mediaMap} settings={settings} onOpenLightbox={onOpenLightbox} />
          ) : (
            <>
              <SlideHeader slide={slide} />
              <ProcessSlide slide={slide} mediaMap={mediaMap} settings={settings} onOpenLightbox={onOpenLightbox} />
            </>
          )
        )}
        {slide.type === 'gallery' && (
          <>
            <SlideHeader slide={slide} />
            <GallerySlide slide={slide} mediaMap={mediaMap} settings={settings} onOpenLightbox={onOpenLightbox} />
          </>
        )}
        {slide.type === 'demo' && (
          <>
            <SlideHeader slide={slide} />
            <WirelessDemo />
          </>
        )}
      </motion.section>
    </AnimatePresence>
  );
}
