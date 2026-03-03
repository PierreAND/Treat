import { ActivityRepository } from "@/src/domain/repositories/Activity-Repository";
import { Activity, ActivitySummary, CreateActivityPayload } from "@/src/domain/entities/activity.model";
import { environment } from "@/src/environment";
import AsyncStorage from "@react-native-async-storage/async-storage";

export class ApiActivityRepositoryImp implements ActivityRepository {
    private readonly baseUrl = `${environment.apiUrl}/activities`;

    private async getToken(): Promise<string> {
        const token = await AsyncStorage.getItem("token");
        console.log("TOKEN:", token ? "PRESENT" : "NULL");
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

    async createActivity(payload: CreateActivityPayload): Promise<Activity> {
        const response = await fetch(this.baseUrl, {
            method: "POST",
            headers: await this.authHeaders(),
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Échec de la création");
        }

        const data = await response.json();
        return { ...data, createdAt: new Date(data.createdAt) };
    }

    async getActivities(): Promise<ActivitySummary[]> {
        const response = await fetch(this.baseUrl, {
            headers: await this.authHeaders(),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Échec du chargement");
        }

        const data = await response.json();
        return data.map((item: any) => ({
            ...item,
            createdAt: new Date(item.createdAt),
        }));
    }

    async getActivity(id: number): Promise<Activity> {
        const response = await fetch(`${this.baseUrl}/${id}`, {
            headers: await this.authHeaders(),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Activité introuvable");
        }

        const data = await response.json();
        return { ...data, createdAt: new Date(data.createdAt) };
    }

    async inviteUser(activityId: number, username: string): Promise<void> {
        const response = await fetch(`${this.baseUrl}/${activityId}/invite`, {
            method: "POST",
            headers: await this.authHeaders(),
            body: JSON.stringify({ username }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Échec de l'invitation");
        }
    }

    async respondInvite(activityId: number, accept: boolean): Promise<void> {
        const response = await fetch(`${this.baseUrl}/${activityId}/respond`, {
            method: "POST",
            headers: await this.authHeaders(),
            body: JSON.stringify({ accept }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Échec de la réponse");
        }
    }

    async startActivity(id: number): Promise<void> {
        const response = await fetch(`${this.baseUrl}/${id}/start`, {
            method: "POST",
            headers: await this.authHeaders(),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Échec du démarrage");
        }
    }

    async stopActivity(id: number): Promise<void> {
        const response = await fetch(`${this.baseUrl}/${id}/stop`, {
            method: "POST",
            headers: await this.authHeaders(),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Échec de l'arrêt");
        }
    }
}