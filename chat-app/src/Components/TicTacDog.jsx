import React, { useState, useEffect } from "react";

// Creates an empty game board with a valid ReceiverId.
function createEmptyGame(myId) {
  return {
    id: 0, // if created on the server, the game id will be set later.
    cell1: 0,
    cell2: 0,
    cell3: 0,
    cell4: 0,
    cell5: 0,
    cell6: 0,
    cell7: 0,
    cell8: 0,
    cell9: 0,
    senderId: "", // Sender is the first player who makes the move
    receiverId: "", // Receiver is the opponent
    redId: myId, // The player who is assigned as red
  };
}

const TicTacToeGame = ({
  game: initialGame,
  saveGame,
  myId,
  opponentId,
  onGameUpdate,
}) => {
  // If no game is passed, initialize an empty one with the proper receiver.
  const [game, setGame] = useState(
    initialGame ? { ...initialGame } : createEmptyGame(myId)
  );
  const [hoveredCell, setHoveredCell] = useState(null); // Track hovered cell for showing available moves
  const [winner, setWinner] = useState(null); // State for winner

  // Whenever the initial game or player data changes, reset the game and winner state.
  useEffect(() => {
    setGame(initialGame ? { ...initialGame } : createEmptyGame(myId));
    setWinner(null); // Reset winner when game is reset
  }, [initialGame, myId, opponentId]);

  // Board cells, representing the state of each cell in the 3x3 grid
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

  // Count how many red and blue pieces have been placed on the board
  const redCount = boardCells.reduce(
    (acc, cell) => (cell > 0 ? acc + 1 : acc),
    0
  );
  const blueCount = boardCells.reduce(
    (acc, cell) => (cell < 0 ? acc + 1 : acc),
    0
  );

  // Determine which color the current player is based on the `redId` property
  const myColor = game.redId === myId ? "red" : "blue";

  // Disable the board if the game is won or if it’s the current player's turn.
  const boardDisabled = game.senderId === myId || winner;

  // Track the available pieces of each type (mouse, cat, dog)
  const availablePieces = { 1: 3, 2: 3, 3: 3 };
  boardCells.forEach((cell) => {
    if (myColor === "red" && cell > 0) {
      availablePieces[cell]--;
    } else if (myColor === "blue" && cell < 0) {
      availablePieces[Math.abs(cell)]--;
    }
  });

  const restartGame = async () => {
    const emptyGame = createEmptyGame(myId);
    await saveGame(emptyGame);
    setGame(emptyGame);
    setWinner(null);
  };

  // Check for win conditions (three-in-a-row, column, or diagonal).
  const checkWin = (board, redId) => {
    const lines = [
      [0, 1, 2], // First row
      [3, 4, 5], // Second row
      [6, 7, 8], // Third row
      [0, 3, 6], // First column
      [1, 4, 7], // Second column
      [2, 5, 8], // Third column
      [0, 4, 8], // Diagonal top-left to bottom-right
      [2, 4, 6], // Diagonal top-right to bottom-left
    ];
    // Loop through each line and check if all three cells are either greater than 0 or less than 0
    for (let [a, b, c] of lines) {
      if (
        (board[a] > 0 && board[b] > 0 && board[c] > 0) ||
        (board[a] < 0 && board[b] < 0 && board[c] < 0)
      ) {
        // If all three cells are either positive or negative, return the color of the winner
        const winnerColor = board[a] > 0 ? "red" : "blue";
        const winner =
          winnerColor === "red"
            ? (redId === myId ? myId : opponentId) + " Win!"
            : (blueId === myId ? myId : opponentId) + " Win!";

        setWinner(winner);

        console.log("winner:", winner);

        return winner; // Red if the value is positive, blue if negative
      }
    }
    setWinner(null);
    return null; // If no winner found
  };

  // Called when a move button is clicked.
  const handleMove = async (cellIndex, pieceType) => {
    const cellKey = `cell${cellIndex + 1}`;
    const currentCellValue = game[cellKey];
    const currentLevel = Math.abs(currentCellValue);

    // You can only place a piece if the cell is empty or holds a smaller piece.
    if (currentCellValue !== 0 && pieceType <= currentLevel) return;
    // Do nothing if no pieces of that type remain.
    if (availablePieces[pieceType] <= 0) return;

    // New value: positive (red) if I'm red, negative (blue) if I'm blue.
    const newValue = myColor === "red" ? pieceType : -pieceType;
    const newGame = {
      ...game,
      [cellKey]: newValue,
      senderId: myId, // Player making the move
      receiverId: opponentId, // Opponent's ID remains the same
    };

    try {
      // Save the game to the server.
      await saveGame(newGame);
      // Update local game state.
      setGame(newGame);

      // Call the parent's update function (if provided) to update the games array.
      if (onGameUpdate) {
        onGameUpdate(newGame);
      }

      // Check for a win after making the move.
      const newBoard = [
        newGame.cell1,
        newGame.cell2,
        newGame.cell3,
        newGame.cell4,
        newGame.cell5,
        newGame.cell6,
        newGame.cell7,
        newGame.cell8,
        newGame.cell9,
      ];

      checkWin(newBoard, newGame.redId);

      setHoveredCell(null); // Reset hovered cell after making a move
    } catch (error) {
      console.error("Error saving game: ", error);
    }
  };

  // Returns allowed moves for a given cell. Only pieces with levels higher than the current one are allowed.
  const getAllowedMoves = (cellValue) => {
    const allowed = [];
    for (let type = 1; type <= 3; type++) {
      if (availablePieces[type] > 0 && type > Math.abs(cellValue)) {
        allowed.push(type); // Add piece types that can be placed in the current cell
      }
    }
    return allowed;
  };

  // Render the image for a cell if a piece is present.
  const renderCellContent = (cellValue) => {
    if (cellValue === 0) return null;
    const colorPrefix = cellValue > 0 ? "r" : "b";
    const pieceType = Math.abs(cellValue);
    const imgSrc = `/ttt/${colorPrefix}${pieceType}.svg`; // Image source based on piece color and type
    return (
      <img
        src={imgSrc}
        alt={`${colorPrefix}${pieceType}`}
        style={{ width: "100%", height: "100%" }}
      />
    );
  };

  // Check if the board is completely empty.
  const boardEmpty = boardCells.every((cell) => cell === 0);

  console.log("winner:", winner);

  useEffect(() => {
    const newBoard = [
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

    checkWin(newBoard, game.redId);


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
              if (!boardDisabled) setHoveredCell(index); // Set hovered cell for move preview
            }}
            onMouseLeave={() => setHoveredCell(null)} // Reset hovered cell
          >
            {renderCellContent(cellValue)} {/* Display the piece in the cell */}
            {/* When hovering, show available piece buttons if a move is allowed */}
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
                      onClick={() => handleMove(index, pieceType)} // Handle the move
                      style={{
                        margin: "2px",
                        padding: "0",
                        border: "none",
                        background: "none",
                      }}
                      disabled={availablePieces[pieceType] <= 0} // Disable button if no pieces left
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
