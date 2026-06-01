"use client";

import { useTrackToggle, useRoomContext, useMediaDeviceSelect } from "@livekit/components-react";
import { Track } from "livekit-client";
import { Mic, MicOff, Video, VideoOff, MonitorUp, PhoneOff, X, ChevronUp } from "lucide-react";
import { IconButton, Button, Toggle, useToast } from "@/shared/ui";
import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

export function CustomControls() {
  const room = useRoomContext();
  const { error } = useToast();
  
  const mic = useTrackToggle({ source: Track.Source.Microphone });
  const camera = useTrackToggle({ source: Track.Source.Camera });
  const screen = useTrackToggle({ source: Track.Source.ScreenShare });

  const [isScreenSettingsOpen, setIsScreenSettingsOpen] = useState(false);
  const [res, setRes] = useState<"original" | 1080 | 720>(1080);
  const [fps, setFps] = useState<60 | 30>(30);
  const [shareAudio, setShareAudio] = useState(true);

  const screenBtnRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const [popupStyle, setPopupStyle] = useState<React.CSSProperties>({});

  const [activeSetting, setActiveSetting] = useState<"mic" | "camera" | null>(null);
  const micBtnRef = useRef<HTMLDivElement>(null);
  const cameraBtnRef = useRef<HTMLDivElement>(null);
  const devicePopupRef = useRef<HTMLDivElement>(null);
  const [devicePopupStyle, setDevicePopupStyle] = useState<React.CSSProperties>({});

  const { devices: audioDevices, activeDeviceId: activeAudioId, setActiveMediaDevice: setAudioDevice } = useMediaDeviceSelect({ kind: "audioinput" });
  const { devices: videoDevices, activeDeviceId: activeVideoId, setActiveMediaDevice: setVideoDevice } = useMediaDeviceSelect({ kind: "videoinput" });

  const updatePopupPosition = useCallback(() => {
    if (!screenBtnRef.current || !popupRef.current) return;
    
    const btnRect = screenBtnRef.current.getBoundingClientRect();
    const popupEl = popupRef.current;
    const popupWidth = 320;
    const popupHeight = popupEl.offsetHeight || 340;
    
    let left = btnRect.left + (btnRect.width / 2) - (popupWidth / 2);
    let bottom = window.innerHeight - btnRect.top + 12;
    
    if (left < 16) left = 16;
    if (left + popupWidth > window.innerWidth - 16) left = window.innerWidth - popupWidth - 16;
    
    if (btnRect.top - popupHeight - 12 < 16) {
      setPopupStyle({ position: 'fixed', left, top: btnRect.bottom + 12, bottom: 'auto', width: popupWidth });
    } else {
      setPopupStyle({ position: 'fixed', left, bottom, top: 'auto', width: popupWidth });
    }
  }, []);

  const updateDevicePopupPosition = useCallback(() => {
    const btnRef = activeSetting === "mic" ? micBtnRef : activeSetting === "camera" ? cameraBtnRef : null;
    if (!btnRef?.current || !devicePopupRef.current) return;
    
    const btnRect = btnRef.current.getBoundingClientRect();
    const popupEl = devicePopupRef.current;
    const popupWidth = 320;
    const popupHeight = popupEl.offsetHeight || 340;
    
    let left = btnRect.left + (btnRect.width / 2) - (popupWidth / 2);
    let bottom = window.innerHeight - btnRect.top + 12;
    
    if (left < 16) left = 16;
    if (left + popupWidth > window.innerWidth - 16) left = window.innerWidth - popupWidth - 16;
    
    if (btnRect.top - popupHeight - 12 < 16) {
      setDevicePopupStyle({ position: 'fixed', left, top: btnRect.bottom + 12, bottom: 'auto', width: popupWidth });
    } else {
      setDevicePopupStyle({ position: 'fixed', left, bottom, top: 'auto', width: popupWidth });
    }
  }, []);

  useEffect(() => {
    if (isScreenSettingsOpen) {
      requestAnimationFrame(updatePopupPosition);
      setTimeout(updatePopupPosition, 50);
    }
    if (activeSetting) {
      requestAnimationFrame(updateDevicePopupPosition);
      setTimeout(updateDevicePopupPosition, 50);
    }
  }, [isScreenSettingsOpen, updatePopupPosition, activeSetting, updateDevicePopupPosition]);

  // Упрощенный обработчик включения медиа-устройств
  const handleMediaToggle = async (track: any, type: "mic" | "camera") => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      error("В вашем браузере заблокирован доступ к медиа (требуется HTTPS или localhost).");
      return;
    }

    try {
      await track.toggle();
    } catch (e: any) {
      console.error(`${type} error details:`, e);
      const isMic = type === "mic";
      if (e.name === "NotFoundError" || e.message?.includes("NotFound")) {
        error(isMic ? "Микрофон не найден аппаратно. Подключите гарнитуру." : "Камера не найдена аппаратно. Подключите веб-камеру.");
      } else if (e.name === "NotAllowedError" || e.name === "PermissionDeniedError") {
        error(`Нет доступа к ${isMic ? "микрофону" : "камере"}. Разрешите доступ в настройках браузера.`);
      } else {
        error(`Ошибка ${isMic ? "микрофона" : "камеры"}: ${e.message}`);
      }
    }
  };

  const startScreenShare = async () => {
    setIsScreenSettingsOpen(false);
    const buildOpts = (withAudio: boolean): any => ({
      audio: withAudio,
      resolution: res === "original" 
        ? { frameRate: fps } 
        : { frameRate: fps, width: res === 1080 ? 1920 : 1280, height: res }
    });

    try {
      if (shareAudio) {
        try {
          await screen.toggle(true, buildOpts(true));
          return;
        } catch (e: any) {
          console.warn("Screen share with audio failed, retrying without audio");
        }
      }
      await screen.toggle(true, buildOpts(false));
    } catch (e: any) {
      error("Ошибка демонстрации экрана: " + e.message);
    }
  };

  // Компонент-помощник для отрисовки разделенных кнопок
  const renderSplitButton = (
    track: any, 
    type: "mic" | "camera",
    IconOn: any, 
    IconOff: any, 
    btnRef: React.RefObject<HTMLDivElement | null>
  ) => {
    const isSettingsOpen = activeSetting === type;
    return (
      <div 
        ref={btnRef}
        className={`flex items-center rounded-full overflow-hidden transition-all duration-200 ${
          track.enabled ? "bg-white/10 text-white" : "bg-red-500/20 text-red-400"
        }`}
      >
        <button 
          onClick={() => handleMediaToggle(track, type)} 
          disabled={track.pending}
          className={`flex items-center justify-center w-10 h-10 transition-colors ${
            track.enabled ? "hover:bg-white/20" : "hover:bg-red-500/30"
          }`}
        >
          <div className={track.enabled ? "block" : "hidden"}><IconOn size={18} /></div>
          <div className={!track.enabled ? "block" : "hidden"}><IconOff size={18} /></div>
        </button>
        
        <div className={`w-[1px] h-6 ${track.enabled ? "bg-white/10" : "bg-red-500/20"}`} />
        
        <button 
          onClick={(e) => {
            e.stopPropagation();
            setActiveSetting(isSettingsOpen ? null : type);
          }}
          className={`flex items-center justify-center w-6 h-10 transition-colors ${
            track.enabled ? "hover:bg-white/20" : "hover:bg-red-500/30"
          } ${isSettingsOpen ? (track.enabled ? "bg-white/20" : "bg-red-500/40") : ""}`}
        >
          <ChevronUp size={14} />
        </button>
      </div>
    );
  };

  return (
    <>
      {/* Screen share settings popup */}
      {isScreenSettingsOpen && !screen.enabled && typeof document !== "undefined" && createPortal(
        <div ref={popupRef} className="fixed bg-background/50 backdrop-blur-2xl border border-white/10 p-5 rounded-2xl shadow-2xl z-[100] animate-scale-in" style={popupStyle}>
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-white text-sm tracking-wide">Настройки демонстрации</h3>
            <IconButton size="sm" variant="ghost" onClick={() => setIsScreenSettingsOpen(false)} className="rounded-full text-white/60 hover:text-white hover:bg-white/10">
              <X size={16} />
            </IconButton>
          </div>
          
          <div className="space-y-5">
            <div>
              <label className="text-xs text-white/60 mb-2 block font-medium">Разрешение</label>
              <div className="flex gap-2">
                {[720, 1080, "original"].map((val) => (
                  <Button 
                    key={val} onClick={() => setRes(val as any)} 
                    variant={res === val ? "primary" : "secondary"} size="sm" className="flex-1"
                  >
                    {val === "original" ? "Оригинал" : `${val}p`}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-white/60 mb-2 block font-medium">Частота кадров</label>
              <div className="flex gap-2">
                {[30, 60].map((val) => (
                  <Button 
                    key={val} onClick={() => setFps(val as any)} 
                    variant={fps === val ? "primary" : "secondary"} size="sm" className="flex-1"
                  >
                    {val} FPS
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between py-2">
              <label className="text-xs text-white/60 font-medium">Захват звука</label>
              <Toggle 
                checked={shareAudio} 
                onChange={setShareAudio} 
                variant="glass" 
              />
            </div>

            <Button onClick={startScreenShare} variant="primary" className="w-full mt-1">Начать стрим</Button>
          </div>
        </div>,
        document.body
      )}

      {/* Device settings popup */}
      {activeSetting && typeof document !== "undefined" && createPortal(
        <div ref={devicePopupRef} className="fixed bg-background/50 backdrop-blur-2xl border border-white/10 p-4 rounded-2xl shadow-2xl z-[100] animate-scale-in" style={{ ...devicePopupStyle, top: devicePopupStyle.top || "50%", left: devicePopupStyle.left || "50%", transform: (devicePopupStyle.top || devicePopupStyle.left) ? "" : "translate(-50%, -50%)" }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-white text-sm tracking-wide">
              {activeSetting === "mic" ? "Настройки микрофона" : "Настройки камеры"}
            </h3>
            <IconButton size="sm" variant="ghost" onClick={() => setActiveSetting(null)} className="rounded-full text-white/60 hover:text-white hover:bg-white/10">
              <X size={16} />
            </IconButton>
          </div>
          
          <div className="space-y-4">
            {activeSetting === "mic" && (
              <div>
                <label className="text-xs text-white/60 mb-2 block font-medium">Микрофон</label>
                <select 
                  value={activeAudioId || ""} 
                  onChange={(e) => setAudioDevice(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 text-white text-sm rounded-xl px-3 py-2 outline-none focus:border-primary/50 transition-colors appearance-none cursor-pointer"
                >
                  {audioDevices.map(d => (
                    <option key={d.deviceId} value={d.deviceId} className="bg-gray-800 text-white">{d.label || "Микрофон по умолчанию"}</option>
                  ))}
                </select>
              </div>
            )}

            {activeSetting === "camera" && (
              <div>
                <label className="text-xs text-white/60 mb-2 block font-medium">Камера</label>
                <select 
                  value={activeVideoId || ""} 
                  onChange={(e) => setVideoDevice(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 text-white text-sm rounded-xl px-3 py-2 outline-none focus:border-primary/50 transition-colors appearance-none cursor-pointer"
                >
                  {videoDevices.map(d => (
                    <option key={d.deviceId} value={d.deviceId} className="bg-gray-800 text-white">{d.label || "Камера по умолчанию"}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}

      {/* Main control bar */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-background/40 backdrop-blur-2xl border border-white/10 px-5 py-3 rounded-full shadow-2xl z-10 opacity-0 hover:opacity-100 group-hover:opacity-100 transition-opacity duration-300">
        
        {renderSplitButton(mic, "mic", Mic, MicOff, micBtnRef)}
        {renderSplitButton(camera, "camera", Video, VideoOff, cameraBtnRef)}

        <div ref={screenBtnRef}>
          <IconButton 
            onClick={() => screen.enabled ? screen.toggle(false).catch(console.error) : setIsScreenSettingsOpen(!isScreenSettingsOpen)} 
            variant="ghost" 
            disabled={screen.pending}
            className={`rounded-full w-10 h-10 flex items-center justify-center transition-all duration-200 ${screen.enabled || isScreenSettingsOpen ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30" : "bg-white/10 text-white hover:bg-white/15"}`}
          >
            <MonitorUp size={20} />
          </IconButton>
        </div>

        <div className="w-px h-8 bg-white/10 mx-1" />

        <IconButton 
          onClick={() => room.disconnect()} 
          variant="ghost" 
          className="rounded-full w-10 h-10 flex items-center justify-center bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/25 transition-all duration-200"
        >
          <PhoneOff size={20} />
        </IconButton>
      </div>
    </>
  );
}
