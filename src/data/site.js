// Contenu réel repris du site actuel (source: base Airtable du studio).
// Rien n'est inventé: projets, clients et textes sont les données d'origine.

export const SITE = {
  url: 'https://www.brunierobadia.com',
  name: 'BrunierObadia',
  legalName: 'BrunierObadia Studios',
  tagline: {
    fr: 'Agence de communication créative, digital performance et brand transformation.',
    en: 'Creative communication, digital performance and brand transformation agency.',
  },
  emails: ['jonasobadia@brunierobadia.com', 'jeanpaulbrunier@brunierobadia.com'],
  foundingDate: '2022',
  address: { country: 'FR', locality: 'Paris' },
};

// Les projets vivent dans ./projects.js (26 projets extraits de la base du studio).
export { projects } from './projects.js';

export const about = {
  fr: "Nous sommes une agence agile, indépendante et pleine d'expérience. Brunier & Obadia réunit un stratège et un créatif d'exception : Jean-Paul Brunier (ancien Président de Publicis Conseil) et Jonas Obadia. Nous maîtrisons toutes les disciplines de la communication créative et décloisonnons les compétences, avec nos pôles complémentaires BrunierObadia Digital Performance (dirigée par Cyrille Douin) et BrunierObadia Brand Transformation (avec Christophe Attelé).",
  en: "We are an agile, independent, and deeply experienced agency. Brunier & Obadia brings together an exceptional strategist and creative: Jean-Paul Brunier (former President of Publicis Conseil) and Jonas Obadia. We master every discipline of creative communication, complemented by BrunierObadia Digital Performance (led by Cyrille Douin) and BrunierObadia Brand Transformation (with Christophe Attelé).",
  stats: [
    { value: '50', label: { fr: "ans d'expérience", en: 'years of experience' } },
    { value: '200', label: { fr: 'marques', en: 'brands' } },
    { value: '21', label: { fr: 'secteurs', en: 'sectors' } },
    { value: '3', label: { fr: 'métiers', en: 'disciplines' } },
  ],
};

// 21 secteurs, marques clientes (source: table clients du studio).
export const clients = [
  { fr: 'MOBILITÉ', en: 'MOBILITY', brands: ['RENAULT', 'PEUGEOT', 'NISSAN', 'ASTON MARTIN', 'JEEP', 'VALEO'] },
  { fr: 'ÉNERGIES', en: 'ENERGIES', brands: ['EDF', 'TOTAL ENERGIES', 'SUEZ'] },
  { fr: 'CONSEIL', en: 'CONSULTING', brands: ['MAZARS'] },
  { fr: 'FINANCE / ASSURANCES', en: 'FINANCE / INSURANCE', brands: ['ALLIANZ', 'MACIF', 'AXA', 'BARCLAYS', 'MILLEIS BANQUE', 'CNP', 'SOCIÉTÉ GÉNÉRALE', 'CRÉDIT AGRICOLE', 'AFER', 'BNP PARIBAS'] },
  { fr: 'COSMÉTIQUES / PARFUMS', en: 'COSMETICS / PERFUMES', brands: ['ACQUA DI PARMA', 'COTY PARFUMS', 'HUGO BOSS', 'DECLÉOR', 'GUERLAIN', 'LANCÔME', 'HELENA RUBINSTEIN', 'VALENTINO'] },
  { fr: 'MÉDIA', en: 'MEDIA', brands: ['LE POINT', 'NRJ', 'TF1', 'FRANCE TELEVISION', 'PRISMA MEDIA', 'MEDIA TRANSPORTS', 'ARCHISTORM', 'NEON', 'TÉLÉ 7 JOURS', 'TÉLÉ LOISIRS', 'VSD', 'GEO', 'FEMME ACTUELLE', "ÇA M'INTERESSE", 'VOICI', 'MARIE-CLAIRE'] },
  { fr: 'ONG', en: 'NGOS', brands: ['ATD QUART MONDE', 'FÉDÉRATION FRANÇAISE DE RUGBY', 'ARMÉE DE TERRE', 'LE SAMU SOCIAL', 'SIDACTION', 'FONDATION MIMI ULLENS', 'ONU', 'MINISTÈRE DE LA CULTURE', 'MINISTÈRE DU LOGEMENT', 'MINISTÈRE DE LA TRANSITION ÉCO.', 'LES ORPHELINS APPRENTIS', 'OLYMPIQUE LYONNAIS', 'UNESCO'] },
  { fr: 'SANTÉ', en: 'HEALTH', brands: ['PFIZER', 'SANOFI', 'SANOFI PASTEUR', 'CIALIS', 'PIERRE FABRE', 'VICHY', "L'ORÉAL", 'GILEAD', 'NEXIUM', 'ALWAYS', 'ROCHE', 'JANSSEN', 'HÔPITAUX DE PARIS', 'DOLIPRANE'] },
  { fr: 'SERVICES', en: 'SERVICES', brands: ['AIR FRANCE', 'TOURISME TUNISIEN', 'ACI', 'LA POSTE', 'INGENICO'] },
  { fr: 'ENSEIGNEMENT', en: 'EDUCATION', brands: ['E-ARTSUP', 'IONIS EDUCATION GROUP', 'EPITECH', 'EPITECH DIGITAL SCHOOL'] },
  { fr: 'TÉLÉCOMMUNICATIONS', en: 'TELECOMMUNICATIONS', brands: ['ALTICE', 'SFR', 'NUMERICABLE', 'CISCO'] },
  { fr: 'JEUX', en: 'GAMBLING', brands: ['PMU', 'FRANÇAISE DES JEUX'] },
  { fr: 'SPORTS', en: 'SPORTS', brands: ['PSG', 'FÉDÉRATION FRANÇAISE DE RUGBY', 'NIKE', 'ADIDAS', 'OLYMPIQUE LYONNAIS', 'JORDAN', 'GO SPORT'] },
  { fr: 'JOAILLERIE', en: 'JEWELRY', brands: ['PIAGET', 'CARTIER', 'BULGARI', 'CHAUMET', 'JAEGER-LECOULTRE'] },
  { fr: 'LUXE', en: 'LUXURY', brands: ['DIOR', 'HERMÈS', 'BALENCIAGA', 'BARBARA BUI', 'CHANEL', 'GIVENCHY', 'MAISON ULLENS'] },
  { fr: 'CULTURE / RECHERCHE', en: 'CULTURE / RESEARCH', brands: ['CNRS', 'NATURAL HISTORY MUSEUM', 'CENTRE POMPIDOU', 'AL THANI COLLECTION'] },
  { fr: 'IMMOBILIER / TRAVAUX PUBLICS', en: 'REAL ESTATE / PUBLIC WORKS', brands: ['ALTAREA COGEDIM', 'LAFARGE', 'DEFACTO', 'VINCI', 'CENTURY 21'] },
  { fr: 'TECH / ÉQUIPEMENTS', en: 'TECH / APPLIANCES', brands: ['SAMSUNG', 'CISCO', 'ATLANTIC'] },
  { fr: 'VINS & SPIRITUEUX', en: 'WINES & SPIRITS', brands: ['MOËT & CHANDON', 'HENNESSY', 'DOM PÉRIGNON'] },
  { fr: 'CONSOMMATION COURANTE', en: 'CONVENIENCE GOODS', brands: ['SOPALIN', 'LE TRÈFLE'] },
  { fr: 'ALIMENTATION / BOISSONS', en: 'FOOD / BEVERAGES', brands: ['NESTLÉ', 'DANONE'] },
];

export const offers = [
  {
    slug: 'creation',
    code: 'DISCIPLINE // 01',
    accent: '#e6ff00',
    fr: {
      title: 'Création & Direction artistique',
      text: "Brunier et Obadia : direction artistique, identité, campagne, édition et fabrication d'exception.",
      scope: 'Haute Façon & Direction Artistique',
      lead: 'Jonas Obadia & Jean-Paul Brunier',
      deliverables: [
        'Direction de création globale',
        'Identité visuelle & Logo system',
        'Typographie sur-mesure & Titrage',
        'Édition d’art & Livres de prestige',
        'Campagnes 360° & Scénographie',
        'Packaging & Façonnage de luxe'
      ],
      steps: ['01. Diagnostic narratif', '02. Direction artistique', '03. Façonnage d’art'],
      standard: '100% Haute façon artisanale & digitale',
    },
    en: {
      title: 'Creation & Art Direction',
      text: 'Brunier and Obadia: art direction, brand identity, campaigns, publishing and collector production.',
      scope: 'Haute Façon & Art Direction',
      lead: 'Jonas Obadia & Jean-Paul Brunier',
      deliverables: [
        'Global Creative Direction',
        'Visual Identity & Logo System',
        'Custom Typography & Titling',
        'Art Books & Collector Print',
        '360° Campaigns & Scenography',
        'Luxury Packaging & Craft'
      ],
      steps: ['01. Narrative Diagnostic', '02. Art Direction', '03. Master Craft & Rollout'],
      standard: '100% Bespoke Craft & Execution',
    },
    caseSlugs: [
      'balenciaga-global-retail-meeting-2023',
      'mad-paris-metal-design',
      'hermes-maison-hermes-les-podiums',
      'al-thani-collection-comment-saisir-une-passion-eclectique'
    ]
  },
  {
    slug: 'performance-digitale',
    code: 'DISCIPLINE // 02',
    accent: '#00e5ff',
    fr: {
      title: 'Performance digitale',
      text: 'BrunierObadia Digital Performance, dirigée par Cyrille Douin : acquisition, sites, contenus, mesure.',
      scope: 'Ingénierie & Écosystèmes Digitaux',
      lead: 'Cyrille Douin (Associé fondateur)',
      deliverables: [
        'Plateformes web headless haute vélocité',
        'Design Systems Figma to Code',
        'Stratégies d’acquisition & Activation média',
        'Audits Core Web Vitals & Vélocité',
        'Content Factory & Motion design',
        'Hub de mesure ROI & Analytics propriétaire'
      ],
      steps: ['01. Audit technique & Funnel', '02. Architecture & UX chirurgicale', '03. Mesure & Scalabilité'],
      standard: 'Score 100/100 Google · Temps de réponse < 200ms',
    },
    en: {
      title: 'Digital Performance',
      text: 'BrunierObadia Digital Performance, led by Cyrille Douin: acquisition, websites, content, measurement.',
      scope: 'Digital Engineering & Ecosystems',
      lead: 'Cyrille Douin (Founding Partner)',
      deliverables: [
        'High-Velocity Headless Web Platforms',
        'Figma-to-Code Design Systems',
        'Acquisition Strategies & Media Activation',
        'Core Web Vitals Audits & Performance',
        'Content Factory & Motion Design',
        'Proprietary ROI & Analytics Hub'
      ],
      steps: ['01. Technical & Funnel Audit', '02. Surgical UX & Architecture', '03. Scale & Measurement'],
      standard: '100/100 Google Score · < 200ms Response Time',
    },
    caseSlugs: [
      'penninghen-creation-site-web',
      'nissan-x-trail-escapes',
      'peugeot-futureship',
      'merci-raymond-pour-des-villes-plus-vertes'
    ]
  },
  {
    slug: 'brand-transformation',
    code: 'DISCIPLINE // 03',
    accent: '#ff8a00',
    fr: {
      title: 'Brand transformation',
      text: 'BrunierObadia Brand Transformation, avec Christophe Attelé : positionnement, marque, conduite du changement.',
      scope: 'Stratégie & Culture de Marque',
      lead: 'Christophe Attelé & Jean-Paul Brunier',
      deliverables: [
        'Plateforme & Récit de marque singulier',
        'Manifeste d’entreprise & Raison d’être',
        'Ateliers ComEx & Direction générale',
        'Playbook d’activation culturelle interne',
        'Architecture de portefeuille & Offre',
        'Baromètre d’adhésion & Gouvernance'
      ],
      steps: ['01. Immersion dirigeants & Parties prenantes', '02. Écriture du Brand Narrative', '03. Conduite du changement & Ralliement'],
      standard: 'Pérennité stratégique garantie à 10 ans',
    },
    en: {
      title: 'Brand Transformation',
      text: 'BrunierObadia Brand Transformation, with Christophe Attelé: positioning, brand, change management.',
      scope: 'Brand Strategy & Culture',
      lead: 'Christophe Attelé & Jean-Paul Brunier',
      deliverables: [
        'Singular Brand Platform & Narrative',
        'Corporate Manifesto & Purpose',
        'Board & Executive Leadership Workshops',
        'Internal Culture Activation Playbook',
        'Portfolio Architecture & Offer Hierarchy',
        'Stakeholder Alignment & Governance'
      ],
      steps: ['01. Leadership & Stakeholder Immersion', '02. Brand Narrative Authoring', '03. Change Management & Alignment'],
      standard: '10-Year Guaranteed Strategic Resilience',
    },
    caseSlugs: [
      'archistorm-refonte-mise-en-page-magazine',
      'micro-macro-cnrs',
      'museum-of-natural-history-london-life-s-journey',
      'jeep-jeep-animaux'
    ]
  },
  {
    slug: 'la-marque-dans-les-ia',
    code: 'DISCIPLINE // 04',
    accent: '#b800ff',
    fr: {
      title: 'La marque dans les IA',
      text: 'Dirigé par Jean-Paul Brunier. Ce que les intelligences génératives disent de votre marque façonne déjà votre réputation : audit de vérité, protection contre les hallucinations, souveraineté et gouvernance de marque face aux IA.',
      scope: 'Souveraineté & Gouvernance de Marque à l’Ère de l’IA',
      lead: 'Jean-Paul Brunier (ex-Président de Publicis Conseil)',
      deliverables: [
        'Audit de vérité de marque : ce que ChatGPT, Perplexity, Gemini et Claude disent de vous',
        'Stratégie de réputation et de souveraineté générative pour les Comex et directions générales',
        'Structuration du corpus de vérité et du narratif officiel de la marque (Knowledge Graph & llms.txt)',
        'Protection contre les hallucinations, amalgames et déformations sémantiques',
        'Imposition de votre singularité et de votre désirabilité face aux moteurs conversationnels',
        'Observatoire permanent de citabilité et d’autorité de marque dans les IA'
      ],
      steps: ['01. Diagnostic de réputation & cartographie des hallucinations IA', '02. Définition du corpus de vérité et ancrage sémantique', '03. Souveraineté de marque et gouvernance continue'],
      standard: 'Contrôle et souveraineté du narratif sur 100% des moteurs génératifs majeurs',
    },
    en: {
      title: 'Brands in the Age of AI',
      text: 'Led by Jean-Paul Brunier. What generative AI says about your brand already shapes your reputation: truth audit, defense against hallucinations, brand sovereignty and boardroom governance in the AI era.',
      scope: 'Brand Governance & Narrative Sovereignty in the AI Era',
      lead: 'Jean-Paul Brunier (Former President of Publicis Conseil)',
      deliverables: [
        'Brand Truth Audit: analyzing what ChatGPT, Perplexity, Gemini and Claude say about you',
        'Executive reputation & generative sovereignty strategy for C-suites and boards',
        'Structuring the official brand truth corpus and narrative grounding (Knowledge Graph & llms.txt)',
        'Protection against AI hallucinations, semantic dilution and competitor conflation',
        'Asserting your brand singularity and luxury value across conversational engines',
        'Ongoing AI citability and brand authority observatory'
      ],
      steps: ['01. Brand reputation audit & AI hallucination mapping', '02. Authoritative truth corpus & semantic grounding', '03. Brand sovereignty & executive governance'],
      standard: 'Narrative sovereignty across all major generative engines',
    },
    caseSlugs: [
      'micro-macro-cnrs',
      'penninghen-creation-site-web',
      'al-thani-collection-comment-saisir-une-passion-eclectique',
      'balenciaga-global-retail-meeting-2023'
    ]
  },
];

export const ui = {
  fr: {
    nav: { projets: 'Projets', studios: 'Les Studios', clients: 'Clients', offres: 'Offres', journal: 'Journal', contact: 'Contact' },
    filter: 'Filtrer les projets', next: 'Prochains projets', customers: 'Parmi nos clients', about: 'À propos',
    allProjects: 'Tous les projets', allSectors: 'Tous les secteurs', nextProject: 'Projet suivant', backHome: "Retour à l'accueil",
    sectorsLabel: 'Secteurs', brandsLabel: 'Marques', contactTitle: 'Nous contacter', langSwitch: 'EN',
  },
  en: {
    nav: { projets: 'Projects', studios: 'The Studios', clients: 'Clients', offres: 'Services', journal: 'Journal', contact: 'Contact' },
    filter: 'Filter projects', next: 'Next projects', customers: 'Amongst our clients', about: 'About us',
    allProjects: 'All projects', allSectors: 'All sectors', nextProject: 'Next project', backHome: 'Back to home',
    sectorsLabel: 'Sectors', brandsLabel: 'Brands', contactTitle: 'Contact us', langSwitch: 'FR',
  },
};

export const totalBrands = new Set(clients.flatMap((c) => c.brands)).size;
