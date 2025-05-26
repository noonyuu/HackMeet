import * as v from "valibot";

export const ProjectSchema = v.object({
  title: v.pipe(
    v.string("タイトルは必須です"),
    v.nonEmpty("タイトルは必須です"),
    v.maxLength(20, "タイトルは20文字以内で入力してください"),
  ),
  description: v.pipe(
    v.string("説明は必須です"),
    v.nonEmpty("説明は必須です"),
    v.maxLength(300, "説明は300文字以内で入力してください"),
  ),
  imageFile: v.pipe(
    v.instance(File, "画像は必須です"),
    // v.check((input) => input.length > 0, "画像は必須です@"),
    v.transform((input) => input),
    v.mimeType(["image/jpeg", "image/png"]),
    v.maxSize(1024 * 1024 * 100),
  ),
  techs: v.pipe(
    v.array(v.string("技術は必須です"), "技術は必須です"),
    v.minLength(1, "少なくとも1つ以上選択してください"),
  ),
});

export const EventProjectSchema = v.object({
  ProjectSchema,
  eventId: v.pipe(
    v.string("イベントIDは必須です"),
    v.nonEmpty("イベントIDは必須です"),
  ),
});
