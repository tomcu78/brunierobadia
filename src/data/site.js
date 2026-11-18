// Contenu réel repris du site actuel (source: base Airtable du studio).
// Rien n'est inventé: projets, clients et textes sont les données d'origine.

export const SITE = {
  url: 'https://www.brunierobadia.com',
  name: 'BrunierObadia',
  legalName: 'BRUNIER OBADIA STUDIOS',
  legalForm: 'Société par Actions Simplifiée (SAS)',
  shareCapital: '3 000 €',
  siren: '984 547 919',
  siret: '984 547 919 00014',
  rcs: 'Paris B 984 547 919',
  rcsCity: 'Paris',
  vatNumber: 'FR 74 984547919',
  codeApe: '9003A (Création artistique relevant des arts plastiques)',
  headquarters: "84 rue d'Aboukir, 75002 Paris, France",
  phone: '+33 1 89 71 33 00',
  // Directeur de la publication = représentant légal de la société (LCEN, art. 6) : le Président.
  publicationDirectors: {
    fr: 'Jonas Obadia, Président',
    en: 'Jonas Obadia, President',
  },
  host: {
    name: 'Vercel Inc.',
    address: '440 N Barranca Ave #4133, Covina, CA 91723, États-Unis',
    phone: '+1 (951) 383-6898',
    url: 'https://vercel.com',
  },
  tagline: {
    fr: 'Agence de communication créative, digital performance et brand transformation.',
    en: 'Creative communication, digital performance and brand transformation agency.',
  },
  emails: ['jonasobadia@brunierobadia.com', 'jeanpaulbrunier@brunierobadia.com'],
  foundingDate: '2024',
  address: { country: 'FR', locality: 'Paris', postalCode: '75002', streetAddress: "84 rue d'Aboukir" },
};

// Les projets vivent dans ./projects.js (26 projets extraits de la base du studio).
export { projects } from './projects.js';

export const about = {
  fr: "Nous sommes une agence agile, indépendante et pleine d'expérience. Brunier & Obadia réunit un stratège et un créatif d'exception : Jean-Paul Brunier (ancien président de Leo Burnett France et dirigeant chez Publicis) et Jonas Obadia. Nous maîtrisons toutes les disciplines de la communication créative et décloisonnons les compétences, avec nos pôles complémentaires BrunierObadia AI Endorsement (avec Tom Cottu) et BrunierObadia Brand Transformation (avec Christophe Attelé).",
  en: "We are an agile, independent, and deeply experienced agency. Brunier & Obadia brings together an exceptional strategist and creative: Jean-Paul Brunier (former president of Leo Burnett France and Publicis Groupe executive) and Jonas Obadia. We master every discipline of creative communication, complemented by BrunierObadia AI Endorsement (with Tom Cottu) and BrunierObadia Brand Transformation (with Christophe Attelé).",
  stats: [
    { value: '50', label: { fr: "ans d'expérience", en: 'years of experience' } },
    { value: '200', label: { fr: 'marques', en: 'brands' } },
    { value: '21', label: { fr: 'secteurs', en: 'sectors' } },
    { value: '3', label: { fr: 'métiers', en: 'disciplines' } },
  ],
};

// 21 secteurs, marques clientes (source: table clients du studio).
export const clients = [
  { fr: 'MOBILITÉ', en: 'MOBILITY', brands: ['RENAULT', 'PEUGEOT', 'NISSAN', 'ASTON MARTIN', 'JEEP', 'VALEO', 'BMW', 'GENERAL MOTORS', 'CHRYSLER', 'DACIA', 'FIAT', 'ALFA ROMEO', 'ABARTH'] },
  { fr: 'ÉNERGIES', en: 'ENERGIES', brands: ['EDF', 'TOTAL ENERGIES', 'SUEZ'] },
  { fr: 'CONSEIL', en: 'CONSULTING', brands: ['MAZARS'] },
  { fr: 'FINANCE / ASSURANCES', en: 'FINANCE / INSURANCE', brands: ['ALLIANZ', 'MACIF', 'AXA', 'BARCLAYS', 'MILLEIS BANQUE', 'CNP', 'SOCIÉTÉ GÉNÉRALE', 'CRÉDIT AGRICOLE', 'AFER', 'BNP PARIBAS'] },
  { fr: 'COSMÉTIQUES / PARFUMS', en: 'COSMETICS / PERFUMES', brands: ['ACQUA DI PARMA', 'COTY PARFUMS', 'HUGO BOSS', 'DECLÉOR', 'GUERLAIN', 'LANCÔME', 'HELENA RUBINSTEIN', 'VALENTINO'] },
  { fr: 'MÉDIA', en: 'MEDIA', brands: ['LE POINT', 'NRJ', 'TF1', 'FRANCE TELEVISION', 'PRISMA MEDIA', 'MEDIA TRANSPORTS', 'ARCHISTORM', 'NEON', 'TÉLÉ 7 JOURS', 'TÉLÉ LOISIRS', 'VSD', 'GEO', 'FEMME ACTUELLE', "ÇA M'INTERESSE", 'VOICI', 'MARIE-CLAIRE'] },
  { fr: 'ONG', en: 'NGOS', brands: ['ATD QUART MONDE', 'FÉDÉRATION FRANÇAISE DE RUGBY', 'ARMÉE DE TERRE', 'LE SAMU SOCIAL', 'SIDACTION', 'FONDATION MIMI ULLENS', 'ONU', 'MINISTÈRE DE LA CULTURE', 'MINISTÈRE DU LOGEMENT', 'MINISTÈRE DE LA TRANSITION ÉCO.', 'LES ORPHELINS APPRENTIS', 'UNESCO'] },
  { fr: 'SANTÉ', en: 'HEALTH', brands: ['PFIZER', 'SANOFI', 'SANOFI PASTEUR', 'CIALIS', 'PIERRE FABRE', 'VICHY', "L'ORÉAL", 'GILEAD', 'NEXIUM', 'ALWAYS', 'ROCHE', 'JANSSEN', 'HÔPITAUX DE PARIS', 'DOLIPRANE'] },
  { fr: 'SERVICES', en: 'SERVICES', brands: ['AIR FRANCE', 'TOURISME TUNISIEN', 'LA POSTE', 'INGENICO', 'WEIGHT WATCHERS', 'INTERMARCHÉ', 'COSTA CROISIÈRES', 'IXINA'] },
  { fr: 'ENSEIGNEMENT', en: 'EDUCATION', brands: ['E-ARTSUP', 'IONIS EDUCATION GROUP', 'EPITECH', 'EPITECH DIGITAL SCHOOL'] },
  { fr: 'TÉLÉCOMMUNICATIONS', en: 'TELECOMMUNICATIONS', brands: ['ALTICE', 'SFR', 'NUMERICABLE', 'CISCO'] },
  { fr: 'JEUX', en: 'GAMBLING', brands: ['PMU', 'FRANÇAISE DES JEUX', 'BETFAIR'] },
  { fr: 'SPORTS', en: 'SPORTS', brands: ['PSG', 'FÉDÉRATION FRANÇAISE DE RUGBY', 'NIKE', 'ADIDAS', 'OLYMPIQUE LYONNAIS', 'OL GROUPE', 'JORDAN', 'GO SPORT'] },
  { fr: 'JOAILLERIE', en: 'JEWELRY', brands: ['PIAGET', 'CARTIER', 'BULGARI', 'CHAUMET', 'JAEGER-LECOULTRE'] },
  { fr: 'LUXE', en: 'LUXURY', brands: ['DIOR', 'HERMÈS', 'BALENCIAGA', 'BARBARA BUI', 'CHANEL', 'GIVENCHY', 'MAISON ULLENS'] },
  { fr: 'CULTURE / RECHERCHE', en: 'CULTURE / RESEARCH', brands: ['CNRS', 'NATURAL HISTORY MUSEUM', 'CENTRE POMPIDOU', 'AL THANI COLLECTION'] },
  { fr: 'IMMOBILIER / TRAVAUX PUBLICS', en: 'REAL ESTATE / PUBLIC WORKS', brands: ['ALTAREA COGEDIM', 'LAFARGE', 'DEFACTO', 'VINCI', 'CENTURY 21'] },
  { fr: 'TECH / ÉQUIPEMENTS', en: 'TECH / APPLIANCES', brands: ['SAMSUNG', 'CISCO', 'ATLANTIC', 'APPLE', 'THOMSON', 'ROWENTA'] },
  { fr: 'VINS & SPIRITUEUX', en: 'WINES & SPIRITS', brands: ['MOËT & CHANDON', 'HENNESSY', 'DOM PÉRIGNON'] },
  { fr: 'CONSOMMATION COURANTE', en: 'CONVENIENCE GOODS', brands: ['SOPALIN', 'LE TRÈFLE', 'PROCTER & GAMBLE', 'ENERGIZER', 'PHILIP MORRIS'] },
  { fr: 'ALIMENTATION / BOISSONS', en: 'FOOD / BEVERAGES', brands: ['NESTLÉ', 'DANONE', 'COCA-COLA', "KELLOGG'S", 'YOPLAIT', 'CHARAL', 'UNITED BISCUITS', 'LINDT', 'PETIT NAVIRE', 'LE GAULOIS'] },
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
    slug: 'brand-transformation',
    code: 'DISCIPLINE // 02',
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
    code: 'DISCIPLINE // 03',
    accent: '#b800ff',
    fr: {
      title: 'AI Endorsement',
      text: 'Ne soyez pas seulement trouvé par l\'IA. Soyez recommandé. Nous mesurons ce que les IA disent de votre marque et nous la faisons passer de la mention à la recommandation, avec des preuves.',
      scope: 'De la mention à l\'endorsement dans les réponses des IA',
      lead: 'Jean-Paul Brunier · Tom Cottu',
      deliverables: [
        'Audit : ce que ChatGPT, Gemini et Perplexity disent de votre marque et de vos concurrents',
        'Score d\'endorsement : présence, rang, tonalité, exactitude',
        'Carte des questions où vous êtes absent et plan d\'action priorisé',
        'Stratégie : les messages, les preuves et les sources à renforcer',
        'Activation : sources tierces, contenus de référence, avis et preuves, experts, site et données, plateformes ouvertes',
        'Suivi : tableau de bord mensuel et comité trimestriel avec votre direction'
      ],
      steps: ['01. Audit', '02. Stratégie', '03. Activation', '04. Suivi'],
      standard: 'Des progrès mesurés chaque mois, pas un rang garanti',
    },
    en: {
      title: 'AI Endorsement',
      text: 'Don\'t just be found by AI. Be recommended. We measure what AI assistants say about your brand and move it from mention to recommendation, with proof.',
      scope: 'From mention to endorsement in AI answers',
      lead: 'Jean-Paul Brunier · Tom Cottu',
      deliverables: [
        'Audit: what ChatGPT, Gemini and Perplexity say about your brand and your competitors',
        'Endorsement score: presence, rank, tone, accuracy',
        'Map of the questions where you are absent, and a prioritised action plan',
        'Strategy: the messages, proof and sources to strengthen',
        'Activation: third-party sources, reference content, reviews and proof, experts, website and data, open platforms',
        'Monitoring: monthly dashboard and quarterly review with your leadership'
      ],
      steps: ['01. Audit', '02. Strategy', '03. Activation', '04. Monitoring'],
      standard: 'Measured progress every month, never a guaranteed rank',
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
