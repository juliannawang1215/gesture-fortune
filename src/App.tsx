/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from "motion/react";
import { useRef, useState, useCallback, useEffect } from "react";
import { fortunes, Fortune } from "./data/fortunes";
import { useHandTracker } from "./hooks/useHandTracker";
import {
  Hand,
  Music,
  VolumeX,
  Wind,
  ChevronDown,
  ChevronUp,
  Languages,
  RotateCcw,
  Compass,
} from "lucide-react";
import { RibbonTree } from "./components/RibbonTree";
import { WishForm } from "./components/WishForm";
import { IncenseSmoke } from "./components/IncenseSmoke";

type AppState =
  | "INITIALIZING"
  | "WAITING"
  | "SHAKING"
  | "DRAWING"
  | "RESULT"
  | "TREE"
  | "SCENE";
type Language = "zh" | "en";

import { GaussianSplatViewer } from "./components/GaussianSplatViewer";

export default function App() {
  const [appState, setAppState] = useState<AppState>("INITIALIZING");
  const [currentFortune, setCurrentFortune] = useState<Fortune | null>(null);
  const [shakeIntensity, setShakeIntensity] = useState<number>(0);
  const [isMusicPlaying, setIsMusicPlaying] = useState<boolean>(true);
  const [isAdviceExpanded, setIsAdviceExpanded] = useState<boolean>(false);
  const [isTying, setIsTying] = useState<boolean>(false);
  const [language, setLanguage] = useState<Language>(() => {
    const params = new URLSearchParams(
      typeof window !== "undefined" ? window.location.search : "",
    );
    return params.get("lang") === "en" ? "en" : "zh";
  });
  const [isWishDetailOpen, setIsWishDetailOpen] = useState<boolean>(false);
  const [currentScene, setCurrentScene] = useState<"TREE" | "TEMPLE">("TREE");
  const [showSceneUnavailableHint, setShowSceneUnavailableHint] = useState(false);

  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get("lang") !== language) {
      url.searchParams.set("lang", language);
      window.history.replaceState({}, "", url);
    }
  }, [language]);

  const splatTreeUrl = (import.meta as any).env.VITE_SPLAT_URL || "";
  const splatTempleUrl = (import.meta as any).env.VITE_SPLAT_TEMPLE_URL || "";
  const splatUrl = currentScene === "TREE" ? splatTreeUrl : splatTempleUrl;
  const hasSplatAssets = Boolean(splatTreeUrl && splatTempleUrl);

  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleShake = useCallback((intensity: number) => {
    setAppState((prev) => {
      // If we are waiting, start shaking
      if (prev === "WAITING" || prev === "RESULT") {
        setShakeIntensity(intensity);
        return "SHAKING";
      }
      return prev;
    });
  }, []);

  const { isReady, hasCameraPermission, isHandVisible, requestCamera } =
    useHandTracker(videoRef, handleShake);

  // We intentionally do not auto-transition to WAITING so the user can click "Start"
  useEffect(() => {
    let lastTime = 0;
    let lastX = 0,
      lastY = 0,
      lastZ = 0;

    const handleDeviceMotion = (e: DeviceMotionEvent) => {
      if (appState !== "WAITING") return;
      const acc = e.accelerationIncludingGravity;
      if (!acc) return;

      const current = Date.now();
      if (current - lastTime > 100) {
        const diffTime = current - lastTime;
        lastTime = current;

        const x = acc.x || 0;
        const y = acc.y || 0;
        const z = acc.z || 0;

        const speed =
          (Math.abs(x + y + z - lastX - lastY - lastZ) / diffTime) * 10000;

        // Threshold for shaking, 1500 is a good standard for "not just moving the phone around"
        if (speed > 1500) {
          handleShake(Math.min(speed / 3000, 1));
        }

        lastX = x;
        lastY = y;
        lastZ = z;
      }
    };

    window.addEventListener("devicemotion", handleDeviceMotion);
    return () => window.removeEventListener("devicemotion", handleDeviceMotion);
  }, [appState, handleShake]);

  useEffect(() => {
    if (appState === "SHAKING") {
      const timer = setTimeout(() => {
        const seed = Math.floor(shakeIntensity * 100) + new Date().getSeconds();
        const fortune = fortunes[Math.abs(seed) % fortunes.length];
        setCurrentFortune(fortune);
        setAppState("DRAWING");

        setTimeout(() => {
          setAppState("RESULT");
        }, 800); // Match animation duration
      }, 800); // Shorter shake duration

      return () => clearTimeout(timer);
    }
  }, [appState, shakeIntensity]);

  useEffect(() => {
    if (audioRef.current && isMusicPlaying) {
      audioRef.current.play().catch((e) => {
        console.log("Autoplay failed, falling back to interaction handler:", e);
        const handleFirstInteraction = () => {
          if (audioRef.current && isMusicPlaying) {
            audioRef.current.play().catch(console.error);
          }
          window.removeEventListener("click", handleFirstInteraction);
          window.removeEventListener("touchstart", handleFirstInteraction);
        };
        window.addEventListener("click", handleFirstInteraction);
        window.addEventListener("touchstart", handleFirstInteraction);
      });
    } else if (audioRef.current && !isMusicPlaying) {
      audioRef.current.pause();
    }
  }, [isMusicPlaying]);

  useEffect(() => {
    if (appState === "SCENE" && !hasSplatAssets) {
      setAppState("TREE");
      setShowSceneUnavailableHint(true);
    }
  }, [appState, hasSplatAssets]);

  useEffect(() => {
    if (!showSceneUnavailableHint) return;
    const timer = window.setTimeout(
      () => setShowSceneUnavailableHint(false),
      3500,
    );
    return () => window.clearTimeout(timer);
  }, [showSceneUnavailableHint]);

  const toggleMusic = () => {
    if (!audioRef.current) return;

    if (isMusicPlaying) {
      audioRef.current.pause();
      setIsMusicPlaying(false);
    } else {
      audioRef.current
        .play()
        .catch((e) => console.log("Audio play failed:", e));
      setIsMusicPlaying(true);
    }
  };

  const toggleSceneMode = useCallback(() => {
    if (!hasSplatAssets) {
      setShowSceneUnavailableHint(true);
      return;
    }
    setAppState((prev) => (prev === "SCENE" ? "TREE" : "SCENE"));
  }, [hasSplatAssets]);

  const reset = () => {
    setCurrentFortune(null);
    setAppState("WAITING");
    setIsAdviceExpanded(false);
    setIsTying(false);
    setIsWishDetailOpen(false);
  };

  return (
    <div className="relative min-h-screen w-full bg-[#14100c] text-[#f4ebd9] font-serif overflow-hidden select-none">
      {/* Layer 1: Background Images (Transitions on TREE state) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Main qiantong background */}
        <img
          src="/bg.png"
          alt=""
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-[2000ms] ease-in-out ${
            appState === "TREE" || appState === "SCENE"
              ? "opacity-0 scale-105 blur-[4px]"
              : appState === "SHAKING"
                ? "opacity-80 blur-[8px] scale-[1.08]"
                : "opacity-80 blur-[4px] scale-[1.04]"
          }`}
        />
        {/* Wishing tree background */}
        <img
          src="/bg-tree.png"
          alt=""
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-[2000ms] ease-in-out ${
            appState === "TREE" || appState === "SCENE"
              ? "opacity-100 blur-none scale-100"
              : "opacity-0 blur-[8px] scale-95"
          }`}
        />
        {/* Noise overlay */}
        <div className="absolute inset-0 z-10 opacity-20 paper-texture mix-blend-overlay" />
      </div>

      {appState === "TREE" && (
        <RibbonTree
          inTreeMode={true}
          onWishStateChange={setIsWishDetailOpen}
          language={language}
        />
      )}

      {appState === "SCENE" && (
        <div className="absolute inset-0 z-10 bg-black overflow-hidden">
          <GaussianSplatViewer plyUrl={splatUrl} />
        </div>
      )}

      {appState === "TREE" && <IncenseSmoke />}

      {/* Layer 1.5: Ambient Floating Dust Particles */}
      <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden mix-blend-screen opacity-50">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-[#f4ebd9] animate-drift blur-[1px]"
            style={{
              width: Math.random() * 5 + 2 + "px",
              height: Math.random() * 5 + 2 + "px",
              left: Math.random() * 100 + "%",
              bottom: "-10%",
              animationDelay: `-${Math.random() * 20}s`,
              animationDuration: `${10 + Math.random() * 15}s`,
              opacity: Math.random() * 0.4 + 0.1,
            }}
          />
        ))}
      </div>

      {/* Layer 2: Foreground Fog & Vignette */}
      <div
        className="absolute inset-0 z-30 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 50% 60%, transparent 10%, rgba(20, 16, 12, 0.6) 100%)",
        }}
      />
      <div className="absolute bottom-0 left-0 right-0 h-1/2 z-30 pointer-events-none bg-gradient-to-t from-[#2a1d13]/90 to-transparent" />

      {/* Layer 2.5: Mid-ground Light Bloom (Separates Qiantong from Background) */}
      <div
        className="absolute bottom-[-10%] left-1/2 -translate-x-1/2 w-[120vw] md:w-[800px] h-[600px] z-30 pointer-events-none mix-blend-screen transition-opacity duration-700"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(225, 89, 65, 0.15) 0%, rgba(20, 16, 12, 0) 60%)",
          opacity: appState === "SHAKING" ? 1 : 0.6,
        }}
      />

      {/* Hidden Camera feed for tracking */}
      <video
        ref={videoRef}
        playsInline
        autoPlay
        muted
        className="absolute w-1 h-1 opacity-0 -z-50 pointer-events-none"
      />

      {/* Hidden Audio */}
      <audio
        ref={audioRef}
        src="/bg_music.mp3"
        loop
        preload="auto"
        autoPlay={isMusicPlaying}
      />

      {/* Top Controls */}
      <div className="absolute top-6 left-6 right-6 flex justify-between z-40 opacity-80">
        <div className="flex gap-4">
          <button
            onClick={() => setLanguage((prev) => (prev === "zh" ? "en" : "zh"))}
            className="px-4 py-2 flex items-center gap-2 border border-[#f4ebd9]/30 rounded-full hover:bg-white/10 transition text-[#f4ebd9] text-sm font-medium tracking-widest"
          >
            <Languages className="w-4 h-4" />
            {language === "zh" ? "En" : "中"}
          </button>
        </div>
        <button
          onClick={toggleMusic}
          className="p-3 border border-[#f4ebd9]/30 rounded-full hover:bg-white/10 transition text-[#f4ebd9]"
        >
          {isMusicPlaying ? (
            <Music className="w-5 h-5" />
          ) : (
            <VolumeX className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Title Area */}
      <AnimatePresence>
        {appState === "WAITING" && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5 }}
            className="relative z-40 pt-12 md:pt-16 flex flex-col items-center pointer-events-none"
          >
            <h1
              className={`text-2xl md:text-3xl font-calligraphy mb-2 drop-shadow-lg text-[#f4ebd9] ml-4 ${language === "zh" ? "tracking-[0.1em]" : "tracking-normal"}`}
            >
              {language === "zh" ? "摇一摇" : "Shake"}
            </h1>
            <h2
              className={`text-base md:text-xl opacity-90 mb-2 ml-2 font-calligraphy text-[#f4ebd9] ${language === "zh" ? "tracking-[0.2em]" : "tracking-wide"}`}
            >
              {language === "zh" ? "让签指引你" : "Let it guide you"}
            </h2>
            <div
              className={`flex items-center gap-4 opacity-70 text-xs -mt-1 text-[#f4ebd9]/80 ${language === "zh" ? "tracking-widest" : "tracking-wide"}`}
            >
              <span className="text-[#e15941]">◇</span>
              <span>
                {language === "zh"
                  ? "想一件事，摇动或点击签筒"
                  : "Think of a question, shake/click the holder"}
              </span>
              <span className="text-[#e15941]">◇</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Side Prompts (Floating) */}
      <AnimatePresence>
        {appState === "WAITING" && (
          <>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 0.8, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5 }}
              className="hidden md:flex absolute top-[45%] -translate-y-1/2 left-4 md:left-12 flex-col items-center gap-8 py-8 px-2 md:px-3 border border-[#f4ebd9]/30 rounded-full backdrop-blur-sm z-40 text-[#f4ebd9]"
            >
              <motion.div
                animate={{
                  scale: isHandVisible ? 1.2 : 1,
                  color: isHandVisible ? "#e15941" : "#f4ebd9",
                }}
              >
                <Hand className="w-6 h-6 md:w-7 md:h-7 mb-2" />
              </motion.div>
              <span
                className={`vertical-text text-sm drop-shadow-md ${language === "zh" ? "tracking-widest" : "tracking-wide"}`}
              >
                {language === "zh" ? "举起手" : "Raise hand"}
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 0.8, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.5 }}
              className="hidden md:flex absolute top-[45%] -translate-y-1/2 right-4 md:right-12 flex-col items-center gap-8 py-8 px-2 md:px-3 border border-[#f4ebd9]/30 rounded-full backdrop-blur-sm z-40 text-[#f4ebd9]"
            >
              <motion.div
                animate={
                  appState === "SHAKING"
                    ? { rotate: [-10, 10, -10], color: "#f4ebd9" }
                    : {}
                }
                transition={{ repeat: Infinity, duration: 0.2 }}
              >
                <Wind className="w-6 h-6 md:w-7 md:h-7 mb-2" />
              </motion.div>
              <span
                className={`vertical-text text-sm drop-shadow-md ${language === "zh" ? "tracking-widest" : "tracking-wide"}`}
              >
                {language === "zh" ? "轻轻摇动" : "Shake gently"}
              </span>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Qiantong (Stick Holder) & Sticks */}
      <AnimatePresence>
        {appState !== "TREE" && appState !== "SCENE" && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 200, scale: 0.9 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="absolute bottom-[32px] md:bottom-[64px] left-1/2 -translate-x-1/2 w-[450px] h-[600px] flex items-end justify-center pointer-events-none scale-100 md:scale-125 origin-bottom z-50"
          >
            <motion.div
              className={`relative w-full h-full drop-shadow-[0_30px_40px_rgba(0,0,0,0.8)] pointer-events-auto cursor-pointer ${appState === "WAITING" ? "animate-float-slow" : ""}`}
              animate={
                appState === "SHAKING"
                  ? {
                      x: [-7.5, 7.5, -7.5],
                      y: [-4.5, 4.5, -4.5],
                      rotate: [-2, 2, -2],
                    }
                  : {}
              }
              transition={{ repeat: Infinity, duration: 0.15 }}
              onClick={() => appState === "WAITING" && handleShake(0.8)}
            >
              {/* Back image: Full barrel with sticks (z-0) */}
              <img
                src="/qiantong-full.png"
                alt=""
                className="absolute inset-0 w-full h-full object-contain object-bottom pointer-events-none z-0"
              />

              {/* Winning Stick Container - Masked exactly at the rim curve */}
              <div
                className="absolute inset-0 z-10 pointer-events-none"
                style={{
                  /* Cuts off the bottom of the stick with a slight downward curve imitating the barrel lip */
                  clipPath:
                    "polygon(0% -200%, 100% -200%, 100% 41%, 85% 43%, 50% 45%, 15% 43%, 0% 41%)",
                  perspective: "1200px",
                }}
              >
                <motion.div
                  initial={{
                    x: "-50%",
                    y: 150,
                    z: 0,
                    rotateX: 0,
                    rotateY: 0,
                    rotateZ: 0,
                    scale: 0,
                  }}
                  animate={{
                    y:
                      appState === "RESULT" || appState === "DRAWING"
                        ? -450
                        : 150,
                    x: "-50%",
                    z: 0,
                    scale:
                      appState === "RESULT" || appState === "DRAWING" ? 1 : 0,
                    rotateX: 0,
                    rotateY: 0,
                    rotateZ: 0,
                  }}
                  transition={{
                    duration: 0.8, // Faster than the 1s state delay to ensure completion
                    ease: [0.34, 1.56, 0.64, 1], // Bouncy ease-out to feel like it's popping out
                  }}
                  className="absolute origin-center flex flex-col items-center justify-end"
                  style={{
                    height: `465px`,
                    left: `50%`,
                    bottom: `45%`,
                    zIndex: 50,
                    transformStyle: "preserve-3d",
                  }}
                >
                  <div className="relative h-full flex flex-col items-center">
                    <img
                      src="/qian.png"
                      alt=""
                      className="h-full w-auto object-contain object-bottom drop-shadow-sm"
                    />
                  </div>
                </motion.div>
              </div>

              {/* Front image mask (barrel outer front) - Cropped exactly at the rim curve */}
              <div
                className="absolute inset-0 z-20 pointer-events-none overflow-hidden"
                style={{
                  /* Inverted polygon to cover everything below the rim */
                  clipPath:
                    "polygon(0% 41%, 15% 43%, 50% 45%, 85% 43%, 100% 41%, 100% 100%, 0% 100%)",
                }}
              >
                <img
                  src="/qiantong-full.png"
                  alt=""
                  className="absolute inset-0 w-full h-full object-contain object-bottom"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Booting/Uninitialized Overlays */}
      <AnimatePresence>
        {appState === "INITIALIZING" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{
              opacity: 0,
              transition: { duration: 2.5, ease: "easeOut" },
            }}
            className="absolute inset-0 z-[60] flex flex-col justify-center items-center overflow-hidden"
          >
            {/* Background Layer */}
            <motion.div
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.8 } }}
              className="absolute inset-0 bg-[#e3d5c1]/90 backdrop-blur-md"
            />

            {/* Content Layer */}
            <motion.div
              initial={{ opacity: 1, scale: 1 }}
              exit={{
                opacity: 0,
                scale: 1.1,
                filter: "blur(10px)",
                transition: { duration: 0.8 },
              }}
              className="relative z-10"
            >
              {!isReady ? (
                <div className="flex flex-col items-center gap-6 text-[#3a2a1a]">
                  <div className="w-10 h-10 border-2 border-[#3a2a1a]/20 border-t-[#3a2a1a] rounded-full animate-spin" />
                  <p
                    className={`opacity-80 text-sm font-medium ${language === "zh" ? "tracking-[0.3em]" : "tracking-wider"}`}
                  >
                    {language === "zh" ? "静候神机..." : "Loading AI..."}
                  </p>
                </div>
              ) : (
                <div className="text-center p-8 bg-[#f4ebd9] border border-[#c0a683] shadow-xl text-[#3a2a1a] flex flex-col items-center">
                  <p
                    className={`text-xl font-bold mb-4 font-calligraphy ${language === "zh" ? "tracking-widest" : "tracking-wide"}`}
                  >
                    {language === "zh" ? "开启求签" : "Enter"}
                  </p>
                  <p className="opacity-80 text-sm mb-6">
                    {language === "zh"
                      ? "将请求使用相机进行手势感应"
                      : "Will request camera for gestures"}
                  </p>
                  <button
                    onClick={() => {
                      requestCamera();
                      if (audioRef.current && isMusicPlaying) {
                        audioRef.current
                          .play()
                          .catch((e) => console.log("Audio play failed:", e));
                      }
                      setAppState("WAITING");
                    }}
                    className={`px-8 py-3 bg-[#3a2a1a] text-[#f4ebd9] rounded hover:bg-[#2a1d13] transition-colors shadow-sm ${language === "zh" ? "tracking-widest" : "tracking-wide"}`}
                  >
                    {language === "zh" ? "允许并进入" : "Allow & enter"}
                  </button>
                  <button
                    onClick={() => {
                      if (audioRef.current && isMusicPlaying) {
                        audioRef.current
                          .play()
                          .catch((e) => console.log("Audio play failed:", e));
                      }
                      setAppState("WAITING");
                    }}
                    className="mt-6 text-xs opacity-60 underline hover:opacity-100 transition-opacity"
                  >
                    {language === "zh" ? "不使用相机直接进入" : "Skip camera"}
                  </button>
                </div>
              )}
            </motion.div>

            {/* Smoke Particles on Exit */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={`smoke-${i}`}
                className="absolute top-1/2 left-1/2 w-[60vmin] h-[60vmin] rounded-full pointer-events-none mix-blend-screen"
                style={{
                  background:
                    "radial-gradient(circle, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0) 70%)",
                  x: "-50%",
                  y: "-50%",
                }}
                initial={{ scale: 0, opacity: 0 }}
                exit={{
                  scale: [0.8, 3 + Math.random() * 2],
                  opacity: [0.8, 0],
                  x: `calc(-50% + ${(Math.random() - 0.5) * 60}vw)`,
                  y: `calc(-50% + ${(Math.random() - 0.5) * 60}vh)`,
                }}
                transition={{
                  duration: 2 + Math.random() * 1.5,
                  ease: "easeOut",
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result Overlay */}
      <svg
        style={{
          visibility: "hidden",
          position: "absolute",
          width: 0,
          height: 0,
        }}
        xmlns="http://www.w3.org/2000/svg"
        version="1.1"
      >
        <defs>
          <filter id="roughpaper" x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.01"
              numOctaves="5"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="12"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      {/* Golden Flash Effect */}
      <AnimatePresence>
        {(appState === "DRAWING" || appState === "RESULT") && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0, 1, 0] }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 1.5,
              times: [0, 0.5, 0.7, 1],
              ease: "easeOut",
            }}
            className="absolute inset-0 z-[60] mix-blend-screen pointer-events-none flex items-center justify-center"
          >
            {/* Core bright light */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,_#ffffff_0%,_#ffe58f_15%,_#fbad22_40%,_transparent_70%)]" />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {appState === "RESULT" && currentFortune && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 z-[70] bg-black/50 backdrop-blur-sm flex flex-col justify-center items-center px-4"
            onClick={reset}
          >
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.3, type: "spring", bounce: 0.3 }}
              className="relative w-full max-w-[480px] p-8 md:p-10"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Irregular Rough Paper Background */}
              {!isTying && (
                <div
                  className="absolute inset-0 z-0"
                  style={{ filter: "drop-shadow(0 25px 40px rgba(0,0,0,0.4))" }}
                >
                  <div
                    className="absolute inset-0 bg-[#ebdcc8]"
                    style={{
                      backgroundImage: `url(/paper-texture.webp)`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      filter: "url(#roughpaper)",
                      borderRadius: "2px",
                    }}
                  >
                    <div className="absolute inset-0 shadow-[inset_0_0_40px_rgba(139,115,85,0.15)] mix-blend-multiply" />
                  </div>
                </div>
              )}

              <div className="text-center relative z-10 pt-4">
                {!isTying && (
                  <motion.div
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="mx-auto w-12 h-12 flex items-center justify-center border border-[#3a2a1a] rounded-full mb-6 relative bg-[#ebdcc8] shadow-sm">
                      <span className="text-[#3a2a1a] text-xl font-calligraphy">
                        解
                      </span>
                    </div>

                    <h2
                      className={`text-3xl md:text-4xl text-[#2a1d13] mb-2 leading-tight font-calligraphy ${language === "zh" ? "tracking-[0.1em]" : "tracking-normal"}`}
                    >
                      {currentFortune.quote}
                    </h2>
                    <p className="text-sm md:text-base text-[#5a3a2a] italic mb-6 font-serif">
                      {currentFortune.enQuote}
                    </p>

                    <div className="my-6 h-[1px] w-48 mx-auto bg-gradient-to-r from-transparent via-[#3a2a1a]/40 to-transparent" />

                    <p className="text-base md:text-lg text-[#3a2a1a] leading-relaxed mb-2 font-medium tracking-wide">
                      {currentFortune.explanation}
                    </p>
                    <p className="text-xs md:text-sm text-[#5a3a2a] leading-relaxed mb-6 font-serif">
                      {currentFortune.enExplanation}
                    </p>

                    <div className="bg-[#3a2a1a]/[0.05] p-5 border border-[#3a2a1a]/20 mt-4 backdrop-blur-sm overflow-hidden transition-all duration-500">
                      <button
                        className="w-full flex items-center justify-between border-b border-[#3a2a1a]/20 pb-2 cursor-pointer focus:outline-none"
                        onClick={() => setIsAdviceExpanded(!isAdviceExpanded)}
                      >
                        <div>
                          <span
                            className={`block text-left text-[#3a2a1a] font-calligraphy text-sm ${language === "zh" ? "tracking-widest" : "tracking-wide"}`}
                          >
                            {language === "zh" ? "指引建议" : "Guidance"}
                          </span>
                          <span
                            className={`block text-left text-[#3a2a1a]/80 text-[9px] mt-0.5 font-serif ${language === "zh" ? "tracking-wider" : "tracking-normal"}`}
                          >
                            Advice
                          </span>
                        </div>
                        <div className="text-[#3a2a1a]/60">
                          {isAdviceExpanded ? (
                            <ChevronUp className="w-5 h-5" />
                          ) : (
                            <ChevronDown className="w-5 h-5" />
                          )}
                        </div>
                      </button>
                      <AnimatePresence initial={false}>
                        {isAdviceExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <div className="pt-3">
                              <p className="text-[#5a3a2a] text-left text-[15px] leading-relaxed tracking-wide mb-2">
                                {currentFortune.advice}
                              </p>
                              <p className="text-[#5a3a2a]/80 text-left text-xs leading-relaxed font-serif">
                                {currentFortune.enAdvice}
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}
              </div>

              <div
                className={`${isTying ? "absolute inset-0 flex items-center" : "relative mt-10"} z-10 w-full flex justify-center`}
              >
                <WishForm
                  fortunePhrase={currentFortune.quote}
                  onTying={() => setIsTying(true)}
                  onComplete={() => {
                    setCurrentFortune(null);
                    setAppState("TREE");
                    setIsTying(false);
                  }}
                  onSkip={reset}
                  language={language}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ribbon Tree Page UI */}
      <AnimatePresence>
        {appState === "TREE" && !isWishDetailOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 z-[60] flex flex-col justify-between px-6 py-12 items-center pointer-events-none"
          >
            <div className="flex flex-col items-center mt-8 pointer-events-auto text-center max-w-lg">
              <h1
                className={`text-4xl md:text-5xl font-calligraphy mb-4 text-[#f4ebd9] drop-shadow-lg [text-shadow:_0_2px_10px_rgba(0,0,0,0.8)] ${language === "zh" ? "tracking-[0.2em]" : "tracking-wide"}`}
              >
                {language === "zh" ? "祈福树" : "Wishing Tree"}
              </h1>
              <p
                className={`text-sm md:text-base text-[#f4ebd9]/80 font-serif leading-relaxed px-4 ${language === "zh" ? "tracking-widest" : "tracking-wide"}`}
              >
                {language === "zh"
                  ? "将心中的祈愿化作丝带，与千百人的希冀同悬于风中。时间会淡化笔迹，但风声会记得。"
                  : "Ribbons fluttering in the wind, carrying the wishes of many. They may fade, but the wind remembers."}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Button to go to Tree Page from Waiting */}
      <AnimatePresence>
        {(appState === "WAITING" ||
          appState === "TREE" ||
          appState === "SCENE") && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="absolute bottom-6 right-6 md:bottom-10 md:right-10 z-40 flex flex-col gap-4"
          >
            {/* 3D Mode & Scene Toggle */}
            {(appState === "TREE" || appState === "SCENE") && (
              <div className="flex flex-col gap-3">
                {appState === "SCENE" && splatTreeUrl && splatTempleUrl && (
                  <button
                    onClick={() =>
                      setCurrentScene(
                        currentScene === "TREE" ? "TEMPLE" : "TREE",
                      )
                    }
                    className="group flex flex-col items-center gap-2"
                  >
                    <div className="w-12 h-12 rounded-full border border-white/20 bg-white/5 backdrop-blur flex items-center justify-center hover:bg-white/20 transition-all duration-300 shadow-lg hover:scale-110">
                      <Compass className="w-5 h-5 text-white/80" />
                    </div>
                    <span
                      className={`text-[#f4ebd9]/70 text-[10px] mb-1 ${language === "zh" ? "tracking-widest" : "tracking-wide"}`}
                    >
                      {currentScene === "TREE"
                        ? language === "zh"
                          ? "前往灵隐"
                          : "To temple"
                        : language === "zh"
                          ? "回祈福树"
                          : "To tree"}
                    </span>
                  </button>
                )}

                <button
                  onClick={toggleSceneMode}
                  className="group flex flex-col items-center gap-2"
                >
                  <div
                    className={`w-12 h-12 rounded-full border ${appState === "SCENE" ? "border-amber-400/60 bg-amber-400/20" : "border-[#f4ebd9]/30 bg-white/10"} backdrop-blur flex items-center justify-center transition-all duration-300 shadow-lg ${hasSplatAssets ? "hover:scale-110" : "opacity-45 cursor-not-allowed"}`}
                  >
                    <RotateCcw
                      className={`w-5 h-5 transition-transform duration-500 ${appState === "SCENE" ? "rotate-180 text-amber-400" : "text-[#f4ebd9]/80"}`}
                    />
                  </div>
                  <span
                    className={`text-[#f4ebd9]/70 text-[10px] mb-1 ${language === "zh" ? "tracking-widest" : "tracking-wide"}`}
                  >
                    {appState === "SCENE"
                      ? language === "zh"
                        ? "返回普通"
                        : "Exit 3D"
                      : language === "zh"
                        ? "实景沉浸"
                        : "3D scene"}
                  </span>
                </button>

                {showSceneUnavailableHint && (
                  <p className="max-w-[170px] text-center text-[10px] leading-relaxed text-[#f4ebd9]/90 bg-black/55 border border-white/10 rounded-md px-3 py-2">
                    {language === "zh"
                      ? "沉浸场景暂未开放，正在维护中。"
                      : "Immersive scene is temporarily unavailable."}
                  </p>
                )}
              </div>
            )}

            <button
              onClick={() => {
                if (appState === "TREE" || appState === "SCENE") {
                  reset();
                } else {
                  setAppState("TREE");
                }
              }}
              className="group flex flex-col items-center gap-2"
            >
              <div className="w-12 h-12 rounded-full border border-[#e15941]/40 bg-[#e15941]/10 backdrop-blur flex items-center justify-center hover:bg-[#e15941]/20 transition-all duration-300 shadow-lg hover:scale-110">
                {appState === "TREE" || appState === "SCENE" ? (
                  <img
                    src="/qiantong-full.png"
                    alt=""
                    className="w-6 h-6 object-contain opacity-80"
                  />
                ) : (
                  <div className="w-[2px] h-6 bg-[#e15941] shadow-[0_0_8px_rgba(225,89,65,0.8)]" />
                )}
              </div>
              <span
                className={`text-[#f4ebd9]/70 text-[10px] mb-1 ${language === "zh" ? "tracking-widest" : "tracking-wide"}`}
              >
                {appState === "TREE" || appState === "SCENE"
                  ? language === "zh"
                    ? "求签"
                    : "Oracle"
                  : language === "zh"
                    ? "祈福树"
                    : "Tree"}
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
