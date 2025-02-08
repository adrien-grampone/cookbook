// screens/HomeScreen.js
import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    Animated,
    TouchableOpacity,
    FlatList,
} from 'react-native';
import { COLORS, CATEGORIES } from '../styles/theme';
import RecipeCard from '../components/RecipeCard';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import {StorageService} from "../utils/storage";
import {CategoryChip} from "../components/CategoryChip";

const HomeScreen = () => {
    const navigation = useNavigation();
    const [recipes, setRecipes] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [scrollY] = useState(new Animated.Value(0));
    const [refreshing, setRefreshing] = useState(false);

    // Animation pour le header
    const headerHeight = scrollY.interpolate({
        inputRange: [0, 100],
        outputRange: [200, 120],
        extrapolate: 'clamp',
    });

    const searchBarOpacity = scrollY.interpolate({
        inputRange: [0, 100],
        outputRange: [1, 0.9],
        extrapolate: 'clamp',
    });

    const filterRecipes = () => {
        return recipes.filter(recipe => {
            const matchesSearch =
                recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                recipe.ingredients.some(ing =>
                    ing.name.toLowerCase().includes(searchQuery.toLowerCase())
                );

            const matchesCategory =
                selectedCategories.length === 0 ||
                (Array.isArray(recipe.category) && recipe.category.some(category => selectedCategories.includes(category)));

            console.log('recipe.category', recipe.category)
            console.log('selectedCategories', selectedCategories)

            //return matchesSearch && matchesCategory;
            return  matchesCategory;
        });
    };

    const fetchRecipes = async () => {
        try {
            const storedRecipes = await AsyncStorage.getItem('@recipes');
            if (storedRecipes) {
                setRecipes(JSON.parse(storedRecipes));
            }
        } catch (error) {
            console.error('Erreur lors du chargement des recettes :', error);
        }
    };

    useEffect(() => {
        fetchRecipes();
    }, []);

    const deleteRecipe = async (id) => {
        try {
            const updatedRecipes = recipes.filter(recipe => recipe.id !== id);
            setRecipes(updatedRecipes);
            await AsyncStorage.setItem('@recipes', JSON.stringify(updatedRecipes));
        } catch (error) {
            console.error('Erreur lors de la suppression de la recette :', error);
        }
    };


    /*const CategoryChip = ({ category, isSelected, onPress }) => (
        <TouchableOpacity
            onPress={onPress}
            style={[
                styles.categoryChip,
                isSelected && { backgroundColor: COLORS.primary }
            ]}
        >
            <Text style={[
                styles.categoryLabel,
                isSelected && { color: COLORS.card }
            ]}>
                {category.icon} {category.label}
            </Text>
        </TouchableOpacity>
    );*/

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.header, { height: headerHeight }]}>
                <Animated.View style={[styles.searchContainer, { opacity: searchBarOpacity }]}>
                    <Icon name="search" size={24} color={COLORS.textLight} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Rechercher une recette ou un ingrédient..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </Animated.View>

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.categoriesContainer}
                >
                    {CATEGORIES.map(category => (
                        <CategoryChip
                            key={category.id}
                            category={category}
                            isSelected={selectedCategories.includes(category.id)}
                            onPress={() => {
                                setSelectedCategories(prev =>
                                    prev.includes(category.id)
                                        ? prev.filter(id => id !== category.id)
                                        : [...prev, category.id]
                                );
                            }}
                        />
                    ))}
                </ScrollView>
            </Animated.View>

            <FlatList
                data={filterRecipes()}
                renderItem={({ item }) => (
                    <RecipeCard
                        recipe={item}
                        onPress={() => navigation.navigate('RecipeDetail', { recipe: item })}
                        onEdit={() => navigation.navigate('EditRecipe', { recipe: item })}
                        onDelete={() => deleteRecipe(item.id)}
                    />
                )}
                keyExtractor={item => item.id}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.recipesList}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: false }
                )}
                refreshing={refreshing}
                onRefresh={fetchRecipes} // Action déclenchée en tirant vers le bas
            />

            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('AddRecipe')}
            >
                <Icon name="add" size={30} color={COLORS.card} />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        backgroundColor: COLORS.primary,
        padding: 16,
        paddingTop: 60,
    },
    searchContainer: {
        flexDirection: 'row',
        backgroundColor: COLORS.card,
        borderRadius: 12,
        padding: 12,
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 16,
        color: COLORS.text,
    },
    categoriesContainer: {
        marginTop: 8,
    },
    recipesList: {
        paddingHorizontal: 8,
    },
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        backgroundColor: COLORS.accent,
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
});

export default HomeScreen;