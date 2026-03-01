import { Activity, CreateActivityPayload } from "@/src/domain/entities/activity.model";
import { ActivityRepository } from "@/src/domain/repositories/Activity-Repository";

export class CreateActivityUseCase {
    constructor (private activityRepository : ActivityRepository){}
    async execute(payload: CreateActivityPayload) : Promise<Activity>{
        return this.activityRepository.createActivity(payload)
    }
}