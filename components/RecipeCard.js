import React from 'react';
import {View, Text, ImageBackground, StyleSheet, TouchableOpacity, Alert} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {SwipeRow} from 'react-native-swipe-list-view';
import {CATEGORIES, COLORS} from "../styles/theme";
import CategoryDisplay from "./CategoryDisplay";

const RecipeCard = ({recipe, onPress, onEdit, onDelete}) => {

    const confirmDelete = () => {
        Alert.alert(
            "Supprimer la recette",
            "Êtes-vous sûr de vouloir supprimer cette recette ?",
            [
                {text: "Annuler", style: "cancel"},
                {text: "Supprimer", onPress: () => onDelete(recipe.id), style: "destructive"}
            ]
        );
    };

    {
        /* <SwipeRow rightOpenValue={-140} style={styles.card}>
            <View style={styles.hiddenRow}>
                <TouchableOpacity style={[styles.actionButton, styles.editButton]} onPress={() => onEdit(recipe)}>
                    <Icon name="edit" size={24} color="white"/>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={confirmDelete}>
                    <Icon name="delete" size={24} color="white"/>
                </TouchableOpacity>
            </View>
            <TouchableOpacity activeOpacity={0.85} onPress={onPress} >
                <ImageBackground
                    source={recipe.image ? {uri: recipe.image} : require('../assets/icon.png')}
                    style={styles.imageBackground}
                    imageStyle={styles.image}
                >
                </ImageBackground>

                <View style={styles.content}>
                    <Text style={styles.title} numberOfLines={2}>{recipe.name}</Text>
                    {recipe.macros && (
                        <View style={styles.macros}>
                            {recipe.macros.calories &&
                                <Text style={styles.macroBadge}>🔥 {recipe.macros.calories} kcal</Text>}
                            {recipe.macros.protein && <Text style={styles.macroBadge}>🥩 {recipe.macros.protein}g</Text>}
                            {recipe.macros.fat && <Text style={styles.macroBadge}>🥑 {recipe.macros.fat}g</Text>}
                            {recipe.macros.carbs && <Text style={styles.macroBadge}>🍚 {recipe.macros.carbs}g</Text>}
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        </SwipeRow>*/
    }

    return (

        <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={styles.card}>
            <ImageBackground
                source={recipe.image ? {uri: recipe.image} : require('../assets/recipe-default.jpg')}
                style={styles.imageBackground}
                imageStyle={styles.image}
            >
                {recipe.category?.length > 0 && (
                    <CategoryDisplay recipe={recipe}/>
                )}
            </ImageBackground>

            <View style={styles.content}>
                <Text style={styles.title}>{recipe.name}</Text>
                {recipe.macros && (recipe.macros.calories || recipe.macros.protein || recipe.macros.fat || recipe.macros.carbs) && (
                    <View style={styles.macros}>
                        {recipe.macros.calories && <Text style={styles.macroBadge}>🔥 {recipe.macros.calories} kcal</Text>}
                        {recipe.macros.protein && <Text style={styles.macroBadge}>🥩 {recipe.macros.protein}g</Text>}
                        {recipe.macros.fat && <Text style={styles.macroBadge}>🥑 {recipe.macros.fat}g</Text>}
                        {recipe.macros.carbs && <Text style={styles.macroBadge}>🍚 {recipe.macros.carbs}g</Text>}
                    </View>
                )}

            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        marginVertical: 10,
        marginHorizontal: 5,
        borderRadius: 20,
        backgroundColor: COLORS.card,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 6},
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 6,
    },
    imageBackground: {
        height: 180,
        width: '100%',
        justifyContent: 'center',
    },
    image: {
        width: '100%',
        height: '100%',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20
    },
    hiddenRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        backgroundColor: '#fff',
        height: "100%",
    },
    actionButton: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 70,
        height: '100%',
    },
    editButton: {
        backgroundColor: COLORS.accent,
    },
    deleteButton: {
        backgroundColor: COLORS.error,
    },
    content: {
        padding: 12,
        backgroundColor: "fff",
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text,
        textAlign: 'center',
    },
    macros: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 6,
        marginTop:10
    },
    macroBadge: {
        backgroundColor: 'rgba(0,0,0,0.05)',
        color: COLORS.text,
        fontSize: 12,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 14,
    },
    categoryBadge: {
        flexDirection: 'row',
        alignSelf: 'flex-start',
        position:'absolute',
        left: 10,
        top:-10
    },
    categoryChip: {
        backgroundColor: COLORS.surface,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginRight: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    categoryLabel: {
        color: '#000',
        fontSize: 14,
        fontWeight: '500',
    },
});

export default RecipeCard;