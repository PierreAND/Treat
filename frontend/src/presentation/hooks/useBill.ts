import { useState } from "react";
import { Bill, CreateBillPayload } from "@/src/domain/entities/bill.model";
import { container } from "@/src/infrastructure/injecteur/container";

export const useBill = (activityId: number) => {
    const [bill, setBill] = useState<Bill | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createBill = async (payload: CreateBillPayload) => {
        setLoading(true);
        setError(null);
        try {
            const data = await container.createBill.execute(activityId, payload);
            setBill(data);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchBill = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await container.getBill.execute(activityId);
            setBill(data);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    return { bill, loading, error, createBill, fetchBill };
};