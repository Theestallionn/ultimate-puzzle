import React, { useState, useEffect, useRef } from "react";
import puzzleImage from "./assets/puzzle-image.png";
import winGif from "./assets/rockyyyyyyyy.gif";
import confetti from "canvas-confetti";

function App() {
  const gridSize = 3;
  const tileSize = 100;
  const tileCount = gridSize * gridSize;

  const [tiles, setTiles] = useState([]);
  const [time, setTime] = useState(0);
  const [isWon, setIsWon] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    resetGame();
  }, []);

  useEffect(() => {
    if (!isWon) {
      timerRef.current = setInterval(() => {
        setTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [isWon]);

  const resetGame = () => {
    const original = [...Array(tileCount - 1).keys()];
    const shuffled = [...original];

    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    shuffled.push(null);
    setTiles(shuffled);
    setTime(0);
    setIsWon(false);
  };

  const moveTile = (index) => {
    if (isWon) return;

    const emptyIndex = tiles.indexOf(null);
    const isAdjacent = (a, b) => {
      const rowA = Math.floor(a / gridSize),
        colA = a % gridSize;
      const rowB = Math.floor(b / gridSize),
        colB = b % gridSize;
      return (
        (rowA === rowB && Math.abs(colA - colB) === 1) ||
        (colA === colB && Math.abs(rowA - rowB) === 1)
      );
    };

    if (isAdjacent(index, emptyIndex)) {
      const newTiles = [...tiles];
      [newTiles[index], newTiles[emptyIndex]] = [
        newTiles[emptyIndex],
        newTiles[index],
      ];
      setTiles(newTiles);
      checkWin(newTiles);
    }
  };

  const checkWin = (tiles) => {
    const correct = [...Array(tileCount - 1).keys()];
    const current = tiles.slice(0, tileCount - 1);
    const isComplete = current.every((val, i) => val === correct[i]);

    if (isComplete) {
      clearInterval(timerRef.current);
      setIsWon(true);
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#E1B382", "#FF7E5F", "#3AB0A2"],
      });
    }
  };

  const getBackgroundPosition = (tileIndex) => {
    const col = tileIndex % gridSize;
    const row = Math.floor(tileIndex / gridSize);
    return `-${col * tileSize}px -${row * tileSize}px`;
  };

  const formatTime = (seconds) => {
    const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
    const secs = String(seconds % 60).padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const styles = {
    container: {
      fontFamily: "sans-serif",
      padding: "20px",
      background: "linear-gradient(to bottom right, #c8a47b, #E1B382)",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    },
    previewWrapper: {
      marginBottom: "16px",
    },
    previewImage: {
      width: "180px",
      borderRadius: "8px",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
    },
    gif: {
      width: "180px",
      marginTop: "20px",
      borderRadius: "10px",
    },
    timerRow: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      gap: "16px",
      marginBottom: "20px",
      fontSize: "18px",
      color: "#333",
    },
    grid: {
      display: "grid",
      gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
      gap: "2px",
      width: `${gridSize * tileSize + (gridSize - 1) * 2}px`,
      height: `${gridSize * tileSize + (gridSize - 1) * 2}px`,
      backgroundColor: "#00000010",
      borderRadius: "12px",
    },
    tile: {
      backgroundRepeat: "no-repeat",
      backgroundSize: `${gridSize * tileSize}px ${gridSize * tileSize}px`,
      border: "none",
      borderRadius: "10px",
      cursor: "pointer",
    },
    button: {
      padding: "8px 16px",
      fontSize: "14px",
      borderRadius: "6px",
      backgroundColor: "#5C412B",
      color: "#F9F6F1",
      cursor: "pointer",
      border: "none",
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.previewWrapper}>
        <img src={puzzleImage} alt="Preview" style={styles.previewImage} />
      </div>

      <div style={styles.timerRow}>
        <span>⏱ {formatTime(time)}</span>
        <button onClick={resetGame} style={styles.button}>
          Restart
        </button>
      </div>

      <div style={styles.grid}>
        {tiles.map((tile, index) => (
          <div
            key={index}
            onClick={() => moveTile(index)}
            style={{
              ...styles.tile,
              backgroundImage: tile !== null ? `url(${puzzleImage})` : "none",
              backgroundPosition:
                tile !== null ? getBackgroundPosition(tile) : "none",
              backgroundColor: tile === null ? "transparent" : "#fff",
              boxShadow:
                tile === null ? "none" : "0 2px 5px rgba(0,0,0,0.15)",
              width: `${tileSize}px`,
              height: `${tileSize}px`,
            }}
          />
        ))}
      </div>

      {isWon && <img src={winGif} alt="You Win!" style={styles.gif} />}
    </div>
  );
}

export default App;
