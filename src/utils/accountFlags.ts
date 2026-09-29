import type { UserMeResponse } from '@/types/user.types';
import type { UserCreateRequest } from '@/schemas/user.schema';

const ACCOUNT_FLAGS = ['is_active', 'is_contributor', 'auto_generate_fees'] as const;

/** The account flags a loaded user actually carries, named as the user form names them. */
export const loadedAccountFlags = (user: UserMeResponse | null): Partial<UserCreateRequest> => user ? {
    ...(user.isActive !== undefined && { is_active: user.isActive }),
    ...(user.isContributor !== undefined && { is_contributor: user.isContributor }),
    ...(user.autoGenerateFees !== undefined && { auto_generate_fees: user.autoGenerateFees }),
} : {};

/** Drop the flags the form never loaded, so schema defaults cannot overwrite the stored values. */
export const withoutUnloadedFlags = (
    data: UserCreateRequest,
    loaded: Partial<UserCreateRequest>
): UserCreateRequest => {
    const payload = { ...data };
    ACCOUNT_FLAGS.forEach(flag => {
        if (!(flag in loaded)) delete payload[flag];
    });
    return payload;
};
