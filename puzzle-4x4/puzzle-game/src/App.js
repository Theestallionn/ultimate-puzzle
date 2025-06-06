import React, { useState, useEffect, useRef } from "react";
import puzzleImage from "./assets/puzzle-image.png"; // Your image here

function App() {
  const gridSize = 4;
  const tileCount = gridSize * gridSize;

  const [tiles, setTiles] = useState([]);
  const [time, setTime] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    resetGame();
  }, []);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const resetGame = () => {
    const original = [...Array(tileCount - 1).keys()]; // [0, 1, ..., 14]
    const shuffled = [...original];

    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    shuffled.push(null); // add empty tile
    setTiles(shuffled);
    setTime(0);
  };

  const moveTile = (index) => {
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
    }
  };

  const getBackgroundPosition = (tileIndex) => {
    const x = (tileIndex % gridSize) * -120;
    const y = Math.floor(tileIndex / gridSize) * -120;
    return `${x}px ${y}px`;
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
    </div>
  );
}

const styles = {
  container: {
    fontFamily: "sans-serif",
    padding: "20px",
    background: "linear-gradient(to bottom right , #f5f2ee, #ded0c5)",
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
    gridTemplateColumns: "repeat(4, 120px)",
    gridTemplateRows: "repeat(4, 120px)",
    gap: "2px",
    backgroundColor: "#00000010",
    borderRadius: "12px",
    padding: "4px"
  },
  tile: {
    width: "120px",
    height: "120px",
    backgroundRepeat: "no-repeat",
    backgroundSize: `${4 * 120}px ${4 * 120}px`, // 480x480 if 4x4 grid
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
  },
  button: {
    padding: "8px 16px",
    fontSize: "14px",
    borderRadius: "6px",
    backgroundColor: "#333",
    color: "#fff",
    cursor: "pointer",
    border: "none"
  }
};

export default App;
