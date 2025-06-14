import { Profile } from "@/types/user";
import { Skill } from "@/types/skill";
import { Event } from "@/types/event";

type CreateProject = {
  title: string;
  description: string;
  imageFile: File | string | null;
  techs: string[];
};

export type ProjectInfoQueryResult = {
  createWork: CreateProject;
};

type TodoProfile = Pick<Profile, "id" | "nickName" | "avatarUrl">;
type TodoSkills = Pick<Skill, "id" | "name">;
type TodoEvents = Pick<Event, "id" | "name">;

export type Work = {
  id: string;
  title: string;
  description: string;
  imageUrl: string[] | null;
  diagramImageUrl: string[] | null;
  createdAt: string;
  updatedAt: string;
  profile: TodoProfile[];
  skills: TodoSkills[];
  event: TodoEvents[];
  workProfileId: string;
};

export type EventWithWorks = {
  id: string;
  eventId: string;
  title: string;
};

export type UpdateProject = Pick<
  Work,
  | "id"
  | "title"
  | "description"
  | "imageUrl"
  | "diagramImageUrl"
  | "skills"
  | "profile"
>;
