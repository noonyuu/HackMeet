import { gql, useQuery } from "@apollo/client";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Index,
});

const PROFILE = gql`
  query ($id: String!) {
    profile(id: $id) {
      id
      nickName
    }
  }
`;

type Profile = {
  id: string;
  nickName: string;
};

type ProfileQueryResult = {
  profile: Profile;
};

function Index() {
  const { loading, error, data } = useQuery<ProfileQueryResult>(PROFILE, {
    variables: { id: "ab0bedb3-aece-4c49-a8d4-9c8e9942cc2d" },
    fetchPolicy: "network-only",
  });
  const profile = data?.profile;
  if (loading) {
    return <div className="p-2">Loading...</div>;
  }
  if (error) {
    return <div className="p-2 text-red-500">Error: {error.message}</div>;
  }
  return (
    <div className="p-2">
      <div>Hello from Index!</div>
      <div className="p-2">
        {profile ? (
          <div>
            <h2>Profile</h2>
            <ul>
              <li>ID: {profile.id}</li>
              <li>NickName: {profile.nickName}</li>
            </ul>
          </div>
        ) : (
          <div>No profile found</div>
        )}
      </div>
    </div>
  );
}
