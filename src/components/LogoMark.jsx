export default function LogoMark({ settings, slide }) {
  if (!settings?.logoVisible || !settings?.logoSrc) return null;
  if (settings.logoScope === 'cover' && slide?.id !== 1) return null;
  if (settings.logoScope === 'hide') return null;

  return (
    <img
      className={`global-logo ${settings.logoPosition || 'top-left'} ${settings.logoSize || 'medium'}`}
      src={settings.logoSrc}
      alt="شعار العرض"
      onError={(event) => {
        event.currentTarget.style.display = 'none';
      }}
      style={{ opacity: Number(settings.logoOpacity ?? 0.86) }}
    />
  );
}
