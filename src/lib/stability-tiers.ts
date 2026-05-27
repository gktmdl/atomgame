const stabilityTierGroups = [
  ["Ni", "Fe"],
  ["Co", "Cu", "Zn", "Mn", "Cr", "V"],
  ["Ti", "Sc", "Ga", "Ge", "As", "Se", "Br", "Kr"],
  ["Rb", "Sr", "Y", "Zr", "Nb", "Mo", "Tc", "Ru", "Rh", "Pd", "Ag", "Ca", "K", "Ar", "Cl"],
  ["Cd", "In", "Sn", "Sb", "Te", "I", "Xe", "Cs", "Ba", "La", "Ce", "Pr", "Nd", "S", "P", "Si", "Al", "Mg"],
  ["Pm", "Sm", "Eu", "Gd", "Tb", "Dy", "Ho", "Er", "Tm", "Yb", "Lu", "Hf", "Ta", "W", "Re", "Os", "Ir", "Pt", "Au", "Hg", "Na", "Ne"],
  ["Tl", "Pb", "Bi", "Po", "O", "F"],
  ["At", "Rn", "Fr", "Ra", "Ac", "Th", "Pa", "U", "C", "N"],
  ["Np", "Pu", "Am", "Cm", "Bk", "Cf", "Es", "Fm", "Md", "No", "Lr"],
  ["Rf", "Db", "Sg", "Bh", "Hs", "Mt", "Ds", "Rg", "Cn", "Nh", "Fl", "Mc", "Lv", "Ts", "Og", "He"],
  ["B", "Be", "Li"],
  ["H"],
] as const;

export const elementTierMap: Record<string, number> = stabilityTierGroups.reduce(
  (map, group, tier) => {
    for (const symbol of group) {
      map[symbol] = tier;
    }
    return map;
  },
  {} as Record<string, number>
);

export const getElementStabilityTier = (symbol: string) => elementTierMap[symbol] ?? 11;

export const getElementLifetimeScale = (symbol: string) => {
  const tier = getElementStabilityTier(symbol);
  return 1 - (tier / 11) * 0.25;
};

export const getElementTierScale = getElementLifetimeScale;