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
    } while (!isSolvable([...shuffled, null]));

    shuffled.push(null);
    setTiles(shuffled);
    setTime(0);
    setIsSolved(false);
  };

  // ✅ Updated solvability check for 4x4 grids
  const isSolvable = (tiles) => {
    const invCount = tiles.reduce((inv, val, i) => {
      if (val === null) return inv;
      for (let j = i + 1; j < tiles.length; j++) {
        if (tiles[j] !== null && tiles[i] > tiles[j]) inv++;
      }
      return inv;
    }, 0);

    const emptyIndex = tiles.indexOf(null);
    const emptyRowFromBottom = gridSize - Math.floor(emptyIndex / gridSize);

    if (gridSize % 2 === 0) {
      return (emptyRowFromBottom % 2 === 0)
        ? (invCount % 2 === 1)
        : (invCount % 2 === 0);
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
    if (typeof window !== "undefined") {
      confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.6 },
        colors: ["#7b3f00", "#a0522d", "#deb887"],
      });
    }
  };

  const getBackgroundPosition = (tileIndex) => {
    const col = tileIndex % gridSize;
    const row = Math.floor(tileIndex / gridSize);
    const step = 100 / (gridSize - 1);
    return `${col * step}% ${row * step}%`;
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
          <div
            key={index}
            onClick={() => !isSolved && moveTile(index)}
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
    background: "linear-gradient(to bottom right , #b79777, #d6bea3)",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    boxSizing: "border-box"
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
    gridTemplateColumns: "repeat(4, 1fr)",
    gridTemplateRows: "repeat(4, 1fr)",
    gap: "2px",
    backgroundColor: "#00000010",
    borderRadius: "12px",
    padding: "4px",
    width: "90vw",
    maxWidth: "480px",
    aspectRatio: "1 / 1",
    boxSizing: "border-box"
  },
  tile: {
    width: "100%",
    height: "100%",
    backgroundRepeat: "no-repeat",
    backgroundSize: "400% 400%",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    boxSizing: "border-box"
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
