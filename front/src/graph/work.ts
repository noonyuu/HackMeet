import { gql } from "@apollo/client";

// profileId(userId)から作品を取得する
export const GET_USER_WORKS = gql`
  query ($profileId: String!) {
    worksByProfileId(profileId: $profileId) {
      id
      title
      description
      imageUrl
      skills {
        id
        name
      }
    }
  }
`;

export const CREATE_WORK = gql`
  mutation CreateProjectEvent($input: NewCreateProjectEvent!) {
    createProjectEvent(input: $input) {
      title
      description
      imageUrl
      skills {
        name
      }
      eventId
      userId
    }
  }
`;
