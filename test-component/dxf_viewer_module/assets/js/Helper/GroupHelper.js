export const getChildrenGroupIds = (groups) => {
  const groupIds = [];
  groups.forEach((g) => groupIds.push(g.id));
  return groups
    .map((g) => g.group_ids)
    .flat(Infinity)
    .filter((id) => groupIds.includes(id));
}

export const getRootGroups = (groups) => {
  const childrenGroupIds = getChildrenGroupIds(groups);

  return groups.filter((g) => !childrenGroupIds.includes(g.id));
};

export const getChildrenGroupsByParentGroupId = (groups, id) => {
  const childrenGroupIds = groups
    .filter((g) => g.id == id)
    .map((g) => g.group_ids)
    .flat(Infinity);
  return groups.filter((g) => childrenGroupIds.includes(g.id));
};

const getParentGroupId = (groups, id, parentGroupIds) => {
  groups.forEach((g) => {
    if (g.group_ids.includes(id)) {
      parentGroupIds.push(g);
      getParentGroupId(groups, g.id, parentGroupIds);
    }
  });
  return parentGroupIds;
}

export const getParentGroup = (groups, id) => { 
  let parentGroups = [null];
  parentGroups = getParentGroupId(groups, id, parentGroups);
  return parentGroups;
}