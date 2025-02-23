// screens/HomeScreen.js
import React, {useState, useEffect} from 'react';
import {
    View,
    StyleSheet,
    TextInput,
    Animated,
    TouchableOpacity,
    FlatList,
    Keyboard, TouchableWithoutFeedback, KeyboardAvoidingView, Platform, Text
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
    const {recipes, refreshRecipes, deleteRecipe, loading, setSelectedRecipe, handleSaveRecipe} = useRecipes();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [scrollY] = useState(new Animated.Value(0));

    useEffect(() => {
        /*Dialog.show({
            type: ALERT_TYPE.SUCCESS,
            title: 'Supprimer la recette',
            textBody: 'Êtes-vous sûr de vouloir supprimer cette recette ?',
            button: 'Annuler',
            onPressButton: () => Dialog.hide(),
            onPressConfirm: () => onDelete(recipe.id),
        });*/
    }, []);

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

    const handleRecipePress = (recipe) => {
        setSelectedRecipe(recipe);
        navigation.navigate('RecipeDetail');
    };

    const handleExport = async () => {
        const success = await StorageService.exportRecipes();
        if (success) {
            alert('Exportation réussie !');
        } else {
            alert("Une erreur s'est produite.");
        }
    };

    const handleImport = async () => {
        const success = await StorageService.importRecipes();
        if (success) {
            alert('Importation réussie !');
        } else {
            alert("Erreur lors de l'importation.");
        }
    };

    let desc = '';

    const fetchTikTokDescription = async () => {
        const url = "https://www.tiktok.com/@joexfitness/video/7471249646854229291?_t=ZN-8txiZoJgw7S&_r=1";
        const videoId = url.split('/').pop();

        const options = {
            method: 'GET',
            url: 'https://tiktok-api23.p.rapidapi.com/api/post/detail',
            params: {
                videoId: videoId
            },
            headers: {
                'x-rapidapi-key': '888b40bdafmsh5edb1371b01fc2dp17158djsn11b523888675',
                'x-rapidapi-host': 'tiktok-api23.p.rapidapi.com'
            }
        };

        try {
            const response = await axios.request(options);
            const desc = response.data.itemInfo.itemStruct.desc;
            console.log(desc);

            const recipe = await generateRecipe(desc);

            handleSaveRecipe(recipe, false);
        } catch (error) {
            console.error(error);
        }
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
                                    onChangeText={setSearchQuery}
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
                            onRefresh={refreshRecipes}
                        />

                        <TouchableOpacity
                            style={styles.fab}
                            onPress={() => {
                                setSelectedRecipe(null);
                                navigation.navigate('AddOrEditRecipe');
                            }}
                        >
                            <Icon name="add" size={30} color={COLORS.card}/>
                        </TouchableOpacity>

                        <ImportButton/>
                    </SafeAreaView>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
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
});

export default HomeScreen;