// utils/storage.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Recipe} from '../models/Recipe';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';

const STORAGE_KEY = '@recipes';

const isValidRecipe = (recipe) => {
    return (
        typeof recipe.id === 'string' &&
        typeof recipe.name === 'string'
    );
};

export const StorageService = {

    async saveRecipe(recipe) {
        try {
            const existingRecipes = await this.getAllRecipes();
            const recipeIndex = existingRecipes.findIndex(r => r.id === recipe.id);

            if (recipeIndex >= 0) {
                existingRecipes[recipeIndex] = { ...recipe, updatedAt: new Date() };
            } else {
                existingRecipes.push(new Recipe(recipe));
            }

            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(existingRecipes));
            return true;
        } catch (error) {
            console.error('Error saving recipe:', error);
            return false;
        }
    },

    async getAllRecipes() {
        try {
            const recipesJson = await AsyncStorage.getItem(STORAGE_KEY);
            if (!recipesJson) return [];

            const recipes = JSON.parse(recipesJson);

            recipes.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

            return recipes.map(recipe => new Recipe(recipe));

        } catch (error) {
            console.error('Error getting recipes:', error);
            return [];
        }
    },

    async deleteRecipe(recipeId) {
        try {
            const recipes = await this.getAllRecipes();
            const filteredRecipes = recipes.filter(recipe => recipe.id !== recipeId);
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filteredRecipes));
            return true;
        } catch (error) {
            console.error('Error deleting recipe:', error);
            return false;
        }
    },

    async searchRecipes(query, categories = []) {
        try {
            const recipes = await this.getAllRecipes();
            return recipes.filter(recipe => {
                const matchesSearch = !query ||
                    recipe.name.toLowerCase().includes(query.toLowerCase()) ||
                    recipe.ingredients.some(ing =>
                        ing.name.toLowerCase().includes(query.toLowerCase())
                    );

                const matchesCategory = categories.length === 0 ||
                    categories.includes(recipe.category);

                return matchesSearch && matchesCategory;
            });
        } catch (error) {
            console.error('Error searching recipes:', error);
            return [];
        }
    },

    async exportRecipe(recipeId) {
        try {
            const recipes = await this.getAllRecipes();
            const recipe = recipes.find(r => r.id === recipeId);

            if (!recipe) {
                console.error('Recipe not found:', recipeId);
                return false;
            }

            const json = JSON.stringify([recipe], null, 2);
            const fileUri = `${FileSystem.documentDirectory}${recipe.name}.json`;

            await FileSystem.writeAsStringAsync(fileUri, json, { encoding: FileSystem.EncodingType.UTF8 });

            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(fileUri);
            } else {
                console.log("Le partage n'est pas disponible sur cet appareil.");
            }

            return true;
        } catch (error) {
            console.error('Error exporting recipe:', error);
            return false;
        }
    },

    async exportRecipes() {
        try {
            const recipes = await this.getAllRecipes();
            const json = JSON.stringify(recipes, null, 2);
            const fileUri = `${FileSystem.documentDirectory}Mon Cookbook.json`;

            await FileSystem.writeAsStringAsync(fileUri, json, { encoding: FileSystem.EncodingType.UTF8 });

            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(fileUri);
            } else {
                console.log("Le partage n'est pas disponible sur cet appareil.");
            }

            return true;
        } catch (error) {
            console.error('Error exporting recipes:', error);
            return false;
        }
    },

    async importRecipes() {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'application/json'
            });

            if (result.canceled) return false;

            const fileUri = result.assets[0].uri;
            const content = await FileSystem.readAsStringAsync(fileUri);

            let importedRecipes;
            try {
                importedRecipes = JSON.parse(content);
                if (!Array.isArray(importedRecipes)) throw new Error('Le fichier ne contient pas une liste de recettes.');
            } catch (error) {
                alert("Fichier invalide. Assurez-vous d'importer un fichier JSON contenant des recettes.");
                return false;
            }

            const validRecipes = importedRecipes.filter(isValidRecipe);

            if (validRecipes.length === 0) {
                alert("Aucune recette valide trouvée dans le fichier importé.");
                return false;
            }

            const existingRecipes = await this.getAllRecipes();
            const mergedRecipes = [...existingRecipes, ...validRecipes].reduce((acc, recipe) => {
                if (!acc.find(r => r.id === recipe.id)) acc.push(recipe);
                return acc;
            }, []);

            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(mergedRecipes));
            alert(`${validRecipes.length} recettes importées avec succès !`);
            return true;
        } catch (error) {
            console.error('Erreur lors de l’importation des recettes :', error);
            alert("Une erreur est survenue lors de l'importation.");
            return false;
        }
    },

    async clearAllRecipes() {
        try {
            await AsyncStorage.removeItem(STORAGE_KEY);
            alert("Toutes les recettes ont été supprimées !");
            return true;
        } catch (error) {
            console.error("Erreur lors de la suppression des recettes :", error);
            alert("Une erreur est survenue lors de la suppression.");
            return false;
        }
    }
};