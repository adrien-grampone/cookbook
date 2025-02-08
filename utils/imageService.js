// utils/imageService.js
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const IMAGE_STORAGE_KEY = '@recipe_images';

export const ImageService = {
    async pickImage(options = {}) {
        try {
            const result = await launchImageLibrary({
                mediaType: 'photo',
                quality: 0.8,
                maxWidth: 1200,
                maxHeight: 1200,
                ...options,
            });

            if (result.didCancel) {
                return null;
            }

            if (result.errorCode) {
                throw new Error(`Image picker error: ${result.errorMessage}`);
            }

            if (result.assets?.[0]) {
                const image = result.assets[0];
                await this.saveImageMetadata(image);
                return image.uri;
            }

            return null;
        } catch (error) {
            console.error('Error picking image:', error);
            return null;
        }
    },

    async takePhoto(options = {}) {
        try {
            const result = await launchCamera({
                mediaType: 'photo',
                quality: 0.8,
                maxWidth: 1200,
                maxHeight: 1200,
                ...options,
            });

            if (result.didCancel) {
                return null;
            }

            if (result.errorCode) {
                throw new Error(`Camera error: ${result.errorMessage}`);
            }

            if (result.assets?.[0]) {
                const image = result.assets[0];
                await this.saveImageMetadata(image);
                return image.uri;
            }

            return null;
        } catch (error) {
            console.error('Error taking photo:', error);
            return null;
        }
    },

    async saveImageMetadata(image) {
        try {
            const existingMetadata = await this.getImageMetadata();
            existingMetadata[image.uri] = {
                fileName: image.fileName,
                type: image.type,
                timestamp: Date.now(),
            };
            await AsyncStorage.setItem(IMAGE_STORAGE_KEY, JSON.stringify(existingMetadata));
        } catch (error) {
            console.error('Error saving image metadata:', error);
        }
    },

    async getImageMetadata() {
        try {
            const metadata = await AsyncStorage.getItem(IMAGE_STORAGE_KEY);
            return metadata ? JSON.parse(metadata) : {};
        } catch (error) {
            console.error('Error getting image metadata:', error);
            return {};
        }
    },

    async deleteUnusedImages(usedImageUris) {
        try {
            const metadata = await this.getImageMetadata();
            const newMetadata = {};

            Object.entries(metadata).forEach(([uri, data]) => {
                if (usedImageUris.includes(uri)) {
                    newMetadata[uri] = data;
                }
            });

            await AsyncStorage.setItem(IMAGE_STORAGE_KEY, JSON.stringify(newMetadata));
        } catch (error) {
            console.error('Error cleaning up images:', error);
        }
    },
};