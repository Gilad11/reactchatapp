// TicTacToeGame.jsx
import React, { useState, useEffect } from 'react';

// Creates an empty game board with a valid ReceiverId.
function createEmptyGame(opponentId) {
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
    SenderId: '', // Will be set on the first move.
    ReceiverId: opponentId || ''
  };
}

const TicTacToeGame = ({ game: initialGame, saveGame, myId, opponentId, onGameUpdate }) => {
  // If no game is passed, initialize an empty one with the proper receiver.
  const [game, setGame] = useState(initialGame ? { ...initialGame } : createEmptyGame(opponentId));
  const [hoveredCell, setHoveredCell] = useState(null);
  const [winner, setWinner] = useState(null);

  // Update internal game state when a new game object arrives.
  useEffect(() => {
    setGame(initialGame ? { ...initialGame } : createEmptyGame(opponentId));
  }, [initialGame, opponentId]);

  // Convert the game board cells into an array.
  const boardCells = [
    game.cell1, game.cell2, game.cell3,
    game.cell4, game.cell5, game.cell6,
    game.cell7, game.cell8, game.cell9,
  ];

  // Count how many red and blue pieces have been placed.
  const redCount = boardCells.reduce((acc, cell) => (cell > 0 ? acc + 1 : acc), 0);
  const blueCount = boardCells.reduce((acc, cell) => (cell < 0 ? acc + 1 : acc), 0);

  // Red always goes first.
  // If counts are equal, it’s red’s turn; otherwise blue’s turn.
  const currentTurn = redCount === blueCount ? 'red' : 'blue';

  // Determine my color. For a new game, assume I'm red.
  const myColor = (!game.SenderId && !game.ReceiverId)
    ? 'red'
    : (myId === game.SenderId ? 'red' : 'blue');

  // Disable the board if a winner is declared OR if it's not your turn.
  // (Rule: if you were the last mover -- i.e. your id is stored in SenderId -- then wait for opponent.)
  const boardDisabled = !!winner || (game.SenderId === myId);

  // Each player starts with 3 available pieces per level: 1 (mouse), 2 (cat), 3 (dog).
  // Count the pieces you have already played.
  const availablePieces = { 1: 3, 2: 3, 3: 3 };
  boardCells.forEach(cell => {
    if (myColor === 'red' && cell > 0) {
      availablePieces[cell]--;
    } else if (myColor === 'blue' && cell < 0) {
      availablePieces[Math.abs(cell)]--;
    }
  });

  // Check for win conditions (three-in-a-row, column or diagonal).
  const checkWin = (board) => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6]
    ];
    for (let [a, b, c] of lines) {
      if (board[a] !== 0 && board[b] !== 0 && board[c] !== 0) {
        const colorA = board[a] > 0 ? 'red' : 'blue';
        const colorB = board[b] > 0 ? 'red' : 'blue';
        const colorC = board[c] > 0 ? 'red' : 'blue';
        if (colorA === colorB && colorB === colorC) {
          return colorA;
        }
      }
    }
    return null;
  };

  // Called when a move button is clicked.
  // cellIndex: 0-8 representing the cell; pieceType: 1 (mouse), 2 (cat), 3 (dog).
  const handleMove = async (cellIndex, pieceType) => {
    const cellKey = `cell${cellIndex + 1}`;
    const currentCellValue = game[cellKey];
    const currentLevel = Math.abs(currentCellValue);

    // You can only place a piece if the cell is empty or holds a smaller piece.
    if (currentCellValue !== 0 && pieceType <= currentLevel) return;
    // Also, do nothing if no pieces of that type remain.
    if (availablePieces[pieceType] <= 0) return;

    // New value: positive (red) if I'm red, negative (blue) if I'm blue.
    const newValue = myColor === 'red' ? pieceType : -pieceType;
    const newGame = {
      ...game,
      [cellKey]: newValue,
      // When I send a move, I become the Sender.
      SenderId: myId,
      // Keep the opponent's id (ReceiverId) in the game.
      ReceiverId: game.ReceiverId || opponentId
    };

    try {
      // Save the game to the server.
      await saveGame(newGame);
      // Update local state.
      setGame(newGame);

      // Call the parent's update function (if provided) to update the games array.
      if (onGameUpdate) {
        onGameUpdate(newGame);
      }

      // Check for a win.
      const newBoard = [
        newGame.cell1, newGame.cell2, newGame.cell3,
        newGame.cell4, newGame.cell5, newGame.cell6,
        newGame.cell7, newGame.cell8, newGame.cell9,
      ];
      const win = checkWin(newBoard);
      if (win) {
        setWinner(win);
      }
      setHoveredCell(null);
    } catch (error) {
      console.error("Error saving game: ", error);
    }
  };

  // Returns allowed moves for a given cell. Only pieces with levels higher than the current one are allowed.
  const getAllowedMoves = (cellValue) => {
    const allowed = [];
    for (let type = 1; type <= 3; type++) {
      if (availablePieces[type] > 0 && type > Math.abs(cellValue)) {
        allowed.push(type);
      }
    }
    return allowed;
  };

  // Render the image for a cell if a piece is present.
  const renderCellContent = (cellValue) => {
    if (cellValue === 0) return null;
    const colorPrefix = cellValue > 0 ? 'r' : 'b';
    const pieceType = Math.abs(cellValue);
    const imgSrc = `/ttt/${colorPrefix}${pieceType}.svg`;
    return (
      <img
        src={imgSrc}
        alt={`${colorPrefix}${pieceType}`}
        style={{ width: '100%', height: '100%' }}
      />
    );
  };

  // Check if the board is completely empty.
  const boardEmpty = boardCells.every(cell => cell === 0);

  return (
    <div>
      {winner && (
        <div style={{ marginBottom: '10px', fontWeight: 'bold' }}>
          {winner.toUpperCase()} wins!
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 100px)', gridGap: '5px' }}>
        {boardCells.map((cellValue, index) => (
          <div
            key={index}
            style={{ width: '100px', height: '100px', border: '1px solid black', position: 'relative' }}
            onMouseEnter={() => { if (!boardDisabled) setHoveredCell(index); }}
            onMouseLeave={() => setHoveredCell(null)}
          >
            {renderCellContent(cellValue)}
            {/* When hovering, show available piece buttons if a move is allowed */}
            {!boardDisabled && hoveredCell === index && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  backgroundColor: 'rgba(255,255,255,0.8)',
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1
                }}
              >
                {getAllowedMoves(cellValue).map(pieceType => {
                  const imgSrc = `/ttt/${myColor === 'red' ? 'r' : 'b'}${pieceType}.svg`;
                  return (
                    <button
                      key={pieceType}
                      onClick={() => handleMove(index, pieceType)}
                      style={{ margin: '2px', padding: '0', border: 'none', background: 'none' }}
                      disabled={availablePieces[pieceType] <= 0}
                    >
                      <img src={imgSrc} alt={`${myColor} ${pieceType}`} style={{ width: '30px', height: '30px' }} />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
      {boardEmpty && (
        <div style={{ textAlign: 'center', marginTop: '10px', fontWeight: 'bold' }}>
          Start playing!
        </div>
      )}
    </div>
  );
};

export default TicTacToeGame;
