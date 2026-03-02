import { Bill } from "@/src/domain/entities/bill.model";
import { BillRepository } from "@/src/domain/repositories/Bill-Repository";

export class GetBillUseCase {
    constructor(private billRepository: BillRepository) {}

    async execute(activityId: number): Promise<Bill> {
        return this.billRepository.getBill(activityId);
    }
}