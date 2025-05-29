import type React from "react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp, Grid, Scan } from "lucide-react";

import type { CardData } from "@/types/card";
import { IOSAppSwitcher } from "@/components/IosAppSwitcher";
import { Cards } from "./Card";

interface CardStackProps {
  cards: CardData[];
  setCards: React.Dispatch<React.SetStateAction<CardData[]>>;
  minimizedCards: CardData[];
  setMinimizedCards: React.Dispatch<React.SetStateAction<CardData[]>>;
}

export function CardStack({
  cards,
  setCards,
  minimizedCards,
  setMinimizedCards,
}: CardStackProps) {
  const [activeCardIndex, setActiveCardIndex] = useState<number | null>(null);
  const [showTabStack, setShowTabStack] = useState(false);

  const handleSwipe = (card: CardData, index: number) => {
    setMinimizedCards((prev) => [...prev, card]);
    setCards((prev) => prev.filter((_, i) => i !== index));
    setActiveCardIndex(null);
  };

  const handleCardClose = (index: number) => {
    setMinimizedCards((prev) => prev.filter((_, i) => i !== index));
    if (showTabStack && minimizedCards.length <= 1) {
      setShowTabStack(false);
    }
  };

  const toggleTabStack = () => {
    setShowTabStack(!showTabStack);
  };

  return (
    <>
      {/* クリックして開いた後 */}
      <AnimatePresence>
        {activeCardIndex !== null && (
          <motion.div
            className="fixed inset-0 z-30 flex items-center justify-center bg-black/70 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveCardIndex(null)}
          >
            <motion.div
              className="pointer-events-none absolute inset-0 bg-gradient-to-b from-blue-900/10 to-purple-900/10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
            />
            <div className="cyberpunk-grid pointer-events-none absolute inset-0" />
            {/* ドラッグしてスワイプするためのエリア */}
            <motion.div
              className="relative w-full max-w-sm p-4"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.7}
              onDragEnd={(_, info) => {
                if (Math.abs(info.offset.x) > 100) {
                  handleSwipe(cards[activeCardIndex], activeCardIndex);
                }
              }}
            >
              {/* カードの情報 */}
              <motion.div
                className="cyberpunk-border overflow-hidden rounded-xl"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Cards data={cards[activeCardIndex]} />
              </motion.div>
              {/* スワイプするための説明 */}
              <div className="mt-6 flex justify-center">
                <motion.div
                  className="frosted-glass flex items-center gap-2 rounded-full px-4 py-2 text-white/90 backdrop-blur-sm"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <span className="inline-block h-1 w-6 rounded-full bg-white/50"></span>
                  <span>スワイプしてスタックに追加</span>
                  <span className="inline-block h-1 w-6 rounded-full bg-white/50"></span>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {minimizedCards.length > 0 && (
        <>
          <AnimatePresence>
            {showTabStack && (
              <IOSAppSwitcher
                cards={minimizedCards}
                onClose={handleCardClose}
                onCollapse={() => setShowTabStack(false)}
              />
            )}
          </AnimatePresence>

          <motion.button
            className="fixed right-0 bottom-6 left-0 z-40 flex justify-center"
            onClick={toggleTabStack}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.05 }}
          >
            <div className="frosted-glass flex items-center gap-3 rounded-full px-4 py-2 shadow-lg transition-all hover:bg-white/10">
              <div className="relative">
                <Grid className="h-5 w-5 text-blue-400" />
                <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-xs text-white">
                  {minimizedCards.length}
                </div>
              </div>
              <span className="text-gradient-blue text-xs font-medium">
                保存されたカード
              </span>
              <ChevronUp className="h-4 w-4 text-white/70" />
            </div>
          </motion.button>
        </>
      )}

      <div className="grid w-full max-w-md gap-4">
        {cards.map((card, index) => (
          <motion.div
            key={index}
            className="relative cursor-pointer overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => setActiveCardIndex(index)}
            whileHover={{ scale: 1.02 }}
          >
            <Cards data={card} />
          </motion.div>
        ))}
        {cards.length === 0 && (
          <motion.div
            className="frosted-glass rounded-xl p-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500/20 to-indigo-500/20">
              <Scan className="text-gradient-blue h-8 w-8" />
            </div>
            <p className="text-gradient-blue mb-2 font-medium">
              NFCを読み込むとカードが表示されます
            </p>
            <p className="mt-1 text-sm text-blue-300/70">
              NFCタグをスキャンしてユーザー情報を表示
            </p>
          </motion.div>
        )}
      </div>
    </>
  );
}
