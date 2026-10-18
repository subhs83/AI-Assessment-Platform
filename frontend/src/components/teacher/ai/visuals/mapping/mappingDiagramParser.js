// mapping/mappingDiagramParser.js

const FEATURES = new Set([
  "identify_function",
  "find_domain",
  "find_range",
  "find_codomain",
  "classify_function",
  "identify_ordered_pairs",
]);

function invalid(error) {
  return {
    valid: false,
    error,
    figure: null,
    sourceSet: null,
    targetSet: null,
    arrows: [],
    analysis: null,
  };
}

// Normalize simple display differences for duplicate detection.
// This is not a symbolic mathematics equivalence checker.
function labelKey(label) {
  return label
    .trim()
    .replace(/\$/g, "")
    .replace(/\s+/g, "");
}

export function parseMappingDiagram(visual) {
  const { figure, elements, relationships } = visual || {};

  if (
    figure?.type !== "mapping_diagram" ||
    figure?.subtype !== "two_sets" ||
    !FEATURES.has(figure.feature)
  ) {
    return invalid("Unsupported mapping diagram.");
  }

  if (
    !Array.isArray(elements) ||
    !Array.isArray(relationships)
  ) {
    return invalid("Elements and relationships must be arrays.");
  }

  // ------------------------------------------
  // 1. Validate and index elements.
  // ------------------------------------------
  const byId = new Map();

  for (const element of elements) {
    if (
      !element ||
      typeof element.id !== "string" ||
      !element.id.trim() ||
      byId.has(element.id)
    ) {
      return invalid("Missing or duplicate element ID.");
    }

    if (!["set", "member"].includes(element.type)) {
      return invalid("Unsupported mapping element.");
    }

    if (
      typeof element.label !== "string" ||
      !element.label.trim() ||
      !labelKey(element.label)
    ) {
      return invalid("Sets and members need visible labels.");
    }

    byId.set(element.id, {
      ...element,
      label: element.label.trim(),
    });
  }

  const sets = [...byId.values()].filter(
    (element) => element.type === "set"
  );

  const members = [...byId.values()].filter(
    (element) => element.type === "member"
  );

  if (sets.length !== 2) {
    return invalid("Exactly two sets are required.");
  }

  const source = byId.get(figure.source_set);
  const target = byId.get(figure.target_set);

  if (
    source?.type !== "set" ||
    target?.type !== "set" ||
    source.id === target.id
  ) {
    return invalid(
      "source_set and target_set must reference two distinct sets."
    );
  }

  // ------------------------------------------
  // 2. Validate relationship references.
  // ------------------------------------------
  const membershipLinks = [];
  const mappingLinks = [];

  for (const relationship of relationships) {
    if (
      !relationship ||
      !["belongs_to", "maps_to"].includes(relationship.type) ||
      !Array.isArray(relationship.elements) ||
      relationship.elements.length === 0 ||
      !byId.has(relationship.target) ||
      relationship.elements.some((id) => !byId.has(id))
    ) {
      return invalid("Invalid mapping relationship.");
    }

    if (relationship.type === "belongs_to") {
      membershipLinks.push(relationship);
    } else {
      mappingLinks.push(relationship);
    }
  }

  // ------------------------------------------
  // 3. Assign every member to exactly one set.
  // Multiple belongs_to relationships per set
  // are allowed, provided no member repeats.
  // ------------------------------------------
  const ownerByMember = new Map();

  for (const link of membershipLinks) {
    if (byId.get(link.target).type !== "set") {
      return invalid("belongs_to must target a set.");
    }

    for (const memberId of link.elements) {
      if (byId.get(memberId).type !== "member") {
        return invalid("Only members can belong to a set.");
      }

      if (ownerByMember.has(memberId)) {
        return invalid(
          "Every member must belong to exactly one set without duplicate links."
        );
      }

      ownerByMember.set(memberId, link.target);
    }
  }

  if (ownerByMember.size !== members.length) {
    return invalid("Every member must have a belongs_to relationship.");
  }

  // Preserve element order for a predictable display.
  const sourceMembers = members.filter(
    (member) => ownerByMember.get(member.id) === source.id
  );

  const targetMembers = members.filter(
    (member) => ownerByMember.get(member.id) === target.id
  );

  for (const setMembers of [sourceMembers, targetMembers]) {
    if (setMembers.length < 2 || setMembers.length > 6) {
      return invalid(
        "Each set must contain 2–6 members for this diagram contract."
      );
    }

    const labels = setMembers.map((member) =>
      labelKey(member.label)
    );

    if (new Set(labels).size !== labels.length) {
      return invalid("Member labels must be distinct within each set.");
    }
  }

  // ------------------------------------------
  // 4. Construct arrows.
  // Zero or multiple outgoing arrows are valid
  // in a relation, including non-function examples.
  // ------------------------------------------
  const outgoing = new Map(
    sourceMembers.map((member) => [member.id, []])
  );

  const incoming = new Map(
    targetMembers.map((member) => [member.id, []])
  );

  const seenPairs = new Set();
  const arrows = [];

  for (const link of mappingLinks) {
    if (link.elements.length !== 1) {
      return invalid("Each maps_to relationship needs one source member.");
    }

    const sourceId = link.elements[0];
    const targetId = link.target;

    if (
      !outgoing.has(sourceId) ||
      !incoming.has(targetId)
    ) {
      return invalid(
        "Arrows must run from a source-set member to a target-set member."
      );
    }

    const pairKey = JSON.stringify([sourceId, targetId]);

    if (seenPairs.has(pairKey)) {
      return invalid("The same ordered pair cannot be repeated.");
    }

    seenPairs.add(pairKey);
    outgoing.get(sourceId).push(targetId);
    incoming.get(targetId).push(sourceId);

    arrows.push({
      id: pairKey,
      sourceId,
      targetId,
    });
  }

  if (arrows.length === 0) {
    return invalid("Include at least one mapping arrow.");
  }

  // ------------------------------------------
  // 5. Derive mathematical properties.
  // These are internal metadata, not visual labels.
  // ------------------------------------------
  const isFunction = sourceMembers.every(
    (member) => outgoing.get(member.id).length === 1
  );

  if (
    figure.feature === "classify_function" &&
    !isFunction
  ) {
    return invalid(
      "classify_function requires exactly one image for every source member."
    );
  }

  const domainIds = sourceMembers
    .filter((member) => outgoing.get(member.id).length > 0)
    .map((member) => member.id);

  const rangeIds = targetMembers
    .filter((member) => incoming.get(member.id).length > 0)
    .map((member) => member.id);

  // Function classifications are undefined here for non-functions.
  const isOneOne = isFunction
    ? targetMembers.every(
        (member) => incoming.get(member.id).length <= 1
      )
    : null;

  const isOnto = isFunction
    ? targetMembers.every(
        (member) => incoming.get(member.id).length > 0
      )
    : null;

  return {
    valid: true,
    error: null,
    figure: { ...figure },

    sourceSet: {
      ...source,
      members: sourceMembers,
    },

    targetSet: {
      ...target,
      members: targetMembers,
    },

    arrows,

    analysis: {
      domainIds,
      codomainIds: targetMembers.map((member) => member.id),
      rangeIds,
      isFunction,
      isOneOne,
      isManyOne: isFunction ? !isOneOne : null,
      isOnto,
      isInto: isFunction ? !isOnto : null,
      isBijective: isFunction ? isOneOne && isOnto : null,
    },
  };
}