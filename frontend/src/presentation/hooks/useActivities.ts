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

    return { activities, loading, refreshing, error, refresh: fetchActivities, handleRefresh };
};
