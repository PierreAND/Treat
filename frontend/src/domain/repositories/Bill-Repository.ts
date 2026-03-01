import { Bill, CreateBillPayload} from "../entities/bill.model";

export interface BillRepository {
    createBill(activityId: number, payload: CreateBillPayload):Promise<Bill>
    getBill(activityId:number):Promise<Bill>
}