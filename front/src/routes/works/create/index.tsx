import { useEffect, useState } from "react";
import { gql, useMutation } from "@apollo/client";
import { createFileRoute } from "@tanstack/react-router";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { useForm, FormProvider } from "react-hook-form";

import imagePlus from "@/assets/icons/image-plus.svg";
import imageDelete from "@/assets/icons/circle-x.svg";
import { Card } from "@/components/ui/card/card";
import { useAuth } from "@/hooks/useAuth";
import { ProjectSchema } from "@/schema/work";

export const Route = createFileRoute("/works/create/")({
  component: RouteComponent,
});

const TECH_OPTIONS = [
  { value: "react", label: "React" },
  { value: "nextjs", label: "Next.js" },
  { value: "vue", label: "Vue.js" },
  { value: "angular", label: "Angular" },
  { value: "svelte", label: "Svelte" },
  { value: "node", label: "Node.js" },
  { value: "python", label: "Python" },
  { value: "other", label: "その他" },
];

// TODO: 後で修正
const CREATE_USER = gql`
  mutation CreateWork($input: NewWork!) {
    createWork(input: $input) {
      title
      description
    }
  }
`;

type CreateProject = {
  title: string;
  description: string;
  imageFile: File;
};

type ProjectInfoQueryResult = {
  createWork: CreateProject;
};

function RouteComponent() {
  const HOST_URL = import.meta.env.VITE_HOST_URL || "";
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [currentSelect, setCurrentSelect] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const { user } = useAuth();

  const [techsState, setTechsState] = useState<string[]>([]);

  const methods = useForm({
    resolver: valibotResolver(ProjectSchema),
    defaultValues: {
      title: "",
      description: "",
      imageFile: undefined,
      techs: [],
    },
  });
  const {
    register,
    setValue,
    getValues,
    handleSubmit,
    formState: { errors },
  } = methods;

  const [createProject, { loading }] =
    useMutation<ProjectInfoQueryResult>(CREATE_USER);

  // フォームの値が変わったら state も更新
  useEffect(() => {
    const subscription = methods.watch((value, { name }) => {
      if (name === "techs" || !name) {
        setTechsState((value.techs as string[]) || []);
      }
    });

    return () => subscription.unsubscribe();
  }, [methods]);

  // フィルタリングされた技術候補を取得
  const getSuggestions = () => {
    if (!currentSelect) return [];

    return TECH_OPTIONS.filter(
      (tech) =>
        tech.label.toLowerCase().includes(currentSelect.toLowerCase()) &&
        !getValues("techs").includes(tech.value),
    );
  };

  const suggestions = getSuggestions();

  // 技術を追加する処理
  const handleAddTech = () => {
    if (!currentSelect.trim()) return;

    // 既存の選択肢から完全一致するものを探す
    const exactMatch = TECH_OPTIONS.find(
      (tech) =>
        tech.label.toLowerCase() === currentSelect.toLowerCase() ||
        tech.value.toLowerCase() === currentSelect.toLowerCase(),
    );

    // 入力と一部一致する候補があるか確認
    const partialMatches = TECH_OPTIONS.filter(
      (tech) =>
        tech.label.toLowerCase().includes(currentSelect.toLowerCase()) ||
        tech.value.toLowerCase().includes(currentSelect.toLowerCase()),
    );

    // 入力と一致する候補が1つだけある場合はその候補を使用
    const singleSuggestion = suggestions.length === 1 ? suggestions[0] : null;

    // 候補がない場合は基本的に追加しない
    // TODO:ないものを追加するかどうかの選択肢を与える
    if (partialMatches.length === 0) {
      // カスタム技術の追加は無効化（TECH_OPTIONSにあるものだけ選べるようにする）
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
      // カスタム技術は追加しない
      setCurrentSelect("");
      setShowSuggestions(false);
      return;
    }

    // 既に選択されていない場合のみ追加
    if (!getValues("techs").includes(techToAdd)) {
      const updated = [...getValues("techs"), techToAdd];
      setValue("techs", updated);
      // フォームの状態を強制的に更新
      methods.trigger("techs");
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
    const currentTechs = getValues("techs");
    const updated = currentTechs.filter((t) => t !== tech);
    setValue("techs", updated);

    // フォームの状態を強制的に更新
    methods.trigger("techs");
  };

  // 技術選択時の処理
  const handleSelectTech = (tech: string) => {
    if (!getValues("techs").includes(tech)) {
      const updated = [...getValues("techs"), tech];
      setValue("techs", updated);
      // フォームの状態を強制的に更新
      methods.trigger("techs");
      setCurrentSelect("");
      setShowSuggestions(false);
    }
  };

  return (
    <section className="flex size-full flex-col items-center justify-center bg-gray-100 px-2">
      <h1 className="w-full py-2 text-2xl text-black">作品登録</h1>

      <Card className="w-full px-4 py-4">
        <FormProvider {...methods}>
          <form
            onSubmit={handleSubmit(async (formData) => {
              try {
                const postData = new FormData();
                postData.append("image", formData.imageFile);
                postData.append("uid", user?.id || "");

                const response = await fetch(HOST_URL + "image/upload/", {
                  method: "POST",
                  body: postData,
                });

                if (!response.ok) {
                  throw new Error("Failed to upload image");
                }

                // responseの内容をJSONとして取得
                const data = await response.json();

                // S3のURLを取得
                const s3Url = data.key;
                // 画像のURLをformDataに追加
                formData.imageFile = s3Url;

                //**
                //  テストよう
                // */

                const testData = {
                  eventId: "4537b507-1c2d-479a-aa52-9a8061bd906b",
                  title: formData.title,
                  description: formData.description,
                };

                await createProject({ variables: { input: testData } });
              } catch (e) {
                console.error("Error creating project:", e);
              }
            })}
            className="flex flex-col gap-2"
          >
            <div className="flex flex-col gap-2">
              <label htmlFor="title">作品名</label>
              <input
                type="text"
                {...register("title")}
                id="title"
                className="rounded-md border border-gray-200 px-2 py-3 focus:outline-gray-400"
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="description">作品概要</label>
              <textarea
                {...register("description")}
                id="description"
                className="rounded-md border border-gray-200 px-2 py-3 focus:outline-gray-400"
              />
              {errors.description && (
                <p className="text-sm text-red-500">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <div>作品画像</div>
              {!imagePreview ? (
                <label
                  htmlFor="project-image"
                  className="flex h-[200px] cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed border-gray-300 focus-within:border-gray-500"
                >
                  <img src={imagePlus} alt="画像追加アイコン" />
                  <span className="text-sm text-gray-500">
                    画像をアップロードしてください
                  </span>
                  <span className="text-xs text-gray-400">
                    JPG, PNG (最大 5MB)
                  </span>
                  <input
                    {...register("imageFile")}
                    id="project-image"
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setImagePreview(reader.result as string);
                          methods.setValue("imageFile", file);
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
                    className="absolute top-2 right-2 z-10"
                    onClick={() => setImagePreview(null)}
                  >
                    <img src={imageDelete} alt="削除" />
                  </button>
                  <img
                    src={imagePreview}
                    alt="プレビュー"
                    className="h-full w-full rounded-md object-contain"
                  />
                </div>
              )}
              {errors.imageFile && (
                <p className="text-sm text-red-500">
                  {errors.imageFile.message}
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
                  className="w-full rounded-md border border-gray-200 px-2 py-2 focus:outline-gray-400"
                />

                {/* 候補リスト */}
                {showSuggestions && currentSelect && (
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
                {techsState.map((tech) => {
                  const techOption = TECH_OPTIONS.find((t) => t.value === tech);
                  const label = techOption ? techOption.label : tech;

                  return (
                    <div
                      key={tech}
                      className="flex items-center gap-1 rounded-full bg-gray-200 px-3 py-1 text-sm"
                    >
                      <span>{label}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTech(tech)}
                        className="text-gray-600 hover:text-red-500"
                      >
                        ×
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
              disabled={loading}
              className="mt-4 rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600"
            >
              {loading ? "送信中..." : "送信"}
            </button>
          </form>
        </FormProvider>
      </Card>
    </section>
  );
}
