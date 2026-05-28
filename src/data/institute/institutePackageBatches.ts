// ============================================
// INSTITUTE → PACKAGE → BATCH BINDINGS
// ============================================
// Which of the institute's batches consume a given
// assigned package. One package may be bound to many
// batches; one batch may consume many packages.

import { getPackageById } from "@/data/packages";
import type { Package } from "@/types/packages";

/** key = `${instituteId}::${packageId}` -> Set of batchIds */
const bindings = new Map<string, Set<string>>();

const k = (instituteId: string, packageId: string) =>
  `${instituteId}::${packageId}`;

export const getBatchesForPackage = (
  instituteId: string,
  packageId: string,
): string[] => Array.from(bindings.get(k(instituteId, packageId)) ?? []);

export const setBatchesForPackage = (
  instituteId: string,
  packageId: string,
  batchIds: string[],
): void => {
  bindings.set(k(instituteId, packageId), new Set(batchIds));
};

export const toggleBatchForPackage = (
  instituteId: string,
  packageId: string,
  batchId: string,
): void => {
  const key = k(instituteId, packageId);
  const set = bindings.get(key) ?? new Set<string>();
  if (set.has(batchId)) set.delete(batchId);
  else set.add(batchId);
  bindings.set(key, set);
};

/** Used by future teacher/student panels to discover a batch's packages. */
export const getPackagesForBatch = (
  instituteId: string,
  batchId: string,
): Package[] => {
  const out: Package[] = [];
  for (const [key, set] of bindings.entries()) {
    if (!key.startsWith(`${instituteId}::`)) continue;
    if (!set.has(batchId)) continue;
    const pkgId = key.split("::")[1];
    const pkg = getPackageById(pkgId);
    if (pkg) out.push(pkg);
  }
  return out;
};

export const countBoundBatches = (
  instituteId: string,
  packageId: string,
): number => bindings.get(k(instituteId, packageId))?.size ?? 0;
