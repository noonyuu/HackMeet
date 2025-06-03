import * as v from "valibot";

export const ProfileSchema = v.object({
  nickName: v.pipe(
    v.string("ニックネームは必須です"),
    v.nonEmpty("ニックネームは必須です"),
    v.maxLength(20, "ニックネームは20文字以内で入力してください"),
  ),
  graduationYear: v.pipe(v.number(), v.integer()),
  affiliation: v.pipe(
    v.string("所属は必須です"),
    v.maxLength(50, "所属は50文字以内で入力してください"),
  ),
  bio: v.pipe(
    v.string("自己紹介は必須です"),
    v.maxLength(300, "自己紹介は300文字以内で入力してください"),
  ),
});

export type ProfileSchemaType = v.InferOutput<typeof ProfileSchema>;
