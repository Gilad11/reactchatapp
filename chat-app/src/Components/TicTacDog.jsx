import React, { useState, useEffect } from "react";

function createEmptyGame(myId) {
  return {
    id: 0,
    cell1: 0,
    cell2: 0,
    cell3: 0,
    cell4: 0,
    cell5: 0,
    cell6: 0,
    cell7: 0,
    cell8: 0,
    cell9: 0,
    senderId: "",
    receiverId: "",
    redId: myId,
  };
}

const TicTacToeGame = ({
  game: initialGame,
  saveGame,
  myId,
  opponentId,
  onGameUpdate,
}) => {
  const [game, setGame] = useState(
    initialGame ? { ...initialGame } : createEmptyGame(myId)
  );
  const [hoveredCell, setHoveredCell] = useState(null);
  const [winner, setWinner] = useState(null);

  useEffect(() => {
    setGame(initialGame ? { ...initialGame } : createEmptyGame(myId));
    setWinner(null);
  }, [initialGame, myId, opponentId]);

  const boardCells = [
    game.cell1,
    game.cell2,
    game.cell3,
    game.cell4,
    game.cell5,
    game.cell6,
    game.cell7,
    game.cell8,
    game.cell9,
  ];

  const redCount = boardCells.reduce(
    (acc, cell) => (cell > 0 ? acc + 1 : acc),
    0
  );
  const blueCount = boardCells.reduce(
    (acc, cell) => (cell < 0 ? acc + 1 : acc),
    0
  );

  const myColor = game.redId === myId ? "red" : "blue";
  const boardDisabled = game.senderId === myId || winner;

  const availablePieces = { 1: 3, 2: 3, 3: 3 };
  boardCells.forEach((cell) => {
    if (myColor === "red" && cell > 0) availablePieces[cell]--;
    else if (myColor === "blue" && cell < 0) availablePieces[Math.abs(cell)]--;
  });

  const restartGame = async () => {
    const emptyGame = createEmptyGame(myId);
    await saveGame(emptyGame);
    setGame(emptyGame);
    setWinner(null);
  };

  const checkWin = (board, redId) => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    for (let [a, b, c] of lines) {
      if (
        (board[a] > 0 && board[b] > 0 && board[c] > 0) ||
        (board[a] < 0 && board[b] < 0 && board[c] < 0)
      ) {
        const winnerColor = board[a] > 0 ? "red" : "blue";
        const winner =
          winnerColor === "red"
            ? (redId === myId ? myId : opponentId) + " Win!"
            : (redId !== myId ? myId : opponentId) + " Win!";
        setWinner(winner);
        return winner;
      }
    }

    setWinner(null);
    return null;
  };

  const handleMove = async (cellIndex, pieceType) => {
    const cellKey = `cell${cellIndex + 1}`;
    const currentCellValue = game[cellKey];
    const currentLevel = Math.abs(currentCellValue);

    if (currentCellValue !== 0 && pieceType <= currentLevel) return;
    if (availablePieces[pieceType] <= 0) return;

    const newValue = myColor === "red" ? pieceType : -pieceType;
    const newGame = {
      ...game,
      [cellKey]: newValue,
      senderId: myId,
      receiverId: opponentId,
    };

    try {
      await saveGame(newGame);
      setGame(newGame);
      if (onGameUpdate) onGameUpdate(newGame);
      checkWin(Object.values(newGame).slice(1, 10), newGame.redId);
      setHoveredCell(null);
    } catch (error) {
      console.error("Error saving game: ", error);
    }
  };

  const getAllowedMoves = (cellValue) => {
    const allowed = [];
    for (let type = 1; type <= 3; type++) {
      if (availablePieces[type] > 0 && type > Math.abs(cellValue)) {
        allowed.push(type);
      }
    }
    return allowed;
  };

  const renderCellContent = (cellValue) => {
    if (cellValue === 0) return null;
    const colorPrefix = cellValue > 0 ? "r" : "b";
    const pieceType = Math.abs(cellValue);
    const imgSrc = `/ttt/${colorPrefix}${pieceType}.svg`;
    return (
      <img
        src={imgSrc}
        alt={`${colorPrefix}${pieceType}`}
        style={{ width: "100%", height: "100%" }}
      />
    );
  };

  const boardEmpty = boardCells.every((cell) => cell === 0);

  useEffect(() => {
    checkWin(boardCells, game.redId);
  }, [game]);

  return (
    <div>
      <div
        style={{
          marginBottom: "10px",
          fontWeight: "bold",
          height: "42px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "bottom",
        }}
      >
        {winner && (
          <div
            style={{ textAlign: "center", fontWeight: "bold", margin: "auto" }}
          >
            {winner}
          </div>
        )}
        <button className="restartGame" onClick={restartGame}>
          Restart
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 100px)",
          gridGap: "5px",
        }}
      >
        {boardCells.map((cellValue, index) => (
          <div
            key={index}
            style={{
              width: "100px",
              height: "100px",
              border: "1px solid black",
              position: "relative",
            }}
            onMouseEnter={() => {
              if (!boardDisabled) setHoveredCell(index);
            }}
            onMouseLeave={() => setHoveredCell(null)}
          >
            {renderCellContent(cellValue)}
            {!boardDisabled && hoveredCell === index && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  backgroundColor: "rgba(255,255,255,0.8)",
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 1,
                }}
              >
                {getAllowedMoves(cellValue).map((pieceType) => {
                  const imgSrc = `/ttt/${
                    myColor === "red" ? "r" : "b"
                  }${pieceType}.svg`;
                  return (
                    <button
                      key={pieceType}
                      onClick={() => handleMove(index, pieceType)}
                      style={{
                        margin: "2px",
                        padding: "0",
                        border: "none",
                        background: "none",
                      }}
                      disabled={availablePieces[pieceType] <= 0}
                    >
                      <img
                        src={imgSrc}
                        alt={`${myColor} ${pieceType}`}
                        style={{ width: "30px", height: "30px" }}
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {boardEmpty && (
        <div
          style={{ textAlign: "center", marginTop: "10px", fontWeight: "bold" }}
        >
          Start playing!
        </div>
      )}
    </div>
  );
};

export default TicTacToeGame;
