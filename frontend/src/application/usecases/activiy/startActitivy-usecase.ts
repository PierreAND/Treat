import { ActivityRepository } from "@/src/domain/repositories/Activity-Repository";

export class StartActivityUseCase{
    constructor(private activityRepository : ActivityRepository) {}
    async execute(id: number): Promise<void> {
        return this.activityRepository.startActivity(id)
    }
}