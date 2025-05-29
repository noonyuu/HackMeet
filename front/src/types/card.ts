import { Profile } from "./user";

export type Skill = {
  id: string;
  name: string;
}

export type Work = {
  title: string;
  description: string;
  imageUrl: string;
  skills: Skill[];
};

type CardProfile = Pick<Profile, "nickName" | "graduationYear" | "affiliation" | "bio">;

export type CardData = {
  id: string;
  work: Work;
  profile: CardProfile;
};