import { VotePayload } from "@/src/domain/entities/vote.model";
import { VoteRepository } from "@/src/domain/repositories/Vote-Repository";

export class SubmitVotesUseCase {
    constructor(private voteRepository: VoteRepository) {}

    async execute(activityId: number, votes: VotePayload[]): Promise<void> {
        return this.voteRepository.submitVotes(activityId, votes);
    }
}