import { gql } from "@apollo/client";

// profileId(userId)から作品を取得する
export const GET_USER_WORKS = gql`
  query ($profileId: String!) {
    worksByProfileId(profileId: $profileId) {
      id
      title
      description
      skills {
        id
        name
      }
      imageUrl
      diagramImageUrl
    }
  }
`;

export const GET_WORK = gql`
  query GetWork($id: String!) {
    work(id: $id) {
      id
      title
      description
      imageUrl
      diagramImageUrl
      skills {
        id
        name
      }
      profile {
        id
        nickName
      }
    }
  }
`;

export const CREATE_WORK = gql`
  mutation CreateWork($input: NewWork!) {
    createWork(input: $input) {
      title
      description
      skills {
        name
      }
      userIds
      imageUrl
      diagramImageUrl
    }
  }
`;

export const CREATE_WORK_EVENT = gql`
  mutation CreateProjectEvent($input: NewCreateProjectEvent!) {
    createProjectEvent(input: $input) {
      title
      description
      skills {
        name
      }
      userIds
      imageUrl
      diagramImageUrl
      updatedAt
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
          imageUrl
          diagramImageUrl
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
  query ($id: String!) {
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

export const GET_PROFILE_WORKS = gql`
  query ($profileId: String!) {
    worksByProfileId(profileId: $profileId) {
      id
      title
      description
      skills {
        id
        name
      }
      imageUrl
      diagramImageUrl
      profile {
        nickName
      }
      updatedAt
      workProfileId
    }
  }
`;

export const UPDATE_WORK = gql`
  mutation UpdateWork($id: String!, $input: UpdateWork!) {
    updateWork(id: $id, input: $input) {
      id
      title
      description
      skills {
        name
      }
      userIds
      imageUrl
      diagramImageUrl
    }
  }
`;
