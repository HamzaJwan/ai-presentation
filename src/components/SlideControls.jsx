import { Images, Maximize, MonitorUp, PanelTopOpen, Printer, Rows3, Settings, SkipBack, SkipForward, TimerReset } from 'lucide-react';

export default function SlideControls({
  onNext,
  onPrev,
  onOverview,
  onPresenter,
  onAudience,
  onMedia,
  onFullscreen,
  onMode,
  onPrint,
  modeLabel,
  showEditorTools = false,
  presenterEnabled = true
}) {
  return (
    <nav className="slide-controls" aria-label="أدوات العرض">
      <button type="button" onClick={onPrev} title="السابق">
        <SkipForward />
      </button>
      <button type="button" onClick={onNext} title="التالي">
        <SkipBack />
      </button>
      <button type="button" onClick={onOverview} title="عرض كل الشرائح">
        <Rows3 />
      </button>
      {presenterEnabled && onPresenter && (
        <button type="button" onClick={onPresenter} title="فتح شاشة المقدم">
          <PanelTopOpen />
        </button>
      )}
      <button type="button" onClick={onAudience} title="فتح شاشة الجمهور">
        <MonitorUp />
      </button>
      {showEditorTools && (
        <>
          <button type="button" onClick={onMedia} title="إدارة الوسائط">
            <Images />
          </button>
          <button type="button" onClick={onMedia} title="إعدادات اللوقو" className="text-control">
            <Settings />
            <span>اللوقو</span>
          </button>
        </>
      )}
      <button type="button" onClick={onFullscreen} title="ملء الشاشة">
        <Maximize />
      </button>
      <button type="button" onClick={onMode} title="تغيير وضع العرض" className="text-control">
        <TimerReset />
        <span>{modeLabel}</span>
      </button>
      <button type="button" onClick={onPrint} title="تصدير / طباعة PDF" className="text-control">
        <Printer />
        <span>PDF</span>
      </button>
    </nav>
  );
}
