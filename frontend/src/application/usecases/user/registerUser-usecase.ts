import { RegisterPayload } from "@/src/domain/entities/user.model";
import { AuthRepository } from "@/src/domain/repositories/Auth-Repository";

export class RegisterUseCase{
    constructor(private authrepository : AuthRepository) {}
        async execute(credentials: RegisterPayload) {
            return this.authrepository.register(credentials)
        }
    
}