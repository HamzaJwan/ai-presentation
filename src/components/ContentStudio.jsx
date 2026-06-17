import { useMemo, useState } from 'react';
import { Download, RotateCcw, Save, Search, Upload } from 'lucide-react';
import { adminFetch, saveSettings, saveSlideNotes, saveSlideOverride } from '../utils/adminApi.js';

const audienceProfiles = [
  { value: 'generic', label: 'عام' },
  { value: 'waha', label: 'واحة نت' },
  { value: 'air-defense', label: 'الدفاع الجوي' },
  { value: 'student', label: 'طلبة' }
];

const scanWords = ['ضباط', 'عسكري', 'دفاع', 'الواحة', 'عملاء', 'زبائن', 'مؤسسة', 'شركة'];

function collectText(value, bucket = []) {
  if (!value) return bucket;
  if (typeof value === 'string') bucket.push(value);
  if (Array.isArray(value)) value.forEach((item) => collectText(item, bucket));
  if (typeof value === 'object') Object.values(value).forEach((item) => collectText(item, bucket));
  return bucket;
}

function safeJsonParse(value, fallback) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function stringify(value) {
  return JSON.stringify(value || [], null, 2);
}

export default function ContentStudio({
  slides,
  currentSlide,
  contentState,
  serverSettings,
  brand,
  profile,
  onRefresh,
  onClose
}) {
  const [slideId, setSlideId] = useState(currentSlide?.id || slides[0]?.id || 1);
  const selected = slides.find((slide) => slide.id === slideId) || slides[0];
  const override = contentState.slides?.[String(slideId)] || {};
  const [message, setMessage] = useState('');
  const [activeProfile, setActiveProfile] = useState(profile || 'generic');
  const [draft, setDraft] = useState(() => makeDraft(selected, override));

  function makeDraft(slide, slideOverride = {}) {
    return {
      section: slideOverride.section ?? slide.section ?? '',
      title: slideOverride.title ?? slide.title ?? '',
      subtitle: slideOverride.subtitle ?? slide.subtitle ?? '',
      takeaway: slideOverride.takeaway ?? slide.takeaway ?? '',
      imageHint: slideOverride.imageHint ?? slide.imageHint ?? '',
      cards: stringify(slideOverride.cards ?? slide.cards ?? []),
      steps: stringify(slideOverride.steps ?? slide.steps ?? []),
      left: stringify(slideOverride.left ?? slide.left ?? null),
      right: stringify(slideOverride.right ?? slide.right ?? null),
      speakerNotes: slideOverride.speakerNotes ?? slide.speakerNotes ?? '',
      estimatedMinutes: slideOverride.estimatedMinutes ?? slide.estimatedMinutes ?? (slide.type === 'demo' ? 12 : 1.5),
      modes: {
        full: slideOverride.modes?.full ?? true,
        oneHour: slideOverride.modes?.oneHour ?? Boolean(slide.oneHour),
        waha: slideOverride.modes?.waha ?? Boolean(slide.oneHour),
        military: slideOverride.modes?.military ?? Boolean(slide.oneHour)
      }
    };
  }

  function chooseSlide(nextId) {
    const nextSlide = slides.find((slide) => slide.id === Number(nextId)) || slides[0];
    const nextOverride = contentState.slides?.[String(nextSlide.id)] || {};
    setSlideId(nextSlide.id);
    setDraft(makeDraft(nextSlide, nextOverride));
    setMessage('');
  }

  async function saveVisibleContent() {
    const payload = {
      section: draft.section,
      title: draft.title,
      subtitle: draft.subtitle,
      takeaway: draft.takeaway,
      imageHint: draft.imageHint,
      cards: safeJsonParse(draft.cards, selected.cards || []),
      steps: safeJsonParse(draft.steps, selected.steps || []),
      left: safeJsonParse(draft.left, selected.left || null),
      right: safeJsonParse(draft.right, selected.right || null),
      estimatedMinutes: Number(draft.estimatedMinutes || 1.5),
      modes: draft.modes
    };
    await saveSlideOverride(slideId, payload);
    await onRefresh?.();
    setMessage('تم حفظ نصوص الشريحة.');
  }

  async function saveNotes() {
    await saveSlideNotes(slideId, draft.speakerNotes);
    await onRefresh?.();
    setMessage('تم حفظ شرح المتحدث.');
  }

  async function saveAudienceProfile() {
    const next = {
      ...(serverSettings || {}),
      activeProfile,
      brands: {
        ...(serverSettings?.brands || {}),
        [brand || 'generic']: {
          ...(serverSettings?.brands?.[brand || 'generic'] || {}),
          profile: activeProfile
        }
      }
    };
    await saveSettings(next);
    await onRefresh?.();
    setMessage('تم حفظ ملف الجمهور.');
  }

  async function exportContentPack() {
    const response = await adminFetch('/api/export/content');
    if (!response.ok) {
      setMessage('تعذر تصدير حزمة العرض.');
      return;
    }
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ai-workshop-content-${Date.now()}.zip`;
    link.click();
    URL.revokeObjectURL(url);
    setMessage('تم تصدير حزمة العرض.');
  }

  function resetDraft() {
    setDraft(makeDraft(selected, {}));
    setMessage('تمت إعادة الحقول إلى النسخة الأصلية قبل الحفظ.');
  }

  const scanResults = useMemo(() => {
    return slides.flatMap((slide) => {
      const text = collectText(slide).join(' ');
      return scanWords
        .filter((word) => text.includes(word))
        .map((word) => ({ slideId: slide.id, title: slide.title, word }));
    });
  }, [slides]);

  const totalMinutes = useMemo(
    () => slides.reduce((sum, slide) => sum + Number(slide.estimatedMinutes || (slide.type === 'demo' ? 12 : 1.5)), 0),
    [slides]
  );

  return (
    <div className="overlay content-studio" dir="rtl">
      <div className="overlay-header">
        <div>
          <h2>استوديو المحتوى</h2>
          <p>عدّل نصوص الشرائح، شرح المتحدث، الصور، وأنماط الجمهور بدون تعديل الكود.</p>
        </div>
        <button type="button" onClick={onClose}>إغلاق</button>
      </div>

      <div className="content-studio-grid">
        <section className="manager-panel">
          <h3>اختيار الشريحة</h3>
          <select value={slideId} onChange={(event) => chooseSlide(event.target.value)}>
            {slides.map((slide) => (
              <option key={slide.id} value={slide.id}>
                {String(slide.id).padStart(2, '0')} - {slide.title}
              </option>
            ))}
          </select>

          <h3>ملف الجمهور</h3>
          <select value={activeProfile} onChange={(event) => setActiveProfile(event.target.value)}>
            {audienceProfiles.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
          <button type="button" onClick={saveAudienceProfile}><Save /> حفظ ملف الجمهور</button>

          <h3>تخطيط الوقت</h3>
          <label>
            زمن الشريحة بالدقائق
            <input type="number" step="0.5" value={draft.estimatedMinutes} onChange={(event) => setDraft((value) => ({ ...value, estimatedMinutes: event.target.value }))} />
          </label>
          <p className="media-hint">الزمن التقريبي الحالي: {Math.round(totalMinutes)} دقيقة.</p>
          {['full', 'oneHour', 'waha', 'military'].map((mode) => (
            <label className="check-line" key={mode}>
              <input
                type="checkbox"
                checked={Boolean(draft.modes[mode])}
                onChange={(event) => setDraft((value) => ({ ...value, modes: { ...value.modes, [mode]: event.target.checked } }))}
              />
              تضمين في وضع {mode}
            </label>
          ))}

          <h3><Search /> فحص الكلمات</h3>
          <div className="wording-scan">
            {scanResults.slice(0, 12).map((item) => (
              <button type="button" key={`${item.slideId}-${item.word}`} onClick={() => chooseSlide(item.slideId)}>
                شريحة {item.slideId}: {item.word}
              </button>
            ))}
            {!scanResults.length && <p>لا توجد كلمات تحتاج مراجعة.</p>}
          </div>
        </section>

        <section className="manager-panel">
          <h3>تعديل نصوص الشريحة</h3>
          <label>تصنيف الشريحة<input value={draft.section} onChange={(event) => setDraft((value) => ({ ...value, section: event.target.value }))} /></label>
          <label>العنوان<input value={draft.title} onChange={(event) => setDraft((value) => ({ ...value, title: event.target.value }))} /></label>
          <label>العنوان الفرعي<input value={draft.subtitle} onChange={(event) => setDraft((value) => ({ ...value, subtitle: event.target.value }))} /></label>
          <label>الخلاصة<input value={draft.takeaway} onChange={(event) => setDraft((value) => ({ ...value, takeaway: event.target.value }))} /></label>
          <label>وصف مساحة الصورة<input value={draft.imageHint} onChange={(event) => setDraft((value) => ({ ...value, imageHint: event.target.value }))} /></label>
          <label>البطاقات JSON<textarea value={draft.cards} onChange={(event) => setDraft((value) => ({ ...value, cards: event.target.value }))} /></label>
          <label>الخطوات JSON<textarea value={draft.steps} onChange={(event) => setDraft((value) => ({ ...value, steps: event.target.value }))} /></label>
          <label>الجانب الأيسر JSON<textarea value={draft.left} onChange={(event) => setDraft((value) => ({ ...value, left: event.target.value }))} /></label>
          <label>الجانب الأيمن JSON<textarea value={draft.right} onChange={(event) => setDraft((value) => ({ ...value, right: event.target.value }))} /></label>
          <div className="studio-actions">
            <button type="button" onClick={saveVisibleContent}><Save /> حفظ النصوص</button>
            <button type="button" onClick={resetDraft}><RotateCcw /> رجوع للأصل</button>
          </div>
        </section>

        <section className="manager-panel notes-editor-panel">
          <h3>تعديل شرح المتحدث</h3>
          <textarea
            value={draft.speakerNotes}
            onChange={(event) => setDraft((value) => ({ ...value, speakerNotes: event.target.value }))}
            placeholder="اكتب هنا الشرح الذي تريد قراءته للجمهور..."
          />
          <div className="studio-actions">
            <button type="button" onClick={saveNotes}><Save /> حفظ شرح المتحدث</button>
            <button type="button" onClick={exportContentPack}><Download /> تصدير حزمة العرض</button>
            <label className="button-like disabled"><Upload /> استيراد قريبًا</label>
          </div>
          {message && <p className="media-hint good">{message}</p>}
        </section>
      </div>
    </div>
  );
}
