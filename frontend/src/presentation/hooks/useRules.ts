import { useState } from "react";
import { Rule, RulePayload } from "@/src/domain/entities/rule.model";
import { container } from "@/src/infrastructure/injecteur/container";

export const useRule = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null)

    const addRule = async (activityId: number, payload: RulePayload): Promise<Rule
 | null> => {
    setLoading(true)
    setError(null);
    try {
            const rule = await container.addRule.execute(activityId, payload);
            return rule;
        } catch (e: any) {
            setError(e.message || "Erreur lors de l'ajout de la règle");
            return null;
        } finally {
            setLoading(false);
        }
    };
     return { addRule, loading, error };
 }
