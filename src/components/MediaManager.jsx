import { useMemo, useState } from 'react';
import { FolderOpen, ImagePlus, Link, Sparkles, Trash2, Upload } from 'lucide-react';
import { saveSettings, uploadMediaFile } from '../utils/adminApi.js';

const slots = ['main', 'thumb-1', 'thumb-2', 'thumb-3', 'logo'];
const alignOptions = ['center', 'top', 'bottom', 'left', 'right'];

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function mediaType(src = '', fileType = '') {
  if (fileType.startsWith('video') || /\.(mp4|webm)$/i.test(src)) return 'video';
  return 'image';
}

function mediaKey(slideId, slot) {
  return `slide-${String(slideId).padStart(2, '0')}-${slot}`;
}

function extensionFromFile(file) {
  const fromName = file?.name?.split('.').pop()?.toLowerCase();
  if (fromName && /^[a-z0-9]+$/.test(fromName)) return fromName === 'jpeg' ? 'jpg' : fromName;
  if (file?.type === 'image/png') return 'png';
  if (file?.type === 'image/webp') return 'webp';
  if (file?.type === 'image/gif') return 'gif';
  if (file?.type === 'video/mp4') return 'mp4';
  if (file?.type === 'video/webm') return 'webm';
  return 'jpg';
}

function mediaFileName(slideId, slot, file) {
  if (slot === 'logo') return `logo.${extensionFromFile(file)}`;
  return `${mediaKey(slideId, slot)}.${extensionFromFile(file)}`;
}

export default function MediaManager({
  slides,
  mediaMap,
  defaultMediaMap = {},
  effectiveMediaMap = {},
  setMediaMap,
  settings,
  setSettings,
  brand = 'generic',
  onRefreshContent,
  onClose
}) {
  const [slideId, setSlideId] = useState(slides[0]?.id || 1);
  const [slot, setSlot] = useState('main');
  const [url, setUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [fit, setFit] = useState(settings.defaultFit || 'cover');
  const [align, setAlign] = useState('center');
  const [glow, setGlow] = useState(settings.imageGlow || 'medium');
  const [tint, setTint] = useState(0.12);
  const [message, setMessage] = useState('');
  const [projectMediaDir, setProjectMediaDir] = useState(null);

  const selectedSlide = slides.find((slide) => slide.id === slideId) || slides[0];
  const key = useMemo(() => mediaKey(slideId, slot), [slideId, slot]);
  const current = slot === 'logo' ? null : mediaMap[key];
  const effective = slot === 'logo' ? null : effectiveMediaMap[key];

  async function uploadLogo(file) {
    if (!file) return;
    try {
      const result = await uploadMediaFile({ file, slideId: 0, slot: 'logo', brand, caption: 'Logo', fit: 'contain', align: 'center', tint: 0, glow: 'soft' });
      const logoSrc = result.media.url;
      const nextSettings = { ...settings, logoSrc, logoVisible: true, logoScope: settings.logoScope || 'all' };
      setSettings(nextSettings);
      await saveSettings({ brands: { [brand]: nextSettings }, global: nextSettings });
      setMessage(`تم حفظ اللوقو دائمًا داخل data/media باسم ${result.media.id}.`);
      return;
    } catch {
      // في الوضع الثابت نستخدم التخزين المؤقت القديم.
    }
    const src = await fileToDataUrl(file);
    setSettings((value) => ({ ...value, logoSrc: src, logoVisible: true, logoScope: value.logoScope || 'all' }));
    setMessage('تم حفظ اللوقو محليًا وتفعيله في العرض.');
  }

  async function selectProjectMediaFolder() {
    if (!window.showDirectoryPicker) {
      setMessage('متصفحك لا يدعم الحفظ المباشر في مجلد المشروع. استخدم Chrome أو Edge.');
      return null;
    }

    try {
      const directory = await window.showDirectoryPicker({ mode: 'readwrite' });
      setProjectMediaDir(directory);
      setMessage('تم ربط مجلد الوسائط. أي صورة ترفعها الآن سيتم نسخها داخل هذا المجلد تلقائيًا.');
      return directory;
    } catch {
      setMessage('لم يتم اختيار مجلد. اختر مجلد AI-Workshop-Web/public/media عند الحاجة للحفظ الدائم.');
      return null;
    }
  }

  async function saveToProjectFolder(file, targetName, dataUrl) {
    try {
      const response = await fetch('/__media-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: targetName, dataUrl })
      });
      const result = await response.json().catch(() => null);
      if (response.ok && result?.ok && result.url) {
        return { ok: true, src: result.url, mode: 'vite' };
      }
    } catch {
      // إذا كان العرض يعمل من Docker/static فلن يوجد API، ننتقل لخيار مجلد المتصفح.
    }

    const directory = projectMediaDir || (await selectProjectMediaFolder());
    if (!directory) return { ok: false, src: dataUrl, mode: 'memory' };

    try {
      const handle = await directory.getFileHandle(targetName, { create: true });
      const writable = await handle.createWritable();
      await writable.write(file);
      await writable.close();
      return { ok: true, src: dataUrl, mode: 'folder' };
    } catch {
      return { ok: false, src: dataUrl, mode: 'memory' };
    }
  }

  async function assignFile(file) {
    if (!file) return;
    if (slot === 'logo') {
      await uploadLogo(file);
      return;
    }

    try {
      try {
        const result = await uploadMediaFile({ file, slideId, slot, brand, caption, fit, align, tint, glow });
        const media = result.media;
        setMediaMap((map) => ({
          ...map,
          [key]: {
            src: media.url,
            type: media.type,
            caption: media.caption,
            fit: media.fit,
            align: media.align,
            tint: media.tint,
            glow: media.glow
          }
        }));
        await onRefreshContent?.();
        setMessage(`تم رفع الملف وحفظه دائمًا داخل data/media باسم ${media.id}.`);
        return;
      } catch {
        // إذا لم يكن خادم الحفظ الدائم متاحًا نستخدم الخطة المحلية القديمة.
      }

      const src = await fileToDataUrl(file);
      const targetName = mediaFileName(slideId, slot, file);
      const saved = await saveToProjectFolder(file, targetName, src);
      setMediaMap((map) => ({
        ...map,
        [key]: {
          src: saved.src,
          type: mediaType(src, file.type),
          caption: caption || file.name,
          fit,
          align,
          tint,
          glow
        }
      }));
      if (saved.mode === 'vite') {
        setMessage(`تم حفظ الملف داخل public/media باسم ${targetName} وربطه بالشريحة.`);
      } else if (saved.mode === 'folder') {
        setMessage(`تم نسخ الملف داخل المجلد باسم ${targetName}. سيظهر الآن من الذاكرة، وبعد إعادة بناء Docker سيُقرأ من public/media.`);
      } else {
        setMessage('تم عرض الملف مؤقتًا فقط. للحفظ داخل المشروع اربط مجلد AI-Workshop-Web/public/media ثم ارفع الصورة مرة أخرى.');
      }
    } catch {
      setMessage('تعذر قراءة الملف. جرّب ملفًا آخر أو ضع الملف يدويًا داخل public/media.');
    }
  }

  function assignUrl() {
    if (!url.trim()) return;
    if (slot === 'logo') {
      setSettings((value) => ({ ...value, logoSrc: url.trim(), logoVisible: true }));
      setUrl('');
      setMessage('تم ربط اللوقو من الرابط المحدد.');
      return;
    }

    setMediaMap((map) => ({
      ...map,
      [key]: { src: url.trim(), type: mediaType(url), caption, fit, align, tint, glow }
    }));
    setUrl('');
    setMessage('تم ربط الرابط بالفتحة المحددة.');
  }

  function removeMedia() {
    if (slot === 'logo') {
      setSettings((value) => ({ ...value, logoSrc: '', logoVisible: false }));
      setMessage('تمت إزالة اللوقو المحلي.');
      return;
    }

    setMediaMap((map) => {
      const next = { ...map };
      delete next[key];
      return next;
    });
    setMessage('تمت إزالة الوسائط المخصصة. ستظهر الصورة الافتراضية أو ملف public/media إن وجد.');
  }

  function handleDrop(event) {
    event.preventDefault();
    assignFile(event.dataTransfer.files?.[0]);
  }

  return (
    <div className="overlay media-manager">
      <div className="overlay-header">
        <div>
          <h2>إدارة الوسائط وإعدادات اللوقو</h2>
          <p>اختر الشريحة، اسحب صورة/فيديو، أو استخدم ملفات public/media وخريطة mediaMap الافتراضية.</p>
        </div>
        <button type="button" onClick={onClose}>إغلاق</button>
      </div>

      <div className="media-manager-grid">
        <section className="manager-panel slide-picker-panel">
          <h3><Sparkles /> كل الشرائح</h3>
          <div className="media-slide-list">
            {slides.map((slide) => {
              const slideKey = mediaKey(slide.id, 'main');
              const assigned = Boolean(mediaMap[slideKey]);
              const hasDefault = Boolean(defaultMediaMap[slideKey]);
              const preview = effectiveMediaMap[slideKey]?.src;
              return (
                <button
                  type="button"
                  key={slide.id}
                  className={`media-slide-item ${slide.id === slideId ? 'active' : ''}`}
                  onClick={() => setSlideId(slide.id)}
                >
                  <span>{String(slide.id).padStart(2, '0')}</span>
                  {preview ? <img src={preview} alt="" /> : <em />}
                  <strong>{slide.title}</strong>
                  <small>{assigned ? 'مخصص' : hasDefault ? 'افتراضي' : 'بدون وسائط'}</small>
                </button>
              );
            })}
          </div>
        </section>

        <section className="manager-panel">
          <h3><ImagePlus /> وسائط الشريحة</h3>
          <label>
            الشريحة
            <select value={slideId} onChange={(event) => setSlideId(Number(event.target.value))}>
              {slides.map((slide) => (
                <option key={slide.id} value={slide.id}>
                  {String(slide.id).padStart(2, '0')} - {slide.title}
                </option>
              ))}
            </select>
          </label>
          <label>
            فتحة الوسائط
            <select value={slot} onChange={(event) => setSlot(event.target.value)}>
              {slots.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label>
            وصف مختصر
            <input value={caption} onChange={(event) => setCaption(event.target.value)} placeholder="مثال: مركز عمليات أو tactical map" />
          </label>

          <div className="manager-row">
            <label>
              طريقة الملء
              <select value={fit} onChange={(event) => setFit(event.target.value)}>
                <option value="cover">cover</option>
                <option value="contain">contain</option>
              </select>
            </label>
            <label>
              المحاذاة
              <select value={align} onChange={(event) => setAlign(event.target.value)}>
                {alignOptions.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
          </div>

          <div className="manager-row">
            <label>
              التوهج
              <select value={glow} onChange={(event) => setGlow(event.target.value)}>
                <option value="none">off</option>
                <option value="soft">soft</option>
                <option value="medium">medium</option>
                <option value="strong">strong</option>
              </select>
            </label>
            <label>
              طبقة التعتيم
              <input type="range" min="0" max="0.45" step="0.03" value={tint} onChange={(event) => setTint(Number(event.target.value))} />
            </label>
          </div>

          <label className="drop-zone" onDragOver={(event) => event.preventDefault()} onDrop={handleDrop}>
            <Upload />
            <span>اسحب صورة/فيديو هنا أو اضغط للاختيار</span>
            <input type="file" accept="image/*,video/mp4,video/webm" onChange={(event) => assignFile(event.target.files?.[0])} />
          </label>
          <button type="button" className="folder-link-button" onClick={selectProjectMediaFolder}>
            <FolderOpen /> ربط مجلد public/media للحفظ التلقائي
          </button>
          {projectMediaDir && <p className="media-hint good">مجلد الحفظ مربوط الآن. سيتم نسخ الملفات المرفوعة داخل ملفات المشروع.</p>}

          <div className="url-row">
            <input value={url} onChange={(event) => setUrl(event.target.value)} placeholder="رابط صورة أو فيديو اختياري" />
            <button type="button" onClick={assignUrl}><Link /> ربط</button>
          </div>

          <div className="media-preview-card">
            <strong>معاينة الفتحة الحالية</strong>
            {effective?.src ? (
              effective.type === 'video' ? <video src={effective.src} muted loop playsInline controls /> : <img src={effective.src} alt={effective.caption || selectedSlide.title} />
            ) : (
              <p>لا توجد وسائط لهذه الفتحة بعد.</p>
            )}
            {effective?.caption && <small>{effective.caption}</small>}
          </div>

          <button type="button" className="danger-button" onClick={removeMedia}><Trash2 /> إزالة / إعادة ضبط هذه الفتحة</button>
          <p className="media-hint">convention: public/media/{key}.jpg أو {key}.mp4</p>
          {current && <p className="media-hint good">هذه الفتحة تحتوي وسائط مخصصة الآن.</p>}
          {message && <p className="media-hint">{message}</p>}
        </section>

        <section className="manager-panel">
          <h3><FolderOpen /> إعدادات اللوقو والحركة</h3>
          <label className="drop-zone" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); uploadLogo(event.dataTransfer.files?.[0]); }}>
            <Upload />
            <span>ارفع اللوقو هنا أو ضع logo.png داخل public/media</span>
            <input type="file" accept="image/*" onChange={(event) => uploadLogo(event.target.files?.[0])} />
          </label>

          <label>
            ظهور اللوقو
            <select value={settings.logoScope || 'all'} onChange={(event) => setSettings((value) => ({ ...value, logoScope: event.target.value, logoVisible: event.target.value !== 'hide' }))}>
              <option value="all">show on all slides</option>
              <option value="cover">show only on cover</option>
              <option value="hide">hide logo</option>
            </select>
          </label>

          <div className="manager-row">
            <label>
              مكان اللوقو
              <select value={settings.logoPosition} onChange={(event) => setSettings((value) => ({ ...value, logoPosition: event.target.value }))}>
                <option value="top-right">top-right</option>
                <option value="top-left">top-left</option>
                <option value="bottom-right">bottom-right</option>
                <option value="bottom-left">bottom-left</option>
              </select>
            </label>
            <label>
              الحجم
              <select value={settings.logoSize} onChange={(event) => setSettings((value) => ({ ...value, logoSize: event.target.value }))}>
                <option value="small">small</option>
                <option value="medium">medium</option>
                <option value="large">large</option>
              </select>
            </label>
          </div>

          <label>
            شفافية اللوقو
            <input type="range" min="0.25" max="1" step="0.05" value={settings.logoOpacity} onChange={(event) => setSettings((value) => ({ ...value, logoOpacity: Number(event.target.value) }))} />
          </label>

          <div className="manager-row">
            <label>
              توهج الصور الافتراضي
              <select value={settings.imageGlow || 'medium'} onChange={(event) => setSettings((value) => ({ ...value, imageGlow: event.target.value }))}>
                <option value="none">off</option>
                <option value="soft">soft</option>
                <option value="medium">medium</option>
                <option value="strong">strong</option>
              </select>
            </label>
            <label>
              ملء الوسائط الافتراضي
              <select value={settings.defaultFit || 'cover'} onChange={(event) => setSettings((value) => ({ ...value, defaultFit: event.target.value }))}>
                <option value="cover">cover</option>
                <option value="contain">contain</option>
              </select>
            </label>
          </div>

          <div className="manager-row">
            <label>
              حجم السلايد
              <select value={settings.slideScale || 'normal'} onChange={(event) => setSettings((value) => ({ ...value, slideScale: event.target.value }))}>
                <option value="compact">compact</option>
                <option value="normal">normal</option>
                <option value="cinematic">cinematic</option>
              </select>
            </label>
            <label>
              حجم ملاحظات المقدم
              <input type="range" min="20" max="44" value={settings.notesFontSize} onChange={(event) => setSettings((value) => ({ ...value, notesFontSize: Number(event.target.value) }))} />
            </label>
          </div>

          <label className="check-line">
            <input type="checkbox" checked={settings.reduceMotion} onChange={(event) => setSettings((value) => ({ ...value, reduceMotion: event.target.checked }))} />
            تقليل الحركة
          </label>
          <label className="check-line">
            <input type="checkbox" checked={settings.particles} onChange={(event) => setSettings((value) => ({ ...value, particles: event.target.checked }))} />
            إظهار الجزيئات المتحركة
          </label>
          <label className="check-line">
            <input type="checkbox" checked={settings.animatedBackground !== false} onChange={(event) => setSettings((value) => ({ ...value, animatedBackground: event.target.checked }))} />
            الشبكة والخلفية المتحركة
          </label>
        </section>
      </div>
    </div>
  );
}
