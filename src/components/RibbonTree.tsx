import { useEffect, useState, useRef } from "react";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  limit,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { getLocalUserId } from "../lib/auth-local";
import { motion, AnimatePresence } from "motion/react";
import { fortunes } from "../data/fortunes";

export interface Wish {
  id: string;
  category: "health" | "love" | "career" | "other";
  phrase: string;
  text?: string;
  userId?: string;
  x?: number;
  y?: number;
  createdAt: number;
}

interface RibbonTreeProps {
  inTreeMode?: boolean;
  onWishStateChange?: (isOpen: boolean) => void;
  language?: "zh" | "en";
}

export function RibbonTree({
  inTreeMode = false,
  onWishStateChange,
  language = "zh",
}: RibbonTreeProps) {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [selectedWish, setSelectedWish] = useState<Wish | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const isDragging = useRef(false);

  const handleSelectWish = (wish: Wish | null) => {
    if (wish && isDragging.current) return;
    setSelectedWish(wish);
    if (onWishStateChange) {
      onWishStateChange(!!wish);
    }
  };

  useEffect(() => {
    const q = query(
      collection(db, "wishes"),
      orderBy("createdAt", "desc"),
      limit(100),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedWishes: Wish[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          if (data.createdAt) {
            fetchedWishes.push({
              id: doc.id,
              category: data.category,
              phrase: data.phrase,
              text: data.text,
              userId: data.userId,
              x: data.x,
              y: data.y,
              createdAt: data.createdAt.toMillis
                ? data.createdAt.toMillis()
                : Date.now(),
            });
          }
        });
        setWishes(fetchedWishes);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, "wishes");
      },
    );

    return () => unsubscribe();
  }, []);

  const now = Date.now();
  const ONE_DAY = 24 * 60 * 60 * 1000;

  const handleDragEnd = async (wish: Wish, _event: any, info: any) => {
    // If the ribbon was dragged, update its position
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();

    // Convert absolute screen point to percentage of container
    const x = Math.min(
      95,
      Math.max(5, ((info.point.x - rect.left) / rect.width) * 100),
    );
    const y = Math.min(
      90,
      Math.max(10, ((info.point.y - rect.top) / rect.height) * 100),
    );

    try {
      await updateDoc(doc(db, "wishes", wish.id), { x, y });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `wishes/${wish.id}`);
    }

    // Delay resetting isDragging to prevent the coupled tap event
    setTimeout(() => {
      isDragging.current = false;
    }, 50);
  };

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-[55] pointer-events-none overflow-hidden ribbon-tree-container"
    >
      <AnimatePresence>
        {wishes.map((wish, index) => {
          const ageMs = Math.max(0, now - wish.createdAt);
          const daysOld = ageMs / ONE_DAY;

          if (daysOld > 7) return null;

          // Opacity decreases from 1 to 0.2 over 7 days
          const ribbonOpacity = Math.max(0.1, 1 - (daysOld / 7) * 0.8);
          // Use id string to generate stable random positions
          const hash = wish.id
            .split("")
            .reduce((acc, char) => acc + char.charCodeAt(0), 0);
          const top = wish.y !== undefined ? wish.y : 10 + (hash % 80); // 10% to 90% vertical
          const left = wish.x !== undefined ? wish.x : 5 + ((hash * 13) % 90); // 5% to 95% horizontal

          const isMine = wish.userId === getLocalUserId();

          const match =
            language === "en"
              ? fortunes.find((f) => f.quote === wish.phrase)
              : null;
          const displayPhrase = match ? match.enQuote : wish.phrase;

          return (
            <motion.div
              layout
              key={wish.id}
              drag={inTreeMode && isMine}
              dragConstraints={containerRef}
              dragElastic={0.1}
              dragMomentum={false}
              onDragStart={() => {
                isDragging.current = true;
              }}
              onDragEnd={(_e, info) => handleDragEnd(wish, _e, info)}
              onTap={() => inTreeMode && handleSelectWish(wish)}
              initial={{ opacity: 0, y: -20, rotate: -10, scale: 0.8 }}
              animate={{
                opacity: ribbonOpacity,
                y: 0,
                rotate: inTreeMode ? [-8, 8, -8] : [-2, 2, -2],
                scale: inTreeMode ? (isMine ? 1.4 : 1.15) : isMine ? 1.2 : 1,
              }}
              whileHover={
                inTreeMode
                  ? { scale: 1.3, zIndex: 50, transition: { duration: 0.2 } }
                  : {}
              }
              transition={{
                rotate: {
                  repeat: Infinity,
                  duration: inTreeMode ? 6 + (hash % 4) : 4 + (hash % 3),
                  ease: "easeInOut",
                },
                scale: { duration: 1.5, ease: "easeOut" },
                opacity: { duration: 1 },
              }}
              className={`absolute flex flex-col items-center backdrop-blur-[2px] rounded-[1px] px-1.5 py-3 border ${isMine ? "border-white/80 ring-2 ring-white/40" : "border-[#c4a46e]/40"} shadow-xl ${inTreeMode ? (isMine ? "pointer-events-auto cursor-grab active:cursor-grabbing" : "pointer-events-auto cursor-pointer") : "pointer-events-none"}`}
              style={{
                top: `${top}%`,
                left: `${left}%`,
                background: isMine
                  ? "linear-gradient(135deg, #ffffff 0%, #f0d5a3 50%, #c4a46e 100%)"
                  : "linear-gradient(135deg, #f0d5a3 0%, #c4a46e 100%)",
                boxShadow: isMine
                  ? "0 0 20px rgba(255,255,255,0.6), 0 4px 10px rgba(0,0,0,0.5)"
                  : "0 4px 10px rgba(0,0,0,0.5), inset 0 0 20px rgba(0,0,0,0.2)",
                animationDelay: `${hash % 5}s`,
                zIndex: isMine ? 40 : 10,
              }}
            >
              {/* Phrase text on the ribbon */}
              <div className="relative z-10 flex flex-col items-center overflow-hidden max-h-32">
                <span
                  className={`text-[9px] text-[#2a1d13] font-calligraphy [writing-mode:vertical-rl] ${language === "zh" ? "tracking-[0.1em]" : ""} font-bold opacity-90`}
                  style={{
                    textOrientation: language === "zh" ? "upright" : "mixed",
                  }}
                >
                  {displayPhrase.length > 25
                    ? displayPhrase.slice(0, 25) + "..."
                    : displayPhrase}
                </span>
              </div>

              {/* Red Ribbon SVG Header */}
              <div className="absolute -top-10 left-1/2 -ml-2 w-4 h-12 pointer-events-none">
                <svg
                  viewBox="0 0 20 60"
                  className="w-full h-full drop-shadow-sm"
                >
                  <motion.path
                    d="M10 0 C 15 10, 5 20, 10 30 C 15 40, 5 50, 10 60"
                    fill="none"
                    stroke="#e15941"
                    strokeWidth="3"
                    strokeLinecap="round"
                    animate={{
                      d: [
                        "M10 0 C 15 10, 5 20, 10 30 C 15 40, 5 50, 10 60",
                        "M10 0 C 5 10, 15 20, 10 30 C 5 40, 15 50, 10 60",
                        "M10 0 C 15 10, 5 20, 10 30 C 15 40, 5 50, 10 60",
                      ],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 3 + (hash % 2),
                      ease: "easeInOut",
                    }}
                  />
                </svg>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Selected Wish Overlay */}
      <AnimatePresence>
        {selectedWish &&
          (() => {
            const matchSelected =
              language === "en"
                ? fortunes.find((f) => f.quote === selectedWish.phrase)
                : null;
            const selectedPhrase = matchSelected
              ? matchSelected.enQuote
              : selectedWish.phrase;
            const selectedText =
              selectedWish.text === selectedWish.phrase
                ? selectedPhrase
                : selectedWish.text || selectedPhrase;

            return (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-auto p-6"
                onClick={() => handleSelectWish(null)}
              >
                <motion.div
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 20 }}
                  className="relative max-w-sm w-full p-12 bg-[#ebdcc8] shadow-2xl overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    backgroundImage: `url(/paper-texture.webp)`,
                    backgroundSize: "cover",
                    filter: "url(#roughpaper)",
                  }}
                >
                  <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_transparent_0%,_#3a2a1a_100%)] pointer-events-none" />

                  <div className="relative z-10 flex flex-col items-center">
                    <div className="w-12 h-[1px] bg-[#3a2a1a]/30 mb-8" />

                    <div
                      className={`text-2xl md:text-3xl text-[#3a2a1a] font-calligraphy leading-relaxed mb-6 text-center ${language === "zh" ? "[writing-mode:vertical-rl] tracking-widest" : "tracking-normal"}`}
                      style={
                        language === "zh" ? { textOrientation: "upright" } : {}
                      }
                    >
                      {selectedPhrase}
                    </div>

                    {selectedWish.text &&
                      selectedWish.text !== selectedWish.phrase && (
                        <div className="flex flex-col items-center mt-2 mb-4 w-full">
                          <span className="text-sm text-[#3a2a1a]/40 font-serif mb-4 flex items-center gap-2">
                            <span className="w-4 h-[1px] bg-current" />
                            {language === "zh" ? "愿" : "Wish"}
                            <span className="w-4 h-[1px] bg-current" />
                          </span>
                          <div
                            className={`text-lg md:text-xl text-[#3a2a1a]/80 font-calligraphy leading-relaxed max-h-[30vh] md:max-h-[40vh] overflow-y-auto w-full text-center ${language === "zh" ? "[writing-mode:vertical-rl] tracking-wider" : "tracking-normal"}`}
                            style={
                              language === "zh"
                                ? { textOrientation: "upright" }
                                : {}
                            }
                          >
                            {selectedText}
                          </div>
                        </div>
                      )}

                    <div className="w-12 h-[1px] bg-[#3a2a1a]/30 mt-4 mb-6" />

                    <p className="text-[#3a2a1a]/50 text-xs font-serif italic mb-8">
                      {new Date(selectedWish.createdAt).toLocaleDateString()}
                    </p>

                    <button
                      onClick={() => handleSelectWish(null)}
                      className={`px-6 py-2 border border-[#3a2a1a]/30 text-[#3a2a1a]/60 hover:text-[#3a2a1a] hover:border-[#3a2a1a] transition-all text-xs ${language === "zh" ? "tracking-widest" : "tracking-wide"}`}
                    >
                      {language === "zh" ? "返回" : "Close"}
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            );
          })()}
      </AnimatePresence>
    </div>
  );
}
