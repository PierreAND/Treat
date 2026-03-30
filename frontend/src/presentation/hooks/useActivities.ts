import { useState, useEffect } from "react";
import { ActivitySummary } from "@/src/domain/entities/activity.model";
import { container } from "@/src/infrastructure/injecteur/container";
import { useAuth } from "../context/AuthContext";

export const useActivities = () => {
    const [activities, setActivities] = useState<ActivitySummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { isAuthenticated } = useAuth();
    const [refreshing, setRefreshing] = useState(false)

    const fetchActivities = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await container.getActivities.execute();
            setActivities(data);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    const create = async (name: string, theme: string) => {
        setError(null);
        try {
            await container.createActivity.execute({ name, theme });
            await fetchActivities();
        } catch (e: any) {
            setError(e.message);
            throw e;
        }
    };

    const respond = async (activityId: number, accept: boolean) => {
        setError(null);
        try {
            await container.respondInvite.execute(activityId, accept);
            await fetchActivities();
        } catch (e: any) {
            setError(e.message);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        setError(null);
        try {
            const data = await container.getActivities.execute();
            setActivities(data);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setRefreshing(false);
        }
    };


    useEffect(() => {
        if (isAuthenticated) {
            fetchActivities();
        }
    }, [isAuthenticated]);

    return { activities, loading, refreshing, error, refresh: fetchActivities, handleRefresh, create, respond };
};
