// screens/RecipeDetailScreen.js
import React, { useRef } from 'react';
import {
    View,
    Text,
    ScrollView,
    Image,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Share,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../styles/theme';

const RecipeDetailScreen = ({ route, navigation }) => {
    const { recipe } = route.params;
    const scrollY = useRef(new Animated.Value(0)).current;

    const headerHeight = scrollY.interpolate({
        inputRange: [0, 200],
        outputRange: [300, 60],
        extrapolate: 'clamp',
    });

    const imageOpacity = scrollY.interpolate({
        inputRange: [0, 200],
        outputRange: [1, 0],
        extrapolate: 'clamp',
    });

    const titleTranslateY = scrollY.interpolate({
        inputRange: [0, 200],
        outputRange: [0, -240],
        extrapolate: 'clamp',
    });

    const shareRecipe = async () => {
        try {
            const ingredients = recipe.ingredients
                .map(ing => `- ${ing.amount} ${ing.unit} ${ing.name}`)
                .join('\n');

            const steps = recipe.steps
                .map((step, index) => `${index + 1}. ${step.description}`)
                .join('\n');

            await Share.share({
                message: `${recipe.name}\n\nIngrédients:\n${ingredients}\n\nPréparation:\n${steps}`,
                title: recipe.name,
            });
        } catch (error) {
            console.error('Error sharing recipe:', error);
        }
    };

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.header, { height: headerHeight }]}>
                <Animated.Image
                    source={{ uri: recipe.image }}
                    style={[styles.headerImage, { opacity: imageOpacity }]}
                />
                <Animated.View style={[styles.titleContainer, { transform: [{ translateY: titleTranslateY }] }]}>
                    <Text style={styles.title}>{recipe.name}</Text>
                    <View style={styles.metadata}>
                        <Text style={styles.metadataText}>🕒 {recipe.totalTime} min</Text>
                        <Text style={styles.metadataText}>👥 {recipe.servings} pers.</Text>
                    </View>
                </Animated.View>
            </Animated.View>

            <Animated.ScrollView
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: false }
                )}
                scrollEventThrottle={16}
                style={styles.content}
            >
                <View style={styles.nutritionCard}>
                    <Text style={styles.sectionTitle}>Valeurs nutritionnelles</Text>
                    <View style={styles.nutritionGrid}>
                        <View style={styles.nutritionItem}>
                            <Text style={styles.nutritionValue}>{recipe.macros.calories}</Text>
                            <Text style={styles.nutritionLabel}>Calories</Text>
                        </View>
                        <View style={styles.nutritionItem}>
                            <Text style={styles.nutritionValue}>{recipe.macros.protein}g</Text>
                            <Text style={styles.nutritionLabel}>Protéines</Text>
                        </View>
                        <View style={styles.nutritionItem}>
                            <Text style={styles.nutritionValue}>{recipe.macros.carbs}g</Text>
                            <Text style={styles.nutritionLabel}>Glucides</Text>
                        </View>
                        <View style={styles.nutritionItem}>
                            <Text style={styles.nutritionValue}>{recipe.macros.fat}g</Text>
                            <Text style={styles.nutritionLabel}>Lipides</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Ingrédients</Text>
                    {recipe.ingredients.map((ingredient, index) => (
                        <View key={index} style={styles.ingredientItem}>
                            <Text style={styles.ingredientText}>
                                • {ingredient.amount} {ingredient.unit} {ingredient.name}
                            </Text>
                        </View>
                    ))}
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Préparation</Text>
                    {recipe.steps.map((step, index) => (
                        <View key={index} style={styles.stepItem}>
                            <Text style={styles.stepNumber}>{index + 1}</Text>
                            <Text style={styles.stepText}>{step.description}</Text>
                        </View>
                    ))}
                </View>
            </Animated.ScrollView>

            <View style={styles.actionButtons}>
                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: COLORS.primary }]}
                    onPress={() => navigation.navigate('EditRecipe', { recipe })}
                >
                    <Icon name="edit" size={24} color={COLORS.card} />
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: COLORS.accent }]}
                    onPress={shareRecipe}
                >
                    <Icon name="share" size={24} color={COLORS.card} />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        overflow: 'hidden',
        zIndex: 1,
    },
    headerImage: {
        width: '100%',
        height: '100%',
        position: 'absolute',
    },
    titleContainer: {
        position: 'absolute',
        bottom: SPACING.md,
        left: SPACING.md,
        right: SPACING.md,
    },
    title: {
        ...TYPOGRAPHY.h1,
        color: COLORS.card,
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    metadata: {
        flexDirection: 'row',
        marginTop: SPACING.xs,
    },
    metadataText: {
        ...TYPOGRAPHY.caption,
        color: COLORS.card,
        marginRight: SPACING.md,
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    content: {
        flex: 1,
        marginTop: 300,
        backgroundColor: COLORS.background,
        borderTopLeftRadius: RADIUS.lg,
        borderTopRightRadius: RADIUS.lg,
    },
    nutritionCard: {
        margin: SPACING.md,
        padding: SPACING.md,
        backgroundColor: COLORS.card,
        borderRadius: RADIUS.md,
        ...SHADOWS.medium,
    },
    nutritionGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: SPACING.sm,
    },
    nutritionItem: {
        alignItems: 'center',
    },
    nutritionValue: {
        ...TYPOGRAPHY.h2,
        color: COLORS.primary,
    },
    nutritionLabel: {
        ...TYPOGRAPHY.caption,
        color: COLORS.textLight,
    },
    section: {
        margin: SPACING.md,
        padding: SPACING.md,
        backgroundColor: COLORS.card,
        borderRadius: RADIUS.md,
        ...SHADOWS.small,
    },
    sectionTitle: {
        ...TYPOGRAPHY.h2,
        marginBottom: SPACING.md,
    },
    ingredientItem: {
        marginBottom: SPACING.sm,
    },
    ingredientText: {
        ...TYPOGRAPHY.body,
    },
    stepItem: {
        flexDirection: 'row',
        marginBottom: SPACING.md,
    },
    stepNumber: {
        ...TYPOGRAPHY.h2,
        color: COLORS.primary,
        marginRight: SPACING.md,
        width: 30,
    },
    stepText: {
        ...TYPOGRAPHY.body,
        flex: 1,
    },
    actionButtons: {
        flexDirection: 'row',
        position: 'absolute',
        bottom: SPACING.xl,
        right: SPACING.md,
    },
    actionButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        marginLeft: SPACING.sm,
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.medium,
    },
});

export default RecipeDetailScreen;