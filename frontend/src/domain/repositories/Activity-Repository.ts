import { Activity, ActivitySummary, CreateActivityPayload } from "../entities/activity.model";

export interface ActivityRepository {
    createActivity(payload: CreateActivityPayload): Promise<Activity>;
    getActivities(): Promise<ActivitySummary[]>;
    getActivity(id: number): Promise<Activity>;
    inviteUser(activityId: number, username: string): Promise<void>;
    respondInvite(activityId: number, accept: boolean): Promise<void>;
    startActivity(id: number): Promise<void>;
    stopActivity(id: number): Promise<void>;
}