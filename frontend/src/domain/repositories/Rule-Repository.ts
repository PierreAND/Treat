import { Rule, RulePayload } from "../entities/rule.model";

export interface RuleRepository {
    addRule(activityId: number, data: RulePayload): Promise<Rule>;

}