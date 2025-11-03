import { GestureHandlerRootView } from 'react-native-gesture-handler';
import React, { useState, useEffect, useRef } from 'react';
import SplashScreen from 'react-native-splash-screen';
import {
  View,
  StyleSheet,
  Image,
  Text,
  TouchableOpacity,
  ActionSheetIOS,
  Animated,
} from 'react-native';
import PhotoPicker from './components/PhotoPicker';
import PuzzleBoard from './components/PuzzleBoard';

export default function App() {
  useEffect(() => {
    // First, prevent the splash screen from auto-hiding
    SplashScreen.hide();
    
    // Then show it again and keep it visible for 2 seconds
    const showSplash = async () => {
      await SplashScreen.show();
      
      // Hide after 2 seconds
      setTimeout(() => {
        SplashScreen.hide();
      }, 2000);
    };
    
    showSplash();
    
    // Cleanup
    return () => {
      SplashScreen.hide();
    };
  }, []);
  const [photo, setPhoto] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gridSize, setGridSize] = useState(null);
  const [shuffleKey, setShuffleKey] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current; // 👈 fade animation control

  // Called when a photo is picked or taken
  const handlePhotoPicked = (uri) => {
    setPhoto(uri);
    setGridSize(null);
    setGameStarted(false);

    // Show grid size picker
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: ['Cancel', '3 × 3', '4 × 4', '5 × 5'],
        cancelButtonIndex: 0,
      },
      (buttonIndex) => {
        if (buttonIndex === 1) setGridSize(3);
        else if (buttonIndex === 2) setGridSize(4);
        else if (buttonIndex === 3) setGridSize(5);

        if (buttonIndex !== 0) setGameStarted(true);
      }
    );
  };

  const handleChangeGridSize = () => {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: ['Cancel', '3 × 3', '4 × 4', '5 × 5'],
        cancelButtonIndex: 0,
      },
      (buttonIndex) => {
        if (buttonIndex === 1) setGridSize(3);
        else if (buttonIndex === 2) setGridSize(4);
        else if (buttonIndex === 3) setGridSize(5);

        if (buttonIndex !== 0) setGameStarted(true);
      }
    );
  };

  const handleRetry = () => {
    setGameStarted(false);
    setTimeout(() => setGameStarted(true), 50);
  };

  const handleReshuffle = () => {
    // Fade out → reshuffle → fade in
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
        delay: 100,
      }),
    ]).start();

    setTimeout(() => {
      setShuffleKey((prev) => prev + 1);
    }, 200);
  };

  if (!photo) {
    // Step 1: pick photo (gallery or camera)
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={styles.container}>
          <PhotoPicker setPhoto={handlePhotoPicked} />
        </View>
      </GestureHandlerRootView>
    );
  }

  if (!gameStarted) {
    // Step 2: preview photo with options
    return (
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#000' }}>
        <View style={styles.previewContainer}>
          <View style={styles.imageContainer}>
            <Image 
              source={{ uri: photo }} 
              style={styles.image} 
              resizeMode="contain" 
            />
          </View>
          <View style={styles.buttons}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                setPhoto(null);
                setGridSize(null);
                setGameStarted(false);
              }}
            >
              <Text style={styles.buttonText}>Pick Another Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={handleChangeGridSize}>
              <Text style={styles.buttonText}>Change Grid Size</Text>
            </TouchableOpacity>
          </View>
        </View>
      </GestureHandlerRootView>
    );
  }

  // Step 3: puzzle screen
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
          <PuzzleBoard
            key={`${photo}-${gridSize}-${shuffleKey}`} // 👈 key forces reshuffle
            photo={photo}
            gridSize={gridSize}
            onPuzzleComplete={{
              retry: handleRetry,
              changeGrid: handleChangeGridSize,
              newPhoto: () => setPhoto(null),
            }}
          />
        </Animated.View>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  previewContainer: {
    flex: 1,
    backgroundColor: '#000',
    padding: 20,
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  image: {
    width: '100%',
    height: '100%',
    maxHeight: '70%',
  },
  image: {
    width: '90%',
    height: '70%',
    borderRadius: 10,
    marginBottom: 20,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 20,
    marginTop: 'auto',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    minWidth: 150,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
