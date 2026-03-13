export interface ActivityProps {
    activityId: number;
    onBack: () => void;
    onGoToVote: (activityId: number) => void;
    onGoToBill: (activityId: number) => void;

}