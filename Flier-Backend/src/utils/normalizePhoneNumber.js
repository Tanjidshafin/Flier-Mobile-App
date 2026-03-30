function normalizePhoneNumber(input) {
  const trimmed = String(input || '').trim();
  const digits = trimmed.replace(/[^\d+]/g, '');

  if (!digits.startsWith('+')) {
    return `+${digits.replace(/[^\d]/g, '')}`;
  }

  return `+${digits.slice(1).replace(/[^\d]/g, '')}`;
}

module.exports = { normalizePhoneNumber };
