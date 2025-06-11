import { Link, useMatch, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import clsx from "clsx";

import google from "@/assets/icons/google.svg";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "./ui/button";

export const Header = () => {
  const navigate = useNavigate();
  // ログイン or 新規登録時かを判別
  const isRegister = useMatch({ from: "/register", shouldThrow: false });
  const isLogin = useMatch({ from: "/login", shouldThrow: false });
  // 作品登録画面
  const isWorkCreate = useMatch({
    from: "/works/create/",
    shouldThrow: false,
  });
  const isWorkCreateEvent = useMatch({
    from: "/works/create/$eventId/",
    shouldThrow: false,
  });
  // プロフィール編集画面
  const isProfileEdit = useMatch({ from: "/profile/edit", shouldThrow: false });
  // プロフィール編集画面の作品一覧
  const isProfileProjectList = useMatch({
    from: "/profile/project_list",
    shouldThrow: false,
  });
  // nfc読み取り後の画面
  const isNfc = useMatch({ from: "/nfc/$workId/", shouldThrow: false });

  const isAuth =
    isRegister ||
    isLogin ||
    isWorkCreate ||
    isWorkCreateEvent ||
    isProfileEdit ||
    isNfc;
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  const { user, isAuthenticated, logout } = useAuth();

  const handleMenuClick = () => {
    console.log("handleMenuClick");
    setIsMenuOpen((prev) => !prev);
  };

  const handleLogout = () => {
    console.log("logout");
    setIsMenuOpen(false);
    logout();
    navigate({ to: "/" });
  };

  return (
    <>
      {isAuth ? (
        <header
          className={clsx(
            "flex h-14 items-center justify-center",
            isNfc && "bg-mesh bg-black text-white",
            !isNfc && "border-b border-gray-300",
          )}
        >
          <div className="font-main text-2xl">HackMeet</div>
        </header>
      ) : (
        <header className="flex min-h-25 justify-center border-b border-gray-300 px-8 pt-4">
          <div className="font-main flex w-full flex-col">
            <div className="flex flex-row items-center">
              <div className="flex grow text-2xl">HackMeet</div>
              <div className="">
                {isAuthenticated ? (
                  <div>
                    <button type="button" onClick={handleMenuClick}>
                      <img
                        src={user?.avatarUrl || google}
                        className="size-8 rounded-full"
                      />
                      {isMenuOpen && (
                        <div className="absolute top-16 right-8 z-100 h-96 w-52 rounded-md border border-gray-200 bg-white p-3">
                          <div className="flex size-full flex-col justify-start">
                            <div className="flex grow flex-col gap-y-2">
                              <div className="text-center">
                                <Link to="/profile/edit">プロフィール確認</Link>
                              </div>
                              <div className="text-center">
                                <Link to="/profile/edit">作品一覧</Link>
                              </div>
                            </div>
                            <div
                              className="grow-0 text-center"
                              onClick={handleLogout}
                            >
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
                to="/event"
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
