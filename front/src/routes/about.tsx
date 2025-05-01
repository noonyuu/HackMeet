import { gql, useQuery } from "@apollo/client";
import { createFileRoute } from "@tanstack/react-router";

// ルーティング設定
export const Route = createFileRoute("/about")({
  component: About,
});

// GraphQL クエリを明示的に定義（変数付き）
const SKILL_BY_NAME = gql`
  query SkillByName($name: String!) {
    skillByName(name: $name) {
      id
      name
      category
    }
  }
`;

type Skill = {
  id: string;
  name: string;
  category: string;
};

type SkillQueryResult = {
  skillByName: Skill;
};

function About() {
  const { loading, error, data } = useQuery<SkillQueryResult>(SKILL_BY_NAME, {
    variables: { name: "react" }, // 明示的に渡す
    fetchPolicy: "network-only",
  });

  const skill = data?.skillByName;

  if (loading) {
    return <div className="p-2">Loading...</div>;
  }

  if (error) {
    return <div className="p-2 text-red-500">Error: {error.message}</div>;
  }

  return (
    <div className="p-2">
      <div>Hello from About!</div>
      <div className="p-2">
        {skill ? (
          <div>
            <h2>Skill</h2>
            <ul>
              <li>ID: {skill.id}</li>
              <li>Name: {skill.name}</li>
              <li>Category: {skill.category}</li>
            </ul>
          </div>
        ) : (
          <div>No skill found</div>
        )}
      </div>
    </div>
  );
}
