import {StyleSheet, Text, TouchableOpacity} from "react-native";
import {COLORS} from "../styles/theme";
import React from "react";

export const CategoryChip = ({ category, isSelected, onPress }) => (
    <TouchableOpacity
        onPress={onPress}
        style={[
            styles.categoryChip,
            isSelected && { backgroundColor: COLORS.primary }
        ]}
    >
        <Text style={[
            styles.categoryLabel,
            isSelected && { color: COLORS.card}
        ]}>
            {category.icon} {category.label}
        </Text>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
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