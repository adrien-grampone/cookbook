import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { CATEGORIES, COLORS } from "../styles/theme";

const CategoryDisplay = ({ recipe }) => {
    const [expanded, setExpanded] = useState(false);
    const animation = useRef(new Animated.Value(0)).current;

    const firstCategory = CATEGORIES.find(cat => cat.id === recipe.category[0]);
    const otherCategories = recipe.category.slice(1)
        .map(categorie => CATEGORIES.find(cat => cat.id === categorie))
        .filter(Boolean);

    const toggleExpand = () => {
        Animated.timing(animation, {
            toValue: expanded ? 0 : 1,
            duration: 300,
            useNativeDriver: false,
        }).start();
        setExpanded(!expanded);
    };

    const heightInterpolate = animation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, otherCategories.length * 40],
    });

    return (
        <Animated.View style={[styles.categoryBadge]}>
            {/* Première catégorie */}
            {firstCategory && (
                <Text style={styles.categoryChip}>
                    {firstCategory.icon} {firstCategory.label}
                </Text>
            )}

            {/* Catégories supplémentaires (wrap correct) */}
            {expanded && otherCategories.map((cat, index) => (
                <Text key={index} style={styles.categoryChip}>
                    {cat.icon} {cat.label}
                </Text>
            ))}

            {/* Bulle +X avec toggle */}
            {!expanded && otherCategories.length > 0 && (
                <TouchableOpacity onPress={toggleExpand} style={styles.moreChip}>
                    <Text style={styles.moreLabel}>
                        {expanded ? '-' : `+${otherCategories.length}`}
                    </Text>
                </TouchableOpacity>
            )}

        </Animated.View>
    );
};

export default CategoryDisplay;

const styles = StyleSheet.create({
    categoryBadge: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 8,
        position: 'absolute',
        left: 10,
        top: 10,
    },
    categoryChip: {
        backgroundColor: COLORS.surface,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    moreChip: {
        backgroundColor: COLORS.surface,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
});
