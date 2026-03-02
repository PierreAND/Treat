import { Bill, CreateBillPayload } from "@/src/domain/entities/bill.model";
import { BillRepository } from "@/src/domain/repositories/Bill-Repository";

export class CreateBillUseCase {
    constructor(private billRepository: BillRepository) {}

    async execute(activityId: number, payload: CreateBillPayload): Promise<Bill> {
        return this.billRepository.createBill(activityId, payload);
    }
}