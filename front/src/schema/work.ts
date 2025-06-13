import * as v from "valibot";

// Userスキーマを定義
const userSchema = v.object({
  id: v.string(),
  nickName: v.string(),
});

/**
 * プロジェクトの基本的なバリデーションスキーマを生成する関数。
 * @param options
 * @param options.isImageRequired
 */
export const createProjectSchema = ({
  isImageRequired = true,
}: {
  isImageRequired?: boolean;
}) =>
  v.object({
    title: v.pipe(v.string(), v.minLength(1, "作品名を入力してください")),
    description: v.pipe(
      v.string(),
      v.minLength(1, "作品概要を入力してください"),
    ),
    imageFile: isImageRequired
      ? v.union([
          v.object({
            files: v.array(v.instance(File)),
            existingUrls: v.array(v.string()),
          }),
          v.pipe(
            v.array(v.instance(File)),
            v.minLength(1, "画像を1枚以上アップロードしてください"),
          ),
        ])
      : v.union([
          v.object({
            files: v.array(v.instance(File)),
            existingUrls: v.array(v.string()),
          }),
          v.array(v.instance(File)),
        ]),
    diagramFile: v.union([
      v.object({
        files: v.array(v.instance(File)),
        existingUrls: v.array(v.string()),
      }),
      v.array(v.instance(File)),
    ]),
    techs: v.pipe(
      v.array(v.string()),
      v.minLength(1, "技術スタックを1つ以上選択してください"),
    ),
    // userIdsをUserオブジェクトの配列に変更
    userIds: v.array(userSchema, "コラボレーターの情報が正しくありません"),
  });

export const ProjectSchema = createProjectSchema({ isImageRequired: true });

export const EventProjectSchema = v.object({
  ProjectSchema,
  eventId: v.pipe(
    v.string("イベントIDは必須です"),
    v.nonEmpty("イベントIDは必須です"),
  ),
});

// 型定義も修正
export type UpdateFormData = {
  title: string;
  description: string;
  imageFile:
    | {
        files: File[];
        existingUrls: string[];
      }
    | File[];
  diagramFile:
    | {
        files: File[];
        existingUrls: string[];
      }
    | File[];
  techs: string[];
  userIds: { id: string; nickName: string }[]; // Userオブジェクトの配列に変更
};
