export const hasPostalStreet = address => !!address?.addressLine1 &&
  !/[\u2580-\u259f]|\*{3,}|redacted/i.test(address.addressLine1 + (address.addressLine2 || ''));

export function recoverRecipientAddress(original, payee) {
  if (hasPostalStreet(original)) return original;
  const a = payee?.address;
  const replacement = { name: payee?.name, addressLine1: a?.addressLine1, addressLine2: a?.addressLine2,
    city: a?.city, state: a?.state, zipCode: a?.zipCode || a?.zip, country: 'US' };
  const norm = v => String(v || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (!hasPostalStreet(replacement) || norm(original.name) !== norm(payee.name) ||
      norm(original.city) !== norm(replacement.city) || norm(original.state) !== norm(replacement.state) ||
      String(original.zipCode || '').slice(0, 5) !== String(replacement.zipCode || '').slice(0, 5)) {
    const e = new Error('The original recipient street is masked. Review the saved payee address before mailing.');
    e.statusCode = 422; throw e;
  }
  return replacement;
}
