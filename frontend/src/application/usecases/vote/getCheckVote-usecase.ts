import { VoteRepository } from "@/src/domain/repositories/Vote-Repository";

export class GetVoteCheckUseCase {
    constructor(private voteRepository: VoteRepository) {}

    async execute(activityId: number): Promise<{ allVoted: boolean; votedCount: number; totalCount: number }> {
        return this.voteRepository.getVoteCheck(activityId);
    }
}