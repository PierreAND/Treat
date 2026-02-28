import { User, LoginPayload, RegisterPayload } from '../entities/user.model'

export interface AuthRepository {
  login(credentials: LoginPayload): Promise<{ user: User, token: string }>
  register(credentials: RegisterPayload): Promise<{ user: User, token: string }>
  logout(): Promise<void>;

}