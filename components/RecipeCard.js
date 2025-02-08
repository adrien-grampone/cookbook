// components/RecipeCard.js
import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SwipeRow } from 'react-native-swipe-list-view';


const RecipeCard = ({ recipe, onPress, onEdit, onDelete }) => {
    return (
        <SwipeRow rightOpenValue={-140}>
            {/* Boutons d'actions cachés sous la carte */}
            <View style={styles.hiddenRow}>
                <TouchableOpacity style={[styles.actionButton, styles.editButton]} onPress={() => onEdit(recipe)}>
                    <Icon name="edit" size={24} color="white" />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={() => onDelete(recipe.id)}>
                    <Icon name="delete" size={24} color="white" />
                </TouchableOpacity>
            </View>

            {/* Carte de la recette */}
            <TouchableOpacity activeOpacity={1} onPress={onPress} style={styles.card}>
                <Image
                    source={recipe.image ? { uri: recipe.image } : require('../assets/adaptive-icon.png')}
                    style={styles.image}
                />
                <View style={styles.content}>
                    <Text style={styles.title}>{recipe.name}</Text>
                    <View style={styles.macros}>
                        <Text style={styles.macroText}>🔥 {recipe.calories} kcal</Text>
                        <Text style={styles.macroText}>🥩 {recipe.protein}g</Text>
                        <Text style={styles.macroText}>🥑 {recipe.fat}g</Text>
                        <Text style={styles.macroText}>🍚 {recipe.carbs}g</Text>
                    </View>
                </View>
            </TouchableOpacity>
        </SwipeRow>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: 'white',
        paddingHorizontal: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        flexDirection: 'row',
        overflow: 'hidden',
        height:100,
    },
    image: {
        width: 100,
        height: 100,
        borderTopLeftRadius: 15,
        borderBottomLeftRadius: 15,
    },
    content: {
        flex: 1,
        padding: 12,
    },
    title: {
        fontSize: 18,
        marginBottom: 8,
    },
    macros: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    macroText: {
        fontSize: 12,
        marginRight: 8,
        color: '#666',
    },
    hiddenRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        backgroundColor: '#fff',
        overflow: 'hidden',
    },
    actionButton: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 70, // Largeur de chaque bouton
        height:100,
    },
    editButton: {
        backgroundColor: '#4CAF50',
    },
    deleteButton: {
        backgroundColor: '#FF6B6B',
    },
});

export default RecipeCard;
