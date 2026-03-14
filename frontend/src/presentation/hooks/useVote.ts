import { useState } from "react";
import { VotePayload, VoteResult, PendingVote } from "@/src/domain/entities/vote.model";
import { Rule } from "@/src/domain/entities/rule.model";
import { ActivityMember } from "@/src/domain/entities/activity.model";
import { container } from "@/src/infrastructure/injecteur/container";



export const useVotes = (activityId: number) => {
    const [pendingVotes, setPendingVotes] = useState<PendingVote[]>([]);
    const [results, setResults] = useState<VoteResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasVoted, setHasVoted] = useState(false)
    const [allVoted, setAllVoted] = useState(false)
    const [votedCount, setVotedCount] = useState(0)
    const [totalCount, setTotalCount] = useState(0)

     const checkVoteStatus = async () => {
        try {
            const status = await container.getVoteStatus.execute(activityId);
            setHasVoted(status.hasVoted);
        } catch (e: any) {
            console.log("Vote status check failed:", e.message);
        }
    };

    const addVote = (member: ActivityMember, rule: Rule) => {
        const exists = pendingVotes.find(
            (v) => v.targetId === member.id && v.ruleId === rule.id
        );
        if (exists) return; 

        setPendingVotes((prev) => [
            ...prev,
            {
                targetId: member.id,
                targetUsername: member.username,
                ruleId: rule.id,
                ruleName: rule.name,
                points: rule.points,
            },
        ]);
    };

    const removeVote = (targetId: number, ruleId: number) => {
        setPendingVotes((prev) =>
            prev.filter((v) => !(v.targetId === targetId && v.ruleId === ruleId))
        );
    };

    const getVotesForMember = (memberId: number): PendingVote[] => {
        return pendingVotes.filter((v) => v.targetId === memberId);
    };

    const getScorePreview = (memberId: number): number => {
        return pendingVotes
            .filter((v) => v.targetId === memberId)
            .reduce((sum, v) => sum + v.points, 0);
    };

    const submitVotes = async () => {
        setLoading(true);
        setError(null);
        try {
            const votes: VotePayload[] = pendingVotes.map((v) => ({
                targetId: v.targetId,
                ruleId: v.ruleId,
            }));
            await container.submitVotes.execute(activityId, votes);
            setPendingVotes([]);
            setHasVoted(true); 
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchResults = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await container.getVoteResults.execute(activityId);
            setResults(data);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    const checkVoteCount = async () => {
        const data = await container.getVoteCheck.execute(activityId)
        setAllVoted (data.allVoted)
        setVotedCount(data.votedCount)
        setTotalCount(data.totalCount)
    };


    return {
        pendingVotes,
        results,
        loading,
        checkVoteStatus,
        hasVoted,
        error,
        addVote,
        removeVote,
        getVotesForMember,
        getScorePreview,
        submitVotes,
        fetchResults,
        checkVoteCount,
        totalCount,
        allVoted,
        votedCount
    };
};