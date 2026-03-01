export interface VotePayload {
  targetId: number;
  ruleId: number;
}

export interface VoteResult {
  userId: number;
  username: string;
  score: number;
  rank: number;
  details: VoteDetail[];
}

export interface VoteDetail {
  rule: string;
  points: number;
  from: string;
}