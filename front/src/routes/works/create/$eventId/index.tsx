import { useMutation, useQuery } from "@apollo/client";
import {
  createFileRoute,
  useNavigate,
  useParams,
} from "@tanstack/react-router";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { useForm, FormProvider, FieldError } from "react-hook-form";
import * as v from "valibot";

import { Card } from "@/components/ui/card/card";
import { useAuth } from "@/hooks/useAuth";
import { EventProjectSchema } from "@/schema/work";
import { CREATE_WORK_EVENT, GET_USER_WORKS } from "@/graph/work";
import { ProjectInfoQueryResult } from "@/types/project";
import { UserWork } from "@/types/user";
import { ImageUpload } from "@/components/ui/form/ImageUpload";
import { TechStackInput } from "@/components/ui/form/TechStackInput";
import { TextInput } from "@/components/ui/form/TextInput";
import { useState, useMemo } from "react";

type ProjectFormData = v.InferOutput<typeof EventProjectSchema>;

export const Route = createFileRoute("/works/create/$eventId/")({
  component: RouteComponent,
});

function RouteComponent() {
  const HOST_URL = import.meta.env.VITE_HOST_URL || "";
  const { eventId } = useParams({ from: "/works/create/$eventId/" });
  const navigate = useNavigate();
  const { user } = useAuth();

  const [isNewWork, setIsNewWork] = useState(true);
  const [selectedWork, setSelectedWork] = useState<UserWork | null>(null);

  const methods = useForm<ProjectFormData>({
    resolver: valibotResolver(EventProjectSchema),
    defaultValues: {
      ProjectSchema: { title: "", description: "", imageFile: [], techs: [] },
      eventId: eventId,
    },
  });

  const {
    register,
    control,
    setValue,
    trigger,
    handleSubmit,
    reset,
    formState: { errors },
  } = methods;

  const [createProject, { loading: submitLoading }] =
    useMutation<ProjectInfoQueryResult>(CREATE_WORK_EVENT);

  const { data: userWorksData, loading: worksLoading } = useQuery(
    GET_USER_WORKS,
    {
      variables: { profileId: user?.id || "" },
      skip: !user?.id,
    },
  );

  const handleSelectExistingWork = (workId: string) => {
    const work = userWorksData?.worksByProfileId?.find(
      (w: UserWork) => w.id === workId,
    );
    setSelectedWork(work || null);
    reset({
      eventId: eventId,
      ProjectSchema: {
        title: work?.title || "",
        description: work?.description || "",
        techs: work?.skills.map((skill: { id: string }) => skill.id) || [],
        imageFile: work?.imageUrl || [],
      },
    });
  };

  const handleToggleWorkType = (isNew: boolean) => {
    setIsNewWork(isNew);
    setSelectedWork(null);
    reset({
      eventId: eventId,
      ProjectSchema: { title: "", description: "", techs: [], imageFile: [] },
    });
  };

  const onSubmit = async (formData: ProjectFormData) => {
    try {
      if (!user?.id) {
        alert("ユーザー情報が見つかりません。再度ログインしてください。");
        return;
      }
      let finalImageUrl: string | string[] | null = null;
      const newImageFiles = formData.ProjectSchema.imageFile;
      if (isNewWork && newImageFiles && newImageFiles.length > 0) {
        const postData = new FormData();
        postData.append("image", newImageFiles[0]);
        postData.append("uid", user.id);
        const response = await fetch(`${HOST_URL}image/upload/`, {
          method: "POST",
          body: postData,
        });
        if (!response.ok) throw new Error("画像のアップロードに失敗しました。");
        const data = await response.json();
        finalImageUrl = data.key;
      } else if (!isNewWork && selectedWork) {
        finalImageUrl = selectedWork.imageUrl;
      }
      const projectInputData = {
        title: formData.ProjectSchema.title,
        description: formData.ProjectSchema.description,
        imageUrl: finalImageUrl,
        userIds: [user.id],
        eventId: formData.eventId,
        skills: formData.ProjectSchema.techs,
        workId: !isNewWork ? selectedWork?.id : null,
      };
      await createProject({ variables: { input: projectInputData } });
      alert("作品を登録しました");
      navigate({ to: "/" });
    } catch (e) {
      console.error("作品の登録に失敗しました:", e);
      alert("エラーが発生しました");
    }
  };

  // 既存作品の画像URLを生成
  const initialImageUrls = useMemo(() => {
    if (!isNewWork && selectedWork?.imageUrl) {
      console.log("Selected work:", selectedWork?.imageUrl);
      const imageUrlKey = selectedWork.imageUrl;
      return imageUrlKey.map(
        (url: string) => `${HOST_URL}image/upload/get?date=${url}`,
      );
      // return ;
    }
    return [];
  }, [HOST_URL, isNewWork, selectedWork?.imageUrl]);

  return (
    <section className="flex size-full flex-col items-center justify-center bg-gray-100 px-2">
      <h1 className="w-full py-2 text-2xl text-black">作品登録</h1>
      <Card className="w-full px-4 py-4">
        <div className="mb-4 rounded-md bg-gray-200 p-2">
          <strong>イベントID:</strong> {eventId}
        </div>
        <div className="mb-4 flex space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              checked={isNewWork}
              onChange={() => handleToggleWorkType(true)}
              className="h-4 w-4"
            />
            <span>新規作品を登録</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              checked={!isNewWork}
              onChange={() => handleToggleWorkType(false)}
              className="h-4 w-4"
            />
            <span>既存の作品を使用</span>
          </label>
        </div>
        {!isNewWork && (
          <div className="mb-4">
            <label htmlFor="existing-work" className="mb-2 block">
              既存の作品を選択
            </label>
            <select
              id="existing-work"
              className="w-full rounded-md border border-gray-200 px-2 py-2"
              value={selectedWork?.id || ""}
              onChange={(e) => handleSelectExistingWork(e.target.value)}
            >
              <option value="">作品を選択してください</option>
              {userWorksData?.worksByProfileId?.map((work: UserWork) => (
                <option key={work.id} value={work.id}>
                  {work.title}
                </option>
              ))}
            </select>
            {worksLoading && (
              <p className="text-sm text-gray-500">作品を読み込み中...</p>
            )}
          </div>
        )}
        <FormProvider {...methods}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <div
              className={`${!isNewWork && !selectedWork ? "pointer-events-none opacity-50" : ""}`}
            >
              <TextInput<ProjectFormData>
                name="ProjectSchema.title"
                label="作品名"
                register={register}
                error={errors.ProjectSchema?.title}
              />
              <TextInput<ProjectFormData>
                name="ProjectSchema.description"
                label="作品概要"
                register={register}
                error={errors.ProjectSchema?.description}
                type="textarea"
              />
              <ImageUpload<ProjectFormData>
                name="ProjectSchema.imageFile"
                label="作品画像"
                setValue={setValue}
                trigger={trigger}
                error={errors.ProjectSchema?.imageFile as FieldError}
                maxFiles={4}
                initialUrls={initialImageUrls}
              />
              <TechStackInput<ProjectFormData>
                name="ProjectSchema.techs"
                control={control}
              />
            </div>
            <button
              type="submit"
              disabled={submitLoading || (!isNewWork && !selectedWork)}
              className="mt-4 rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600 disabled:bg-gray-400"
            >
              {submitLoading ? "登録中..." : "登録する"}
            </button>
          </form>
        </FormProvider>
      </Card>
    </section>
  );
}
