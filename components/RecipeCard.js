import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    ImageBackground,
    StyleSheet,
    TouchableOpacity,
    Alert,
    Modal,
    Pressable,
    Share,
    Vibration,
    Platform,
    Animated
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from "../styles/theme";
import { StorageService } from '../utils/storage';
import CategoryDisplay from "./CategoryDisplay";
import {useRecipes} from "../context/RecipeContext";

const RecipeCard = ({ recipe, onPress, onEdit, onDelete }) => {
    const {handleDuplicateRecipe} = useRecipes(); // Utilisation du contexte pour ajouter une recette
    const [showActionModal, setShowActionModal] = useState(false);
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const startLongPressAnimation = () => {
        Vibration.vibrate(Platform.OS === 'ios' ? 50 : 20);
        Animated.spring(scaleAnim, {
            toValue: 0.95,
            useNativeDriver: true,
            speed: 20,
            bounciness: 2
        }).start();
    };

    const endLongPressAnimation = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
            speed: 20,
            bounciness: 2
        }).start();
    };

    const confirmDelete = () => {
        setShowActionModal(false);
        Alert.alert(
            "Supprimer la recette",
            "Êtes-vous sûr de vouloir supprimer cette recette ?",
            [
                { text: "Annuler", style: "cancel" },
                { text: "Supprimer", onPress: () => onDelete(recipe.id), style: "destructive" }
            ]
        );
    };

    const handleShare = async () => {
        setShowActionModal(false);
        try {
            const shareMessage = `Découvre ma recette : ${recipe.name}${recipe.image ? `\nImage : ${recipe.image}` : ''}`;
            await Share.share({
                message: shareMessage,
                title: recipe.name,
            });
        } catch (error) {
            Alert.alert("Erreur", "Le partage a échoué.");
        }
    };

    const ActionModal = () => (
        <Modal
            animationType="fade"
            transparent={true}
            visible={showActionModal}
            onRequestClose={() => {
                setShowActionModal(false);
                endLongPressAnimation();
            }}
        >
            <Pressable
                style={styles.modalOverlay}
                onPress={() => {
                    setShowActionModal(false);
                    endLongPressAnimation();
                }}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => {
                                handleDuplicateRecipe(recipe);
                                setShowActionModal(false);
                            }}
                        >
                            <Icon name="content-copy" size={22} color="#FFF" />
                            <Text style={styles.actionText}>Dupliquer</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={handleShare}
                        >
                            <Icon name="share" size={22} color="#FFF" />
                            <Text style={styles.actionText}>Partager</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={confirmDelete}
                        >
                            <Icon name="delete" size={22} color="#FF453A" />
                            <Text style={styles.deleteText}>Supprimer</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Pressable>
        </Modal>
    );

    return (
        <>
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={onPress}
                    onPressIn={() => { }}
                    onPressOut={endLongPressAnimation}
                    onLongPress={() => {
                        startLongPressAnimation();
                        setShowActionModal(true);
                    }}
                    delayLongPress={300}
                    style={styles.card}
                >
                    <ImageBackground
                        source={recipe.image ? { uri: recipe.image } : require('../assets/recipe-default.jpg')}
                        style={styles.imageBackground}
                        imageStyle={styles.image}
                    >
                        {recipe.category?.length > 0 && (
                            <CategoryDisplay recipe={recipe} />
                        )}

                        {/* Bouton d'action en haut à droite */}
                        <TouchableOpacity
                            activeOpacity={1}
                            style={styles.actionIcon}
                            onPress={() => setShowActionModal(true)}
                        >
                            <Icon name="more-vert" size={26} color="#000" />
                        </TouchableOpacity>
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
            </Animated.View>

            <ActionModal />
        </>
    );
};

const styles = StyleSheet.create({
    card: {
        marginVertical: 10,
        marginHorizontal: 5,
        borderRadius: 20,
        backgroundColor: COLORS.card,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
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
        borderTopRightRadius: 20,
    },
    actionIcon: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: COLORS.surface,
        borderRadius: 20,
        padding: 6,
    },
    content: {
        padding: 12,
        backgroundColor: "#fff",
        borderBottomEndRadius:20,
        borderBottomStartRadius:20,
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
        marginTop: 10,
    },
    macroBadge: {
        backgroundColor: 'rgba(0,0,0,0.05)',
        color: COLORS.text,
        fontSize: 12,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 14,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    modalContainer: {
        backgroundColor: '#1C1C1E',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: Platform.OS === 'ios' ? 34 : 20,
        paddingHorizontal: 16,
        paddingTop: 8,
    },
    modalContent: {
        marginTop: 10,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        gap: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(255, 255, 255, 0.2)',
    },
    actionText: {
        fontSize: 17,
        color: '#FFF',
        fontWeight: '400',
    },
    deleteText: {
        fontSize: 17,
        color: '#FF453A',
        fontWeight: '500',
    },
});

export default RecipeCard;
