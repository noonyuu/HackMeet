import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { useForm, FormProvider } from "react-hook-form";

import imagePlus from "@/assets/icons/image-plus.svg";
import imageDelete from "@/assets/icons/circle-x.svg";
import { Card } from "@/components/ui/card/card";
import { useAuth } from "@/hooks/useAuth";
import { ProjectSchema } from "@/schema/work";

// graphql
import { CREATE_WORK } from "@/graph/work";
import { GET_SKILLS } from "@/graph/skill";
// types
import { Skill } from "@/types/skill";
import { ProjectInfoQueryResult } from "@/types/project";

export const Route = createFileRoute("/works/create/")({
  component: RouteComponent,
});

function RouteComponent() {
  const HOST_URL = import.meta.env.VITE_HOST_URL || "";
  const navigate = useNavigate();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [currentSelect, setCurrentSelect] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [techOptions, setTechOptions] = useState<
    { value: string; label: string }[]
  >([]);

  const { user } = useAuth();

  const [techsState, setTechsState] = useState<string[]>([]);
  // スキルを取得
  const { data: skillsData, loading: skillsLoading } = useQuery(GET_SKILLS);

  useEffect(() => {
    if (skillsData?.skills) {
      const options = skillsData.skills.map((skill: Skill) => ({
        value: skill.id,
        label: skill.name,
      }));
      setTechOptions(options);
    }
  }, [skillsData]);

  // 作品投稿のフォーム定義
  const methods = useForm({
    resolver: valibotResolver(ProjectSchema),
    defaultValues: {
      title: "",
      description: "",
      imageFile: undefined,
      techs: [] as string[],
    },
  });

  const {
    register,
    setValue,
    getValues,
    handleSubmit,
    formState: { errors },
    watch,
    trigger,
  } = methods;

  // 投稿用のGraphQLミューテーション
  const [createProject, { loading: createProjectLoading }] =
    useMutation<ProjectInfoQueryResult>(CREATE_WORK);

  // フォームの値が変わったらstateも更新
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === "techs" || !name) {
        setTechsState((value.techs as string[]) || []);
      }
    });

    return () => subscription.unsubscribe();
  }, [watch]);

  // スキルIDからスキル名を取得するヘルパー関数
  const getSkillNameById = (skillId: string): string => {
    const skill = techOptions.find((tech) => tech.value === skillId);
    return skill ? skill.label : skillId;
  };

  // フィルタリングされた技術候補を取得
  const getSuggestions = () => {
    if (!currentSelect || skillsLoading) return [];

    return techOptions.filter(
      (tech) =>
        tech.label.toLowerCase().includes(currentSelect.toLowerCase()) &&
        !(getValues("techs") as string[]).includes(tech.value),
    );
  };

  const suggestions = getSuggestions();

  // 技術を追加する処理
  const handleAddTech = () => {
    if (!currentSelect.trim() || skillsLoading) return;

    const currentTechValues = getValues("techs") as string[];
    let techIdToAdd: string | null = null;

    const exactMatchByLabel = techOptions.find(
      (tech) => tech.label.toLowerCase() === currentSelect.trim().toLowerCase(),
    );

    if (
      exactMatchByLabel &&
      !currentTechValues.includes(exactMatchByLabel.value)
    ) {
      techIdToAdd = exactMatchByLabel.value;
    } else {
      const isInputAValidUnselectedId = techOptions.find(
        (tech) => tech.value === currentSelect.trim(),
      );
      if (
        isInputAValidUnselectedId &&
        !currentTechValues.includes(isInputAValidUnselectedId.value)
      ) {
        techIdToAdd = isInputAValidUnselectedId.value;
      } else {
        const currentSuggestions = getSuggestions();
        if (
          currentSuggestions.length === 1 &&
          !currentTechValues.includes(currentSuggestions[0].value)
        ) {
          techIdToAdd = currentSuggestions[0].value;
        }
      }
    }

    if (techIdToAdd) {
      const updatedTechs = [...currentTechValues, techIdToAdd];
      setValue("techs", updatedTechs);
      trigger("techs");
    }

    setCurrentSelect("");
    setShowSuggestions(false);
  };

  // 技術を削除する処理
  const handleRemoveTech = (techValue: string) => {
    const currentTechs = getValues("techs") as string[];
    const updated = currentTechs.filter((t) => t !== techValue);
    setValue("techs", updated);
    trigger("techs");
  };

  // 技術選択時の処理
  const handleSelectTech = (techValue: string) => {
    const currentTechs = getValues("techs") as string[];
    if (!currentTechs.includes(techValue)) {
      const updated = [...currentTechs, techValue];
      setValue("techs", updated);
      trigger("techs");
      setCurrentSelect("");
      setShowSuggestions(false);
    }
  };

  return (
    <section className="flex size-full flex-col items-center justify-center bg-gray-100 px-2 py-4 md:py-8">
      {" "}
      <h1 className="w-full py-2 text-center text-2xl font-semibold text-black md:text-left md:text-3xl">
        作品登録
      </h1>{" "}
      <Card className="w-full max-w-2xl px-4 py-4 md:px-6 md:py-6">
        {" "}
        <FormProvider {...methods}>
          <form
            onSubmit={handleSubmit(async (formData) => {
              try {
                const postData = new FormData();
                postData.append("image", formData.imageFile as File);
                postData.append("uid", user?.id || "");

                const response = await fetch(HOST_URL + "image/upload/", {
                  method: "POST",
                  body: postData,
                });

                if (!response.ok) {
                  throw new Error("Failed to upload image");
                }

                const data = await response.json();
                const s3Url = data.key;

                const projectData = {
                  userId: user?.id || "",
                  eventId: null,
                  title: formData.title,
                  description: formData.description,
                  imageUrl: s3Url,
                  workId: null,
                };

                await createProject({ variables: { input: projectData } });
                alert("登録が完了しました");
                methods.reset({
                  title: "",
                  description: "",
                  imageFile: undefined,
                  techs: [],
                });
                setImagePreview(null);
                setTechsState([]);
                navigate({ to: "/" });
              } catch (e) {
                console.error("Error creating project:", e);
                alert(`登録中にエラーが発生しました: ${e || "不明なエラー"}`);
              }
            })}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-1">
              <label htmlFor="title" className="font-medium text-gray-700">
                作品名
              </label>
              <input
                type="text"
                {...register("title")}
                id="title"
                className="rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none"
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label
                htmlFor="description"
                className="font-medium text-gray-700"
              >
                作品概要
              </label>
              <textarea
                {...register("description")}
                id="description"
                rows={4}
                className="rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none"
              />
              {errors.description && (
                <p className="text-sm text-red-500">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-medium text-gray-700">作品画像</label>
              {!imagePreview ? (
                <label
                  htmlFor="project-image"
                  className="flex h-[200px] cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-gray-300 bg-gray-50 p-4 text-center focus-within:border-green-500 hover:border-green-400 hover:bg-gray-100"
                >
                  <img
                    src={imagePlus}
                    alt="画像追加アイコン"
                    className="h-10 w-10 opacity-50"
                  />
                  <span className="text-sm font-medium text-gray-600">
                    画像をドラッグ＆ドロップ
                  </span>
                  <span className="text-xs text-gray-500">
                    またはクリックして選択 (JPG, PNG, GIF - 最大 10MB)
                  </span>
                  <input
                    {...register("imageFile")}
                    id="project-image"
                    type="file"
                    accept="image/jpeg,image/png,image/gif"
                    className="sr-only"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        if (file.size > 5 * 1024 * 1024) {
                          alert("画像サイズは10MB以下にしてください。");
                          return;
                        }
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setImagePreview(reader.result as string);
                          setValue("imageFile", file, { shouldValidate: true });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
              ) : (
                <div className="relative flex h-[200px] items-center justify-center rounded-md border border-gray-300">
                  <img
                    src={imagePreview}
                    alt="プレビュー"
                    className="h-full max-h-[198px] w-full rounded-md object-contain p-1"
                  />
                  <button
                    type="button"
                    className="absolute top-1 right-1 z-10 rounded-full bg-black/50 p-1 text-white hover:bg-black/75"
                    onClick={() => {
                      setImagePreview(null);
                      setValue("imageFile", null as unknown as File, {
                        shouldValidate: true,
                      });
                      const fileInput = document.getElementById(
                        "project-image",
                      ) as HTMLInputElement;
                      if (fileInput) fileInput.value = "";
                    }}
                    aria-label="画像を削除"
                  >
                    <img
                      src={imageDelete}
                      alt="削除"
                      className="h-5 w-5"
                    />{" "}
                  </button>
                </div>
              )}
              {errors.imageFile && (
                <p className="text-sm text-red-500">
                  {errors.imageFile.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label
                htmlFor="tech-select"
                className="font-medium text-gray-700"
              >
                技術スタック
              </label>
              <div className="relative">
                <input
                  id="tech-select"
                  type="text"
                  value={currentSelect}
                  onChange={(e) => {
                    setCurrentSelect(e.target.value);
                    if (e.target.value.trim() !== "") {
                      setShowSuggestions(true);
                    } else {
                      setShowSuggestions(false);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTech();
                    } else if (e.key === "Escape") {
                      setShowSuggestions(false);
                    } else if (
                      e.key === "ArrowDown" &&
                      suggestions.length > 0
                    ) {
                      e.preventDefault();
                    }
                  }}
                  onFocus={() => {
                    if (currentSelect.trim() !== "" && suggestions.length > 0)
                      setShowSuggestions(true);
                  }}
                  onBlur={() => {
                    setTimeout(() => setShowSuggestions(false), 150);
                  }}
                  disabled={skillsLoading}
                  placeholder={
                    skillsLoading ? "技術を読込中..." : "例: React, Next.js"
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none"
                  autoComplete="off"
                />

                {showSuggestions && currentSelect.trim() !== "" && (
                  <ul className="absolute z-20 mt-1 max-h-60 w-full overflow-y-auto rounded-md border border-gray-300 bg-white shadow-lg">
                    {skillsLoading ? (
                      <li className="px-3 py-2 text-sm text-gray-500">
                        読込中...
                      </li>
                    ) : suggestions.length > 0 ? (
                      suggestions.map((option) => (
                        <li key={option.value}>
                          <button
                            type="button"
                            onClick={() => handleSelectTech(option.value)}
                            className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                          >
                            {option.label}
                          </button>
                        </li>
                      ))
                    ) : (
                      <li className="px-3 py-2 text-sm text-gray-500">
                        該当なし。Enterで新規追加はできません。
                      </li>
                    )}
                  </ul>
                )}
              </div>

              {/* Selected Tech Tags Display */}
              <div className="mt-2 flex flex-wrap gap-2">
                {techsState.map((techValue) => {
                  // techValue is the skill ID
                  const label = getSkillNameById(techValue);
                  return (
                    <div
                      key={techValue}
                      className="flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-sm text-green-700"
                    >
                      <span>{label}</span>
                      <button
                        type="button" // Important
                        onClick={() => handleRemoveTech(techValue)}
                        className="text-green-600 hover:text-green-800"
                        aria-label={`${label} を削除`}
                      >
                        &times;
                      </button>
                    </div>
                  );
                })}
              </div>
              {errors.techs && (
                <p className="text-sm text-red-500">{errors.techs.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={createProjectLoading || skillsLoading}
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
