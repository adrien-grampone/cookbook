// styles/theme.js
export const COLORS = {
    primary: '#FF4B6E',      // Rose corail moderne
    secondary: '#FFE3E9',    // Rose pâle
    accent: '#4ECDC4',       // Turquoise menthe
    background: '#FFFFFF',   // Blanc pur
    surface: '#F8F9FA',     // Gris très clair
    card: '#FFFFFF',        // Blanc
    text: '#2B2D42',        // Gris très foncé presque noir
    textLight: '#6C757D',   // Gris moyen
    success: '#2ECC71',     // Vert émeraude
    error: '#E74C3C',       // Rouge vif
    warning: '#F1C40F',     // Jaune or
    border: '#E9ECEF',      // Gris très clair pour les bordures

    // Couleurs additionnelles pour les catégories
    categoryChip: {
        background: '#F8F9FA',
        selectedBackground: '#FF4B6E',
        text: '#2B2D42',
        selectedText: '#FFFFFF',
    },

    // Dégradés
    gradients: {
        primary: ['#FF4B6E', '#FF8199'],
        accent: ['#4ECDC4', '#45B7AF'],
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
    sm: 4,
    md: 8,
    lg: 16,
    xl: 24,
    round: 999,
};

export const TYPOGRAPHY = {
    h1: {
        fontSize: 24,
        //fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    h2: {
        fontSize: 20,
        fontWeight: '600',
        letterSpacing: 0.3,
    },
    body: {
        fontSize: 16,
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
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    medium: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 4,
    },
    large: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
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
        from: { scale: 0.9 },
        to: { scale: 1 },
    },
    fadeIn: {
        from: { opacity: 0 },
        to: { opacity: 1 },
    },
};