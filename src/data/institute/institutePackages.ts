// ============================================
// INSTITUTE → PACKAGES ASSIGNMENT (mock store)
// ============================================
// Maps which packages a SuperAdmin has assigned
// to each institute. In-memory only; replaced
// with persistence in a later phase.

import type { Package } from "@/types/packages";
import { getPackageById, getAllPackages } from "@/data/packages";

/** instituteId -> Set of packageIds */
const assignments = new Map<string, Set<string>>();

// Seed the first institute with both demo packages so the institute
// portal has something to show out of the box.
const seedInstituteId = "inst-1";
assignments.set(
  seedInstituteId,
  new Set(getAllPackages().map((p) => p.id)),
);

export const getAssignedPackageIds = (instituteId: string): string[] =>
  Array.from(assignments.get(instituteId) ?? []);

export const getPackagesForInstitute = (instituteId: string): Package[] => {
  const ids = assignments.get(instituteId);
  if (!ids) return [];
  return Array.from(ids)
    .map((id) => getPackageById(id))
    .filter((p): p is Package => !!p);
};

export const assignPackagesToInstitute = (
  instituteId: string,
  packageIds: string[],
): void => {
  assignments.set(instituteId, new Set(packageIds));
};

export const isPackageAssignedToInstitute = (
  instituteId: string,
  packageId: string,
): boolean => assignments.get(instituteId)?.has(packageId) ?? false;

export const removePackageFromInstitute = (
  instituteId: string,
  packageId: string,
): void => {
  assignments.get(instituteId)?.delete(packageId);
};
