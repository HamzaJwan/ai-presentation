import { useEffect, useState } from 'react';

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(rest).padStart(2, '0')}`;
}

function MiniSlidePreview({ slide, label, active = false }) {
  if (!slide) {
    return (
      <section className="mini-preview">
        <h2>{label}</h2>
        <div className="mini-preview-empty">نهاية العرض</div>
      </section>
    );
  }

  const items = slide.cards || slide.steps || [];

  return (
    <section className={`mini-preview ${active ? 'active' : ''}`}>
      <h2>{label}</h2>
      <div className="mini-slide-card">
        <span>{slide.section}</span>
        <strong>{slide.title}</strong>
        {slide.keyMessage && <p>{slide.keyMessage}</p>}
        <div className="mini-card-list">
          {items.slice(0, 4).map((item) => (
            <em key={item.title}>{item.title}</em>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function PresenterDashboard({
  slide,
  nextSlide,
  index,
  total,
  compactMode,
  settings,
  speakerName,
  brandText,
  showEditorTools = false,
  onNext,
  onPrev,
  onJump,
  onOpenAudience,
  onOpenMedia,
  onToggleBlank,
  onToggleLogo,
  onFullscreenAudience
}) {
  const [seconds, setSeconds] = useState(0);
  const [fontSize, setFontSize] = useState(settings.notesFontSize || 28);
  const [comfortable, setComfortable] = useState(true);

  useEffect(() => {
    const id = window.setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className={`presenter-dashboard ${comfortable ? 'comfortable' : ''}`}>
      <header className="presenter-dashboard-top">
        <div>
          <span>لوحة المقدم</span>
          <h1>{slide.title}</h1>
          {(speakerName || brandText) && <p className="presenter-brand-line">{speakerName}{brandText ? ` — ${brandText}` : ''}</p>}
        </div>
        <div className="presenter-dashboard-meta">
          <strong>{formatTime(seconds)}</strong>
          <span>{index + 1} / {total}</span>
          <span>{compactMode ? 'الوضع المختصر' : 'الوضع الكامل'}</span>
        </div>
      </header>

      <main className="presenter-dashboard-grid">
        <div className="presenter-previews">
          <MiniSlidePreview slide={slide} label="الشريحة الحالية" active />
          <MiniSlidePreview slide={nextSlide} label="الشريحة التالية" />
        </div>

        <section className="presenter-notes">
          <div className="notes-toolbar">
            <h2>ملاحظات المتحدث</h2>
            <button type="button" onClick={() => setFontSize((value) => Math.min(value + 2, 44))}>تكبير</button>
            <button type="button" onClick={() => setFontSize((value) => Math.max(value - 2, 18))}>تصغير</button>
            <button type="button" onClick={() => navigator.clipboard?.writeText(slide.speakerNotes || '')}>نسخ</button>
            <button type="button" onClick={() => setComfortable((value) => !value)}>قراءة مريحة</button>
          </div>
          <p style={{ fontSize }}>{slide.speakerNotes || 'لا توجد ملاحظات لهذه الشريحة.'}</p>
        </section>
      </main>

      <footer className="presenter-dashboard-controls">
        <button type="button" onClick={onPrev}>السابق</button>
        <button type="button" onClick={onNext}>التالي</button>
        <select value={index} onChange={(event) => onJump(Number(event.target.value))}>
          {Array.from({ length: total }, (_, item) => (
            <option key={item} value={item}>شريحة {item + 1}</option>
          ))}
        </select>
        <button type="button" onClick={onOpenAudience}>فتح شاشة الجمهور</button>
        <button type="button" onClick={onFullscreenAudience}>طلب Fullscreen للجمهور</button>
        <button type="button" onClick={onToggleBlank}>{settings.blankAudience ? 'إظهار الجمهور' : 'تعتيم الجمهور'}</button>
        {showEditorTools && (
          <>
            <button type="button" onClick={onToggleLogo}>{settings.logoVisible ? 'إخفاء اللوقو' : 'إظهار اللوقو'}</button>
            <button type="button" onClick={onOpenMedia}>إدارة الوسائط</button>
          </>
        )}
      </footer>
    </div>
  );
}
