export const validateMaxTwoDecimals = (value?: number) => {
    if (value === undefined) {
        return true;
    }

    const decimalPlaces = (value.toString().split('.')[1] || '').length;
    return decimalPlaces <= 2;
};