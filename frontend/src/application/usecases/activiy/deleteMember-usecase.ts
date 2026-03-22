import { ActivityRepository } from "@/src/domain/repositories/Activity-Repository";


export class DeleteMemberUseCase {
    constructor(private activityRepository: ActivityRepository) { }
    async execute(activityId: number, memberId: number) {
        return this.activityRepository.deleteMember(activityId, memberId)
    }
}