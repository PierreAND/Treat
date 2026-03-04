// src/infrastructure/api/ApiBillRepository.ts
import { BillRepository } from "@/src/domain/repositories/Bill-Repository";
import { Bill, CreateBillPayload } from "@/src/domain/entities/bill.model";
import { environment } from "@/src/environment";
import AsyncStorage from "@react-native-async-storage/async-storage";

export class ApiBillRepositoryImp implements BillRepository {
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

    async createBill(activityId: number, payload: CreateBillPayload): Promise<Bill> {
        const response = await fetch(`${this.baseUrl}/${activityId}/bill`, {
            method: "POST",
            headers: await this.authHeaders(),
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Échec de la création de la note");
        }

        return response.json();
    }

    async getBill(activityId: number): Promise<Bill> {
        const response = await fetch(`${this.baseUrl}/${activityId}/bill`, {
            headers: await this.authHeaders(),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Note introuvable");
        }

        return response.json();
    }
}