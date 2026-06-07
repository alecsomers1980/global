export type Branch = 'pretoria' | 'marble-hall';

export const BRANCHES: { value: Branch; label: string }[] = [
    { value: 'pretoria', label: 'Pretoria' },
    { value: 'marble-hall', label: 'Marble Hall' },
];

export function getBranchLabel(branch: Branch | string): string {
    const found = BRANCHES.find(b => b.value === branch);
    return found?.label ?? branch;
}
