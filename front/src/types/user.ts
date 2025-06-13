import { Skill } from "./skill";

export type UserWork = {
  id: string;
  title: string;
  description: string;
  imageUrl: string[];
  diagramUrl: string[];
  skills: Skill[];
  userIds: string[];
};

export type Profile = {
  id: string;
  avatarUrl: string | null;
  nickName: string;
  graduationYear: number | null;
  affiliation: string | null;
  bio: string | null;
  createdAt: string;
  updatedAt: string;
};

export type UpdateProfile = Pick<
  Profile,
  "id" | "nickName" | "graduationYear" | "affiliation" | "bio"
>;
