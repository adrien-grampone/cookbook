// screens/HomeScreen.js
import React, {useState, useEffect} from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    TextInput,
    Animated,
    Text,
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
import { StorageService } from '../utils/storage';
import axios from 'axios';
import {generateRecipe} from "../utils/openai";
import ImportButton from "../components/ImportButton";

const HomeScreen = () => {
    const navigation = useNavigation();
    const {recipes, refreshRecipes, deleteRecipe, loading, selectRecipe, handleSaveRecipe} = useRecipes();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [scrollY] = useState(new Animated.Value(0));

    const handleClearAllRecipes = async () => {
        await StorageService.clearAllRecipes();
    };

    /*useEffect(() => {
        handleClearAllRecipes();
    }, []);*/

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
        selectRecipe(recipe);  // Mettre à jour le contexte avec la recette sélectionnée
        navigation.navigate('RecipeDetail');  // Naviguer vers la page de détails
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
        //const url = "https://www.tiktok.com/@cuisinesaine/video/7471251818220113174?lang=fr";
        const url = "https://www.tiktok.com/@joexfitness/video/7471249646854229291?_t=ZN-8txiZoJgw7S&_r=1";

        //get video id
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
            //console.log(response.data.itemInfo.itemStruct.desc);
            //desc = "Voici la recette d’un délicieux bolw cake version pomme/semoule avec un cœur coulant chocolat au milieu 💘 Pour régaler 1 personne, il vous faudra: 💕30 g de semoule fine  💕100 g de compote de pommes SSA  💕50 g de lait  💕1 soupçon de levure chimique  💕1 œuf 💕1 cuillère de pâte à tartiner (beurre de cacahouète au chocolat Prozis 💙pour moi) ♨️ 3 minutes à 900 W au micro-ondes. 💙10% de réduction chez @Prozis_official + des 🎁🎁 avec le code CUISINESAINE10 #recette #food #healthy #reequilibragealimentaire #cooking #recipe #cook";
            const desc = response.data.itemInfo.itemStruct.desc;
            console.log(desc);

            const recipe = await generateRecipe(desc);

            handleSaveRecipe(recipe, false);
        } catch (error) {
            console.error(error);
        }

    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{flex: 1}}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.container}>
                    <TouchableOpacity onPress={() => handleExport()}>
                        <Text>Exporter</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleImport()}>
                        <Text>Importer</Text>
                    </TouchableOpacity>
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

                    <ImportButton />
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
    fab2: {
        position: 'absolute',
        bottom: 24,
        left: 24,
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