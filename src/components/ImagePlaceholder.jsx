import { useEffect, useMemo, useState } from 'react';
import { Film, Image, Sparkles } from 'lucide-react';
import { Icon } from './iconMap.jsx';

const imageExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
const videoExtensions = ['mp4', 'webm'];

function mediaTypeFrom(src = '', fallback = 'image') {
  if (/\.(mp4|webm)$/i.test(src)) return 'video';
  return fallback;
}

function conventionCandidates(slideId, slot) {
  const number = String(slideId).padStart(2, '0');
  return [...imageExtensions, ...videoExtensions].map((ext) => ({
    src: `/media/slide-${number}-${slot}.${ext}`,
    type: videoExtensions.includes(ext) ? 'video' : 'image',
    source: 'folder'
  }));
}

function useConventionMedia(slideId, slot) {
  const [found, setFound] = useState(null);

  useEffect(() => {
    let alive = true;
    const candidates = conventionCandidates(slideId, slot);

    async function detect() {
      for (const candidate of candidates) {
        try {
          const response = await fetch(candidate.src, { method: 'HEAD' });
          if (response.ok && alive) {
            setFound(candidate);
            return;
          }
        } catch {
          // نتجاهل المحاولة وننتقل للامتداد التالي.
        }
      }
      if (alive) setFound(null);
    }

    detect();
    return () => {
      alive = false;
    };
  }, [slideId, slot]);

  return found;
}

function Placeholder({ slide, slot }) {
  const fileName = `public/media/slide-${String(slide.id).padStart(2, '0')}-${slot}.jpg`;

  if (slot === 'main') {
    const diagram = diagramBySlideId[slide.id];
    if (diagram) return <InternalDiagram slide={slide} diagram={diagram} />;
  }

  return (
    <div className="image-placeholder">
      <div className="placeholder-orbit">
        {slot === 'main' ? <Image size={44} /> : <Film size={42} />}
        <Sparkles size={22} />
      </div>
      <p>[مساحة صورة/فيديو: {slide.imageHint || 'أضف صورة مناسبة لمحتوى الشريحة'}]</p>
      <small>الاسم المقترح: {fileName} أو .png أو .mp4</small>
    </div>
  );
}

const diagramBySlideId = {
  8: {
    title: 'OODA داخل العمل الحديث',
    stages: [
      ['Radar', 'Observe', 'رصد الإشارات'],
      ['BrainCircuit', 'Orient', 'فهم السياق'],
      ['Scale', 'Decide', 'اختيار القرار'],
      ['Zap', 'Act', 'تنفيذ ومتابعة']
    ]
  },
  9: {
    title: 'Sensor Fusion إلى قرار',
    stages: [
      ['Radar', 'حساسات', 'رادار وفيديو وخرائط'],
      ['Database', 'دمج بيانات', 'تنظيف وربط'],
      ['PanelsTopLeft', 'لوحة عمليات', 'صورة مشتركة'],
      ['ShieldCheck', 'قرار', 'مراجعة بشرية']
    ]
  },
  10: {
    title: 'Video Analytics',
    stages: [
      ['Camera', 'كاميرات', 'تدفق فيديو'],
      ['ScanEye', 'تحليل', 'كشف أحداث'],
      ['SearchCheck', 'بحث', 'وقت ومكان'],
      ['LockKeyhole', 'حوكمة', 'صلاحيات وسجلات']
    ]
  },
  11: {
    title: 'NOC / Network Dashboard',
    stages: [
      ['Wifi', 'أجهزة', 'حالة الشبكة'],
      ['Activity', 'قياسات', 'تجربة المستخدم'],
      ['LineChart', 'اتجاهات', 'تحليل أعطال'],
      ['Wrench', 'إجراء', 'تحسين الخدمة']
    ]
  },
  12: {
    title: 'Medical Imaging Workflow',
    stages: [
      ['ScanSearch', 'صورة أشعة', 'CT / Radiology'],
      ['HeartPulse', 'فرز', 'حالات حرجة'],
      ['UserCheck', 'طبيب', 'مراجعة قرار'],
      ['ClipboardCheck', 'مسار عمل', 'متابعة الحالة']
    ]
  },
  15: {
    title: 'Public vs Protected AI',
    stages: [
      ['CloudCog', 'Public', 'تعلم وتجارب عامة'],
      ['ShieldCheck', 'Protected', 'بيانات حساسة'],
      ['Lock', 'سياسات', 'صلاحيات وسجلات'],
      ['Server', 'بيئة', 'تشغيل مناسب']
    ]
  },
  18: {
    title: 'Risk Pipeline',
    stages: [
      ['Database', 'بيانات', 'مصدر وتدريب'],
      ['Cpu', 'نموذج', 'استدلال'],
      ['MessageSquareText', 'سؤال', 'سياق ومدخلات'],
      ['Scale', 'قرار', 'مراجعة بشرية']
    ]
  },
  20: {
    title: 'بناء نموذج لهجات محلي',
    stages: [
      ['Languages', 'لهجات متعددة', 'تنوع نطق وكتابة'],
      ['Mic', 'تسجيل صوتي', 'عينات مرخصة'],
      ['FileText', 'تفريغ', 'تحويل الكلام لنص'],
      ['DatabaseZap', 'تنظيف بيانات', 'وسم وتدقيق'],
      ['BadgeCheck', 'اختبار جودة', 'قياس وتحسين']
    ]
  },
  22: {
    title: 'Wireless + Codex',
    stages: [
      ['RadioTower', 'وصلة لاسلكية', 'مسافة وتردد'],
      ['Calculator', 'معادلات', 'FSPL وRx Power'],
      ['Code2', 'Codex', 'تحويلها إلى كود'],
      ['PanelsTopLeft', 'Web App', 'اختبار مباشر']
    ]
  },
  23: {
    title: 'خيارات تشغيل AI',
    stages: [
      ['CloudCog', 'Cloud', 'مرونة وتجارب'],
      ['Server', 'On‑Prem', 'سيطرة وبيانات'],
      ['Cpu', 'Edge', 'استجابة قريبة'],
      ['LockKeyhole', 'Air‑Gapped', 'حساسية عالية']
    ]
  }
};

function InternalDiagram({ slide, diagram }) {
  return (
    <div className="internal-diagram" role="img" aria-label={diagram.title || slide.title}>
      <strong>{diagram.title || slide.title}</strong>
      <div className="internal-diagram-flow">
        {diagram.stages.map(([icon, title, body], index) => (
          <div className="internal-diagram-node" key={`${title}-${index}`}>
            <span>
              <Icon name={icon} size={30} />
            </span>
            <b>{title}</b>
            <small>{body}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

function MediaSlot({ slide, slot, mediaMap, settings, onOpen, hideWhenEmpty = false }) {
  const key = `slide-${String(slide.id).padStart(2, '0')}-${slot}`;
  const conventionMedia = useConventionMedia(slide.id, slot);
  const [hasError, setHasError] = useState(false);
  const assigned = mediaMap?.[key];
  const media = useMemo(() => {
    if (assigned?.src) {
      return { ...assigned, type: mediaTypeFrom(assigned.src, assigned.type) };
    }
    if (conventionMedia?.src) return conventionMedia;
    if (slot === 'main' && slide.image) return { src: slide.image, type: mediaTypeFrom(slide.image), source: 'slide' };
    return null;
  }, [assigned, conventionMedia, slide.image, slot]);

  useEffect(() => {
    setHasError(false);
  }, [media?.src]);

  if (hasError) {
    if (hideWhenEmpty) return null;
    return <Placeholder slide={slide} slot={slot} />;
  }

  if (!media && hideWhenEmpty) return null;
  if (!media) return <Placeholder slide={slide} slot={slot} />;

  const fit = media.fit || settings?.defaultFit || 'cover';
  const alignment = media.align || 'center';
  const tint = Number(media.tint ?? 0.08);
  const rounded = media.rounded !== false;
  const glow = media.glow || settings?.imageGlow || 'medium';
  const isVideo = media.type === 'video';

  return (
    <button
      type="button"
      className={`media-frame ${rounded ? 'rounded' : ''} glow-${glow} align-${alignment}`}
      onClick={() => onOpen?.(media)}
      title="اضغط لتكبير الوسائط"
    >
      {isVideo ? (
        <video src={media.src} autoPlay muted loop playsInline style={{ objectFit: fit }} onError={() => setHasError(true)} />
      ) : (
        <img src={media.src} alt={media.caption || slide.title} style={{ objectFit: fit }} onError={() => setHasError(true)} />
      )}
      <span className="media-tint" style={{ opacity: tint }} />
      <span className="media-caption">{media.caption || (isVideo ? 'فيديو توضيحي' : 'صورة توضيحية')}</span>
    </button>
  );
}

export default function ImagePlaceholder({ slide, mediaMap, settings, onOpenLightbox }) {
  const thumbSlots = slide.mediaSlots?.filter((slot) => slot !== 'main') || ['thumb-1', 'thumb-2'];

  return (
    <div className="media-visual-stack">
      <MediaSlot slide={slide} slot="main" mediaMap={mediaMap} settings={settings} onOpen={onOpenLightbox} />
      {slide.mediaSlots?.length > 1 && (
        <div className="media-thumbs">
          {thumbSlots.map((slot) => (
            <MediaSlot
              key={slot}
              slide={slide}
              slot={slot}
              mediaMap={mediaMap}
              settings={settings}
              onOpen={onOpenLightbox}
              hideWhenEmpty
            />
          ))}
        </div>
      )}
    </div>
  );
}
