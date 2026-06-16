import { useEffect, useMemo, useState } from 'react';
import { Film, Image, Sparkles } from 'lucide-react';

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
          // تجاهل المحاولات الفاشلة والانتقال للمرشح التالي
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
  return (
    <div className="image-placeholder">
      <div className="placeholder-orbit">
        {slot === 'main' ? <Image size={44} /> : <Film size={42} />}
        <Sparkles size={22} />
      </div>
      <p>[مساحة الصورة: أضف هنا {slide.imageHint || 'صورة أو فيديو مناسب لمحتوى الشريحة'}]</p>
      <small>اسم الملف المقترح: public/media/slide-{String(slide.id).padStart(2, '0')}-{slot}.jpg أو .mp4</small>
    </div>
  );
}

function MediaSlot({ slide, slot, mediaMap, settings, onOpen }) {
  const key = `slide-${String(slide.id).padStart(2, '0')}-${slot}`;
  const conventionMedia = useConventionMedia(slide.id, slot);
  const assigned = mediaMap?.[key];
  const media = useMemo(() => {
    if (assigned?.src) {
      return { ...assigned, type: mediaTypeFrom(assigned.src, assigned.type) };
    }
    if (conventionMedia?.src) return conventionMedia;
    if (slot === 'main' && slide.image) return { src: slide.image, type: mediaTypeFrom(slide.image), source: 'slide' };
    return null;
  }, [assigned, conventionMedia, slide.image, slot]);

  if (!media) return <Placeholder slide={slide} slot={slot} />;

  const fit = media.fit || settings?.defaultFit || 'cover';
  const alignment = media.align || 'center';
  const tint = Number(media.tint ?? 0.16);
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
        <video src={media.src} autoPlay muted loop playsInline />
      ) : (
        <img src={media.src} alt={media.caption || slide.title} style={{ objectFit: fit }} />
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
            />
          ))}
        </div>
      )}
    </div>
  );
}
