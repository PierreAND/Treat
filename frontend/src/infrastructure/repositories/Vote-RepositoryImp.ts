import { VoteRepository } from "@/src/domain/repositories/Vote-Repository";
import { VotePayload, VoteResult } from "@/src/domain/entities/vote.model";
import { environment } from "@/src/environment";
import AsyncStorage from "@react-native-async-storage/async-storage";

export class ApiVoteRepositoryImp implements VoteRepository {
    private readonly baseUrl = `${environment.apiUrl}/activities`;

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

    async submitVotes(activityId: number, votes: VotePayload[]): Promise<void> {
        const response = await fetch(`${this.baseUrl}/${activityId}/votes`, {
            method: "POST",
            headers: await this.authHeaders(),
            body: JSON.stringify({ votes }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Échec de l'envoi des votes");
        }
    }

    async getResults(activityId: number): Promise<VoteResult[]> {
        const response = await fetch(`${this.baseUrl}/${activityId}/votes/results`, {
            headers: await this.authHeaders(),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Échec du chargement des résultats");
        }

        return response.json();
    }

async getVoteStatus(activityId: number): Promise<{ hasVoted: boolean }> {
    const response = await fetch(`${this.baseUrl}/${activityId}/votes/status`, {
        headers: await this.authHeaders(),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erreur");
    }

    return response.json();
}
}