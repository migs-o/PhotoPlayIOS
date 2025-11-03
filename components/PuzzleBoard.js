import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  ImageBackground,
  Image,
  StyleSheet,
  Dimensions,
  PanResponder,
  Animated,
  Alert,
  Text,
  TouchableOpacity,
} from 'react-native';
import Sound from 'react-native-sound';
import backgroundImg from '../assets/bg1.png';

// Initialize snap sound
const snapSound = new Sound('snap.wav', Sound.MAIN_BUNDLE, (error) => {
  if (error) console.log('Failed to load sound', error);
});

// Scoring constants
const PUZZLE_MAX_SIZE = 400;
const BASE_POINTS = 1000;
const MOVE_PENALTY = 10;
const TIME_PENALTY = 2;

export default function PuzzleBoard({ photo, gridSize = 3, onPuzzleComplete }) {
  const GRID_SIZE = gridSize;
  const PUZZLE_SIZE = Math.min(Dimensions.get('window').width * 0.9, PUZZLE_MAX_SIZE);
  const TILE_SIZE = PUZZLE_SIZE / GRID_SIZE;

  const [tiles, setTiles] = useState([]);
  const [draggingId, setDraggingId] = useState(null);
  const [moveCount, setMoveCount] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [score, setScore] = useState(BASE_POINTS);
  const [puzzleCompleted, setPuzzleCompleted] = useState(false);

  const timerRef = useRef(null);
  const moveCountRef = useRef(0);
  const secondsRef = useRef(0);
  const tilesRef = useRef([]);

  // Keep tilesRef in sync
  useEffect(() => {
    tilesRef.current = tiles;
  }, [tiles]);

  // Timer
  useEffect(() => {
    if (tiles.length === 0) return;

    setSeconds(0);
    secondsRef.current = 0;
    clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setSeconds((prev) => {
        const newSeconds = prev + 1;
        secondsRef.current = newSeconds;
        updateScore(moveCountRef.current, newSeconds);
        return newSeconds;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [tiles]);

  // Initialize tiles
  useEffect(() => {
    createTiles();
  }, [photo, GRID_SIZE]);

  const createTiles = () => {
    setPuzzleCompleted(false);

    const newTiles = [];
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        newTiles.push({
          id: `${row}-${col}`,
          correctRow: row,
          correctCol: col,
          row,
          col,
        });
      }
    }

    // Shuffle positions
    const shuffledPositions = shuffleArrayMultiple(
      newTiles.map((t) => ({ row: t.row, col: t.col })),
      3
    );

    const shuffledTiles = newTiles.map((tile, index) => {
      const { row, col } = shuffledPositions[index];
      return {
        ...tile,
        row,
        col,
      };
    });

    setTiles(shuffledTiles);
    tilesRef.current = shuffledTiles;
    setMoveCount(0);
    moveCountRef.current = 0;
    setSeconds(0);
    secondsRef.current = 0;
    setScore(BASE_POINTS);
  };

  const incrementMove = () => {
    setMoveCount((prev) => {
      const newMoves = prev + 1;
      moveCountRef.current = newMoves;
      updateScore(newMoves, secondsRef.current);
      return newMoves;
    });
  };

  const updateScore = (moves, seconds) => {
    let newScore = BASE_POINTS - MOVE_PENALTY * moves - TIME_PENALTY * seconds;
    if (newScore < 0) newScore = 0;
    setScore(newScore);
  };

  const playSnapSound = () => {
    snapSound.stop(() => {
      snapSound.play((success) => {
        if (!success) console.log('Sound playback failed');
      });
    });
  };

  const checkCompletion = (updatedTiles) => {
    const allCorrect = updatedTiles.every(
      (t) => t.row === t.correctRow && t.col === t.correctCol
    );
    if (allCorrect && !puzzleCompleted) {
      clearInterval(timerRef.current);
      setPuzzleCompleted(true);

      const finalScore = Math.max(
        BASE_POINTS - MOVE_PENALTY * moveCountRef.current - TIME_PENALTY * secondsRef.current,
        0
      );

      setTimeout(() => {
        Alert.alert(
          '🎉 Puzzle solved!',
          `Great job!\nMoves: ${moveCountRef.current}\nTime: ${secondsRef.current}s\nScore: ${finalScore}`
        );
      }, 300);
    }
  };

  const swapTiles = (tileId1, tileId2) => {
    setTiles(prevTiles => {
      const tile1Index = prevTiles.findIndex(t => t.id === tileId1);
      const tile2Index = prevTiles.findIndex(t => t.id === tileId2);

      if (tile1Index === -1 || tile2Index === -1) return prevTiles;

      const newTiles = [...prevTiles];
      const tile1 = newTiles[tile1Index];
      const tile2 = newTiles[tile2Index];

      // Swap their grid positions
      const tempRow = tile1.row;
      const tempCol = tile1.col;
      
      newTiles[tile1Index] = { ...tile1, row: tile2.row, col: tile2.col };
      newTiles[tile2Index] = { ...tile2, row: tempRow, col: tempCol };

      playSnapSound();
      incrementMove();
      checkCompletion(newTiles);
      
      return newTiles;
    });
  };

  return (
    <ImageBackground source={backgroundImg} style={styles.background} resizeMode="cover">
      <View style={styles.overlay}>
        <Text style={styles.scoreText}>
          Moves: {moveCount} | Time: {seconds}s | Score: {score}
        </Text>

        <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
          <View style={[styles.board, { width: PUZZLE_SIZE, height: PUZZLE_SIZE }]}>
            {tiles.map((tile) => (
              <DraggableTile
                key={tile.id}
                tile={tile}
                tilesRef={tilesRef}
                image={photo}
                setDraggingId={setDraggingId}
                isDragging={tile.id === draggingId}
                TILE_SIZE={TILE_SIZE}
                GRID_SIZE={GRID_SIZE}
                puzzleCompleted={puzzleCompleted}
                swapTiles={swapTiles}
              />
            ))}
          </View>
        </View>

        <View style={styles.buttonRow}>
          <GameButton label="🔄 Shuffle" onPress={createTiles} />
          <GameButton label="📸 New Photo" onPress={onPuzzleComplete.newPhoto} />
          <GameButton label="🔢 Grid" onPress={onPuzzleComplete.changeGrid} />
        </View>
      </View>
    </ImageBackground>
  );
}

function DraggableTile({
  tile,
  tilesRef,
  image,
  setDraggingId,
  isDragging,
  TILE_SIZE,
  GRID_SIZE,
  puzzleCompleted,
  swapTiles,
}) {
  const pan = useRef(new Animated.ValueXY()).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !puzzleCompleted,
      onPanResponderGrant: () => {
        setDraggingId(tile.id);
      },
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: () => {
        const draggedX = pan.x._value;
        const draggedY = pan.y._value;
        
        setDraggingId(null);

        // Get current tiles from ref
        const currentTiles = tilesRef.current;
        const currentTile = currentTiles.find(t => t.id === tile.id);
        
        if (!currentTile) {
          // Reset if we can't find the tile
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
          }).start();
          return;
        }

        // Calculate the center point of where the dragged tile ended up
        const tileCenterX = currentTile.col * TILE_SIZE + TILE_SIZE / 2 + draggedX;
        const tileCenterY = currentTile.row * TILE_SIZE + TILE_SIZE / 2 + draggedY;
        
        // Which grid cell is the center in?
        const targetCol = Math.floor(tileCenterX / TILE_SIZE);
        const targetRow = Math.floor(tileCenterY / TILE_SIZE);

        // Clamp to grid
        const clampedCol = Math.max(0, Math.min(GRID_SIZE - 1, targetCol));
        const clampedRow = Math.max(0, Math.min(GRID_SIZE - 1, targetRow));

        // Only swap if we moved to a different position
        if (clampedRow !== currentTile.row || clampedCol !== currentTile.col) {
          // Find tile at target position using current tiles
          const targetTile = currentTiles.find(
            t => t.row === clampedRow && t.col === clampedCol
          );

          if (targetTile) {
            // Swap with target tile
            swapTiles(tile.id, targetTile.id);
          }
        }

        // Reset position animation
        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
          friction: 8,
          tension: 40,
        }).start();
      },
    })
  ).current;

  const animatedStyle = {
    transform: [
      { translateX: pan.x },
      { translateY: pan.y },
    ],
  };

  const tileStyle = {
    position: 'absolute',
    left: tile.col * TILE_SIZE,
    top: tile.row * TILE_SIZE,
    width: TILE_SIZE,
    height: TILE_SIZE,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#fff',
    borderRadius: 4,
    zIndex: isDragging ? 1000 : 1,
    elevation: isDragging ? 1000 : 1,
  };

  return (
    <Animated.View style={[tileStyle, animatedStyle]} {...panResponder.panHandlers}>
      <Image
        source={{ uri: image }}
        style={{
          width: TILE_SIZE * GRID_SIZE,
          height: TILE_SIZE * GRID_SIZE,
          transform: [
            { translateX: -tile.correctCol * TILE_SIZE },
            { translateY: -tile.correctRow * TILE_SIZE },
          ],
        }}
      />
    </Animated.View>
  );
}

function GameButton({ label, onPress }) {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.buttonText}>{label}</Text>
    </TouchableOpacity>
  );
}

function shuffleArrayMultiple(array, times) {
  let arr = [...array];
  for (let k = 0; k < times; k++) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }
  return arr;
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 24,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  board: {
    position: 'relative',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 8,
    marginTop: 10,
  },
  scoreText: {
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 10,
  },
  button: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  buttonText: {
    color: '#222',
    fontWeight: '600',
    fontSize: 14,
  },
});