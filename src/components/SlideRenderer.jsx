import { AnimatePresence, motion } from 'motion/react';
import ComparisonSlide from './ComparisonSlide.jsx';
import GlassCard from './GlassCard.jsx';
import { Icon } from './iconMap.jsx';
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

function TakeawayStrip({ children, title = 'الخلاصة' }) {
  return (
    <div className="takeaway-strip">
      <strong>{title}</strong>
      <span>{children}</span>
    </div>
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

function MiniFlowDiagram({ stages, className = '' }) {
  return (
    <div className={`mini-flow-diagram ${className}`}>
      {stages.map((stage, index) => (
        <motion.div
          className="mini-flow-stage"
          key={stage.label}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.08, duration: 0.36 }}
        >
          <div className="mini-flow-icon">
            <Icon name={stage.icon} size={34} />
          </div>
          <strong>{stage.label}</strong>
          {stage.hint && <small>{stage.hint}</small>}
        </motion.div>
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

  if (!slide.mediaSlots?.length) {
    return (
      <div className="process-balanced">
        <MiniFlowDiagram
          stages={slide.steps.slice(0, 4).map((step) => ({
            icon: step.icon,
            label: step.title
          }))}
        />
        {cards}
        <TakeawayStrip>{slide.keyMessage}</TakeawayStrip>
      </div>
    );
  }

  return (
    <div className="process-media-layout">
      {cards}
      <ImagePlaceholder slide={slide} mediaMap={mediaMap} settings={settings} onOpenLightbox={onOpenLightbox} />
    </div>
  );
}

function GallerySlide({ slide, mediaMap, settings, onOpenLightbox }) {
  return (
    <div className="gallery-layout gallery-rich">
      <CardGrid cards={slide.cards} />
      <ImagePlaceholder slide={slide} mediaMap={mediaMap} settings={settings} onOpenLightbox={onOpenLightbox} />
    </div>
  );
}

function LanguageModelSlide({ slide }) {
  const primaryCard = slide.cards?.[0];
  const otherCards = slide.cards?.slice(1) || [];

  return (
    <>
      <SlideHeader slide={slide} />
      <div className="concept-pipeline-layout">
        <div className="concept-visual-panel">
          <MiniFlowDiagram
            stages={[
              { icon: 'MessageSquareText', label: 'السؤال والسياق', hint: 'مدخلات واضحة' },
              { icon: 'BrainCircuit', label: 'النموذج', hint: 'يتوقع النمط' },
              { icon: 'FileOutput', label: 'الإجابة', hint: 'مخرج قابل للمراجعة' },
              { icon: 'BadgeCheck', label: 'التحقق', hint: 'قرار بيد الإنسان' }
            ]}
          />
          <div className="example-mini-card">
            <Icon name="TriangleAlert" size={30} />
            <p>سؤال عام يعطي إجابة عامة، وسياق واضح يعطي نتيجة أدق.</p>
          </div>
          <TakeawayStrip>السياق الواضح يقلل التخمين، والتحقق يحمي القرار.</TakeawayStrip>
        </div>
        <div className="concept-card-panel">
          {primaryCard && <GlassCard card={primaryCard} index={0} large />}
          {otherCards.map((card, index) => (
            <GlassCard key={card.title} card={card} index={index + 1} />
          ))}
        </div>
      </div>
    </>
  );
}

function RiskFlowSlide({ slide }) {
  return (
    <>
      <SlideHeader slide={slide} />
      <div className="risk-story-layout">
        <div className="risk-path-panel">
          <MiniFlowDiagram
            className="risk-path"
            stages={[
              { icon: 'Database', label: 'البيانات', hint: 'Training Data' },
              { icon: 'Cpu', label: 'النموذج', hint: 'Model' },
              { icon: 'MessageSquareText', label: 'السؤال', hint: 'Inference' },
              { icon: 'Scale', label: 'القرار', hint: 'Decision' }
            ]}
          />
          <div className="risk-defense-layer">
            <Icon name="ShieldCheck" size={34} />
            <strong>طبقة الدفاع</strong>
            <span>السجلات + الاختبار + الحوكمة + المراجعة البشرية</span>
          </div>
        </div>
        <div className="risk-grid">
          {slide.cards.map((card, index) => (
            <GlassCard key={card.title} card={card} index={index} />
          ))}
        </div>
      </div>
    </>
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
      {bento && <TakeawayStrip title={slide.takeawayTitle}>{slide.takeawayText || slide.keyMessage}</TakeawayStrip>}
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
            <h3>شرح سريع</h3>
            <p>{slide.oodaMessage}</p>
          </div>
        </div>
      </div>
      <TakeawayStrip>AI يسرّع الرصد والفهم، لكنه لا يلغي مسؤولية القائد عن القرار.</TakeawayStrip>
    </>
  );
}

export default function SlideRenderer({ slide, mediaMap = {}, settings = {}, onOpenLightbox, preview = false }) {
  return (
    <AnimatePresence mode="wait">
      <motion.section
        className={`slide slide-${slide.type} slide-id-${slide.id} ${preview ? 'slide-preview' : ''}`}
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
        {slide.type === 'bento' && (
          slide.id === 18 ? (
            <RiskFlowSlide slide={slide} />
          ) : slide.id === 5 ? (
            <LanguageModelSlide slide={slide} />
          ) : (
            <StandardSlide slide={slide} bento mediaMap={mediaMap} settings={settings} />
          )
        )}
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
