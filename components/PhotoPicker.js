import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { View, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';

export default function PhotoPicker({ setPhoto }) {
  const pickFromGallery = () => {
    launchImageLibrary(
      { mediaType: 'photo', quality: 1 },
      response => {
        if (response.didCancel) return;
        if (response.errorCode) {
          Alert.alert('Image picker error', response.errorMessage);
          return;
        }
        if (response.assets && response.assets.length > 0) {
          setPhoto(response.assets[0].uri);
        }
      }
    );
  };

  const takePhoto = () => {
    launchCamera(
      { mediaType: 'photo', quality: 1 },
      response => {
        if (response.didCancel) return;
        if (response.errorCode) {
          Alert.alert('Camera error', response.errorMessage);
          return;
        }
        if (response.assets && response.assets.length > 0) {
          setPhoto(response.assets[0].uri);
        }
      }
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={pickFromGallery}>
        <Text style={styles.buttonText}>Choose from Gallery</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={takePhoto}>
        <Text style={styles.buttonText}>Take Photo</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    padding: 20,
    gap: 20, // spacing between buttons
  },
  button: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: 20,
    borderRadius: 10,
    marginVertical: 12,
    width: '100%',
    maxWidth: 300,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});
