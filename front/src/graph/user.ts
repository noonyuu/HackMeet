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

export const UPDATE_PROFILE = gql`
  mutation UpdateProfile($input: UpdateProfile!) {
    updateProfile(input: $input) {
      id
      avatarUrl
      nickName
      graduationYear
      affiliation
      bio
    }
  }
`;

export const SEARCH_USERS = gql`
  query ProfileByNickName($nickName: String!) {
    profileByNickName(nickName: $nickName) {
      id
      nickName
    }
  }
`;
