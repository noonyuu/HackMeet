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

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // urlポップアップ用
  const [popupUrl, setPopupUrl] = useState<string | null>(null);

  useEffect(() => {
    setLoading(queryLoading);

    if (queryError) {
      setError(`データ取得エラー: ${queryError.message}`);
      return;
    }

    if (!queryLoading) {
      setError(null);
    }
  }, [queryError, queryLoading]);

  const onClick = (id: string) => {
    const url = `${HOST_URL}nfc/${id}`;
    console.log(`NFC書き込み用URL: ${url}`);
    setPopupUrl(url);
  };

  const closePopup = () => {
    setPopupUrl(null);
  };

  // データの取得
  const projects = data?.worksByProfileId || [];

  return (
    <div className="flex flex-col items-center justify-center px-4 py-8">
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : projects.length === 0 ? (
        <p className="text-gray-500">プロジェクトが見つかりません</p>
      ) : (
        <div className="w-full max-w-3xl">
          {projects.map((card) => (
            <div
              key={card.id}
              className="mb-4 border-b border-gray-200 pb-4 last:border-b-0"
            >
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
                      className="aspect-video max-w-40 min-w-40 rounded object-cover"
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
                    {/* その他の情報 */}
                    <div className="">
                      <div className="text-sm text-gray-600">
                        {new Date(card.updatedAt).toLocaleDateString("ja-JP")}{" "}
                        更新
                      </div>
                    </div>
                  </div>
                </div>
                {/* 編集ボタン */}
                <div className="flex flex-row justify-end gap-x-2">
                  <div className="my-auto py-2 text-end">
                    <Link
                      to="/profile/$projectId"
                      params={{ projectId: card.id }}
                      className="inline-block rounded border border-gray-500 px-4 py-1 text-base text-gray-500 transition-colors hover:bg-gray-50"
                    >
                      編集
                    </Link>
                  </div>
                  <div className="my-auto py-2">
                    <button
                      onClick={() => onClick(card.workProfileId)}
                      className="rounded border border-gray-500 px-4 py-1 text-base text-gray-500 transition-colors hover:bg-gray-50"
                    >
                      NFC書き込み用URL
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ポップアップモーダル */}
      {popupUrl && (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
          <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-xl font-bold">NFC書き込み用URL</h2>
            <div className="mb-4 rounded bg-gray-100 p-3 text-sm break-all">
              {popupUrl}
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => navigator.clipboard.writeText(popupUrl)}
                className="rounded bg-gray-500 px-4 py-2 text-white transition-colors hover:bg-gray-600"
              >
                コピー
              </button>
              <button
                onClick={closePopup}
                className="rounded bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
