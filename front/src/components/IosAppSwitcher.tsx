import { useState, useRef, useEffect } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { ChevronDown, Search, Grid3X3 } from "lucide-react";

import type { CardData } from "@/types/card";
import { Cards } from "./Card";

interface IOSAppSwitcherProps {
  cards: CardData[];
  onClose: (index: number) => void;
  onCollapse: () => void;
}

export function IOSAppSwitcher({
  cards,
  onClose,
  onCollapse,
}: IOSAppSwitcherProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [isGridView, setIsGridView] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const columns = cards.length <= 4 ? 2 : 3;
  const getGridPosition = (index: number) => {
    const row = Math.floor(index / columns);
    const col = index % columns;
    return { row, col };
  };

  const filteredCards = cards.filter(
    (card) =>
      card.profile.nickName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.profile.affiliation!
        .toLowerCase()
        .includes(searchQuery.toLowerCase()),
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col bg-black/70 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-blue-900/10 to-purple-900/10" />
      <div className="cyberpunk-grid pointer-events-none absolute inset-0" />
      <div className="noise-bg pointer-events-none absolute inset-0" />

      <div className="flex justify-center pt-3 pb-2">
        <div className="h-1 w-10 rounded-full bg-white/50" />
      </div>

      <div className="mb-4 space-y-3 px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium text-white/90">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/20 text-xs text-blue-300">
              {filteredCards.length}
            </span>
            <span className="text-gradient-blue">Saved Cards</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsGridView(!isGridView)}
              className="frosted-glass rounded-full p-2 text-white/90 transition-colors hover:bg-white/20"
            >
              <Grid3X3 size={16} className="text-blue-300" />
            </button>
            <button
              onClick={onCollapse}
              className="frosted-glass flex items-center gap-1 rounded-full px-3 py-1 text-sm text-white/90 transition-colors hover:bg-white/20"
            >
              <span>Done</span>
              <ChevronDown size={14} />
            </button>
          </div>
        </div>

        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
            <Search size={16} className="text-blue-400" />
          </div>
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search cards..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-full border border-white/10 bg-white/5 py-2 pr-4 pl-10 text-sm text-white placeholder-blue-300/50 focus:ring-2 focus:ring-blue-500/50 focus:outline-none"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-16">
        {filteredCards.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center p-4 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-900/30">
              <Search size={24} className="text-blue-400" />
            </div>
            <h3 className="text-gradient-blue mb-2 text-xl font-bold">
              No cards found
            </h3>
            <p className="text-sm text-blue-200/70">
              Try a different search term
            </p>
          </div>
        ) : (
          <div
            className={`grid gap-4 pb-4 ${isGridView ? `grid-cols-${columns}` : "grid-cols-1"}`}
            style={{
              gridTemplateColumns: isGridView
                ? `repeat(${columns}, 1fr)`
                : "1fr",
              gridAutoRows: "min-content",
            }}
          >
            <AnimatePresence>
              {filteredCards.map((card, index) => {
                const { row, col } = getGridPosition(index);
                return (
                  <CardItem
                    key={index}
                    card={card}
                    index={index}
                    onClose={onClose}
                    isActive={activeIndex === index}
                    setActive={() => setActiveIndex(index)}
                    row={row}
                    col={col}
                    isGridView={isGridView}
                  />
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      <div className="frosted-glass h-16 border-t border-white/10">
        <div className="flex h-full w-full items-center justify-center">
          <div className="h-1 w-32 rounded-full bg-white/30" />
        </div>
      </div>
    </motion.div>
  );
}

interface CardItemProps {
  card: CardData;
  index: number;
  onClose: (index: number) => void;
  isActive: boolean;
  setActive: () => void;
  row: number;
  col: number;
  isGridView: boolean;
}

function CardItem({
  card,
  index,
  onClose,
  isActive,
  setActive,
  row,
  col,
  isGridView,
}: CardItemProps) {
  const y = useMotionValue(0);
  const [isHovered, setIsHovered] = useState(false);

  const opacity = useTransform(y, [0, -100], [1, 0]);
  const scale = useTransform(y, [0, -100], [1, 0.8]);
  const rotate = useTransform(y, [0, -100], [0, -5]);

  return (
    <motion.div
      className={`relative ${isGridView ? "aspect-[3/4] w-full" : "aspect-[16/9] w-full"}`}
      initial={{ opacity: 0, scale: 0.8, y: 50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: -50 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
        delay: row * 0.1 + col * 0.05,
      }}
      onClick={setActive}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <motion.div
        className={`card-shine relative h-full overflow-hidden rounded-xl shadow-2xl ${
          isActive ? "cyberpunk-border" : "border border-white/10"
        }`}
        style={{ y, opacity, scale, rotateX: rotate }}
        animate={{
          y: 0,
          scale: isHovered ? 1.02 : 1,
          boxShadow: isHovered
            ? "0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.2)"
            : "0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -4px rgba(0, 0, 0, 0.2)",
        }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.2}
        onDragEnd={(_, info) => {
          if (info.offset.y < -50) {
            onClose(index);
          }
        }}
      >
        {/* <div className="card-header-gradient absolute top-0 right-0 left-0 z-10 h-10">
          <div className="flex items-center justify-between px-3 pt-1.5">
            <div className="flex max-w-[70%] items-center gap-1.5 truncate text-xs font-medium text-white">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-500/30 text-[10px] text-blue-200">
                {index + 1}
              </span>
              <span className="text-gradient">{card.profile.nickName}</span>
            </div>
            <div className="flex gap-1.5">
              <button
                className="frosted-glass rounded-full p-1 text-white transition-colors hover:bg-white/20"
                onClick={(e) => {
                  e.stopPropagation();
                  setActive();
                }}
              >
                <Maximize2 size={12} />
              </button>
              <button
                className="frosted-glass rounded-full p-1 text-white transition-colors hover:bg-red-500/30"
                onClick={(e) => {
                  e.stopPropagation();
                  onClose(index);
                }}
              >
                <X size={12} />
              </button>
            </div>
          </div>
        </div> */}

        <div className="h-full overflow-hidden rounded-xl bg-black/40">
          <Cards data={card} compact={isGridView} />
        </div>
      </motion.div>

      {/* <motion.div
        className="absolute right-0 bottom-[-12px] left-0 flex justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0.7 }}
      >
        <div className="frosted-glass flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] text-white/90 backdrop-blur-sm">
          <span className="flex inline-block h-3 w-3 items-center justify-center rounded-full bg-blue-500/30">
            <span className="inline-block h-2 w-0.5 bg-blue-400"></span>
          </span>
          <span>スワイプ</span>
        </div>
      </motion.div> */}
    </motion.div>
  );
}
