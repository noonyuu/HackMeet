import { Link } from "@tanstack/react-router";

export const Header = () => {
  return (
    <header className="flex h-25 border-b border-gray-300 px-8 pt-4">
      <div className="flex flex-col w-full">
        <div className="flex flex-row items-center">
          <div className="grow text-2xl flex">タイトル</div>
          <div className="">icon</div> {/* ログイン ? icon : ログイン or 新規登録 */}
        </div>
        <div className="flex grow items-end gap-4">
          <Link
            to="/"
            className="text-lg [&.active]:border-b [&.active]:border-green-500 [&.active]:font-bold"
          >
            作品一覧
          </Link>
          <Link
            to="/about"
            className="text-lg [&.active]:border-b [&.active]:border-green-500 [&.active]:font-bold"
          >
            イベント
          </Link>
        </div>
      </div>
    </header>
  );
};
