import { ActivitySummary } from "@/src/domain/entities/activity.model";

export interface InvitationCardProps {
    item: ActivitySummary;
    onAccept: (id: number) => void;
    onDecline: (id: number) => void;
}