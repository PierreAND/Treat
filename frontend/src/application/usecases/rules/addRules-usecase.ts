import { Rule, RulePayload } from "@/src/domain/entities/rule.model";
import { RuleRepository } from "@/src/domain/repositories/Rule-Repository";

export class AddRuleUseCase {
    constructor(private readonly ruleRepository: RuleRepository) {}
    async execute(activityId: number,payload: RulePayload): Promise<Rule> {
        return this.ruleRepository.addRule(activityId,payload)
    }
}