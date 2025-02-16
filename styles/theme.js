// styles/theme.js
export const COLORS = {
    primary: '#4A90E2',      // Bleu doux et moderne
    secondary: '#F7F9FC',    // Blanc bleuté très léger (lumineux)
    accent: '#E29C4A',       // Corail chaud (touche vibrante)
    background: '#FFFFFF',   // Blanc pur (minimaliste et clean)
    surface: '#F2F4F8',      // Gris bleuté ultra léger (subtilité)
    card: '#FFFFFF',         // Blanc pour les cartes
    text: '#333333',         // Gris foncé (lisibilité optimale)
    textLight: '#7D8A99',    // Gris moyen (texte secondaire)
    success: '#22C55E',      // Vert doux (validation)
    error: '#FF4D4F',        // Rouge doux (erreur)
    warning: '#FFC107',      // Jaune moderne (avertissement)
    border: '#E3E8EF',       // Gris très clair (bordures subtiles)

    // Couleurs additionnelles pour les catégories
    categoryChip: {
        background: '#F2F4F8',
        selectedBackground: '#4A90E2',
        text: '#333333',
        selectedText: '#FFFFFF',
    },

    // Dégradés
    gradients: {
        primary: ['#4A90E2', '#76B4FC'],  // Dégradé de bleu doux
        accent: ['#FF7A59', '#FF9A76'],  // Dégradé de corail chaud
    }
};

// Constantes pour le style général
export const SPACING = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
};

export const RADIUS = {
    sm: 6,
    md: 12,
    lg: 20,
    xl: 32,
    round: 999,
};

export const TYPOGRAPHY = {
    h1: {
        fontSize: 26,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    h2: {
        fontSize: 24,
        fontWeight: '600',
        letterSpacing: 0.3,
    },
    body: {
        fontSize: 18,
        letterSpacing: 0.2,
    },
    caption: {
        fontSize: 14,
        letterSpacing: 0.1,
    },
};

export const SHADOWS = {
    small: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    medium: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 4,
    },
    large: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 6,
    },
};

export const CATEGORIES = [
    { id: 'breakfast', label: 'Petit-déjeuner', icon: '🍳' },
    { id: 'lunch', label: 'Déjeuner', icon: '🍝' },
    { id: 'dinner', label: 'Dîner', icon: '🍖' },
    { id: 'dessert', label: 'Dessert', icon: '🍰' },
    { id: 'snack', label: 'Encas', icon: '🥨' },
    { id: 'drink', label: 'Boisson', icon: '🥤' },
    { id: 'vegetarian', label: 'Végétarien', icon: '🥗' },
];

export const ANIMATIONS = {
    scale: {
        from: { scale: 0.95 },
        to: { scale: 1 },
    },
    fadeIn: {
        from: { opacity: 0 },
        to: { opacity: 1 },
    },
};

export const UNITS = [
    { id: 'g', label: 'grammes (g)', icon: '🍚' },
    { id: 'kg', label: 'kilogrammes (kg)', icon: '🧱' },
    { id: 'ml', label: 'millilitres (ml)', icon: '🥄' },
    { id: 'cl', label: 'centilitres (cl)', icon: '🥂' },
    { id: 'l', label: 'litres (l)', icon: '🛁' },
    { id: 'cas', label: 'cuillères à soupe', icon: '🥄' },
    { id: 'cac', label: 'cuillères à café', icon: '☕' },
    { id: 'pincee', label: 'pincée(s)', icon: '🤏' },
    { id: 'unite', label: 'unité(s)', icon: '🔢' },
    { id: 'piece', label: 'pièce(s)', icon: '🧩' },
    { id: 'tranche', label: 'tranche(s)', icon: '🍞' },
    { id: 'tasse', label: 'tasse(s)', icon: '🍵' },
    { id: 'verre', label: 'verre(s)', icon: '🥤' },
];

