import { AuthRepository } from "@/src/domain/repositories/Auth-Repository";

export class ResetPasswordUseCase {
    constructor(private passwordRepository: AuthRepository) {}
    async execute(token: string, password: string): Promise<void> {
        return this.passwordRepository.resetPassword(token, password)
    }
}