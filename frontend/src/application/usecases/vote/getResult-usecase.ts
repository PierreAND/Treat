import { VoteResult } from "@/src/domain/entities/vote.model";
import { VoteRepository } from "@/src/domain/repositories/Vote-Repository";

export class GetVoteResultsUseCase {
    constructor(private voteRepository: VoteRepository) { }

    async execute(activityId: number): Promise<VoteResult[]> {
        return this.voteRepository.getResults(activityId);
    }
}