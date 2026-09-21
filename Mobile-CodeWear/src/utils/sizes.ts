const SIZE_ORDER = ['P', 'M', 'G', 'GG'];
type SizeValue = string | { size: string };

export function sortSizes(sizes: string[]): string[];
export function sortSizes<T extends { size: string }>(sizes: T[]): T[];
export function sortSizes(sizes: string[] | { size: string }[]): SizeValue[];
export function sortSizes(sizes: SizeValue[]): SizeValue[] {
  return [...sizes].sort((left, right) => {
    const leftSize = typeof left === 'string' ? left : left.size;
    const rightSize = typeof right === 'string' ? right : right.size;
    const leftIndex = SIZE_ORDER.indexOf(leftSize.toUpperCase());
    const rightIndex = SIZE_ORDER.indexOf(rightSize.toUpperCase());

    return (leftIndex === -1 ? SIZE_ORDER.length : leftIndex) - (rightIndex === -1 ? SIZE_ORDER.length : rightIndex);
  });
}