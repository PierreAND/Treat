import { useState, useCallback } from "react";
import { Profile } from "@/src/domain/entities/user.model";
import { container } from "@/src/infrastructure/injecteur/container";

export const useProfile = (username: string) => {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchProfile = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await container.getProfile.execute(username);
            setProfile(data);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, [username]);

    return { profile, loading, error, fetchProfile };
};