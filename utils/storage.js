// utils/storage.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Recipe} from '../models/Recipe';

const STORAGE_KEY = '@recipes';

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
    }
};