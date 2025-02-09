import React from 'react';
import {View, Text, Image, StyleSheet, TouchableOpacity, Alert} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {SwipeRow} from 'react-native-swipe-list-view';
import {CATEGORIES, COLORS} from "../styles/theme";

const RecipeCard = ({recipe, onPress, onEdit, onDelete}) => {

    const confirmDelete = () => {
        Alert.alert(
            "Supprimer la recette",
            "Êtes-vous sûr de vouloir supprimer cette recette ?",
            [
                { text: "Annuler", style: "cancel" },
                { text: "Supprimer", onPress: () => onDelete(recipe.id), style: "destructive" }
            ]
        );
    };

    return (
        <SwipeRow rightOpenValue={-160}>
            {/* Action Buttons */}
            <View style={styles.hiddenRow}>
                <TouchableOpacity style={[styles.actionButton, styles.editButton]} onPress={() => onEdit(recipe)}>
                    <Icon name="edit" size={24} color="white"/>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionButton, styles.deleteButton]}
                                  onPress={() => confirmDelete()}>
                    <Icon name="delete" size={24} color="white"/>
                </TouchableOpacity>
            </View>

            {/* Recipe Card */}
            <TouchableOpacity activeOpacity={1} onPress={onPress} style={styles.card}>
                <View style={styles.imageContainer}>
                    <Image
                        source={recipe.image ? {uri: recipe.image} : require('../assets/icon.png')}
                        style={styles.image}
                    />
                </View>
                <View style={styles.content}>
                    {/*recipe.category?.length > 0 && (
                        <View style={styles.categoryBadge}>
                            {
                                recipe.category
                                    .map(categorie => CATEGORIES.find(cat => cat.id === categorie)?.icon)
                                    .filter(Boolean)
                                    .map((icon, index) => (
                                        <Text key={index} style={styles.categoryIcon}>{icon}</Text>
                                    ))
                            }
                        </View>
                    )*/}
                    <Text style={styles.title}>
                        {recipe.name}
                    </Text>
                    <View style={styles.macros}>
                        {recipe.macros && recipe.macros.calories && (
                            <View style={styles.macroBox}>
                                <Text style={styles.macroText}>🔥 {recipe.macros.calories} kcal</Text>
                            </View>
                        )}
                        {recipe.macros && recipe.macros.protein && (
                            <View style={styles.macroBox}>
                                <Text style={styles.macroText}>🥩 {recipe.macros.protein}g</Text>
                            </View>
                        )}
                        {recipe.macros && recipe.macros.fat && (
                            <View style={styles.macroBox}>
                                <Text style={styles.macroText}>🥑 {recipe.macros.fat}g</Text>
                            </View>
                        )}
                        {recipe.macros && recipe.macros.carbs && (
                            <View style={styles.macroBox}>
                                <Text style={styles.macroText}>🍚 {recipe.macros.carbs}g</Text>
                            </View>
                        )}
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
        paddingVertical: 12,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 6},
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
        flexDirection: 'row',
        overflow: 'hidden',
    },
    imageContainer: {
        position: 'relative',
    },
    categoryBadge: {
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        paddingVertical: 4,
        paddingHorizontal: 8,
        flexDirection: 'row',
        alignSelf: 'flex-start',
    },
    categoryIcon: {
        fontSize: 14,
        color: 'white',
        marginRight: 4,
    },
    image: {
        width: 150,
        height: 100,
        marginRight: 16,
        borderRadius: 8
    },
    content: {
        flex: 1,
        justifyContent: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#333',
    },
    macros: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    macroBox: {
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        paddingVertical: 4,
        paddingHorizontal: 8,
        marginRight: 8,
        marginBottom: 4,
    },
    macroText: {
        fontSize: 12,
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
        width: 70,
        height: 100,
    },
    editButton: {
        backgroundColor: COLORS.accent
    },
    deleteButton: {
        backgroundColor: COLORS.error
    },
});

export default RecipeCard;
