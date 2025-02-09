// screens/HomeScreen.js
import React, {useState, useEffect} from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    TextInput,
    Animated,
    TouchableOpacity,
    FlatList,
    Keyboard, TouchableWithoutFeedback, KeyboardAvoidingView, Platform
} from 'react-native';
import {COLORS, CATEGORIES} from '../styles/theme';
import RecipeCard from '../components/RecipeCard';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useNavigation} from '@react-navigation/native';
import {CategoryChip} from "../components/CategoryChip";
import {useRecipes} from "../context/RecipeContext";

const HomeScreen = () => {
    const navigation = useNavigation();
    const {recipes, refreshRecipes, deleteRecipe, loading, selectRecipe} = useRecipes();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [scrollY] = useState(new Animated.Value(0));

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

            return matchesSearch && matchesCategory;
        });
    };

    const handleRecipePress = (recipe) => {
        selectRecipe(recipe);  // Mettre à jour le contexte avec la recette sélectionnée
        navigation.navigate('RecipeDetail');  // Naviguer vers la page de détails
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{flex: 1}}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.container}>
                    <Animated.View style={[styles.header]}>
                        <Animated.View style={[styles.searchContainer, {opacity: searchBarOpacity}]}>
                            <Icon name="search" size={24} color={COLORS.textLight}/>
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Rechercher une recette"
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
                        renderItem={({item}) => (
                            <RecipeCard
                                recipe={item}
                                onPress={() => handleRecipePress(item)}  // Utiliser la nouvelle fonction handleRecipePress
                                onEdit={() => navigation.navigate('AddOrEditRecipe', {recipe: item})}
                                onDelete={() => deleteRecipe(item.id)}
                            />
                        )}
                        keyExtractor={item => item.id}
                        keyboardShouldPersistTaps="handled"
                        contentContainerStyle={styles.recipesList}
                        onScroll={Animated.event(
                            [{nativeEvent: {contentOffset: {y: scrollY}}}],
                            {useNativeDriver: false}
                        )}
                        refreshing={loading}
                        onRefresh={refreshRecipes}
                    />

                    <TouchableOpacity
                        style={styles.fab}
                        onPress={() => navigation.navigate('AddOrEditRecipe')}
                    >
                        <Icon name="add" size={30} color={COLORS.card}/>
                    </TouchableOpacity>
                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        //backgroundColor: COLORS.primary,
        paddingVertical: 20,
    },
    searchContainer: {
        flexDirection: 'row',
        backgroundColor: COLORS.card,
        borderRadius: 12,
        padding: 12,
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        marginHorizontal: 20,
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 16,
        paddingRight: 8,
        color: COLORS.text,
    },
    categoriesContainer: {
        marginTop: 8,
        paddingLeft: 20,
    },
    recipesList: {},
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
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
});

export default HomeScreen;