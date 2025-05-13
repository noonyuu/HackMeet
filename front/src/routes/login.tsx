import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { gql, useMutation } from "@apollo/client";

import github from "@/assets/icons/github.svg";
import google from "@/assets/icons/google.svg";
import eye from "@/assets/icons/eye.svg";
import eyeOff from "@/assets/icons/eye-off.svg";

import { Button } from "@/components/ui/button";
import { LoginSchema } from "@/schema/login";

export const Route = createFileRoute("/login")({
  component: RouteComponent,
});

const CREATE_USER = gql`
  mutation CreateUser($input: NewUser!) {
    createUser(input: $input) {
      email
      password
    }
  }
`;

type CreateUser = {
  email: string;
  password: string;
};

type UserInfoQueryResult = {
  createUser: CreateUser;
};

function RouteComponent() {
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: valibotResolver(LoginSchema),
  });
  const [login, { loading, error }] =
    useMutation<UserInfoQueryResult>(CREATE_USER);

  if (loading) {
    return <div className="p-2">Loading...</div>;
  }
  if (error) {
    return <div className="p-2 text-red-500">Error: {error.message}</div>;
  }

  const handleButtonClick = () => {
    console.log("Button clicked parent");
    window.location.href =
      "http://localhost:8080/api/v1/auth/" + "github" + "?redirect_path=/";
  };

  return (
    <section className="flex flex-col gap-8 pt-8">
      <div className="font-main text-center text-xl">ログイン</div>
      <div className="flex flex-col gap-y-3 rounded-md border border-gray-300 bg-white px-8">
        <div className="flex flex-col gap-3 pt-16">
          <Button variant="sns" size="lg" icon onClick={handleButtonClick}>
            <img src={google} alt="google icon" className="size-4" />
            Googleでログイン
          </Button>
          <Button variant="sns" size="lg" icon onClick={handleButtonClick}>
            <img src={github} alt="github icon" className="size-4" />
            GitHubでログイン
          </Button>
        </div>
        {/* または */}
        <div className="flex items-center justify-center">
          <div className="h-px w-5/12 bg-gray-300" />
          <div className="text-gray-500">または</div>
          <div className="h-px w-5/12 bg-gray-300" />
        </div>
        {/* メールアドレスでログイン */}
        <form
          onSubmit={handleSubmit(async (formData) => {
            try {
              await login({ variables: { input: formData } });
            } catch (e) {
              console.error("ログイン失敗", e);
            }
          })}
          className="flex flex-col gap-3"
        >
          <div>
            <label className="mb-1 block" htmlFor="email">
              メールアドレス
            </label>
            <input
              type="email"
              {...register("email")}
              className="w-full rounded border px-2 py-1"
              id="email"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">
                {errors.email.message as string}
              </p>
            )}
          </div>
          {/* password */}
          <div>
            <label className="mb-1 block" htmlFor="pass">
              パスワード
            </label>
            <div className="flex items-center rounded border pr-4">
              <input
                type={isPasswordVisible ? "text" : "password"}
                {...register("password")}
                className="w-full px-2 py-1 focus:outline-none"
                id="pass"
              />
              <span
                className=""
                onClick={() => setIsPasswordVisible(!isPasswordVisible)}
              >
                <img
                  src={isPasswordVisible ? eye : eyeOff}
                  alt="パスワード表示ONOFFボタン"
                />
              </span>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-500">
                {errors.password.message as string}
              </p>
            )}
          </div>

          <input
            type="submit"
            value="ログイン"
            className="cursor-pointer rounded bg-black py-2 text-white"
          />
        </form>
        <div className="flex flex-col gap-y-3 py-4">
          <div className="text-center">パスワードを忘れた方はこちら</div>
          <div className="text-center">
            <Link to="/register">新規登録はこちら</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
