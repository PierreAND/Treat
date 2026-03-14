import { ProfileRepository } from "@/src/domain/repositories/Profile-Repository";

export class GetProfileUseCase {
    constructor (private profileRepository : ProfileRepository) {}
    async execute(username: string) {
        return this.profileRepository.getProfile(username)
    }
}