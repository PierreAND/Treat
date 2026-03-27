export interface HomeScreenProps {
    onNavigateToActivity: (activityId: number) => void;
    onNavigateToProfile: (username: string) => void;
}
