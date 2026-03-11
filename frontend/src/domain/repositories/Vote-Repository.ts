import { VotePayload, VoteResult } from "../entities/vote.model";

export interface VoteRepository {
    submitVotes(activityId: number, votes: VotePayload[]):Promise<void>
    getResults(activityId: number):Promise<VoteResult[]>    
    getVoteStatus(activityId: number): Promise<{ hasVoted: boolean }>;
    getVoteCheck(activityId: number): Promise<{allVoted: boolean, votedCount: number, totalCount: number}>
}