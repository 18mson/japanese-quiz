export interface FormulaToken {
  text: string;
  isPlus: boolean;
}

export function parseFormulaTokens(formula: string): FormulaToken[] {
  if (!formula) return [];
  const rawParts = formula.split(/\s+\+\s+/);
  const tokens: FormulaToken[] = [];
  rawParts.forEach((part, idx) => {
    if (idx > 0) {
      tokens.push({ text: '+', isPlus: true });
    }
    if (part.trim()) {
      tokens.push({ text: part.trim(), isPlus: false });
    }
  });
  return tokens;
}
