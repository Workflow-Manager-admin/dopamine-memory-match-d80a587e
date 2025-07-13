import React, { useEffect, useState } from 'react';
import './App.css';

// CARD DATA: Use emojis for dopamine-rich, vibrant symbols
const CARD_IMAGES = ['🍊', '💎', '🌈', '🦄', '🎈', '⭐'];

const CARD_BACK_COLOR = "#f7b32b";
const CARD_FRONT_COLOR = "#ffffff";
const CARD_MATCH_GLOW = "0 0 16px 8px #6ccff6";
const CARD_FLIP_DURATION = 400; // ms

// Utility: Shuffle array (Fisher-Yates)
function shuffleArray(array) {
  const arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// PUBLIC_INTERFACE
function App() {
  // Choose 4 or 6 cards (random each time for replay value)
  const [cardCount, setCardCount] = useState(6); // 6 for richer dopamine, or do 4 for quick games
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]); // indexes of flipped cards (max 2)
  const [matched, setMatched] = useState([]); // indexes of matched pairs
  const [moves, setMoves] = useState(0);
  const [showWin, setShowWin] = useState(false);
  const [playAgainPulse, setPlayAgainPulse] = useState(false);

  // On mount and when play again, (re)initialize game state and shuffle cards
  useEffect(() => {
    startNewGame();
    // eslint-disable-next-line
  }, [cardCount]); // replay with different card count

  // Start or restart the memory game
  // PUBLIC_INTERFACE
  function startNewGame() {
    // If you want variability, periodically randomize between 4 or 6 (for replay dopamine):
    // setCardCount(Math.random() < 0.5 ? 4 : 6);

    const symbols = shuffleArray(CARD_IMAGES).slice(0, cardCount);
    let pairs = shuffleArray([...symbols, ...symbols]);
    // create array of {symbol, id, state} for each card
    setCards(pairs.map((emoji, idx) => ({
      emoji,
      id: idx,
      state: 'unflipped', // 'flipped', 'matched'
    })));
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setShowWin(false);
    setPlayAgainPulse(false);
  }

  // Handle card click
  // PUBLIC_INTERFACE
  function handleFlip(idx) {
    // Prevent interaction if already matched or already flipped, or win modal is open, or 2 flipped
    if (
      flipped.includes(idx) ||
      matched.includes(idx) ||
      showWin ||
      flipped.length === 2
    ) {
      return;
    }

    // Flip card
    const newFlipped = [...flipped, idx];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(moves + 1);
      // Check match after short delay to allow animation
      setTimeout(() => {
        checkMatch(newFlipped);
      }, CARD_FLIP_DURATION);
    }
  }

  // PUBLIC_INTERFACE
  function checkMatch([first, second]) {
    if (first === undefined || second === undefined) return;
    if (cards[first].emoji === cards[second].emoji) {
      setMatched([...matched, first, second]);
      setFlipped([]);
      // On match pulse
      setTimeout(() => {
        // vibrate - dopamine trick (if on mobile)
        if ("vibrate" in navigator) navigator.vibrate(100);
      }, 200);
    } else {
      // No match: flip back after short delay
      setTimeout(() => {
        setFlipped([]);
      }, CARD_FLIP_DURATION);
    }
  }

  // Check for win
  useEffect(() => {
    if (matched.length > 0 && matched.length === cards.length && cards.length > 0) {
      setTimeout(() => setShowWin(true), 400);
      setTimeout(() => setPlayAgainPulse(true), 800);
    }
  }, [matched, cards.length]);

  // PUBLIC_INTERFACE
  function playAgain() {
    startNewGame();
  }

  // Compute grid columns: for 6 cards 3x2, for 4 cards 2x2
  const columns = cardCount === 6 ? 3 : 2;

  return (
    <div className="memory-app-bg">
      <main className="memory-container">
        <h1 className="memory-title">🍭 Memory Flip Game</h1>
        <div className="memory-scoreboard">
          <div><strong>Moves</strong>: {moves}</div>
          <div><strong>Matches</strong>: {matched.length / 2} / {cardCount}</div>
        </div>
        <section
          className="memory-grid"
          style={{
            gridTemplateColumns: `repeat(${columns}, 1fr)`
          }}
        >
          {cards.map((card, idx) => {
            // Card state
            const isFlipped = flipped.includes(idx) || matched.includes(idx);
            const isMatched = matched.includes(idx);
            return (
              <div
                key={card.id}
                className={`memory-card${isFlipped ? ' flipped' : ''}${isMatched ? ' matched' : ''}`}
                onClick={() => handleFlip(idx)}
                tabIndex={0}
                aria-label={
                  isMatched ? "Matched" :
                  isFlipped ? `Card: ${card.emoji}` :
                  "Card: hidden"
                }
                role="button"
                style={{
                  // Playful scale or glow if matched
                  animation: isMatched ? 'glow-pulse 0.7s linear' : 'none',
                }}
              >
                <div className="memory-card-inner">
                  <div className="memory-card-front">
                    {card.emoji}
                  </div>
                  <div className="memory-card-back"></div>
                </div>
              </div>
            );
          })}
        </section>
        <div className="memory-controls">
          {showWin ? (
            <div className="youwin-modal">
              <span className="youwin-text">🎉 You Win! 🎉</span>
              <button
                className={`dopamine-btn playagain ${playAgainPulse ? 'pulse' : ''}`}
                onClick={playAgain}
                aria-label="Play Again"
              >
                Play Again!
              </button>
            </div>
          ) : (
            <button
              className="dopamine-btn"
              onClick={playAgain}
              aria-label="Restart"
              disabled={moves < 1 || showWin}
              style={{opacity: moves < 1 ? 0.65 : 1}}
            >
              🔄 Restart
            </button>
          )}
        </div>
        <div className="memory-footer">
          <span>Modern, Playful UI • <a href="https://reactjs.org" target="_blank" rel="noopener noreferrer">React</a></span>
        </div>
      </main>
    </div>
  );
}

export default App;
