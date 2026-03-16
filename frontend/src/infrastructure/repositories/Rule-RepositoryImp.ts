import { RuleRepository } from "@/src/domain/repositories/Rule-Repository";
import { Rule, RulePayload } from "@/src/domain/entities/rule.model";
import { environment } from "@/src/environment";
import AsyncStorage from "@react-native-async-storage/async-storage";

export class ApiRuleRepositoryImp implements RuleRepository {
    private readonly baseUrl = `${environment.apiUrl}/activities`

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

    async addRule(activityId: number ,payload: RulePayload): Promise<Rule> {
        const response = await fetch(`${this.baseUrl}/${activityId}/rules`, {
            method: "POST",
            headers: await this.authHeaders(),
            body: JSON.stringify(payload)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Ta règle n'a pas été enregistré")
        }
        return response.json()
    }
}