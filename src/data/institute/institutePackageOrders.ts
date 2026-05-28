// ============================================
// INSTITUTE LOCAL REORDER OVERRIDES
// ============================================
// SA's master order in the Package store stays
// untouched. The institute can choose its own
// sequence for chapters / lesson plans / blocks
// without affecting any other institute or SA.

type Scope =
  | { kind: "chapter"; gradeId: string; subjectId: string }
  | { kind: "lesson"; gradeId: string; subjectId: string; chapterId: string }
  | { kind: "block"; lessonId: string };

const orders = new Map<string, string[]>();

const keyFor = (instituteId: string, packageId: string, scope: Scope): string => {
  const base = `${instituteId}::${packageId}`;
  switch (scope.kind) {
    case "chapter":
      return `${base}::ch::${scope.gradeId}::${scope.subjectId}`;
    case "lesson":
      return `${base}::lp::${scope.gradeId}::${scope.subjectId}::${scope.chapterId}`;
    case "block":
      return `${base}::bk::${scope.lessonId}`;
  }
};

/** Returns the institute's custom order, or null when none has been set. */
export const getOrder = (
  instituteId: string,
  packageId: string,
  scope: Scope,
): string[] | null => {
  const v = orders.get(keyFor(instituteId, packageId, scope));
  return v ? [...v] : null;
};

export const setOrder = (
  instituteId: string,
  packageId: string,
  scope: Scope,
  ids: string[],
): void => {
  orders.set(keyFor(instituteId, packageId, scope), [...ids]);
};

export const clearOrder = (
  instituteId: string,
  packageId: string,
  scope: Scope,
): void => {
  orders.delete(keyFor(instituteId, packageId, scope));
};

/**
 * Apply an override (if any) to the SA default list, while gracefully
 * tolerating items that have been added/removed since the override was set.
 */
export const applyOrder = <T extends { id: string }>(
  defaults: T[],
  override: string[] | null,
): T[] => {
  if (!override || override.length === 0) return defaults;
  const byId = new Map(defaults.map((d) => [d.id, d]));
  const ordered: T[] = [];
  for (const id of override) {
    const item = byId.get(id);
    if (item) {
      ordered.push(item);
      byId.delete(id);
    }
  }
  // Append any new items SA added after the override was saved, in their
  // original SA order.
  for (const remaining of defaults) {
    if (byId.has(remaining.id)) ordered.push(remaining);
  }
  return ordered;
};

export type { Scope as OrderScope };
