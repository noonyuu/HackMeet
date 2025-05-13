import { gql, useQuery } from "@apollo/client";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/")({
  component: Index,
});

const PROFILE = gql`
  query ($id: String!) {
    profile(id: $id) {
      id
      nickName
    }
  }
`;

type Profile = {
  id: string;
  nickName: string;
};

type ProfileQueryResult = {
  profile: Profile;
};

function Index() {
  // const { loading, error, data } = useQuery<ProfileQueryResult>(PROFILE, {
  //   variables: { id: "ab0bedb3-aece-4c49-a8d4-9c8e9942cc2d" },
  //   fetchPolicy: "network-only",
  // });
  // const profile = data?.profile;
  // if (loading) {
  //   return <div className="p-2">Loading...</div>;
  // }
  // if (error) {
  //   return <div className="p-2 text-red-500">Error: {error.message}</div>;
  // }

  const fetchWithRefresh = async (url: string, options: RequestInit = {}) => {
    let response = await fetch(url, {
      ...options,
      credentials: "include", // クッキー送信が必要なら include
    });

    if (response.status === 401) {
      // アクセストークンが無効 → リフレッシュを試みる
      const refreshRes = await fetch(
        "http://localhost:8080/api/v1/auth/refresh",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // クッキー型のリフレッシュトークンを使う場合
        },
      );

      if (refreshRes.ok) {
        // 新しいアクセストークンで再試行
        response = await fetch(url, {
          ...options,
          credentials: "include",
        });
      } else {
        throw new Error("リフレッシュに失敗しました。再ログインが必要です。");
      }
    }

    return response;
  };

  const handleClick = async () => {
    try {
      const response = await fetchWithRefresh(
        "http://localhost:8080/api/v1/auth/getUser/google",
      );

      if (response.ok) {
        const data = await response.json();
        console.log("Response data:", data);
      } else {
        console.error("Failed to fetch user:", response.statusText);
      }
    } catch (error) {
      console.error("Error:", error);
      alert(
        "セッションが切れている可能性があります。再度ログインしてください。",
      );
    }
  };
  return (
    <div className="p-2">
      <div>Hello from Index!</div>
      <div className="p-2">
        {/* {profile ? (
          <div>
            <h2>Profile</h2>
            <ul>
              <li>ID: {profile.id}</li>
              <li>NickName: {profile.nickName}</li>
            </ul>
          </div>
        ) : (
          <div>
            No profile found
          </div>
        )} */}
        <button onClick={handleClick}>get user</button>
      </div>
    </div>
  );
}
