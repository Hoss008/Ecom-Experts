/**
 * Format a number as a USD price string.
 * @param {number} amount
 * @returns {string} e.g. "$27.98"
 */
export const formatPrice = (amount) => `$${amount.toFixed(2)}`;
