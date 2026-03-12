export interface VoteScreenProps {
    activityId: number;
    onBack: () => void;
    onGoToBill: (activityId: number) => void;
}