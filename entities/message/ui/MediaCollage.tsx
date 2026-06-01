"use client";

import { useState } from "react";
import { X as XIcon, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { createPortal } from "react-dom";
import { CircularProgress } from "@/shared/ui";
import { VoiceMessage } from "./VoiceMessage";

interface MediaCollageProps {
  attachments: string[];
  uploadProgress: number | null;
  messageId: string;
  isMe?: boolean;
}

function isVideo(url: string) {
  return (
    (url.endsWith("#video") ||
      url.includes("/video/") ||
      /\.(mp4|mov|mkv|avi|ogv)(\?.*)?(#.*)?$/i.test(url) ||
      (/\.(webm|ogg)(\?.*)?(#.*)?$/i.test(url) && url.endsWith("#video"))) &&
    !url.endsWith("#audio") &&
    !url.includes("/audio/")
  );
}

function isAudio(url: string) {
  return (
    url.endsWith("#audio") ||
    url.includes("/audio/") ||
    /\.(mp3|wav|m4a|oga)(\?.*)?(#.*)?$/i.test(url) ||
    (/\.(webm|ogg)(\?.*)?(#.*)?$/i.test(url) && !url.endsWith("#video"))
  );
}

function cleanUrl(url: string) {
  return url.replace(/#(audio|video|image)$/, "");
}

// Lightbox for fullscreen media viewing
function Lightbox({
  media,
  initialIndex,
  onClose,
}: {
  media: string[];
  initialIndex: number;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(initialIndex);
  const current = media[index];

  return createPortal(
    <div
      className="fixed inset-0 z-[10000] bg-black/90 flex items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute top-4 right-4 flex items-center gap-4 z-10">
        <button
          className="text-white/70 hover:text-white transition-colors"
          onClick={async (e) => {
            e.stopPropagation();
            try {
              const url = cleanUrl(current);
              const response = await fetch(url);
              const blob = await response.blob();
              const blobUrl = window.URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = blobUrl;
              const ext = isVideo(current) ? "mp4" : "jpg"; // fallback extensions
              a.download = `media-${Date.now()}.${ext}`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              window.URL.revokeObjectURL(blobUrl);
            } catch (err) {
              console.error("Download failed, opening in new tab", err);
              window.open(cleanUrl(current), "_blank");
            }
          }}
          title="Скачать"
        >
          <Download size={26} />
        </button>
        <button
          className="text-white/70 hover:text-white transition-colors"
          onClick={onClose}
        >
          <XIcon size={28} />
        </button>
      </div>

      {media.length > 1 && (
        <>
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-10"
            onClick={(e) => {
              e.stopPropagation();
              setIndex((prev) => (prev - 1 + media.length) % media.length);
            }}
          >
            <ChevronLeft size={24} />
          </button>
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-10"
            onClick={(e) => {
              e.stopPropagation();
              setIndex((prev) => (prev + 1) % media.length);
            }}
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}

      <div
        className="max-w-[90vw] max-h-[90vh] flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {isVideo(current) ? (
          <video
            src={cleanUrl(current)}
            controls
            autoPlay
            className="max-w-full max-h-[90vh] rounded-lg"
          />
        ) : (
          <img
            src={cleanUrl(current)}
            alt="Media"
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
          />
        )}
      </div>

      {media.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5">
          {media.map((_, i) => (
            <button
              key={i}
              className={`w-2 h-2 rounded-full transition-all ${
                i === index ? "bg-white w-5" : "bg-white/40 hover:bg-white/60"
              }`}
              onClick={(e) => {
                e.stopPropagation();
                setIndex(i);
              }}
            />
          ))}
        </div>
      )}
    </div>,
    document.body
  );
}

// Upload overlay with CircularProgress
function UploadOverlay({
  progress,
  messageId,
}: {
  progress: number;
  messageId: string;
}) {
  return (
    <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/30">
      <button
        onClick={() =>
          window.dispatchEvent(
            new CustomEvent("chat:cancel_upload", {
              detail: { tempId: messageId },
            })
          )
        }
        className="relative w-14 h-14 flex items-center justify-center rounded-full hover:bg-black/20 transition-colors group/cancel"
      >
        <CircularProgress value={progress} size={48} className="text-white absolute" />
        <XIcon
          size={18}
          className="text-white relative z-10 group-hover/cancel:scale-110 transition-transform rotate-90"
        />
      </button>
    </div>
  );
}

// Single media item
function MediaItem({
  url,
  className,
  onClick,
  uploadProgress,
  messageId,
}: {
  url: string;
  className?: string;
  onClick: () => void;
  uploadProgress: number | null;
  messageId: string;
}) {
  const src = cleanUrl(url);
  const uploading = uploadProgress !== null;

  return (
    <div
      className={`relative overflow-hidden cursor-pointer group/media ${className || ""}`}
      onClick={onClick}
    >
      {isVideo(url) ? (
        <video
          src={src}
          className={`w-full h-full object-cover block transition-all duration-300 ${
            uploading ? "blur-sm brightness-50" : ""
          }`}
          muted
        />
      ) : (
        <img
          src={src}
          alt="attachment"
          className={`w-full h-full object-cover block transition-all duration-300 ${
            uploading ? "blur-sm brightness-50" : ""
          }`}
        />
      )}

      {/* Video play icon */}
      {isVideo(url) && !uploading && (
        <div className="absolute inset-0 flex items-center justify-center opacity-80 group-hover/media:opacity-100 transition-opacity">
          <div className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
            <svg
              className="w-5 h-5 text-white ml-0.5"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      )}

      {/* Hover overlay */}
      {!uploading && (
        <div className="absolute inset-0 bg-black/0 group-hover/media:bg-black/10 transition-colors duration-200" />
      )}

      {uploading && (
        <UploadOverlay progress={uploadProgress!} messageId={messageId} />
      )}
    </div>
  );
}

export function MediaCollage({
  attachments,
  uploadProgress,
  messageId,
  isMe = false,
}: MediaCollageProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Separate audio from visual media
  const audioItems = attachments.filter(isAudio);
  const mediaItems = attachments.filter((url) => !isAudio(url));
  const count = mediaItems.length;

  const openLightbox = (index: number) => {
    if (uploadProgress !== null) return;
    setLightboxIndex(index);
  };

  return (
    <>
      {/* Voice messages */}
      {audioItems.map((url, i) => (
        <VoiceMessage key={`audio-${i}`} src={cleanUrl(url)} isMe={isMe} messageId={messageId} />
      ))}

      {/* Media collage grid */}
      {count > 0 && (
        <div
          className={`rounded-2xl overflow-hidden ${
            count === 1
              ? "max-w-sm"
              : count <= 4
                ? "max-w-md"
                : "max-w-md"
          }`}
        >
          {count === 1 && (
            <MediaItem
              url={mediaItems[0]}
              className="max-h-80"
              onClick={() => openLightbox(0)}
              uploadProgress={uploadProgress}
              messageId={messageId}
            />
          )}

          {count === 2 && (
            <div className="grid grid-cols-2 gap-0.5 h-60">
              {mediaItems.map((url, i) => (
                <MediaItem
                  key={i}
                  url={url}
                  className="h-full"
                  onClick={() => openLightbox(i)}
                  uploadProgress={uploadProgress}
                  messageId={messageId}
                />
              ))}
            </div>
          )}

          {count === 3 && (
            <div className="flex flex-col gap-0.5">
              <MediaItem
                url={mediaItems[0]}
                className="w-full h-48"
                onClick={() => openLightbox(0)}
                uploadProgress={uploadProgress}
                messageId={messageId}
              />
              <div className="grid grid-cols-2 gap-0.5 h-32">
                <MediaItem
                  url={mediaItems[1]}
                  className="h-full"
                  onClick={() => openLightbox(1)}
                  uploadProgress={uploadProgress}
                  messageId={messageId}
                />
                <MediaItem
                  url={mediaItems[2]}
                  className="h-full"
                  onClick={() => openLightbox(2)}
                  uploadProgress={uploadProgress}
                  messageId={messageId}
                />
              </div>
            </div>
          )}

          {count === 4 && (
            <div className="grid grid-cols-2 gap-0.5 h-72">
              {mediaItems.map((url, i) => (
                <MediaItem
                  key={i}
                  url={url}
                  className="h-full"
                  onClick={() => openLightbox(i)}
                  uploadProgress={uploadProgress}
                  messageId={messageId}
                />
              ))}
            </div>
          )}

          {count >= 5 && (
            <div className="flex flex-col gap-0.5">
              {/* Top row: 2 images */}
              <div className="grid grid-cols-2 gap-0.5 h-40">
                <MediaItem
                  url={mediaItems[0]}
                  className="h-full"
                  onClick={() => openLightbox(0)}
                  uploadProgress={uploadProgress}
                  messageId={messageId}
                />
                <MediaItem
                  url={mediaItems[1]}
                  className="h-full"
                  onClick={() => openLightbox(1)}
                  uploadProgress={uploadProgress}
                  messageId={messageId}
                />
              </div>
              {/* Bottom row: 3 images (last one may have "+N" overlay) */}
              <div className="grid grid-cols-3 gap-0.5 h-32">
                <MediaItem
                  url={mediaItems[2]}
                  className="h-full"
                  onClick={() => openLightbox(2)}
                  uploadProgress={uploadProgress}
                  messageId={messageId}
                />
                <MediaItem
                  url={mediaItems[3]}
                  className="h-full"
                  onClick={() => openLightbox(3)}
                  uploadProgress={uploadProgress}
                  messageId={messageId}
                />
                <div className="relative h-full">
                  <MediaItem
                    url={mediaItems[4]}
                    className="h-full"
                    onClick={() => openLightbox(4)}
                    uploadProgress={uploadProgress}
                    messageId={messageId}
                  />
                  {count > 5 && (
                    <div
                      className="absolute inset-0 bg-black/60 flex items-center justify-center cursor-pointer"
                      onClick={() => openLightbox(4)}
                    >
                      <span className="text-white text-2xl font-bold">
                        +{count - 5}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Fullscreen Lightbox */}
      {lightboxIndex !== null && (
        <Lightbox
          media={mediaItems}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  );
}
