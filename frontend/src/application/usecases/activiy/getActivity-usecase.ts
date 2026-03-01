import { Activity } from "@/src/domain/entities/activity.model";
import { ActivityRepository } from "@/src/domain/repositories/Activity-Repository";

export class GetActivityUseCase {
    constructor(private activityRepository: ActivityRepository){}
    async execute(id:number): Promise<Activity>{
        return this.activityRepository.getActivity(id)
    }
}