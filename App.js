import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, AccessibilityInfo } from 'react-native';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';

export default function App() {
  const [gameState, setGameState] = useState('MENU'); // MENU, LOBBY, PLAYING, GAMEOVER
  const [health, setHealth] = useState(100);
  const [playersLeft, setPlayersLeft] = useState(100);
  const [kills, setKills] = useState(0);
  const [log, setLog] = useState('Welcome to Audio Royale. Double tap Start Game to begin.');

  const soundObject = useRef(new Audio.Sound());

  useEffect(() => {
    speak(log);
  }, [log]);

  const speak = (text) => {
    Speech.stop();
    Speech.speak(text, { language: 'en', pitch: 1.0, rate: 0.9 });
  };

  const playBeep = async () => {
    try {
      await soundObject.current.unloadAsync();
      await soundObject.current.loadAsync(require('./assets/beep.mp3')); // Placeholder or generic sound URI can be injected
      await soundObject.current.playAsync();
    } catch (error) {
      // Fallback if local asset is missing during raw build testing
    }
  };

  const startGame = () => {
    setGameState('PLAYING');
    setHealth(100);
    setPlayersLeft(100);
    setKills(0);
    setLog('Match started. 100 players remaining. You have dropped into the arena. Find cover!');
    gameLoop();
  };

  const gameLoop = () => {
    const interval = setInterval(() => {
      setPlayersLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setGameState('GAMEOVER');
          setLog(`Victory Royale! You won the match with ${kills} kills!`);
          return 1;
        }
        
        // Random events
        const eventChance = Math.random();
        if (eventChance < 0.3) {
          // Combat event
          setHealth((h) => {
            const damage = Math.floor(Math.random() * 20) + 5;
            const newHealth = h - damage;
            if (newHealth <= 0) {
              clearInterval(interval);
              setGameState('GAMEOVER');
              setLog(`You were eliminated! Total kills: ${kills}. Double tap to return to menu.`);
              return 0;
            }
            setLog(`You are under attack! Took ${damage} damage. Health is now ${newHealth} percent.`);
            return newHealth;
          });
        } else if (eventChance < 0.6) {
          // Player elimination event
          const eliminated = Math.floor(Math.random() * 5) + 1;
          const remaining = Math.max(1, prev - eliminated);
          setLog(`${eliminated} players eliminated. ${remaining} players left.`);
          return remaining;
        }

        return prev;
      });
    }, 5000);
  };

  const attackButton = () => {
    playBeep();
    const killChance = Math.random();
    if (killChance > 0.4) {
      setKills((k) => k + 1);
      setPlayersLeft((p) => Math.max(1, p - 1));
      setLog(`Target eliminated! Nice shot. Total kills: ${kills + 1}.`);
    } else {
      setLog('You fired but missed your target!');
    }
  };

  return (
    <View style={styles.container}>
      <Text accessibilityLiveRegion="assertive" style={styles.logText}>{log}</Text>
      
      {gameState === 'MENU' && (
        <TouchableOpacity 
          style={styles.button} 
          onPress={startGame}
          accessibilityLabel="Start Game"
          accessibilityHint="Double tap to launch into the battle royale arena"
        >
          <Text style={styles.buttonText}>START GAME</Text>
        </TouchableOpacity>
      )}

      {gameState === 'PLAYING' && (
        <View style={styles.gameUi}>
          <Text accessibilityLabel={`Health: ${health} percent`}>HP: {health}</Text>
          <Text accessibilityLabel={`${playersLeft} players remaining`}>Alive: {playersLeft}</Text>
          <Text accessibilityLabel={`${kills} kills`}>Kills: {kills}</Text>
          
          <TouchableOpacity 
            style={styles.attackButton} 
            onPress={attackButton}
            accessibilityLabel="Fire Weapon"
            accessibilityHint="Double tap to shoot at nearby enemies"
          >
            <Text style={styles.buttonText}>FIRE WEAPON</Text>
          </TouchableOpacity>
        </View>
      )}

      {gameState === 'GAMEOVER' && (
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => setGameState('MENU')}
          accessibilityLabel="Return to main menu"
        >
          <Text style={styles.buttonText}>MAIN MENU</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  logText: {
    color: '#ffffff',
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#1e88e5',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 8,
  },
  attackButton: {
    backgroundColor: '#d32f2f',
    paddingVertical: 20,
    paddingHorizontal: 50,
    borderRadius: 8,
    marginTop: 30,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  gameUi: {
    alignItems: 'center',
  }
});
