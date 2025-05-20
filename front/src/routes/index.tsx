import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { gql, useQuery } from "@apollo/client";

import AddWorkIcon from "@/assets/icons/add-work-icon.jpg";
import { Fab } from "@/components/ui/fab";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/")({
  component: Index,
});

const PROJECT_LIST = gql`
  query GetWorks($first: Int, $after: String, $last: Int, $before: String) {
    workList(first: $first, after: $after, last: $last, before: $before) {
      edges {
        cursor
        node {
          id
          title
          description
          imageUrl
          createdAt
          updatedAt
        }
      }
      pageInfo {
        startCursor
        endCursor
        hasNextPage
        hasPreviousPage
      }
    }
  }
`;

type Work = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
};

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

  // ページネーション状態
  const [paginationVars, setPaginationVars] = useState<{
    first?: number | null;
    after?: string | null;
    last?: number | null;
    before?: string | null;
  }>({
    first: 6,
    after: null,
    last: null,
    before: null,
  });

  // GraphQLエラー状態
  const [graphqlError, setGraphqlError] = useState<string | null>(null);

  // 選択された作品
  const [selectedWork, setSelectedWork] = useState<Work | null>(null);

  const { data, loading } = useQuery<GetWorksData>(PROJECT_LIST, {
    variables: paginationVars,
    fetchPolicy: "network-only",
    onError: (error) => {
      setGraphqlError(error.message);
      handleResetPagination();
      setTimeout(() => setGraphqlError(null), 5000);
    },
  });

  const { isAuthenticated, loading: authLoading } = useAuth();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();

    if (authLoading) {
      return;
    }

    if (isAuthenticated) {
      navigate({ to: "/works/create" });
    } else {
      navigate({ to: "/login" });
    }
  };

  // 最初のページに戻る
  const handleResetPagination = () => {
    setPaginationVars({
      first: 6,
      after: null,
      last: null,
      before: null,
    });
  };

  // 次ページ取得
  const handleNextPage = () => {
    if (!data?.workList.pageInfo.hasNextPage || loading) return;

    const endCursor = data.workList.pageInfo.endCursor;
    if (!endCursor) return;

    setPaginationVars({
      first: 6,
      after: endCursor,
      last: null,
      before: null,
    });
  };

  // 前ページ取得
  const handlePreviousPage = () => {
    if (!data?.workList.pageInfo.hasPreviousPage || loading) return;

    const startCursor = data.workList.pageInfo.startCursor;
    if (!startCursor) return;

    setPaginationVars({
      first: null,
      after: null,
      last: 6,
      before: startCursor,
    });
  };

  // 作品詳細を表示
  const handleWorkClick = (work: Work) => {
    setSelectedWork(work);
  };

  // モーダルを閉じる
  const closeModal = () => {
    setSelectedWork(null);
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 pb-20">
      {/* エラーメッセージ表示 */}
      {graphqlError && (
        <div className="mx-auto mt-4 max-w-6xl px-4">
          <div className="mb-4 rounded bg-red-100 p-3 text-red-700">
            <p className="font-bold">エラーが発生しました</p>
            <p>{graphqlError}</p>
            <button
              onClick={handleResetPagination}
              className="mt-2 rounded bg-red-500 px-3 py-1 text-white hover:bg-red-600"
            >
              最初のページに戻る
            </button>
          </div>
        </div>
      )}

      {/* ローディング表示 */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="flex animate-pulse flex-col items-center">
            <div className="mb-4 h-16 w-16 rounded-full bg-indigo-200"></div>
            <div className="font-medium text-indigo-500">読み込み中...</div>
          </div>
        </div>
      )}

      {/* 作品がない場合 */}
      {!loading && data?.workList?.edges.length === 0 && (
        <div className="py-16 text-center">
          <div className="mx-auto max-w-md rounded-lg bg-white p-6 shadow-sm">
            <div className="mb-4 text-5xl">✨</div>
            <h2 className="mb-2 text-xl font-semibold text-gray-700">
              まだ作品が登録されていません
            </h2>
            <p className="mb-6 text-gray-500">
              新しい作品を追加して、あなたの才能を世界に共有しましょう！
            </p>
            <button
              onClick={handleClick}
              className="rounded-md bg-indigo-600 px-6 py-2 text-white transition hover:bg-indigo-700"
            >
              最初の作品を追加する
            </button>
          </div>
        </div>
      )}

      {/* 作品一覧 */}
      {!loading && (data?.workList?.edges?.length ?? 0) > 0 && (
        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {data?.workList?.edges?.map(({ node }) => (
              <div
                key={node.id}
                className="cursor-pointer overflow-hidden rounded-xl bg-white shadow-md transition-shadow duration-300 hover:shadow-lg"
                onClick={() => handleWorkClick(node)}
              >
                <div className="pb-2/3 relative">
                  {node.imageUrl ? (
                    <img
                      src={`${HOST_URL}image/upload/get?date=${encodeURIComponent(node.imageUrl)}`}
                      alt={node.title}
                      className="h-48 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-48 w-full items-center justify-center bg-gray-200">
                      <span className="text-gray-400">No image</span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h2 className="mb-1 line-clamp-1 text-lg font-semibold text-gray-800">
                    {node.title}
                  </h2>
                  <p className="mb-3 line-clamp-2 text-sm text-gray-600">
                    {node.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      {new Date(node.updatedAt).toLocaleDateString("ja-JP")}
                    </span>
                    <span className="rounded-full bg-indigo-100 px-2 py-1 text-xs text-indigo-700">
                      詳細を見る
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ページネーションボタン */}
          <div className="mt-8 flex justify-center">
            <div className="inline-flex rounded-md shadow-sm">
              <button
                className={`rounded-l-lg border border-indigo-300 bg-white px-4 py-2 text-sm font-medium text-indigo-700 ${
                  !data?.workList?.pageInfo?.hasPreviousPage
                    ? "cursor-not-allowed opacity-50"
                    : "hover:bg-indigo-50"
                }`}
                onClick={handlePreviousPage}
                disabled={!data?.workList?.pageInfo?.hasPreviousPage || loading}
              >
                前のページ
              </button>
              <button
                className="border border-indigo-600 bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                onClick={handleResetPagination}
                disabled={loading}
              >
                最初のページ
              </button>
              <button
                className={`rounded-r-lg border border-indigo-300 bg-white px-4 py-2 text-sm font-medium text-indigo-700 ${
                  !data?.workList?.pageInfo?.hasNextPage
                    ? "cursor-not-allowed opacity-50"
                    : "hover:bg-indigo-50"
                }`}
                onClick={handleNextPage}
                disabled={!data?.workList?.pageInfo?.hasNextPage || loading}
              >
                次のページ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 作品詳細モーダル */}
      {selectedWork && (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white">
            <div className="p-6">
              <div className="mb-4 flex items-start justify-between">
                <h2 className="text-2xl font-bold text-gray-800">
                  {selectedWork.title}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              {selectedWork.imageUrl && (
                <img
                  src={`${HOST_URL}image/upload/get?date=${encodeURIComponent(selectedWork.imageUrl)}`}
                  alt={selectedWork.title}
                  className="mb-4 h-auto w-full rounded-lg"
                />
              )}

              <div className="prose max-w-none">
                <p className="whitespace-pre-line text-gray-700">
                  {selectedWork.description}
                </p>
              </div>

              <div className="mt-6 border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div>
                    作成日:{" "}
                    {new Date(selectedWork.createdAt).toLocaleString("ja-JP")}
                  </div>
                  <div>
                    更新日:{" "}
                    {new Date(selectedWork.updatedAt).toLocaleString("ja-JP")}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
