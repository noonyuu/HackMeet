import { motion } from "framer-motion";
import type { CardData } from "@/types/card";
import { SwiperComponents } from "./ui/swiper/swiper";

interface CardProps {
  data: CardData;
  compact?: boolean;
}

export function Cards({ data, compact = false }: CardProps) {

  return (
    <div
      className={`overflow-hidden rounded-xl ${compact ? "" : "shadow-xl"} h-full`}
    >
      <div className="card-gradient flex h-full flex-col overflow-hidden rounded-xl border border-white/10">
        <div className="card-header-gradient px-4 py-3">
          <div className="flex items-center justify-between">
            <h2 className={`font-bold ${compact ? "text-sm" : "text-xl"}`}>
              <span className="bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                {data.profile.nickName}
              </span>
            </h2>
            <div className="flex items-center">
              <span className="flex items-center gap-1 rounded-full bg-blue-500/20 px-2 py-0.5 text-xs font-medium text-blue-300">
                {data.profile.graduationYear}卒
              </span>
            </div>
          </div>
        </div>

        <div className={`${compact ? "p-2" : "p-4"} flex flex-1 flex-col`}>
          <div className="mb-3 flex items-center gap-2">
            <div className="rounded-full bg-blue-900/30 p-1"></div>
            <p
              className={`text-blue-100/80 ${compact ? "text-[10px]" : "text-sm"}`}
            >
              所属: {data.profile.affiliation}
            </p>
          </div>

          {!compact && (
            <div className="mb-4 flex gap-2">
              {data.work.skills.map((name, i) => (
                <motion.div
                  key={i}
                  className="flex items-center justify-center rounded-full border border-blue-500/30 bg-gradient-to-br from-blue-900/50 to-indigo-900/50 px-3 py-1"
                  whileHover={{ scale: 1.1 }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                >
                  {name.name}
                </motion.div>
              ))}
            </div>
          )}

          <div className="flex flex-1 flex-col space-y-3">
            <div>
              <h3
                className={`mb-1.5 flex items-center gap-1 text-xs font-medium text-blue-200`}
              >
                <span className="inline-block h-3 w-1 rounded-full bg-blue-500"></span>
                作品名
                <span className="pl-2 text-blue-100/70">{data.work.title}</span>
              </h3>
              <SwiperComponents
                images={data.work.imageUrl}
                title={data.work.title || "作品画像"}
                css="mx-auto max-h-56 max-w-104"
              />
            </div>

            <div className="flex-1">
              <h3
                className={`mb-1 flex items-center gap-1 text-xs font-medium text-blue-200`}
              >
                <span className="inline-block h-3 w-1 rounded-full bg-blue-500"></span>
                作品概要
              </h3>
              <p
                className={`text-blue-100/70 ${compact ? "line-clamp-3 text-[10px]" : "text-sm"} overflow-ellipsis`}
              >
                {data.work.description || "~".repeat(50)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
