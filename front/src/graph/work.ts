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
  mutation CreateWork($input: NewWork!) {
    createWork(input: $input) {
      title
      description
      imageUrl
      skills {
        name
      }
      userIds
    }
  }
`;

export const CREATE_WORK_EVENT = gql`
  mutation CreateProjectEvent($input: NewCreateProjectEvent!) {
    createProjectEvent(input: $input) {
      title
      description
      imageUrl
      skills {
        name
      }
      userIds
    }
  }
`;

export const PROJECT_LIST = gql`
  query GetWorks($first: Int, $after: String, $last: Int, $before: String) {
    workList(first: $first, after: $after, last: $last, before: $before) {
      edges {
        cursor
        node {
          id
          title
          description
          imageUrl
          createdAt
          updatedAt
          userIds # Keep if used elsewhere, otherwise can be removed if profile is primary
          profile {
            id
            nickName
            avatarUrl
          }
          skills {
            id
            name
          }
          event {
            id
            name
          }
        }
      }
      pageInfo {
        startCursor
        endCursor
        hasNextPage
        hasPreviousPage
      }
    }
  }
`;

export const GET_NFC_DATA = gql`
  query ($id: Int!) {
    workProfile(id: $id) {
      id
      work {
        title
        description
        imageUrl
        skills {
          id
          name
        }
      }
      profile {
        nickName
        graduationYear
        affiliation
        bio
      }
    }
  }
`;
