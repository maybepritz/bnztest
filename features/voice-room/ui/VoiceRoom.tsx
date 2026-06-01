"use client";

import { LiveKitRoom, RoomAudioRenderer } from "@livekit/components-react";
import { ScreenSharePresets, VideoPresets } from "livekit-client";
import { CustomControls } from "./CustomControls";
import { CustomVideoGrid } from "./CustomVideoGrid";

interface VoiceRoomProps {
  roomName: string;
  token: string;
  onLeave: () => void;
  isPip?: boolean;
}

export function VoiceRoom({ roomName, token, onLeave, isPip }: VoiceRoomProps) {
  return (
    <LiveKitRoom
      video={false}
      audio={false}
      token={token}
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL || "ws://144.31.228.88:7880"}
      onDisconnected={onLeave}
      className="h-full w-full bg-black relative group"
      options={{
        adaptiveStream: false,
        dynacast: true,
        videoCaptureDefaults: {
          resolution: {
            ...VideoPresets.h1080.resolution,
            frameRate: 60,
          },
        },
        publishDefaults: {
          videoCodec: "vp8",
          screenShareEncoding: {
            maxBitrate: 3_000_000,
            maxFramerate: 60,
          },
          videoEncoding: {
            maxBitrate: 1_500_000,
            maxFramerate: 60,
          },
        },
      }}
    >
      <CustomVideoGrid isPip={isPip} onLeave={onLeave} />
      {!isPip && <CustomControls />}
      <RoomAudioRenderer />
    </LiveKitRoom>
  );
}
