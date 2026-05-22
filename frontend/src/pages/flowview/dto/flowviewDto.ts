// ---- Commit DTO ----
export interface CommitHistoryDto {
  id: string;         // commitSha
  title: string;      // message
  assignee: string;   // author
  commitDate: string;
}

// ---- BoardTask DTO ----
export type BoardTaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

export interface BoardTaskDto {
  id: number;
  spaceId: number;
  title: string;
  status: BoardTaskStatus;
  assignee: string | null;
  label: string | null;
  createdAt: string;
}
