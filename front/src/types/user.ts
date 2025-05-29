import { Skill } from "./skill";

export type UserWork = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  skills: Skill[];
};

export type Profile = {
  id: string;
  avatarUrl: string | null;
  nickName: string;
  graduationYear: number | null;
  affiliation: number | null;
  bio: string | null;
  createdAt: string;
  updatedAt: string;
};
