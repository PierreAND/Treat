import { Profile } from "../entities/user.model";

export interface ProfileRepository {
      getProfile(username: string) : Promise<Profile>
}