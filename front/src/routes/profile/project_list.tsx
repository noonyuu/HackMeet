import { useEffect, useState } from "react";
import { useQuery } from "@apollo/client";
import { createFileRoute, Link } from "@tanstack/react-router";

import { Work } from "@/types/project";
import { GET_PROFILE_WORKS } from "@/graph/work";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/profile/project_list")({
  component: RouteComponent,
});

type ProjectQueryResult = {
  worksByProfileId: Work[];
};

function RouteComponent() {
  const HOST_URL = import.meta.env.VITE_HOST_URL;
  const { user } = useAuth();
  const {
    data,
    loading: queryLoading,
    error: queryError,
  } = useQuery<ProjectQueryResult>(GET_PROFILE_WORKS, {
    variables: { profileId: user?.id || "" },
    fetchPolicy: "network-only",
    skip: !user || !user.id,
  });
  const [cards, setCards] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(queryLoading);

    if (queryError) {
      setError(`データ取得エラー`);
      return;
    }

    setError(null);

    const projects = data?.worksByProfileId || [];

    if (!projects) {
      setError("プロジェクトが見つかりません");
      return;
    }

    setError(null);
    setCards((prevCards) => {
      const newCards = [...prevCards];
      return [...newCards, ...projects];
    });
  }, [data, queryError, queryLoading]);

  return (
    <div className="flex flex-col items-center justify-center px-4 py-8">
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="w-full max-w-3xl">
          {cards.map((card) => (
            <div key={card.id}>
              <div className="flex flex-col px-4 sm:flex-row sm:py-4">
                {/* 作品画像 */}
                <div className="flex grow">
                  <div className="my-auto">
                    <img
                      src={
                        card.imageUrl && card.imageUrl[0]
                          ? `${HOST_URL}image/upload/get?date=${encodeURIComponent(card.imageUrl[0])}`
                          : "https://placehold.co/600x400"
                      }
                      alt="作品画像"
                      className="aspect-16/9 max-w-40 min-w-40 object-cover"
                    />
                  </div>
                  {/* 作品情報 */}
                  <div className="flex grow flex-col justify-between p-4">
                    {/* 作品タイトル */}
                    <div className="text-lg font-bold sm:text-2xl">
                      {card.title.length > 15
                        ? card.title.slice(0, 15) + "..."
                        : card.title}
                    </div>
                    {/* そん他の情報 */}
                    <div className="">
                      <div className="text-sm">{card.updatedAt} 更新</div>
                    </div>
                  </div>
                </div>
                {/* 編集ボタン */}
                <div className="my-auto py-2 text-end">
                  <Link
                    to="/profile/$projectId"
                    params={{ projectId: card.id }}
                    className="rounded border border-gray-500 px-4 py-1 text-base text-gray-500"
                  >
                    編集
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
