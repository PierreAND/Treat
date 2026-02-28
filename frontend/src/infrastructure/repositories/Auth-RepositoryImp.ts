import { AuthRepository } from "@/src/domain/repositories/Auth-Repository";
import { User, RegisterPayload, LoginPayload } from '../../domain/entities/user.model'
import { environment } from "@/src/environment";
import AsyncStorage from '@react-native-async-storage/async-storage';

export class ApiAuthRepositoryImp implements AuthRepository {
    private readonly registerUrl = `${environment.apiUrl}/register`;
    private readonly loginUrl = `${environment.apiUrl}/login`

    private async postRequest<T>(url: string, body: object): Promise<T> {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Erreur serveur');
        }
        return response.json();
    }

    async login(credentials: LoginPayload): Promise<{ user: User; token: string }> {
        const data = await this.postRequest<{ user: User; token: string }>(this.loginUrl, credentials);
        await AsyncStorage.setItem('token', data.token);
        await AsyncStorage.setItem('user', JSON.stringify(data.user));
        return data;
    }

    async register(credentials: RegisterPayload): Promise<{ user: User; token: string }> {
        const data = await this.postRequest<{ user: User; token: string }>(this.registerUrl, credentials);
        await AsyncStorage.setItem('token', data.token);
        await AsyncStorage.setItem('user', JSON.stringify(data.user));
        return data;
    }
    async logout(): Promise<void> {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
    }
}