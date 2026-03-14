import { ProfileRepository } from "@/src/domain/repositories/Profile-Repository";
import { Profile } from "@/src/domain/entities/user.model";
import { environment } from "@/src/environment";
import AsyncStorage from "@react-native-async-storage/async-storage";

export class ApiProfileRepositoryImp implements ProfileRepository {
    private readonly baseUrl = `${environment.apiUrl}/users`;

    private async getToken(): Promise<string> {
        const token = await AsyncStorage.getItem("token");
        if (!token) throw new Error("Non authentifié");
        return token;
    }

    private async authHeaders(): Promise<HeadersInit> {
        const token = await this.getToken();
        return {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        };
    }

    async getProfile(username: string): Promise<Profile> {
        const response = await fetch(`${this.baseUrl}/${username}/profile`, {
            headers: await this.authHeaders()
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Profile introuvable");
        }
        
        return response.json()

    }
}