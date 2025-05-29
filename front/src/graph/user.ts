import { gql } from "@apollo/client";

export const GET_PROFILE = gql`
  query ($id: String!) {
    profileByUserId(id: $id) {
      id
      avatarUrl
      nickName
      graduationYear
      affiliation
      bio
    }
  }
`;
