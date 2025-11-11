import {BaseEntity} from "@/types/index.types.ts";

export interface Vat extends BaseEntity {
    name: string;
    value: number;
}

export interface VatCreateRequest {
    name: string;
    value: number;
}

export interface VatUpdateRequest extends Partial<VatCreateRequest> {
    id: string;
}