import { useEffect, useState } from "react";
import { gql, useMutation, useQuery } from "@apollo/client";
import { createFileRoute, useParams } from "@tanstack/react-router";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { useForm, FormProvider } from "react-hook-form";

import imagePlus from "@/assets/icons/image-plus.svg";
import imageDelete from "@/assets/icons/circle-x.svg";
import { Card } from "@/components/ui/card/card";
import { useAuth } from "@/hooks/useAuth";
import { EventProjectSchema } from "@/schema/work";

export const Route = createFileRoute("/works/create/$eventId/")({
  component: RouteComponent,
});

// 技術スタックを取得するクエリを追加
const GET_SKILLS = gql`
  query GetSkills {
    skills {
      id
      name
      category
    }
  }
`;

// 作品一覧取得クエリ
const GET_USER_WORKS = gql`
  query ($profileId: String!) {
    worksByProfileId(profileId: $profileId) {
      id
      title
      description
      imageUrl
      skills {
        id
        name
      }
    }
  }
`;

// 作品作成ミューテーション
const CREATE_WORK = gql`
  mutation CreateProjectEvent($input: NewCreateProjectEvent!) {
    createProjectEvent(input: $input) {
      title
      description
      imageUrl
      skills {
        name
      }
      eventId
      userId
    }
  }
`;

type CreateProject = {
  title: string;
  description: string;
  imageFile: File | string | null;
  techs: string[];
};

type ProjectInfoQueryResult = {
  createWork: CreateProject;
};

type Skill = {
  id: string;
  name: string;
  category: string;
};

type UserWork = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  skills: Skill[];
};

function RouteComponent() {
  const HOST_URL = import.meta.env.VITE_HOST_URL || "";
  const { eventId } = useParams({ from: "/works/create/$eventId/" });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [currentSelect, setCurrentSelect] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isNewWork, setIsNewWork] = useState(true);
  const [selectedWorkId, setSelectedWorkId] = useState<string | null>(null);
  const [techOptions, setTechOptions] = useState<
    { value: string; label: string }[]
  >([]);

  const { user } = useAuth();

  const [techsState, setTechsState] = useState<string[]>([]);

  const methods = useForm({
    resolver: valibotResolver(EventProjectSchema),
    defaultValues: {
      ProjectSchema: {
        title: "",
        description: "",
        imageFile: null as unknown as File,
        techs: [],
      },
      eventId: eventId,
    },
  });

  const {
    register,
    setValue,
    getValues,
    handleSubmit,
    reset,
    formState: { errors },
  } = methods;

  const [createProject, { loading: submitLoading }] =
    useMutation<ProjectInfoQueryResult>(CREATE_WORK);

  // スキル一覧を取得
  const { data: skillsData, loading: skillsLoading } = useQuery(GET_SKILLS);

  // ユーザーの既存作品を取得
  const { data: userWorksData, loading: worksLoading } = useQuery(
    GET_USER_WORKS,
    {
      variables: { profileId: user?.id || "" },
      skip: !user?.id,
    },
  );

  // スキルデータが取得できたらtechOptionsを更新
  useEffect(() => {
    if (skillsData?.skills) {
      const options = skillsData.skills.map((skill: Skill) => ({
        value: skill.id,
        label: skill.name,
      }));
      setTechOptions(options);
    }
  }, [skillsData]);

  // フォームの値が変わったら state も更新
  useEffect(() => {
    const subscription = methods.watch((value, { name }) => {
      if (name === "ProjectSchema.techs" || !name) {
        setTechsState((value.ProjectSchema?.techs as string[]) || []);
      }
    });

    return () => subscription.unsubscribe();
  }, [methods]);

  // イベントIDをフォームにセット
  useEffect(() => {
    if (eventId) {
      setValue("eventId", eventId);
    }
  }, [eventId, setValue]);

  // スキルIDからスキル名を取得するヘルパー関数
  const getSkillNameById = (skillId: string): string => {
    const skill = techOptions.find((tech) => tech.value === skillId);
    return skill ? skill.label : skillId;
  };

  // スキル名からスキルIDを取得するヘルパー関数
  const findSkillIdByName = (skillName: string): string => {
    // 完全一致するものを探す
    const exactMatch = techOptions.find(
      (tech) => tech.label.toLowerCase() === skillName.toLowerCase(),
    );

    if (exactMatch) return exactMatch.value;

    // 部分一致するものを探す
    const partialMatch = techOptions.find(
      (tech) =>
        tech.label.toLowerCase().includes(skillName.toLowerCase()) ||
        skillName.toLowerCase().includes(tech.label.toLowerCase()),
    );

    if (partialMatch) return partialMatch.value;

    // 一致するものがなければそのまま返す
    return "";
  };

  // 既存の作品を選択したときの処理
  const handleSelectExistingWork = (workId: string) => {
    // userWorksDataから正しくアクセス
    if (!userWorksData?.worksByProfileId) return;

    const selectedWork = userWorksData.worksByProfileId.find(
      (work: UserWork) => work.id === workId,
    );

    if (selectedWork) {
      setSelectedWorkId(workId);

      // スキルオブジェクトからIDの配列に変換
      const techValues = selectedWork.skills
        ? selectedWork.skills.map(
            (skill: Skill) => findSkillIdByName(skill.name) || skill.id,
          )
        : [];

      // フォームの値をリセット
      reset({
        ProjectSchema: {
          title: selectedWork.title,
          description: selectedWork.description,
          imageFile: selectedWork.imageUrl,
          techs: techValues,
        },
        eventId: eventId,
      });

      // 画像プレビューを設定
      setImagePreview(selectedWork.imageUrl);

      // 技術スタックを更新
      setTechsState(techValues);
      methods.trigger("ProjectSchema.techs");
    }
  };

  // フィルタリングされた技術候補を取得
  const getSuggestions = () => {
    if (!currentSelect) return [];

    return techOptions.filter(
      (tech) =>
        tech.label.toLowerCase().includes(currentSelect.toLowerCase()) &&
        !getValues("ProjectSchema.techs").includes(tech.value),
    );
  };

  const suggestions = getSuggestions();

  // 技術を追加する処理
  const handleAddTech = () => {
    if (!currentSelect.trim()) return;

    // 既存の選択肢から完全一致するものを探す
    const exactMatch = techOptions.find(
      (tech) => tech.label.toLowerCase() === currentSelect.toLowerCase(),
    );

    // 入力と一部一致する候補があるか確認
    const partialMatches = techOptions.filter((tech) =>
      tech.label.toLowerCase().includes(currentSelect.toLowerCase()),
    );

    // 入力と一致する候補が1つだけある場合はその候補を使用
    const singleSuggestion = suggestions.length === 1 ? suggestions[0] : null;

    // 候補がない場合は追加しない
    if (partialMatches.length === 0) {
      setCurrentSelect("");
      setShowSuggestions(false);
      return;
    }

    let techToAdd;

    if (exactMatch) {
      techToAdd = exactMatch.value;
    } else if (singleSuggestion) {
      techToAdd = singleSuggestion.value;
    } else if (partialMatches.length > 0) {
      // 部分一致するものがあれば、最も近いものを使用
      techToAdd = partialMatches[0].value;
    } else {
      // 一致するものがなければ追加しない
      setCurrentSelect("");
      setShowSuggestions(false);
      return;
    }

    // 既に選択されていない場合のみ追加
    if (!getValues("ProjectSchema.techs").includes(techToAdd)) {
      const updated = [...getValues("ProjectSchema.techs"), techToAdd];
      setValue("ProjectSchema.techs", updated);
      // フォームの状態を強制的に更新
      methods.trigger("ProjectSchema.techs");
      setCurrentSelect("");
      setShowSuggestions(false);
    } else {
      // 既に選択されている場合は入力をクリアするだけ
      setCurrentSelect("");
      setShowSuggestions(false);
    }
  };

  // 技術を削除する処理
  const handleRemoveTech = (tech: string) => {
    const currentTechs = getValues("ProjectSchema.techs");
    const updated = currentTechs.filter((t) => t !== tech);
    setValue("ProjectSchema.techs", updated);

    // フォームの状態を強制的に更新
    methods.trigger("ProjectSchema.techs");
  };

  // 技術選択時の処理
  const handleSelectTech = (tech: string) => {
    if (!getValues("ProjectSchema.techs").includes(tech)) {
      const updated = [...getValues("ProjectSchema.techs"), tech];
      setValue("ProjectSchema.techs", updated);
      // フォームの状態を強制的に更新
      methods.trigger("ProjectSchema.techs");
      setCurrentSelect("");
      setShowSuggestions(false);
    }
  };

  // 新規作品/既存作品の切り替え処理
  const handleToggleWorkType = (isNew: boolean) => {
    setIsNewWork(isNew);

    if (isNew) {
      // 新規作成モードに切り替え: フォームをリセット
      reset({
        ProjectSchema: {
          title: "",
          description: "",
          imageFile: null as unknown as File,
          techs: [],
        },
        eventId: eventId,
      });

      setImagePreview(null);
      setTechsState([]);
      setSelectedWorkId(null);
    }
  };

  return (
    <section className="flex size-full flex-col items-center justify-center bg-gray-100 px-2">
      <h1 className="w-full py-2 text-2xl text-black">作品登録</h1>

      <Card className="w-full px-4 py-4">
        {/* イベントID表示 */}
        <div className="mb-4 rounded-md bg-gray-200 p-2">
          <strong>イベントID:</strong> {eventId}
        </div>

        {/* 新規/既存選択 */}
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

        {/* 既存作品選択 */}
        {!isNewWork && (
          <div className="mb-4">
            <label htmlFor="existing-work" className="mb-2 block">
              既存の作品を選択
            </label>
            <select
              id="existing-work"
              className="w-full rounded-md border border-gray-200 px-2 py-2"
              value={selectedWorkId || ""}
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
            {!worksLoading &&
              (!userWorksData?.worksByProfileId ||
                userWorksData.worksByProfileId.length === 0) && (
                <p className="text-sm text-gray-500">
                  登録済みの作品がありません
                </p>
              )}
          </div>
        )}

        <FormProvider {...methods}>
          <form
            onSubmit={handleSubmit(async (formData) => {
              try {
                let imageUrl = formData.ProjectSchema.imageFile;

                if (isNewWork) {
                  const postData = new FormData();
                  postData.append("image", imageUrl as File);
                  postData.append("uid", user?.id || "");

                  const response = await fetch(HOST_URL + "image/upload/", {
                    method: "POST",
                    body: postData,
                  });

                  if (!response.ok) {
                    throw new Error("Failed to upload image");
                  }

                  const data = await response.json();
                  imageUrl = data.key;
                }

                const projectData = {
                  userId: user?.id || "",
                  eventId: formData.eventId,
                  title: formData.ProjectSchema.title,
                  description: formData.ProjectSchema.description,
                  imageUrl: imageUrl,
                  skills: formData.ProjectSchema.techs,
                  workId: !isNewWork ? selectedWorkId : null,
                };

                await createProject({ variables: { input: projectData } });

                // 送信成功後の処理
                alert("作品を登録しました");
              } catch (e) {
                console.error("Error creating project:", e);
                alert("エラーが発生しました");
              }
            })}
            className="flex flex-col gap-2"
          >
            {/* eventIdを隠しフィールドとして追加 */}
            <input type="hidden" {...register("eventId")} />

            <div className="flex flex-col gap-2">
              <label htmlFor="title">作品名</label>
              <input
                type="text"
                {...register("ProjectSchema.title")}
                id="title"
                disabled={!isNewWork && !selectedWorkId} // 既存モードで作品未選択の場合は無効化
                className="rounded-md border border-gray-200 px-2 py-3 focus:outline-gray-400 disabled:bg-gray-100"
              />
              {errors.ProjectSchema?.title && (
                <p className="text-sm text-red-500">
                  {errors.ProjectSchema?.title.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="description">作品概要</label>
              <textarea
                {...register("ProjectSchema.description")}
                id="description"
                disabled={!isNewWork && !selectedWorkId}
                className="rounded-md border border-gray-200 px-2 py-3 focus:outline-gray-400 disabled:bg-gray-100"
              />
              {errors.ProjectSchema?.description && (
                <p className="text-sm text-red-500">
                  {errors.ProjectSchema?.description.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <div>作品画像</div>
              {!imagePreview ? (
                <label
                  htmlFor="project-image"
                  className={`flex h-[200px] cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed border-gray-300 focus-within:border-gray-500 ${
                    !isNewWork && !selectedWorkId
                      ? "pointer-events-none opacity-50"
                      : ""
                  }`}
                >
                  <img src={imagePlus} alt="画像追加アイコン" />
                  <span className="text-sm text-gray-500">
                    画像をアップロードしてください
                  </span>
                  <span className="text-xs text-gray-400">
                    JPG, PNG (最大 5MB)
                  </span>
                  <input
                    {...register("ProjectSchema.imageFile")}
                    id="project-image"
                    type="file"
                    accept="image/*"
                    disabled={!isNewWork && !selectedWorkId}
                    className="sr-only"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setImagePreview(reader.result as string);
                          methods.setValue("ProjectSchema.imageFile", file);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
              ) : (
                <div className="relative flex h-[200px] cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed border-gray-300 focus-within:border-gray-500">
                  <button
                    type="button"
                    className={`absolute top-2 right-2 z-10 ${
                      !isNewWork && !selectedWorkId ? "hidden" : ""
                    }`}
                    onClick={() => {
                      setImagePreview(null);
                      setValue(
                        "ProjectSchema.imageFile",
                        null as unknown as File,
                      );
                    }}
                    disabled={!isNewWork && !selectedWorkId}
                  >
                    <img src={imageDelete} alt="削除" />
                  </button>
                  <img
                    src={
                      isNewWork
                        ? imagePreview
                        : `${HOST_URL}image/upload/get?date=${imagePreview}`
                    }
                    alt="プレビュー"
                    className="h-full w-full rounded-md object-contain"
                  />
                </div>
              )}
              {errors.ProjectSchema?.imageFile && (
                <p className="text-sm text-red-500">
                  {errors.ProjectSchema.imageFile.message}
                </p>
              )}
            </div>

            {/* 技術選択フォーム */}
            <div className="flex flex-col gap-2">
              <label htmlFor="tech-select">技術スタック</label>
              <div className="relative">
                <input
                  id="tech-select"
                  type="text"
                  value={currentSelect}
                  disabled={(!isNewWork && !selectedWorkId) || skillsLoading}
                  onChange={(e) => {
                    setCurrentSelect(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTech();
                    } else if (e.key === "Escape") {
                      setShowSuggestions(false);
                    }
                  }}
                  onFocus={() => {
                    if (currentSelect) setShowSuggestions(true);
                  }}
                  onBlur={() => {
                    // 候補クリック時に即座に閉じないよう少し遅延させる
                    setTimeout(() => setShowSuggestions(false), 150);
                  }}
                  placeholder="例: React"
                  className="w-full rounded-md border border-gray-200 px-2 py-2 focus:outline-gray-400 disabled:bg-gray-100"
                />

                {skillsLoading && (
                  <p className="text-sm text-gray-500">
                    スキル一覧を読み込み中...
                  </p>
                )}

                {/* 候補リスト */}
                {showSuggestions && currentSelect && !skillsLoading && (
                  <ul className="absolute z-10 mt-1 max-h-40 w-full overflow-y-auto rounded-md border border-gray-300 bg-white shadow">
                    {suggestions.length > 0 ? (
                      suggestions.map((option) => (
                        <li key={option.value}>
                          <button
                            type="button"
                            onClick={() => handleSelectTech(option.value)}
                            className="w-full px-3 py-2 text-left hover:bg-gray-100"
                          >
                            {option.label}
                          </button>
                        </li>
                      ))
                    ) : (
                      <li className="px-3 py-2 text-gray-500">該当なし</li>
                    )}
                  </ul>
                )}
              </div>

              {/* 選択された技術タグ表示 */}
              <div className="mt-2 flex flex-wrap gap-2">
                {techsState.map((techId) => {
                  const skillName = getSkillNameById(techId);

                  return (
                    <div
                      key={techId}
                      className="flex items-center gap-1 rounded-full bg-gray-200 px-3 py-1 text-sm"
                    >
                      <span>{skillName}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTech(techId)}
                        className="text-gray-600 hover:text-red-500"
                        disabled={!isNewWork && !selectedWorkId}
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>

              {errors.ProjectSchema?.techs && (
                <p className="text-sm text-red-500">
                  {errors.ProjectSchema.techs.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={
                submitLoading ||
                (!isNewWork && !selectedWorkId) ||
                skillsLoading
              }
              className="mt-4 rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600 disabled:bg-gray-400"
            >
              {submitLoading ? "送信中..." : "送信"}
            </button>
          </form>
        </FormProvider>
      </Card>
    </section>
  );
}
