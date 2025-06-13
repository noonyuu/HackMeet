import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@apollo/client";

import AddWorkIcon from "@/assets/icons/add-work-icon.jpg";
import CherryBackImage from "@/assets/images/cherry.webp";
import { Fab } from "@/components/ui/fab";
import { useAuth } from "@/hooks/useAuth";
import { PROJECT_LIST } from "@/graph/work";
import { Work } from "@/types/project";
import { SwiperComponents } from "@/components/ui/swiper/swiper";

export const Route = createFileRoute("/")({
  component: Index,
});

type WorkEdge = {
  cursor: string;
  node: Work;
};

type PageInfo = {
  startCursor: string | null;
  endCursor: string | null;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

type WorkConnection = {
  edges: WorkEdge[];
  pageInfo: PageInfo;
};

type GetWorksData = {
  workList: WorkConnection;
};

function Index() {
  const HOST_URL = import.meta.env.VITE_HOST_URL || "";
  const navigate = useNavigate();

  const [paginationVars, setPaginationVars] = useState<{
    first?: number | null;
    after?: string | null;
    last?: number | null;
    before?: string | null;
  }>({
    first: 12,
    after: null,
    last: null,
    before: null,
  });

  const [graphqlError, setGraphqlError] = useState<string | null>(null);
  const [selectedWork, setSelectedWork] = useState<Work | null>(null);

  const { data, loading } = useQuery<GetWorksData>(PROJECT_LIST, {
    variables: paginationVars,
    fetchPolicy: "network-only",
    onError: (error) => {
      console.error("GraphQL Error:", error);
      setGraphqlError(error.message);
      setTimeout(() => setGraphqlError(null), 5000);
    },
  });

  const { isAuthenticated, loading: authLoading } = useAuth();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate({ to: isAuthenticated ? "/works/create" : "/login" });
  };

  const handleResetPagination = () => {
    setPaginationVars({ first: 12, after: null, last: null, before: null });
  };

  const handleNextPage = () => {
    if (!data?.workList.pageInfo.hasNextPage || loading) return;
    const endCursor = data.workList.pageInfo.endCursor;
    if (!endCursor) return;
    setPaginationVars({
      first: 12,
      after: endCursor,
      last: null,
      before: null,
    });
    // 情報更新後にスクロールをトップに戻す
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePreviousPage = () => {
    if (!data?.workList.pageInfo.hasPreviousPage || loading) return;
    const startCursor = data.workList.pageInfo.startCursor;
    if (!startCursor) return;
    setPaginationVars({
      first: null,
      after: null,
      last: 12,
      before: startCursor,
    });
    // 情報更新後にスクロールをトップに戻す
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleWorkClick = (work: Work) => {
    setSelectedWork(work);
  };

  const closeModal = () => {
    setSelectedWork(null);
  };

  // Fallback image URL
  const placeholderImage = (text: string = "No Image") =>
    `https://placehold.co/600x400/E2E8F0/A0AEC0?text=${encodeURIComponent(text)}`;

  return (
    <div className="min-h-screen w-full bg-gray-50 pb-20 font-sans">
      {" "}
      {graphqlError && (
        <div className="fixed top-4 left-1/2 z-[100] w-full max-w-md -translate-x-1/2 transform px-4 sm:max-w-lg">
          <div className="mb-4 rounded-md bg-red-100 p-4 text-red-700 shadow-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  エラーが発生しました
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{graphqlError}</p>
                </div>
                <button
                  onClick={() => {
                    setGraphqlError(null);
                    handleResetPagination();
                  }}
                  className="mt-3 rounded-md bg-red-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-600 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-red-100 focus:outline-none"
                >
                  最初のページに戻る
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Loading State */}
      {loading && !data && (
        <div className="flex min-h-[calc(100vh-10rem)] flex-col items-center justify-center py-20 text-center">
          <div className="h-16 w-16 animate-spin rounded-full border-t-4 border-b-4 border-indigo-600"></div>
          <p className="mt-4 text-lg font-semibold text-indigo-700">
            作品を読み込んでいます...
          </p>
          <p className="text-sm text-gray-500">少々お待ちください</p>
        </div>
      )}
      {/* No Works Found */}
      {!loading && data?.workList?.edges.length === 0 && (
        <div className="flex min-h-[calc(100vh-10rem)] flex-col items-center justify-center py-16 text-center">
          <div className="mx-auto max-w-md rounded-xl bg-white p-8 shadow-xl">
            <div className="mb-6 text-6xl">🎨</div>
            <h2 className="mb-3 text-2xl font-bold text-gray-800">
              まだ作品がありません
            </h2>
            <p className="mb-8 text-gray-600">
              あなたの素晴らしい作品を世界に共有しましょう。最初の作品を投稿してみませんか？
            </p>
            <button
              onClick={handleClick}
              disabled={authLoading}
              className="focus:ring-opacity-50 w-full rounded-lg bg-indigo-600 px-8 py-3 text-base font-semibold text-white shadow-md transition-all duration-300 ease-in-out hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-70"
            >
              {authLoading ? "確認中..." : "最初の作品を追加する"}
            </button>
          </div>
        </div>
      )}
      {/* Works List */}
      {!loading && (data?.workList?.edges?.length ?? 0) > 0 && (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
            {data?.workList?.edges?.map(({ node }) => (
              <div
                key={node.id}
                className="group relative flex cursor-pointer flex-col overflow-hidden rounded-xl bg-white shadow-lg transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-2xl"
                onClick={() => handleWorkClick(node)}
              >
                <div className="aspect-[16/10] w-full overflow-hidden bg-gray-200">
                  <img
                    src={
                      node.imageUrl
                        ? `${HOST_URL}image/upload/get?date=${encodeURIComponent(node.imageUrl[0])}`
                        : placeholderImage(node.title)
                    }
                    alt={node.title || "作品画像"}
                    className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-110"
                    onError={(e) =>
                      (e.currentTarget.src = placeholderImage(node.title))
                    }
                  />
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <h2 className="mb-1 line-clamp-1 text-lg font-semibold text-gray-900">
                    {node.title || "無題の作品"}
                  </h2>
                  <p className="mb-3 line-clamp-2 flex-grow text-sm text-gray-600">
                    {node.description || "説明がありません"}
                  </p>
                  <div className="mt-auto flex items-center justify-between pt-2">
                    <span className="text-xs text-gray-500">
                      更新日:{" "}
                      {new Date(node.updatedAt).toLocaleDateString("ja-JP")}
                    </span>
                    <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700 group-hover:bg-indigo-600 group-hover:text-white">
                      詳細を見る
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ページネーション */}
          {(data?.workList?.pageInfo?.hasNextPage ||
            data?.workList?.pageInfo?.hasPreviousPage) && (
            <div className="mt-12 flex items-center justify-center space-x-3">
              <button
                className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={handlePreviousPage}
                disabled={!data?.workList?.pageInfo?.hasPreviousPage || loading}
              >
                前のページ
              </button>
              <button
                className="inline-flex items-center justify-center rounded-lg border border-transparent bg-fuchsia-300 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                onClick={handleResetPagination}
                disabled={loading}
              >
                最初のページ
              </button>
              <button
                className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={handleNextPage}
                disabled={!data?.workList?.pageInfo?.hasNextPage || loading}
              >
                次のページ
              </button>
            </div>
          )}
        </div>
      )}
      {/* 作品詳細モーダル */}
      {selectedWork && (
        <>
          <div className="fixed inset-0 z-[59] bg-blue-300" />
          <div
            className="fixed inset-0 z-[60] bg-cover bg-center bg-no-repeat opacity-70 transition-opacity duration-300"
            style={{ backgroundImage: `url(${CherryBackImage})` }}
          />
          <div className="fixed inset-0 z-[61] flex items-center justify-center p-4 transition-opacity duration-300">
            <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white p-6 shadow-2xl">
              <button
                onClick={closeModal}
                className="absolute top-3 right-3 z-10 rounded-full bg-white/60 p-2 text-gray-600 hover:bg-gray-100/80 focus:ring-2 focus:ring-pink-300 focus:outline-none"
                aria-label="閉じる"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
              <div className="space-y-6">
                <h2 className="pr-8 text-3xl leading-tight font-bold text-gray-900">
                  {selectedWork.title || "無題の作品"}
                </h2>

                {selectedWork.imageUrl && (
                  <div className="overflow-hidden rounded-lg shadow-md">
                    <SwiperComponents
                      images={selectedWork.imageUrl}
                      title={selectedWork.title || "作品"}
                    />
                  </div>
                )}

                <div>
                  <h3 className="mb-2 text-sm font-semibold tracking-wide text-gray-500 uppercase">
                    説明
                  </h3>
                  <div className="prose prose-sm max-w-none whitespace-pre-line text-gray-700">
                    {selectedWork.description || "説明がありません。"}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <h3 className="mb-3 text-sm font-semibold tracking-wide text-gray-500 uppercase">
                      関わった人
                    </h3>
                    <div className="flex items-center space-x-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
                      {selectedWork.profile.map((profile) => {
                        return (
                          <div>
                            <div className="flex flex-col justify-center">
                              <img
                                key={profile.id}
                                src={
                                  profile.avatarUrl ||
                                  placeholderImage(profile.nickName?.[0] || "P")
                                }
                                alt={profile.nickName || "アバター"}
                                className="mx-auto h-12 w-12 rounded-full object-cover"
                                onError={(e) => {
                                  const target = e.currentTarget;
                                  target.src = placeholderImage(
                                    profile.nickName?.[0] || "P",
                                  );
                                  target.onerror = null;
                                }}
                              />
                            </div>
                            <p className="text-center font-semibold text-gray-800">
                              {profile.nickName || "匿名ユーザー"}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-3 text-sm font-semibold tracking-wide text-gray-500 uppercase">
                      使用スキル
                    </h3>
                    {selectedWork.skills && selectedWork.skills.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {selectedWork.skills.map((skill) => (
                          <span
                            key={skill.id}
                            className="rounded-full bg-teal-100 px-3 py-1 text-sm font-medium text-teal-700"
                          >
                            {skill.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">
                        スキル情報はありません。
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="mb-3 text-sm font-semibold tracking-wide text-gray-500 uppercase">
                    参加イベント
                  </h3>
                  {selectedWork.event && selectedWork.event.length > 0 ? (
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                      {selectedWork.event.map((ev) => (
                        <p key={ev.id} className="font-semibold text-gray-800">
                          {ev.name}
                        </p>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      この作品は特定のイベントには関連付けられていません。
                    </p>
                  )}
                </div>

                <div className="mt-8 border-t border-gray-200 pt-6">
                  <div className="flex flex-col space-y-1 text-xs text-gray-500 sm:flex-row sm:justify-between sm:space-y-0">
                    <span>
                      作成日:{" "}
                      {new Date(selectedWork.createdAt).toLocaleString(
                        "ja-JP",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )}
                    </span>
                    <span>
                      最終更新日:{" "}
                      {new Date(selectedWork.updatedAt).toLocaleString(
                        "ja-JP",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      {/* FAB */}
      <Fab
        variant="default"
        size="lg"
        className="fixed right-6 bottom-6 z-40 bg-indigo-600 text-white shadow-lg hover:bg-indigo-700"
        onClick={handleClick}
      >
        <img src={AddWorkIcon} alt="作品を追加" className="rounded-full" />
      </Fab>
    </div>
  );
}
