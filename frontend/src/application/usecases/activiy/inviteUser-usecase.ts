import { ActivityRepository } from "@/src/domain/repositories/Activity-Repository";

export class InviteUserUseCase {
    constructor(private activityRepository: ActivityRepository){}
    async execute(activityId: number, username: string):Promise<void> {
        return this.activityRepository.inviteUser(activityId, username)
    }
}