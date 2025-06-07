import React, { useState, useEffect, useRef } from "react";
import puzzleImage from "./assets/puzzle-image.png";
import gif from "./assets/rockyyyyyyyy.gif";
import confetti from "canvas-confetti";

function App() {
  const gridSize = 4;
  const tileCount = gridSize * gridSize;

  const [tiles, setTiles] = useState([]);
  const [time, setTime] = useState(0);
  const [isSolved, setIsSolved] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    resetGame();
  }, []);

  useEffect(() => {
    if (!isSolved) {
      timerRef.current = setInterval(() => {
        setTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [isSolved]);

  const resetGame = () => {
    const original = [...Array(tileCount - 1).keys()];
    let shuffled;
    do {
      shuffled = [...original];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      shuffled.push(null);
    } while (!isSolvable(shuffled));

    setTiles(shuffled);
    setTime(0);
    setIsSolved(false);
  };

  const isSolvable = (tiles) => {
    let invCount = 0;
    const flattened = tiles.filter((n) => n !== null);

    for (let i = 0; i < flattened.length - 1; i++) {
      for (let j = i + 1; j < flattened.length; j++) {
        if (flattened[i] > flattened[j]) invCount++;
      }
    }

    const emptyRowFromBottom = gridSize - Math.floor(tiles.indexOf(null) / gridSize);
    if (gridSize % 2 === 0) {
      return (emptyRowFromBottom % 2 === 0) !== (invCount % 2 === 0);
    } else {
      return invCount % 2 === 0;
    }
  };

  const moveTile = (index) => {
    if (isSolved) return;

    const emptyIndex = tiles.indexOf(null);
    const isAdjacent = (a, b) => {
      const rowA = Math.floor(a / gridSize), colA = a % gridSize;
      const rowB = Math.floor(b / gridSize), colB = b % gridSize;
      return (
        (rowA === rowB && Math.abs(colA - colB) === 1) ||
        (colA === colB && Math.abs(rowA - rowB) === 1)
      );
    };

    if (isAdjacent(index, emptyIndex)) {
      const newTiles = [...tiles];
      [newTiles[index], newTiles[emptyIndex]] = [newTiles[emptyIndex], newTiles[index]];
      setTiles(newTiles);

      if (isPuzzleSolved(newTiles)) {
        clearInterval(timerRef.current);
        setIsSolved(true);
        fireConfetti();
      }
    }
  };

  const isPuzzleSolved = (tiles) => {
    for (let i = 0; i < tileCount - 1; i++) {
      if (tiles[i] !== i) return false;
    }
    return tiles[tileCount - 1] === null;
  };

  const fireConfetti = () => {
    confetti({
      particleCount: 200,
      spread: 100,
      origin: { y: 0.6 },
      colors: ["#7b3f00", "#a0522d", "#deb887"],
    });
  };

  const getBackgroundPosition = (tileIndex) => {
    const col = tileIndex % gridSize;
    const row = Math.floor(tileIndex / gridSize);
    const percent = 100 / (gridSize - 1);
    return `${col * percent}% ${row * percent}%`;
  };

  const formatTime = (seconds) => {
    const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
    const secs = String(seconds % 60).padStart(2, "0");
    return `${mins}:${secs}`;
  };

  return (
    <div style={styles.container}>
      <div style={styles.previewWrapper}>
        <img src={puzzleImage} alt="Preview" style={styles.previewImage} />
      </div>

      <div style={styles.timerRow}>
        <span>⏱ {formatTime(time)}</span>
        <button onClick={resetGame} style={styles.button}>Restart</button>
      </div>

      <div style={styles.grid}>
        {tiles.map((tile, index) => (
          <button
            key={index}
            onClick={() => moveTile(index)}
            style={{
              ...styles.tile,
              backgroundImage: tile !== null ? `url(${puzzleImage})` : "none",
              backgroundPosition: tile !== null ? getBackgroundPosition(tile) : "none",
              backgroundColor: tile === null ? "transparent" : "#fff",
              boxShadow: tile === null ? "none" : "0 2px 5px rgba(0,0,0,0.15)",
            }}
          />
        ))}
      </div>

      {isSolved && (
        <div style={styles.victorySection}>
          <h2>🎉 Puzzle Completed!</h2>
          <img src={gif} alt="Victory" style={styles.victoryGif} />
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    fontFamily: "sans-serif",
    padding: "20px",
    background: "linear-gradient(to bottom right , #86664a, #ad8761)",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
  },
  previewWrapper: {
    marginBottom: "16px"
  },
  previewImage: {
    width: "180px",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)"
  },
  timerRow: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "16px",
    marginBottom: "20px",
    fontSize: "18px",
    color: "#333"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, clamp(60px, 22vw, 120px))",
    gridTemplateRows: "repeat(4, clamp(60px, 22vw, 120px))",
    gap: "2px",
    backgroundColor: "#00000010",
    borderRadius: "12px",
    padding: "4px"
  },
  tile: {
    width: "clamp(60px, 22vw, 120px)",
    height: "clamp(60px, 22vw, 120px)",
    backgroundRepeat: "no-repeat",
    backgroundSize: "400% 400%",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer"
  },
  button: {
    padding: "8px 16px",
    fontSize: "14px",
    borderRadius: "6px",
    backgroundColor: "#333",
    color: "#fff",
    cursor: "pointer",
    border: "none"
  },
  victorySection: {
    marginTop: "20px",
    textAlign: "center"
  },
  victoryGif: {
    width: "220px",
    marginTop: "10px",
    borderRadius: "10px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)"
  }
};

export default App;
