type CreateProject = {
  title: string;
  description: string;
  imageFile: File | string | null;
  techs: string[];
};

export type ProjectInfoQueryResult = {
  createWork: CreateProject;
};
