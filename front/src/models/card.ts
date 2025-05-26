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

export type Profile = {
  nickName: string;
  graduationYear: string;
  affiliation: string;
  bio: string;
};

export type CardData = {
  id: string;
  work: Work;
  profile: Profile;
};