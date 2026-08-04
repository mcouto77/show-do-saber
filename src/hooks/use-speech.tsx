import { useCallback, useEffect, useRef, useState } from "react";

/** Leitura em voz alta usando a Web Speech API (sem envio de dados). */
export function useSpeech() {
  const [supported, setSupported] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const idRef = useRef<string | null>(null);

  useEffect(() => {
    setSupported(typeof window !== "undefined" && "speechSynthesis" in window);
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const stop = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    idRef.current = null;
    setSpeakingId(null);
  }, []);

  const speak = useCallback(
    (text: string, id: string) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
      if (idRef.current === id) {
        stop();
        return;
      }
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = "pt-BR";
      utter.rate = 0.95;
      utter.onend = () => {
        idRef.current = null;
        setSpeakingId(null);
      };
      utter.onerror = () => {
        idRef.current = null;
        setSpeakingId(null);
      };
      idRef.current = id;
      setSpeakingId(id);
      window.speechSynthesis.speak(utter);
    },
    [stop],
  );

  return { supported, speakingId, speak, stop };
}
