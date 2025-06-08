import { useEffect, useState } from "react";
import { createFileRoute, useParams } from "@tanstack/react-router";
import { useQuery } from "@apollo/client";
import { AlertTriangle, Scan } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { CardData } from "@/types/card";
import { CardStack } from "@/components/CardStack";
import { GET_NFC_DATA } from "@/graph/work";

export const Route = createFileRoute("/nfc/$workId/")({
  component: RouteComponent,
});

type CardQueryResult = {
  workProfile: CardData;
};

function RouteComponent() {
  const { workId } = useParams({ from: "/nfc/$workId/" });
  const [cards, setCards] = useState<CardData[]>([]);
  // const [minimizedCards, setMinimizedCards] = useState<CardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    data,
    loading: queryLoading,
    error: queryError,
  } = useQuery<CardQueryResult>(GET_NFC_DATA, {
    variables: { id: parseInt(workId, 10) },
    fetchPolicy: "network-only",
    skip: !workId, // workIdがないときはquery実行しない
  });

  const card = data?.workProfile;

  useEffect(() => {
    setLoading(queryLoading);

    if (queryError) {
      setError(`データ取得エラー: ${queryError.message}`);
      return;
    }

    if (!card || !workId) return;

    setError(null); // エラーリセット

    setCards((prevCards) => {
      const newCards = [...prevCards];
      if (newCards.length > 0) {
        // const lastCard = newCards.pop();
        // if (lastCard) {
        //   setMinimizedCards((prev) => [...prev, lastCard]);
        // }
      }
      return [...newCards, card];
    });

    // オプション: URLパラメータをクリア
    window.history.replaceState({}, document.title, window.location.pathname);
  }, [card, queryError, queryLoading, workId]);

  return (
    <div className="bg-mesh relative flex min-h-full w-full flex-col items-center overflow-hidden bg-black p-4 text-white">
      <div className="bg-grid pointer-events-none absolute inset-0" />

      <motion.div
        className="z-10 flex w-full max-w-md flex-col items-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="relative mt-4 mb-8 flex w-full justify-center">
          <div className="absolute top-1/2 left-1/2 -z-10 h-40 w-40 -translate-x-1/2 -translate-y-1/2 transform rounded-full bg-blue-500/20 blur-3xl" />
          <motion.h1
            className="text-gradient text-3xl font-bold"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            ユーザー情報
          </motion.h1>
        </div>

        {/* エラー表示 */}
        <AnimatePresence>
          {error && (
            <motion.div
              className="frosted-glass mb-6 w-full rounded-xl p-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-red-500/20 p-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                </div>
                <p className="text-sm text-red-200">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ローディング表示 */}
        <AnimatePresence>
          {loading && (
            <motion.div
              className="mb-8 flex w-full flex-col items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="relative mx-auto mb-3 h-16 w-16">
                <motion.div
                  className="absolute inset-0 rounded-full border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent"
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 1,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "linear",
                  }}
                />
                <motion.div
                  className="absolute inset-2 rounded-full border-4 border-t-transparent border-r-blue-400 border-b-transparent border-l-transparent"
                  animate={{ rotate: -180 }}
                  transition={{
                    duration: 1.5,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "linear",
                  }}
                />
                <div className="absolute inset-4 flex items-center justify-center rounded-full bg-blue-500/20">
                  <Scan className="h-4 w-4 text-blue-300" />
                </div>
              </div>
              <p className="text-blue-100">ユーザー情報を読み込んでいます...</p>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          className="mb-8 rounded-full border border-white/10 bg-white/10 px-4 py-2 shadow-2xl backdrop-blur-md transition-colors hover:bg-white/10"
          onClick={() => (window.location.href = "/")}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          ホームに戻る
        </motion.button>
      </motion.div>

      <CardStack
        cards={cards}
        setCards={setCards}
        // minimizedCards={minimizedCards}
        // setMinimizedCards={setMinimizedCards}
      />
    </div>
  );
}
