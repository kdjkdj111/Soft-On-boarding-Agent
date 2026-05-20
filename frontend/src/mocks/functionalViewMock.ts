import type { FunctionalViewResponse } from '../services/functionalViewApi';

export const mockFunctionalViewData: FunctionalViewResponse = {
  nodes: [
    {
      id: 'root-user',
      type: 'forestNode',
      data: {
        label: 'User Service',
        description: 'Handles user authentication and profile management',
      },
    },
    {
      id: 'user-login',
      type: 'treeNode',
      parentId: 'root-user',
      data: {
        label: 'Login / OAuth',
        description: 'GitHub OAuth2 integration for user login',
        apiMethod: 'GET',
        apiUrl: '/oauth2/authorization/github',
        filePath: 'backend/src/main/java/com/vector/onboarding/global/security/SecurityConfig.java',
      },
    },
    {
      id: 'user-profile',
      type: 'treeNode',
      parentId: 'root-user',
      data: {
        label: 'Get User Profile',
        description: 'Retrieves current user profile information',
        apiMethod: 'GET',
        apiUrl: '/api/users/me',
        filePath: 'backend/src/main/java/com/vector/onboarding/domain/user/UserController.java',
      },
    },
    {
      id: 'root-space',
      type: 'forestNode',
      data: {
        label: 'Space Service',
        description: 'Manages team spaces and integrations',
      },
    },
    {
      id: 'space-create',
      type: 'treeNode',
      parentId: 'root-space',
      data: {
        label: 'Create Space',
        description: 'Creates a new workspace for a team',
        apiMethod: 'POST',
        apiUrl: '/api/spaces',
        filePath: 'backend/src/main/java/com/vector/onboarding/domain/space/SpaceController.java',
      },
    },
    {
      id: 'space-join',
      type: 'treeNode',
      parentId: 'root-space',
      data: {
        label: 'Join Space',
        description: 'Joins an existing workspace using a team code',
        apiMethod: 'POST',
        apiUrl: '/api/spaces/join',
        filePath: 'backend/src/main/java/com/vector/onboarding/domain/space/SpaceController.java',
      },
    },
    {
      id: 'db-ring-user',
      type: 'ringNode',
      parentId: 'user-profile',
      data: {
        label: 'User DB',
        description: 'PostgreSQL User Table',
      },
    },
    {
      id: 'db-ring-space',
      type: 'ringNode',
      parentId: 'space-create',
      data: {
        label: 'Space DB',
        description: 'PostgreSQL Space Table',
      },
    },
  ],
  edges: [
    {
      id: 'e-user-space',
      source: 'root-user',
      target: 'root-space',
      animated: true,
    },
    {
      id: 'e-profile-db',
      source: 'user-profile',
      target: 'db-ring-user',
      animated: true,
    },
    {
      id: 'e-space-create-db',
      source: 'space-create',
      target: 'db-ring-space',
      animated: true,
    },
    {
      id: 'e-space-join-db',
      source: 'space-join',
      target: 'db-ring-space',
      animated: true,
    },
  ],
};
