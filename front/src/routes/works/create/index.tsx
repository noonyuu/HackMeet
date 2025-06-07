import { useMutation } from "@apollo/client";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { useForm, FormProvider, FieldError } from "react-hook-form";
import * as v from "valibot";

import { Card } from "@/components/ui/card/card";
import { useAuth } from "@/hooks/useAuth";
import { ProjectSchema } from "@/schema/work";
import { CREATE_WORK } from "@/graph/work";
import { ProjectInfoQueryResult } from "@/types/project";
import { TextInput } from "@/components/ui/form/TextInput";
import { ImageUpload } from "@/components/ui/form/ImageUpload";
import { TechStackInput } from "@/components/ui/form/TechStackInput";

type ProjectFormData = v.InferOutput<typeof ProjectSchema>;

export const Route = createFileRoute("/works/create/")({
  component: RouteComponent,
});

function RouteComponent() {
  const HOST_URL = import.meta.env.VITE_HOST_URL || "";
  const navigate = useNavigate();
  const { user } = useAuth();
  const [createProject, { loading: createProjectLoading }] =
    useMutation<ProjectInfoQueryResult>(CREATE_WORK);

  const methods = useForm<ProjectFormData>({
    resolver: valibotResolver(ProjectSchema),
    defaultValues: {
      title: "",
      description: "",
      imageFile: [],
      diagramFile: [],
      techs: [],
    },
  });

  const {
    register,
    setValue,
    control,
    handleSubmit,
    formState: { errors },
    trigger,
    reset,
  } = methods;

  const onSubmit = async (formData: ProjectFormData) => {
    try {
      if (!user?.id) {
        alert("ユーザー情報が見つかりません。再度ログインしてください。");
        return;
      }
      const uploadFiles = async (files: File[]): Promise<string[]> => {
        if (!files || files.length === 0) return [];
        const postData = new FormData();
        postData.append("uid", user.id);
        for (const file of files) {
          postData.append("images", file);
        }
        const response = await fetch(`${HOST_URL}image/upload/`, {
          method: "POST",
          body: postData,
        });
        if (!response.ok) throw new Error(`画像のアップロードに失敗しました`);
        const data = await response.json();
        return data.keys;
      };
      const s3ImageUrls = await uploadFiles(formData.imageFile ?? []);
      const s3DiagramImageUrls = await uploadFiles(formData.diagramFile ?? []);
      const projectInputData = {
        title: formData.title,
        description: formData.description || null,
        imageUrl: s3ImageUrls,
        diagramImageUrl:
          s3DiagramImageUrls.length > 0 ? s3DiagramImageUrls : null,
        userIds: [user.id],
        skills: formData.techs,
      };
      await createProject({ variables: { input: projectInputData } });
      alert("登録が完了しました");
      reset();
      navigate({ to: "/" });
    } catch (e) {
      console.error("Error creating project:", e);
      alert(
        `登録中にエラーが発生しました: ${e instanceof Error ? e.message : "不明なエラー"}`,
      );
    }
  };

  return (
    <section className="flex size-full flex-col items-center justify-center bg-gray-100 px-2 py-4 md:py-8">
      <h1 className="w-full py-2 text-center text-2xl font-semibold text-black md:text-left md:text-3xl">
        作品登録
      </h1>
      <Card className="w-full max-w-2xl px-4 py-4 md:px-6 md:py-6">
        <FormProvider {...methods}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <TextInput<ProjectFormData>
              name="title"
              label="作品名"
              register={register}
              error={errors.title}
            />
            <TextInput<ProjectFormData>
              name="description"
              label="作品概要"
              register={register}
              error={errors.description}
              type="textarea"
            />
            <ImageUpload<ProjectFormData>
              name="imageFile"
              label="作品画像 (最大5枚)"
              setValue={setValue}
              trigger={trigger}
              error={errors.imageFile as FieldError}
              maxFiles={4}
            />
            <ImageUpload<ProjectFormData>
              name="diagramFile"
              label="構成図 (最大2枚)"
              setValue={setValue}
              trigger={trigger}
              error={errors.diagramFile as FieldError}
              maxFiles={2}
            />
            <TechStackInput<ProjectFormData> name="techs" control={control} />
            <button
              type="submit"
              disabled={createProjectLoading}
              className="mt-4 w-full rounded-md bg-green-600 px-4 py-2.5 text-base font-semibold text-white shadow-sm hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:outline-none disabled:opacity-50"
            >
              {createProjectLoading ? "送信中..." : "登録する"}
            </button>
          </form>
        </FormProvider>
      </Card>
    </section>
  );
}
