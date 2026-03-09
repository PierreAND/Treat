import React from "react";
import { RefreshControl } from "react-native";
import { colors } from "@/src/ui/styles/colors";

interface Props {
    refreshing: boolean;
    onRefresh: () => void;
}

export const PullToRefresh = ({ refreshing, onRefresh }: Props) => (
    <RefreshControl
        refreshing={refreshing}
        onRefresh={onRefresh}
        tintColor={colors.accent}
        colors={[colors.accent, colors.primary]}
        progressBackgroundColor={colors.bgSecondary}
        progressViewOffset={20}
        title="Mise à jour..."
        titleColor={colors.textSecondary}
    />
);