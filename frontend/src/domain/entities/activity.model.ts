import { Rule, RulePayload } from "./rule.model"

export type ActivityStatus = 'pending' | 'active' | 'voting' | 'finished'
export type MemberStatus = 'invited' | 'accepted' | "declined"
export interface Activity {
    id: number
    name: string
    theme: string
    status: ActivityStatus
    members: ActivityMember[]
    rules: Rule[]
    creator: string
    createdAt: Date
}

export interface ActivitySummary {
    id: number
    name: string
    theme: string
    status: ActivityStatus
    creator: string
    memberStatus: MemberStatus
    createdAt: Date
}


export interface CreateActivityPayload {
    name: string
    theme: string
    rules?: RulePayload[]
}

export interface ActivityMember {
    id: string
    username: string
    status: MemberStatus
}