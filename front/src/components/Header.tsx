import { Link, useMatch } from "@tanstack/react-router";

export const Header = () => {
  // ログイン or 新規登録時かを判別
  const isRegister = useMatch({ from: "/register", shouldThrow: false });
  const isLogin = useMatch({ from: "/login", shouldThrow: false });

  const isAuth = isRegister || isLogin;

  return (
    <>
      {isAuth ? (
        <header className="flex h-14 items-center justify-center border-b border-gray-300">
          <div className="font-main text-2xl">タイトル</div>
        </header>
      ) : (
        <header className="flex h-25 justify-center border-b border-gray-300 px-8 pt-4">
          <div className="font-main flex w-full flex-col">
            <div className="flex flex-row items-center">
              <div className="flex grow text-2xl">タイトル</div>
              <div className="">icon</div>{" "}
              {/* ログイン ? icon : ログイン or 新規登録 */}
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
      )}
    </>
  );
};
