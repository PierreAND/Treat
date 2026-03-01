import { ActivitySummary } from "@/src/domain/entities/activity.model";
import { ActivityRepository } from "@/src/domain/repositories/Activity-Repository";

export class GetActivitiesUseCase {
    constructor (private activityRepository : ActivityRepository){}
    async execute():Promise<ActivitySummary[]> {
        return this.activityRepository.getActivities()
    }
}