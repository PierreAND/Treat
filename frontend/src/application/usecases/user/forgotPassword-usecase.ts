import { AuthRepository } from "@/src/domain/repositories/Auth-Repository";

export class ForgotPasswordUseCase {
    constructor(private passwordRepository: AuthRepository) {}
    async execute(email: string): Promise<void> {
        return this.passwordRepository.forgotPassword(email)
    }
}