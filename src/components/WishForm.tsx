import { useState, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { collection, addDoc } from "firebase/firestore";
import {
  db,
  serverTimestamp,
  handleFirestoreError,
  OperationType,
} from "../lib/firebase";
import { getLocalUserId } from "../lib/auth-local";
import { processWish } from "../lib/wishProcessor";

interface WishFormProps {
  onComplete: () => void;
  onTying?: () => void;
  onSkip: () => void;
  language: "zh" | "en";
  fortunePhrase?: string;
}

export function WishForm({
  onComplete,
  onTying,
  onSkip,
  language,
  fortunePhrase,
}: WishFormProps) {
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const trimmedText = text.trim();
    setIsSubmitting(true);

    try {
      await addDoc(collection(db, "wishes"), {
        text: trimmedText || "",
        phrase: fortunePhrase || trimmedText || "福", // Fallback to '福' if everything is empty
        userId: getLocalUserId(),
        createdAt: serverTimestamp(),
      });

      setSuccess(true);
      if (onTying) onTying();
      setTimeout(() => {
        onComplete();
      }, 2500);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "wishes");
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="mt-8 w-full max-w-sm"
    >
      <AnimatePresence mode="wait">
        {!success ? (
          <motion.form
            key="form"
            onSubmit={handleSubmit}
            className="flex flex-col gap-3"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <p className="text-center text-[#3a2a1a]/60 text-sm mb-2 font-serif">
              {language === "zh"
                ? "将祈愿系于风中，化作福报印记"
                : "Tie your wish to the wind"}
            </p>
            <input
              type="text"
              maxLength={20}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={
                language === "zh"
                  ? "在此写下祈愿 (可选, 最多20字)"
                  : "Write your wish... (optional, limit 20)"
              }
              className="px-4 py-3 bg-[#3a2a1a]/5 border border-[#3a2a1a]/20 rounded-sm text-center focus:outline-none focus:border-[#e15941]/50 text-[#3a2a1a] placeholder:text-[#3a2a1a]/40 transition-colors font-medium"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onSkip}
                className={`flex-1 py-3 bg-transparent border border-[#3a2a1a]/20 text-[#3a2a1a]/60 rounded-sm hover:text-[#3a2a1a] hover:border-[#3a2a1a]/40 transition-all text-sm font-medium ${language === "zh" ? "tracking-widest" : "tracking-wide"}`}
              >
                {language === "zh" ? "跳过" : "Skip"}
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`flex-1 py-3 bg-[#8b2b2b] text-[#f4ebd9] rounded-sm hover:bg-[#a63333] transition-colors shadow-sm disabled:opacity-50 text-sm ${language === "zh" ? "tracking-widest" : "tracking-wide"}`}
              >
                {isSubmitting
                  ? language === "zh"
                    ? "化印中..."
                    : "Sending..."
                  : language === "zh"
                    ? "挂送福签"
                    : "Tie wish"}
              </button>
            </div>
          </motion.form>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-4 flex flex-col items-center justify-center relative z-50"
          >
            {/* The primary visual: The clean red ribbon/pendant asset with falling animation */}
            <motion.div
              initial={{ y: -1000, opacity: 0, rotate: -10 }}
              animate={{ y: 0, opacity: 1, rotate: 0 }}
              transition={{
                type: "spring",
                damping: 12,
                stiffness: 90,
                duration: 0.8,
                delay: 0.05,
              }}
              className="relative w-[350px] h-[600px] md:w-[500px] md:h-[850px] drop-shadow-[0_50px_100px_rgba(0,0,0,0.9)]"
            >
              <img
                src="/qian-red.png"
                alt=""
                className="w-full h-full object-contain"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="mt-4"
            >
              <p
                className={`text-[#8b2b2b] font-calligraphy text-4xl mb-4 drop-shadow-lg ${language === "zh" ? "tracking-[0.5em]" : "tracking-wide"}`}
              >
                {language === "zh" ? "祈愿已系" : "Wish tied"}
              </p>
              <p
                className={`text-[#ffffff]/80 text-lg font-serif drop-shadow-md ${language === "zh" ? "tracking-[0.2em]" : "tracking-wide"}`}
              >
                {language === "zh"
                  ? "风声会记得你的愿望"
                  : "The wind remembers."}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
