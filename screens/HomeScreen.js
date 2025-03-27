import React, {useState, useEffect} from 'react';
import {
    View,
    StyleSheet,
    TextInput,
    Animated,
    TouchableOpacity,
    FlatList,
    Keyboard, TouchableWithoutFeedback, KeyboardAvoidingView, Platform, Text, ActivityIndicator
} from 'react-native';
import {COLORS, CATEGORIES} from '../styles/theme';
import RecipeCard from '../components/RecipeCard';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useNavigation} from '@react-navigation/native';
import {CategoryChip} from "../components/CategoryChip";
import {useRecipes} from "../context/RecipeContext";
import {StorageService} from '../utils/storage';
import axios from 'axios';
import {generateRecipe} from "../utils/openai";
import ImportButton from "../components/ImportButton";
import {SafeAreaView} from 'react-native-safe-area-context';
import {ALERT_TYPE, Dialog, AlertNotificationRoot, Toast} from 'react-native-alert-notification';

const HomeScreen = () => {
    const navigation = useNavigation();
    const {recipes, loadRecipes, deleteRecipe, loading, setSelectedRecipe, handleSaveRecipe, setLoading} = useRecipes();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [scrollY] = useState(new Animated.Value(0));
    const [isSearching, setIsSearching] = useState(false);

    const handleClearAllRecipes = async () => {
        await StorageService.clearAllRecipes();
    };

    const searchBarOpacity = scrollY.interpolate({
        inputRange: [0, 100],
        outputRange: [1, 0.9],
        extrapolate: 'clamp',
    });

    const filterRecipes = () => {
        return recipes.filter(recipe => {
            const matchesSearch =
                recipe.name && recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                recipe.ingredients && recipe.ingredients.some(ing =>
                    ing.name.toLowerCase().includes(searchQuery.toLowerCase())
                );

            const matchesCategory =
                selectedCategories.length === 0 ||
                (Array.isArray(recipe.category) && recipe.category.some(category => selectedCategories.includes(category)));

            return matchesSearch && matchesCategory;
        });
    };

    useEffect(() => {
        if (searchQuery) {
            setIsSearching(true);
            const timeoutId = setTimeout(() => {
                setIsSearching(false);
            }, 100); // Simulate a delay for searching
            return () => clearTimeout(timeoutId);
        } else{
            setIsSearching(false);
        }
    }, [searchQuery]);

    const handleRecipePress = (recipe) => {
        setSelectedRecipe(recipe);
        navigation.navigate('RecipeDetail');
    };

    return (
        <AlertNotificationRoot>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{flex: 1}}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
                        <Animated.View style={[styles.header]}>
                            <Animated.View style={[styles.searchContainer, {opacity: searchBarOpacity}]}>
                                <Icon name="search" size={24} color={COLORS.textLight}/>
                                <TextInput
                                    style={styles.searchInput}
                                    placeholder="Rechercher une recette"
                                    value={searchQuery}
                                    onChangeText={text => {
                                        setSearchQuery(text);
                                        setIsSearching(true);
                                    }}
                                />
                            </Animated.View>

                            <FlatList
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                data={CATEGORIES}
                                keyExtractor={item => item.id}
                                renderItem={({item}) => (
                                    <CategoryChip
                                        category={item}
                                        isSelected={selectedCategories.includes(item.id)}
                                        onPress={() => {
                                            setSelectedCategories(prev =>
                                                prev.includes(item.id)
                                                    ? prev.filter(id => id !== item.id)
                                                    : [...prev, item.id]
                                            );
                                        }}
                                    />
                                )}
                                contentContainerStyle={styles.categoriesContainer}
                            />
                        </Animated.View>

                        {isSearching ? (
                            <View style={styles.loaderContainerRecipe}>
                                <ActivityIndicator size="large" color={COLORS.accent} />
                            </View>
                        ) : (
                            <FlatList
                                data={filterRecipes()}
                                renderItem={({item}) => (
                                    <RecipeCard
                                        recipe={item}
                                        onPress={() => handleRecipePress(item)}
                                        onEdit={() => navigation.navigate('AddOrEditRecipe', {recipe: item})}
                                        onDelete={() => deleteRecipe(item.id)}
                                    />
                                )}
                                keyExtractor={item => item.id}
                                keyboardShouldPersistTaps="handled"
                                contentContainerStyle={[styles.recipesList, {paddingBottom: 80}]} // Ajout du padding
                                onScroll={Animated.event(
                                    [{nativeEvent: {contentOffset: {y: scrollY}}}],
                                    {useNativeDriver: false}
                                )}
                                refreshing={loading}
                                onRefresh={() => loadRecipes(false)} // Ensure this is a function
                            />
                        )}

                        <TouchableOpacity
                            style={styles.fab}
                            onPress={() => {
                                setSelectedRecipe(null);
                                navigation.navigate('AddOrEditRecipe');
                            }}>
                            <Icon name="add" size={30} color={COLORS.card}/>
                        </TouchableOpacity>

                        <ImportButton/>
                    </SafeAreaView>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
            {loading && (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color={COLORS.accent} />
                </View>
            )}
        </AlertNotificationRoot>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
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
    recipesList: {
        paddingHorizontal: 10,
    },
    columnWrapper: {
        justifyContent: 'space-between',
    },
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        backgroundColor: COLORS.primary,
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
    loaderContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',  // Semi-transparent background
        zIndex: 1,  // Ensure the loader is on top
        width: '100%',
        height: '100%',
    },
    loaderContainerRecipe: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,  // Ensure the loader is on top
        width: '100%',
        height: '100%',
        paddingTop:80
    },

});

export default HomeScreen;