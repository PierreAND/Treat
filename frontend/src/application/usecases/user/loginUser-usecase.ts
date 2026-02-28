import { LoginPayload } from "@/src/domain/entities/user.model";
import { AuthRepository } from "@/src/domain/repositories/Auth-Repository";

export class LoginUseCase {
    constructor( private authRepository : AuthRepository) {}
    async execute(credentials: LoginPayload) {
        return this.authRepository.login(credentials)
    }
}