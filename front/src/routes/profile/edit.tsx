import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { useForm, FormProvider } from "react-hook-form";
import { useMutation } from "@apollo/client";

import { useAuth } from "@/hooks/useAuth";
import { ProfileSchema, ProfileSchemaType } from "@/schema/profile";
import { UPDATE_PROFILE } from "@/graph/user";
import { UpdateProfile as UpdateProfileMutationType } from "@/types/user";

export const Route = createFileRoute("/profile/edit")({
  component: RouteComponent,
});

function RouteComponent() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const methods = useForm<ProfileSchemaType>({
    resolver: valibotResolver(ProfileSchema),
    defaultValues: {
      nickName: "",
      graduationYear: 0,
      affiliation: "",
      bio: "",
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = methods;

  useEffect(() => {
    if (user) {
      reset({
        nickName: user.nickName || "",
        graduationYear: user.graduationYear || 0,
        affiliation: user.affiliation || "",
        bio: user.bio || "",
      });
    }
  }, [user, reset]);

  const [updateProfileMutation, { loading: submitLoading }] =
    useMutation<UpdateProfileMutationType>(UPDATE_PROFILE);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="text-lg font-semibold text-slate-700">
          プロフィール情報を読み込み中です...
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="rounded-lg bg-white p-8 text-center shadow-lg">
          <h2 className="mb-4 text-xl font-semibold text-slate-700">エラー</h2>
          <p className="text-slate-600">
            ユーザー情報が見つかりません。プロフィールの編集はできません。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-gradient-to-br px-4 py-8 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl">
        <div className="space-y-8 rounded-xl bg-white p-8 shadow-2xl md:p-12">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-800">
              プロフィール編集
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              最新の情報に更新しましょう。
            </p>
          </div>

          <FormProvider {...methods}>
            <form
              onSubmit={handleSubmit(async (data) => {
                if (!user) {
                  console.error(
                    "ユーザー情報が存在しないため、更新できません。",
                  );
                  return;
                }
                try {
                  const inputData = {
                    id: user.id,
                    nickName: data.nickName,
                    graduationYear: data.graduationYear
                      ? Number(data.graduationYear)
                      : null,
                    affiliation: data.affiliation || null,
                    bio: data.bio || null,
                  };
                  await updateProfileMutation({
                    variables: {
                      input: inputData,
                    },
                  });
                  navigate({ to: "/" });
                } catch (error) {
                  console.error("プロファイル更新に失敗しました:", error);
                  alert(
                    "プロフィールの更新に失敗しました。もう一度お試しください。",
                  );
                }
              })}
              className="space-y-6"
            >
              {/* ニックネーム */}
              <div>
                <label
                  htmlFor="nickName"
                  className="mb-1 block text-sm font-medium text-slate-700"
                >
                  ニックネーム
                </label>
                <input
                  id="nickName"
                  type="text"
                  {...register("nickName")}
                  placeholder="例: 山田 太郎"
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-3 shadow-sm transition duration-150 ease-in-out focus:border-sky-500 focus:ring-sky-500 focus:outline-none sm:text-sm"
                />
                {errors.nickName && (
                  <p className="mt-2 text-xs text-red-600">
                    {errors.nickName.message}
                  </p>
                )}
              </div>

              {/* 卒業年 */}
              <div>
                <label
                  htmlFor="graduationYear"
                  className="mb-1 block text-sm font-medium text-slate-700"
                >
                  卒業年 (任意)
                </label>
                <input
                  id="graduationYear"
                  type="number"
                  {...register("graduationYear", { valueAsNumber: true })}
                  placeholder="例: 2025"
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-3 shadow-sm transition duration-150 ease-in-out focus:border-sky-500 focus:ring-sky-500 focus:outline-none sm:text-sm"
                />
                {errors.graduationYear && (
                  <p className="mt-2 text-xs text-red-600">
                    {errors.graduationYear.message}
                  </p>
                )}
              </div>

              {/* 所属 */}
              <div>
                <label
                  htmlFor="affiliation"
                  className="mb-1 block text-sm font-medium text-slate-700"
                >
                  所属 (任意)
                </label>
                <input
                  id="affiliation"
                  type="text"
                  {...register("affiliation")}
                  placeholder="例: 株式会社〇〇 / △△大学"
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-3 shadow-sm transition duration-150 ease-in-out focus:border-sky-500 focus:ring-sky-500 focus:outline-none sm:text-sm"
                />
                {errors.affiliation && (
                  <p className="mt-2 text-xs text-red-600">
                    {errors.affiliation.message}
                  </p>
                )}
              </div>

              {/* 自己紹介 */}
              <div>
                <label
                  htmlFor="bio"
                  className="mb-1 block text-sm font-medium text-slate-700"
                >
                  自己紹介 (任意)
                </label>
                <textarea
                  id="bio"
                  {...register("bio")}
                  rows={4}
                  placeholder="あなたのことを教えてください"
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-3 shadow-sm transition duration-150 ease-in-out focus:border-sky-500 focus:ring-sky-500 focus:outline-none sm:text-sm"
                />
                {errors.bio && (
                  <p className="mt-2 text-xs text-red-600">
                    {errors.bio.message}
                  </p>
                )}
              </div>

              {/* 更新ボタン */}
              <div>
                <button
                  type="submit"
                  disabled={submitLoading || authLoading}
                  className="flex w-full justify-center rounded-lg border border-transparent bg-sky-600 px-4 py-3 text-sm font-medium text-white shadow-sm transition duration-150 ease-in-out hover:bg-sky-700 focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                  {submitLoading ? (
                    <>
                      <svg
                        className="mr-3 -ml-1 h-5 w-5 animate-spin text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      更新中...
                    </>
                  ) : (
                    "プロフィールを更新"
                  )}
                </button>
              </div>
            </form>
          </FormProvider>
        </div>
      </div>
    </div>
  );
}
