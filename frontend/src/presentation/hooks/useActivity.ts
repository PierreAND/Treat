import { useState, useEffect } from "react";
import { Activity } from "@/src/domain/entities/activity.model";
import { container } from "@/src/infrastructure/injecteur/container";

export const useActivity = (id: number) => {
    const [activity, setActivity] = useState<Activity | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchActivity = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await container.getActivity.execute(id);
            setActivity(data);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchActivity();

    }, [id]);

    const invite = async (username: string) => {
        setError(null);
        try {
            await container.inviteUser.execute(id, username);
            await fetchActivity();
        } catch (e: any) {
            setError(e.message);
        }
    };

    const respond = async (accept: boolean) => {
        setError(null);
        try {
            await container.respondInvite.execute(id, accept);
            await fetchActivity();
        } catch (e: any) {
            setError(e.message);
        }
    };

    const start = async () => {
        setError(null);
        try {
            await container.startActivity.execute(id);
            await fetchActivity();
        } catch (e: any) {
            setError(e.message);
        }
    };

    const stop = async () => {
        setError(null);
        try {
            await container.stopActivity.execute(id);
            await fetchActivity();
        } catch (e: any) {
            setError(e.message);
        }
    };

    return { activity, loading, error, refresh: fetchActivity, invite, respond, start, stop };
};