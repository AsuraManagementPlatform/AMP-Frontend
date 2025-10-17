export const TransactionStatus = {
    DRAFT: 'DRAFT',
    PENDING_APPROVAL: 'PENDING_APPROVAL',
    APPROVED: 'APPROVED',
    PAID: 'PAID',
    REJECTED: 'REJECTED',
    CANCELLED: 'CANCELLED'
} as const;

export type TransactionStatus = typeof TransactionStatus[keyof typeof TransactionStatus];
