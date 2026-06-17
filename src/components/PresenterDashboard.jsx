import { useEffect, useMemo, useState } from 'react';
import SlideRenderer from './SlideRenderer.jsx';

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(rest).padStart(2, '0')}`;
}

function SlidePreview({ slide, label, mediaMap, settings, primary = false }) {
  return (
    <section className={`presenter-preview-card ${primary ? 'primary' : ''}`}>
      <div className="presenter-panel-title">
        <h2>{label}</h2>
        {slide && <span>{slide.section}</span>}
      </div>
      <div className="presenter-slide-viewport">
        {slide ? (
          <div className="presenter-slide-scale">
            <SlideRenderer slide={slide} mediaMap={mediaMap} settings={settings} preview />
          </div>
        ) : (
          <div className="presenter-empty-next">نهاية العرض</div>
        )}
      </div>
    </section>
  );
}

function QuickGuide({ onClose }) {
  return (
    <aside className="presenter-guide" role="dialog" aria-label="دليل سريع">
      <div>
        <h3>كيف أضيف صورة أو فيديو؟</h3>
        <button type="button" onClick={onClose}>إغلاق</button>
      </div>
      <ol>
        <li>افتح الرابط مع <strong>?presenter=1&amp;admin=1</strong>.</li>
        <li>اضغط <strong>إدارة الصور والفيديو</strong> واختر الشريحة والمكان.</li>
        <li>ارفع صورة/فيديو أو ضع رابطًا، ثم عدّل Fit إلى contain إذا كانت الصورة مقصوصة.</li>
        <li>للطريقة الدائمة: ضع الملفات داخل <strong>public/media</strong> باسم مثل <strong>slide-09-main.jpg</strong>.</li>
        <li>للوقو: استخدم <strong>إعداد اللوقو</strong> أو ضع الملف باسم <strong>public/media/logo.png</strong>.</li>
      </ol>
      <p>شاشة الجمهور لا تعرض هذه الأدوات ولا ملاحظات المتحدث.</p>
    </aside>
  );
}

function parseNotes(notes) {
  const markerPattern = /(الشرح المختصر:|توسّع اختياري:|الانتقال:)/g;
  const speaker = notes.split('الشرح المختصر:')[0]?.trim() || '';
  const parts = notes.split(markerPattern);
  const sections = {};

  for (let index = 1; index < parts.length; index += 2) {
    const key = parts[index].replace(':', '').trim();
    sections[key] = (parts[index + 1] || '').trim();
  }

  return { speaker, sections };
}

function StructuredNotes({ notes, fontSize }) {
  const { speaker, sections } = parseNotes(notes);
  const hasStructuredNotes = Boolean(sections['الشرح المختصر'] || sections['توسّع اختياري'] || sections['الانتقال']);

  if (!hasStructuredNotes) return <p style={{ fontSize }}>{notes}</p>;

  return (
    <div className="notes-script" style={{ fontSize }}>
      {speaker && <strong className="notes-speaker">{speaker}</strong>}
      <section className="notes-section primary">
        <h3>الشرح المختصر</h3>
        <p>{sections['الشرح المختصر']}</p>
      </section>
      {sections['توسّع اختياري'] && (
        <details className="notes-section optional">
          <summary>توسّع اختياري</summary>
          <p>{sections['توسّع اختياري']}</p>
        </details>
      )}
      {sections['الانتقال'] && (
        <section className="notes-section transition">
          <h3>الانتقال</h3>
          <p>{sections['الانتقال']}</p>
        </section>
      )}
    </div>
  );
}

export default function PresenterDashboard({
  slide,
  nextSlide,
  index,
  total,
  compactMode,
  modeLabel,
  modeDescription,
  settings,
  mediaMap,
  speakerName,
  brandText,
  showEditorTools = false,
  onNext,
  onPrev,
  onJump,
  onOpenAudience,
  onOpenMedia,
  onOpenContentStudio,
  onSlideOnly,
  onToggleBlank,
  onToggleLogo,
  onFullscreenAudience,
  onNotesFontChange
}) {
  const [seconds, setSeconds] = useState(0);
  const [fontSize, setFontSize] = useState(settings.notesFontSize || 30);
  const [comfortable, setComfortable] = useState(true);
  const [guideOpen, setGuideOpen] = useState(false);

  useEffect(() => {
    const id = window.setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    setFontSize(settings.notesFontSize || 30);
  }, [settings.notesFontSize]);

  const notes = useMemo(() => {
    return slide.speakerNotes || 'لا توجد ملاحظات لهذه الشريحة. اكتب شرحًا مختصرًا في بيانات الشريحة حتى يظهر هنا.';
  }, [slide.speakerNotes]);

  function changeFont(delta) {
    const nextSize = Math.max(20, Math.min(fontSize + delta, 52));
    setFontSize(nextSize);
    onNotesFontChange?.(nextSize);
  }

  return (
    <div className={`presenter-dashboard presenter-console ${comfortable ? 'comfortable' : ''}`}>
      <header className="presenter-dashboard-top">
        <div className="presenter-heading">
          <span>لوحة المقدم</span>
          <h1>{slide.title}</h1>
          {(speakerName || brandText) && (
            <p className="presenter-brand-line">
              {speakerName}{brandText ? ` — ${brandText}` : ''}
            </p>
          )}
        </div>
        <div className="presenter-dashboard-meta">
          <strong>{formatTime(seconds)}</strong>
          <span dir="ltr">{index + 1} / {total}</span>
          <span>{modeLabel || (compactMode ? 'الوضع المختصر' : 'الوضع الكامل')}</span>
          {modeDescription && <span>{modeDescription}</span>}
        </div>
      </header>

      <main className="presenter-console-grid">
        <section className="presenter-notes">
          <div className="notes-toolbar">
            <h2>شرح السلايد للجمهور</h2>
            <button type="button" onClick={() => changeFont(2)}>تكبير</button>
            <button type="button" onClick={() => changeFont(-2)}>تصغير</button>
            <button type="button" onClick={() => navigator.clipboard?.writeText(notes)}>نسخ</button>
            <button type="button" onClick={() => setComfortable((value) => !value)}>قراءة مريحة</button>
            <button type="button" onClick={() => setGuideOpen(true)}>دليل الصور</button>
          </div>
          <StructuredNotes notes={notes} fontSize={fontSize} />
        </section>

        <div className="presenter-preview-stack">
          <SlidePreview
            slide={slide}
            label="الشريحة الحالية"
            mediaMap={mediaMap}
            settings={settings}
            primary
          />
          <SlidePreview
            slide={nextSlide}
            label="الشريحة التالية"
            mediaMap={mediaMap}
            settings={settings}
          />
        </div>
      </main>

      <footer className="presenter-dashboard-controls">
        <button type="button" onClick={onPrev}>السابق</button>
        <button type="button" className="primary-action" onClick={onNext}>التالي</button>
        <select value={index} onChange={(event) => onJump(Number(event.target.value))} aria-label="اختيار الشريحة">
          {Array.from({ length: total }, (_, item) => (
            <option key={item} value={item}>شريحة {item + 1}</option>
          ))}
        </select>
        <button type="button" onClick={onOpenAudience}>فتح شاشة الجمهور</button>
        <button type="button" onClick={onFullscreenAudience}>طلب ملء شاشة الجمهور</button>
        <button type="button" onClick={onSlideOnly}>عرض الشرائح فقط</button>
        <button type="button" onClick={onToggleBlank}>{settings.blankAudience ? 'إظهار الجمهور' : 'تعتيم الجمهور'}</button>
        {showEditorTools ? (
          <>
            <button type="button" onClick={onToggleLogo}>{settings.logoVisible ? 'إخفاء اللوقو' : 'إظهار اللوقو'}</button>
            <button type="button" onClick={onOpenContentStudio}>استوديو المحتوى</button>
            <button type="button" onClick={onOpenMedia}>إدارة الصور والفيديو</button>
            <button type="button" onClick={onOpenMedia}>إعداد اللوقو</button>
          </>
        ) : (
          <button type="button" onClick={() => setGuideOpen(true)}>كيف أضيف وسائط؟</button>
        )}
      </footer>

      {guideOpen && <QuickGuide onClose={() => setGuideOpen(false)} />}
    </div>
  );
}
