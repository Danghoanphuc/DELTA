// apps/customer-frontend/src/features/social/components/SocialChatWindow/hooks/useChatAudio.ts
// ✅ Custom hook để quản lý audio sounds

import { useEffect, useRef } from "react";

const SOUND_SEND = "/sounds/message-send-.mp3";
const SOUND_RECEIVE = "/sounds/happy.mp3";

export function useChatAudio() {
  const sendAudioRef = useRef<HTMLAudioElement | null>(null);
  const receiveAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    sendAudioRef.current = new Audio(SOUND_SEND);
    sendAudioRef.current.volume = 0.5;
    receiveAudioRef.current = new Audio(SOUND_RECEIVE);
    receiveAudioRef.current.volume = 0.6;
  }, []);

  const playSendSound = () => {
    sendAudioRef.current?.play().catch(() => {});
  };

  const playReceiveSound = () => {
    receiveAudioRef.current?.play().catch(() => {});
  };

  return {
    playSendSound,
    playReceiveSound,
  };
}

