// Regroupe les étiquettes des projets (doublons, variantes FR/EN) en quelques familles lisibles pour les filtres.
const GROUPS = [
  { key: 'identite', fr: 'Identité', en: 'Identity', match: ['identité', 'identité visuelle', 'identités visuelles', 'visual identity', 'visual identities', 'identity', 'brand design', 'x-trail escapes'] },
  { key: 'direction', fr: 'Direction artistique', en: 'Art direction', match: ['direction artistique', 'art direction'] },
  { key: 'edition', fr: 'Édition', en: 'Publishing', match: ['magazine', 'édition', 'layout'] },
  { key: 'web', fr: 'Web', en: 'Web', match: ['site web', 'webdesign', 'website'] },
  { key: 'photo', fr: 'Photographie', en: 'Photography', match: ['photographie', 'photography'] },
  { key: 'motion', fr: 'Motion 3D', en: 'Motion 3D', match: ['3d motion', 'motion 3d'] },
];

export const typeKeys = (p) => {
  const tags = [...(p.tags_fr || []), ...(p.tags_en || [])].map((t) => t.toLowerCase().trim());
  return GROUPS.filter((g) => g.match.some((m) => tags.includes(m))).map((g) => g.key);
};

export const typeFilters = (projects, lang) =>
  GROUPS.map((g) => ({ key: g.key, label: g[lang], count: projects.filter((p) => typeKeys(p).includes(g.key)).length })).filter((g) => g.count > 0);
