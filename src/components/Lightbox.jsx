export default function Lightbox({ media, onClose }) {
  if (!media) return null;
  const isVideo = media.type === 'video' || /\.(mp4|webm)$/i.test(media.src || '');

  return (
    <div className="lightbox" onClick={onClose}>
      <button type="button" onClick={onClose}>إغلاق</button>
      <div className="lightbox-media" onClick={(event) => event.stopPropagation()}>
        {isVideo ? (
          <video src={media.src} controls autoPlay muted loop />
        ) : (
          <img src={media.src} alt={media.caption || 'وسائط الشريحة'} />
        )}
        {media.caption && <p>{media.caption}</p>}
      </div>
    </div>
  );
}
