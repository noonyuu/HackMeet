import { useMemo } from "react";
import { useQuery, useMutation } from "@apollo/client";
import {
  createFileRoute,
  useNavigate,
  useParams,
} from "@tanstack/react-router";
import {
  useForm,
  FormProvider,
  FieldError,
  SubmitHandler,
} from "react-hook-form";
import { valibotResolver } from "@hookform/resolvers/valibot";

import { Card } from "@/components/ui/card/card";
import { useAuth } from "@/hooks/useAuth";
import { createProjectSchema, UpdateFormData } from "@/schema/work";
import { GET_WORK, UPDATE_WORK } from "@/graph/work";
import { Work } from "@/types/project";
import { TextInput } from "@/components/ui/form/TextInput";
import { ImageUpload } from "@/components/ui/form/ImageUpload";
import { TechStackInput } from "@/components/ui/form/TechStackInput";
import { UserSearchInput } from "@/components/ui/form/UserSearchInput";

type WorkQueryResult = {
  work: Work;
};

function ProjectEditForm({ work }: { work: Work }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const HOST_URL = import.meta.env.VITE_HOST_URL || "";
  const { projectId } = useParams({ from: "/profile/$projectId/" });

  const initialImageUrls = useMemo(
    () =>
      (work.imageUrl || []).map(
        (key) => `${HOST_URL}image/upload/get?date=${encodeURIComponent(key)}`,
      ),
    [work.imageUrl, HOST_URL],
  );
  const initialDiagramUrls = useMemo(
    () =>
      (work.diagramImageUrl || []).map(
        (key) => `${HOST_URL}image/upload/get?date=${encodeURIComponent(key)}`,
      ),
    [work.diagramImageUrl, HOST_URL],
  );

  const projectSchema = useMemo(
    () =>
      createProjectSchema({
        isImageRequired: initialImageUrls.length === 0,
      }),
    [initialImageUrls.length],
  );

  const methods = useForm<UpdateFormData>({
    resolver: valibotResolver(projectSchema),
    mode: "onChange",
    defaultValues: {
      title: work.title || "",
      description: work.description || "",
      techs: work.skills?.map((skill) => skill.id) || [],
      userIds:
        work?.profile.map(
          (p: { id: string; nickName?: string; name?: string }) => ({
            id: p.id,
            nickName: p.nickName,
          }),
        ) || [],
      imageFile: {
        files: [],
        existingUrls: work.imageUrl || [],
      },
      diagramFile: {
        files: [],
        existingUrls: work.diagramImageUrl || [],
      },
    },
  });

  const {
    register,
    control,
    setValue,
    trigger,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = methods;

  const [updateWork, { loading: mutationLoading }] = useMutation(UPDATE_WORK);
  // フォーム送信処理
  const onSubmit: SubmitHandler<UpdateFormData> = async (formData) => {
    try {
      if (!user?.id) throw new Error("ユーザー情報が見つかりません");

      const uploadFiles = async (
        files: File[] | undefined,
      ): Promise<string[]> => {
        if (!files || files.length === 0) return [];
        const postData = new FormData();
        postData.append("uid", user.id);
        files.forEach((file) => postData.append("images", file));

        const response = await fetch(`${HOST_URL}image/upload/`, {
          method: "POST",
          body: postData,
        });
        if (!response.ok)
          throw new Error(
            `画像のアップロードに失敗しました: ${await response.text()}`,
          );
        const result = await response.json();
        return result.keys;
      };

      const imageFiles = Array.isArray(formData.imageFile)
        ? formData.imageFile
        : formData.imageFile.files;
      const diagramFiles = Array.isArray(formData.diagramFile)
        ? formData.diagramFile
        : formData.diagramFile.files;

      // 既存のURLからdate=パラメータを抽出し、空文字を除外
      const existingImageUrls = Array.isArray(formData.imageFile)
        ? []
        : formData.imageFile.existingUrls
            .map((url) => {
              const dateParam = url.split("date=")[1];
              return dateParam ? decodeURIComponent(dateParam) : null;
            })
            .filter(
              (dateParam): dateParam is string =>
                dateParam !== null && dateParam !== "",
            );

      const existingDiagramUrls = Array.isArray(formData.diagramFile)
        ? []
        : formData.diagramFile.existingUrls
            .map((url) => {
              const dateParam = url.split("date=")[1];
              return dateParam ? decodeURIComponent(dateParam) : null;
            })
            .filter(
              (dateParam): dateParam is string =>
                dateParam !== null && dateParam !== "",
            );

      const newImageKeys = await uploadFiles(imageFiles);
      const newDiagramKeys = await uploadFiles(diagramFiles);

      const updateInput = {
        title: formData.title,
        description: formData.description,
        imageUrl:
          existingImageUrls.length > 0
            ? [...existingImageUrls, ...newImageKeys]
            : work.imageUrl || [],
        diagramImageUrl:
          existingDiagramUrls.length > 0
            ? [...existingDiagramUrls, ...newDiagramKeys]
            : work.diagramImageUrl || [],
        skills: formData.techs,
        userIds: formData.userIds || [],
      };
      console.log("更新データ:", updateInput);

      await updateWork({ variables: { id: projectId, input: updateInput } });
      alert("作品を更新しました。");
      navigate({ to: "/profile/project_list" });
    } catch (e) {
      console.error("更新エラー:", e);
      alert(
        `エラーが発生しました: ${e instanceof Error ? e.message : "不明なエラー"}`,
      );
    }
  };

  const onError = (
    errors: import("react-hook-form").FieldErrors<UpdateFormData>,
  ) => {
    console.log("バリデーションエラー:", errors);
    alert("入力内容に問題があります。エラーを確認してください。");
  };

  return (
    <section className="flex size-full flex-col items-center justify-center bg-gray-100 px-2 py-4 md:py-8">
      <Card className="w-full max-w-2xl px-4 py-4 md:px-6 md:py-6">
        <FormProvider {...methods}>
          <form
            onSubmit={handleSubmit(onSubmit, onError)}
            className="flex flex-col gap-4"
          >
            <TextInput<UpdateFormData>
              name="title"
              label="作品名"
              register={register}
              error={errors.title}
            />
            <TextInput<UpdateFormData>
              name="description"
              label="作品概要"
              register={register}
              error={errors.description}
              type="textarea"
            />
            <ImageUpload<UpdateFormData>
              name="imageFile"
              label="作品画像"
              setValue={setValue}
              trigger={trigger}
              error={errors.imageFile as FieldError}
              maxFiles={4}
              initialUrls={initialImageUrls}
            />
            <ImageUpload<UpdateFormData>
              name="diagramFile"
              label="構成図 (最大2枚)"
              setValue={setValue}
              trigger={trigger}
              error={errors.diagramFile as FieldError}
              maxFiles={2}
              initialUrls={initialDiagramUrls}
            />
            <TechStackInput<UpdateFormData> name="techs" control={control} />
            <UserSearchInput<UpdateFormData>
              name="ProjectSchema.userIds"
              control={control}
              label="一緒に制作した人"
              placeholder="ユーザー名で検索..."
              currentUserId={user?.id}
            />
            <button
              type="submit"
              disabled={mutationLoading || isSubmitting}
              className="mt-4 w-full rounded-md bg-blue-600 px-4 py-2.5 text-base font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none disabled:opacity-50"
            >
              {mutationLoading || isSubmitting ? "更新中..." : "更新する"}
            </button>
          </form>
        </FormProvider>
      </Card>
    </section>
  );
}

export const Route = createFileRoute("/profile/$projectId/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { projectId } = useParams({ from: "/profile/$projectId/" });

  const { data, loading, error } = useQuery<WorkQueryResult>(GET_WORK, {
    variables: { id: projectId },
    skip: !projectId,
  });

  if (loading) return <div className="p-8 text-center">読み込み中...</div>;
  if (error)
    return (
      <div className="p-8 text-center text-red-500">
        エラー: {error.message}
      </div>
    );
  if (!data?.work)
    return <div className="p-8 text-center">作品データが見つかりません。</div>;

  return <ProjectEditForm work={data.work} />;
}
