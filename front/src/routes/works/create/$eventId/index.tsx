import { useMutation, useQuery } from "@apollo/client";
import {
  createFileRoute,
  useNavigate,
  useParams,
} from "@tanstack/react-router";
import { valibotResolver } from "@hookform/resolvers/valibot";
import {
  useForm,
  FormProvider,
  FieldError,
  SubmitErrorHandler,
} from "react-hook-form";
import * as v from "valibot";

import { Card } from "@/components/ui/card/card";
import { useAuth } from "@/hooks/useAuth";
import { CREATE_WORK_EVENT, GET_USER_WORKS } from "@/graph/work";
import { ProjectInfoQueryResult } from "@/types/project";
import { UserWork } from "@/types/user";
import { ImageUpload } from "@/components/ui/form/ImageUpload";
import { TechStackInput } from "@/components/ui/form/TechStackInput";
import { TextInput } from "@/components/ui/form/TextInput";
import { UserSearchInput } from "@/components/ui/form/UserSearchInput";
import { useState, useMemo } from "react";
import { EventProjectSchema } from "@/schema/work";

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
      ProjectSchema: {
        title: "",
        description: "",
        imageFile: [],
        diagramFile: [],
        techs: [],
        userIds: [],
      },
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
        imageFile: {
          files: [],
          existingUrls: work?.imageUrl || [],
        },
        diagramFile: {
          files: [],
          existingUrls: work?.diagramImageUrl || [],
        },
        userIds:
          work?.profile.map(
            (p: { id: string; nickName?: string; name?: string }) => ({
              id: p.id,
              nickName: p.nickName,
            }),
          ) || [],
      },
    });
  };
  const onInvalid: SubmitErrorHandler<ProjectFormData> = (errors) => {
    console.error("Form Validation Errors:", errors);
    alert("入力内容にエラーがあります。コンソールを確認してください。");
  };

  const handleToggleWorkType = (isNew: boolean) => {
    setIsNewWork(isNew);
    setSelectedWork(null);
    reset({
      eventId: eventId,
      ProjectSchema: {
        title: "",
        description: "",
        techs: [],
        imageFile: [],
        diagramFile: [],
        userIds: [],
      },
    });
  };

  const onSubmit = async (formData: ProjectFormData) => {
    console.log("Form Data:", formData);
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
      const extractFiles = (input: unknown): File[] => {
        if (Array.isArray(input)) return input as File[];
        if (
          input &&
          typeof input === "object" &&
          "files" in input &&
          Array.isArray((input as { files: unknown }).files)
        ) {
          return (input as { files: File[] }).files;
        }
        return [];
      };

      const s3ImageUrls = await uploadFiles(
        extractFiles(formData.ProjectSchema.imageFile),
      );
      const s3DiagramImageUrls = await uploadFiles(
        extractFiles(formData.ProjectSchema.diagramFile),
      );

      interface Collaborator {
        id: string;
        nickName?: string;
      }

      interface ProjectSchema {
        title: string;
        description: string;
        imageFile: File[] | { files: File[]; existingUrls?: string[] };
        diagramFile: File[] | { files: File[]; existingUrls?: string[] };
        techs: string[];
        userIds: Collaborator[];
      }

      interface ProjectFormDataTyped {
        ProjectSchema: ProjectSchema;
        eventId: string;
      }

      const collaboratorIds: string[] = (
        formData as ProjectFormDataTyped
      ).ProjectSchema.userIds.map((user: Collaborator) => user.id);
      const allUserIds = [user.id, ...collaboratorIds];

      const projectInputData = {
        title: formData.ProjectSchema.title,
        description: formData.ProjectSchema.description,
        imageUrl: s3ImageUrls,
        diagramImageUrl:
          s3DiagramImageUrls.length > 0 ? s3DiagramImageUrls : null,
        userIds: allUserIds,
        eventId: formData.eventId,
        skills: formData.ProjectSchema.techs,
        workId: !isNewWork ? selectedWork?.id : null,
      };

      console.log("Project Input Data:", formData.ProjectSchema.userIds);

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
      const imageUrlKey = selectedWork.imageUrl;
      return imageUrlKey.map(
        (url: string) => `${HOST_URL}image/upload/get?date=${url}`,
      );
    }
    return [];
  }, [HOST_URL, isNewWork, selectedWork]);

  // 既存作品の構成図URLを生成
  const initialDiagramUrls = useMemo(() => {
    if (!isNewWork && selectedWork?.diagramUrl) {
      const diagramUrlKey = selectedWork.diagramUrl;
      return diagramUrlKey.map(
        (url: string) => `${HOST_URL}image/upload/get?date=${url}`,
      );
    }
    return [];
  }, [HOST_URL, isNewWork, selectedWork]);

  return (
    <section className="flex size-full flex-col items-center justify-center bg-gray-100 px-2">
      <h1 className="w-full py-2 text-2xl text-black">作品登録</h1>
      <Card className="w-full px-4 py-4">
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
            onSubmit={handleSubmit(onSubmit, onInvalid)}
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
              <ImageUpload<ProjectFormData>
                name="ProjectSchema.diagramFile"
                label="構成図 (最大2枚)"
                setValue={setValue}
                trigger={trigger}
                error={errors.ProjectSchema?.diagramFile as FieldError}
                maxFiles={2}
                initialUrls={initialDiagramUrls}
              />
              <TechStackInput<ProjectFormData>
                name="ProjectSchema.techs"
                control={control}
              />
              <UserSearchInput<ProjectFormData>
                name="ProjectSchema.userIds"
                control={control}
                label="一緒に制作した人"
                placeholder="ユーザー名で検索..."
                currentUserId={user?.id}
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
