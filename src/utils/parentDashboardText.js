export function childDisplayName(child) {
  if (!child) return "Child";
  return [child.name, child.lastname].filter(Boolean).join(" ").trim() || "Child";
}

/** "Emma", "Emma and Liam", or "your children" */
export function childrenNamesPhrase(children = [], selectedChild = null) {
  if (selectedChild) return childDisplayName(selectedChild);

  const active = children.filter(Boolean);
  if (active.length === 0) return "your child";
  if (active.length === 1) return childDisplayName(active[0]);
  if (active.length === 2) {
    return `${childDisplayName(active[0])} and ${childDisplayName(active[1])}`;
  }
  return `${childDisplayName(active[0])} and ${active.length - 1} more`;
}

/** "child" vs "children" */
export function childCountNoun(count, selectedChild = null) {
  if (selectedChild) return "child";
  return count === 1 ? "child" : "children";
}

/** "Emma's" vs "your children's" */
export function childPossessive(children = [], selectedChild = null) {
  if (selectedChild) return `${childDisplayName(selectedChild)}'s`;
  const active = children.filter(Boolean);
  if (active.length === 1) return `${childDisplayName(active[0])}'s`;
  return "your children's";
}

export function parentDashboardDescription() {
  return "Your family hub for child reflections, learning moments and centre updates.";
}

export function itemMatchesChild(item, childId) {
  if (!childId || childId === "all") return true;
  const target = String(childId);
  const links = item?.children || item?.child || [];
  const list = Array.isArray(links) ? links : [links];
  return list.some((entry) => {
    const id = entry?.childid ?? entry?.child?.id ?? entry?.id ?? entry;
    return String(id) === target;
  });
}
