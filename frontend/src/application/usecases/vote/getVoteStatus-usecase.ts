import { VoteRepository } from "@/src/domain/repositories/Vote-Repository";

export class GetVoteStatusUseCase {
    constructor(private voteRepository: VoteRepository) {}

    async execute(activityId: number): Promise<{ hasVoted: boolean }> {
        return this.voteRepository.getVoteStatus(activityId);
    }
}