import React, {useState, useRef, useEffect} from 'react';
import {
    View,
    Text,
    ImageBackground,
    StyleSheet,
    TouchableOpacity,
    Alert,
    Modal,
    Share,
    Vibration,
    Platform,
    Animated,
    TouchableWithoutFeedback
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {COLORS, TYPOGRAPHY, SPACING, RADIUS} from "../styles/theme";
import {useRecipes} from "../context/RecipeContext";
import CategoryDisplay from "./CategoryDisplay";
import ActionModal from "./ActionModal";

const RecipeCard = ({recipe, onPress, onEdit, onDelete}) => {
    const {handleDuplicateRecipe} = useRecipes();
    const [showActionModal, setShowActionModal] = useState(false);
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const backgroundAnim = useRef(new Animated.Value(0)).current;
    const modalAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (showActionModal) {
            Animated.timing(backgroundAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();
            Animated.spring(modalAnim, {
                toValue: 1,
                useNativeDriver: true,
                speed: 20,
                bounciness: 2,
            }).start();
        } else {
            Animated.timing(backgroundAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start();
            Animated.spring(modalAnim, {
                toValue: 0,
                useNativeDriver: true,
                speed: 20,
                bounciness: 2,
            }).start();
        }
    }, [showActionModal]);

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
                {text: "Annuler", style: "cancel"},
                {text: "Supprimer", onPress: () => onDelete(recipe.id), style: "destructive"}
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

    /* const ActionModal = () => (
         <Modal
             animationType="none"
             transparent={true}
             visible={showActionModal}
             onRequestClose={() => {
                 setShowActionModal(false);
                 endLongPressAnimation();
             }}
         >
             <TouchableWithoutFeedback onPress={() => setShowActionModal(false)}>
                 <Animated.View style={[styles.modalOverlay, {opacity: backgroundAnim}]}>
                     <Animated.View style={[styles.modalContent, {transform: [{translateY: modalAnim.interpolate({
                                 inputRange: [0, 1],
                                 outputRange: [300, 0]
                             })}]}]}>
                         <View style={styles.modalHeader}>
                             <Text style={styles.modalTitle}>{recipe.name.split(' ').slice(0, 4).join(' ')}</Text>
                             <TouchableOpacity
                                 style={styles.modalCloseButton}
                                 onPress={() => setShowActionModal(false)}
                             >
                                 <Icon name="close" size={24} color={COLORS.text}/>
                             </TouchableOpacity>
                         </View>
                         <View style={styles.modalContent}>
                             <TouchableOpacity
                                 style={styles.actionButton}
                                 onPress={() => {
                                     handleDuplicateRecipe(recipe);
                                     setShowActionModal(false);
                                 }}
                             >
                                 <Icon name="content-copy" size={22} color="#000"/>
                                 <Text style={styles.actionText}>Dupliquer</Text>
                             </TouchableOpacity>

                             <TouchableOpacity
                                 style={styles.actionButton}
                                 onPress={handleShare}
                             >
                                 <Icon name="share" size={22} color="#000"/>
                                 <Text style={styles.actionText}>Partager</Text>
                             </TouchableOpacity>

                             <TouchableOpacity
                                 style={{...styles.actionButton, borderBottomWidth: 0}}
                                 onPress={confirmDelete}
                             >
                                 <Icon name="delete" size={22} color="#FF453A"/>
                                 <Text style={styles.deleteText}>Supprimer</Text>
                             </TouchableOpacity>
                         </View>
                     </Animated.View>
                 </Animated.View>
             </TouchableWithoutFeedback>
         </Modal>
     );*/

    return (
        <>
            <Animated.View style={{transform: [{scale: scaleAnim}]}}>
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={onPress}
                    onPressIn={() => {
                    }}
                    onPressOut={endLongPressAnimation}
                    onLongPress={() => {
                        startLongPressAnimation();
                        setShowActionModal(true);
                    }}
                    delayLongPress={300}
                    style={styles.card}
                >
                    <ImageBackground
                        source={recipe.image ? {uri: recipe.image} : require('../assets/recipe-default.jpg')}
                        style={styles.imageBackground}
                        imageStyle={styles.image}
                    >
                        {recipe.category?.length > 0 && (
                            <CategoryDisplay recipe={recipe}/>
                        )}

                        <TouchableOpacity
                            activeOpacity={1}
                            style={styles.actionIcon}
                            onPress={() => setShowActionModal(true)}
                        >
                            <Icon name="more-vert" size={22} color="#000"/>
                        </TouchableOpacity>
                    </ImageBackground>

                    <View style={styles.content}>

                        {recipe.prepTime && recipe.prepTime > 0 && (
                            <View style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                                <Text style={styles.macroBadge}>🕒 {recipe.prepTime} min</Text>
                            </View>
                        )}
                        <Text style={styles.title}>{recipe.name}</Text>
                        {recipe.macros && (recipe.macros.calories || recipe.macros.protein || recipe.macros.fat || recipe.macros.carbs) && (
                            <View style={styles.macros}>
                                {recipe.macros.calories &&
                                    <Text style={styles.macroBadge}>🔥 {recipe.macros.calories} kcal</Text>}
                                {recipe.macros.protein &&
                                    <Text style={styles.macroBadge}>🥩 {recipe.macros.protein}g</Text>}
                                {recipe.macros.fat && <Text style={styles.macroBadge}>🥑 {recipe.macros.fat}g</Text>}
                                {recipe.macros.carbs && <Text style={styles.macroBadge}>🍚 {recipe.macros.carbs}g</Text>}
                            </View>
                        )}
                    </View>
                </TouchableOpacity>
            </Animated.View>

            <ActionModal
                visible={showActionModal}
                onClose={() => setShowActionModal(false)}
                title={recipe.name.split(' ').slice(0, 4).join(' ')}
                actions={[
                    {
                        label: 'Dupliquer', icon: 'content-copy', onPress: () => {
                            setShowActionModal(false);
                            handleDuplicateRecipe(recipe);
                        }
                    },
                    {label: 'Partager', icon: 'share', onPress: handleShare},
                    {label: 'Supprimer', icon: 'delete', color: '#FF453A', onPress: confirmDelete},
                ]}
            />
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
        borderTopRightRadius: 20,
    },
    actionIcon: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: COLORS.surface,
        borderRadius: 20,
        padding: 5,
    },
    content: {
        padding: 12,
        backgroundColor: "#fff",
        borderBottomEndRadius: 20,
        borderBottomStartRadius: 20,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text,
        textAlign: 'center',
        marginTop: 10,
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
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: COLORS.background,
        borderTopLeftRadius: RADIUS.lg,
        borderTopRightRadius: RADIUS.lg,
        maxHeight: '70%',
        paddingBottom: 10,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    modalTitle: {
        ...TYPOGRAPHY.h2,
        color: COLORS.text,
    },
    modalCloseButton: {
        padding: SPACING.sm,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        color: COLORS.text,
        gap: 12,
        padding: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    actionText: {
        ...TYPOGRAPHY.body,
        color: COLORS.text,
    },
    deleteText: {
        fontSize: 17,
        color: '#FF453A',
        fontWeight: '500',
    },
    metadata: {
        position: 'absolute',
        bottom: 10,
        left: 10,
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 8,
        justifyContent: 'center',
    },
    metadataText: {
        backgroundColor: COLORS.surface,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
        width: 'auto',
    },
});

export default RecipeCard;