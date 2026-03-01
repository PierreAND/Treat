import { ActivityRepository } from "@/src/domain/repositories/Activity-Repository";

export class RespondInviteUserUseCase {
    constructor(private activityRepository: ActivityRepository){}
    async execute(activityId: number, accept: boolean):Promise<void> {
        return this.activityRepository.respondInvite(activityId, accept)
    }
}