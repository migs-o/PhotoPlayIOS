import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { View, TouchableOpacity, Text, StyleSheet, Alert, ImageBackground, Image } from 'react-native';

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
    <ImageBackground 
      source={require('../assets/select.png')} 
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.galleryButton]} 
            onPress={pickFromGallery}
          >
            <Text style={styles.buttonText}>Choose from Gallery</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.cameraButton]} 
            onPress={takePhoto}
          >
            <Text style={styles.buttonText}>Take Photo</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    width: '80%',
    maxWidth: 300,
  },
  button: {
    padding: 18,
    borderRadius: 30,
    marginBottom: 20,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  galleryButton: {
    backgroundColor: '#FF6B6B',
  },
  cameraButton: {
    backgroundColor: '#4ECDC4',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});
