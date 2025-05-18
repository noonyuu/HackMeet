import { useAuth } from "@/hooks/useAuth";
import { Link, useMatch } from "@tanstack/react-router";
import google from "@/assets/icons/google.svg";
import { Button } from "./ui/button";
import { useState } from "react";

export const Header = () => {
  // ログイン or 新規登録時かを判別
  const isRegister = useMatch({ from: "/register", shouldThrow: false });
  const isLogin = useMatch({ from: "/login", shouldThrow: false });
  // 作品登録画面
  const isEdit = useMatch({ from: "/works/create", shouldThrow: false });
  // プロフィール編集画面
  const isProfileEdit = useMatch({ from: "/profile/edit", shouldThrow: false });

  const isAuth = isRegister || isLogin || isEdit || isProfileEdit;
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  const { user, isAuthenticated } = useAuth();

  const handleMenuClick = () => {
    console.log("handleMenuClick");
    setIsMenuOpen((prev) => !prev);
  };

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
              <div className="">
                {isAuthenticated ? (
                  <div>
                    <button type="button" onClick={handleMenuClick}>
                      <img
                        src={user?.avatarUrl || google}
                        className="size-8 rounded-full"
                      />
                      {isMenuOpen && (
                        <div className="absolute top-16 right-8 h-96 w-52 rounded-md border border-gray-200 bg-white p-3">
                          <div className="flex size-full flex-col justify-start">
                            <div className="flex grow flex-col">
                              <div className="text-center">
                                <Link to="/profile/edit">プロフィール確認</Link>
                              </div>
                            </div>
                            <div className="grow-0 text-center">
                              <a>ログアウト</a>
                            </div>
                          </div>
                        </div>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-x-4">
                    <Link to="/login">
                      <Button variant="default" size="sm">
                        ログイン
                      </Button>
                    </Link>
                    <Link to="/register">
                      <Button variant="default" size="sm">
                        新規登録
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
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
