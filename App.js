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
  ImageBackground,
} from 'react-native';
import PhotoPicker from './components/PhotoPicker';
import PuzzleBoard from './components/PuzzleBoard';

function TitleScreen({ onPlay }) {
  return (
    <View style={styles.titleContainer}>
      <Image 
        source={require('./assets/title.png')} 
        style={styles.titleImage}
        resizeMode="contain"
      />
      <TouchableOpacity 
        style={styles.playButton}
        onPress={onPlay}
      >
        <Text style={styles.playButtonText}>PLAY</Text>
      </TouchableOpacity>
    </View>
  );
}

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
  const [showTitle, setShowTitle] = useState(true);
  const [photo, setPhoto] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gridSize, setGridSize] = useState(null);
  const [shuffleKey, setShuffleKey] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const handlePlay = () => {
    setShowTitle(false);
  };

  // Called when a photo is picked or taken
  const handlePhotoPicked = (uri) => {
    setPhoto(uri);
    setGridSize(null);
    setGameStarted(false);
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
    if (showTitle) {
      return <TitleScreen onPlay={handlePlay} />;
    }

    // Step 1: pick photo (gallery or camera)
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={styles.container}>
          <PhotoPicker setPhoto={handlePhotoPicked} />
        </View>
      </GestureHandlerRootView>
    );
  }

  if (photo && !gameStarted) {
    return (
      <ImageBackground 
        source={require('./assets/choosegrid.png')} 
        style={styles.previewBackground}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          <View style={styles.previewContainer}>
            <View style={styles.previewImageContainer}>
              <Image
                source={{ uri: photo }}
                style={styles.previewImage}
                resizeMode="contain"
              />
              <Text style={styles.chooseDifficultyText}>Choose Difficulty</Text>
              <View style={styles.difficultyButtons}>
                <TouchableOpacity
                  style={[styles.difficultyButton, styles.easyButton]}
                  onPress={() => {
                    setGridSize(3);
                    setGameStarted(true);
                  }}
                >
                  <Text style={styles.difficultyButtonText}>Easy (3×3)</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.difficultyButton, styles.mediumButton]}
                  onPress={() => {
                    setGridSize(4);
                    setGameStarted(true);
                  }}
                >
                  <Text style={styles.difficultyButtonText}>Medium (4×4)</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.difficultyButton, styles.hardButton]}
                  onPress={() => {
                    setGridSize(5);
                    setGameStarted(true);
                  }}
                >
                  <Text style={styles.difficultyButtonText}>Hard (5×5)</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </ImageBackground>
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
  titleContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  playButton: {
    position: 'absolute',
    bottom: 100,
    backgroundColor: '#FFD700',
    paddingHorizontal: 50,
    paddingVertical: 15,
    borderRadius: 30,
  },
  playButtonText: {
    color: '#000',
    fontSize: 24,
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  previewBackground: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 20,
  },
  previewContainer: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: 15,
    padding: 20,
    flex: 1,
    justifyContent: 'space-between',
  },
  previewImageContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: '100%',
    paddingTop: 40, // Add some padding at the top
  },
  chooseDifficultyText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 20,
    textAlign: 'center',
  },
  difficultyButtons: {
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 20, // Add margin to push buttons up
  },
  difficultyButton: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: 'center',
    width: '100%',
  },
  easyButton: {
    backgroundColor: '#4CAF50',
  },
  mediumButton: {
    backgroundColor: '#FFC107',
  },
  hardButton: {
    backgroundColor: '#F44336',
  },
  difficultyButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  previewImage: {
    width: '100%',
    height: '50%', // Reduce image height
    maxHeight: 300, // Add max height
    borderRadius: 10,
    marginBottom: 20, // Add some space below the image
  },
  previewButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
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
