import { AuthRepository } from "@/src/domain/repositories/Auth-Repository";

export class LogOutUseCase{
    constructor(private authRepository: AuthRepository) {}
    async execute(): Promise<void>{
        return this.authRepository.logout()
    }
}