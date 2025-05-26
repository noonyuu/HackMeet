import { Skill } from "./skill";

export type UserWork = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  skills: Skill[];
};
