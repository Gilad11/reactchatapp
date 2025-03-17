import { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { startConnection, getHubConnection } from "../../../signalRService.js"; // Import SignalR functions

export default function TicTacToe() {
  // Game room identifier (you could make this dynamic if supporting multiple games)
  const [gameId, setGameId] = useState("room1");

  // Player symbol ('X' or 'O')
  const [player, setPlayer] = useState("X");

  // Board state represented as an array of 9 cells (null initially)
  const [board, setBoard] = useState(Array(9).fill(null));

  // Tracks which player's turn it is
  const [currentPlayer, setCurrentPlayer] = useState("X");

  // Stores the winner (if any)
  const [winner, setWinner] = useState(null);

  // SignalR connection state
  const [hubConnection, setHubConnection] = useState(null);

  // Establish SignalR connection when component mounts
  useEffect(() => {
    const connectToHub = async () => {
      try {
        const hubConnection = getHubConnection();
        if (hubConnection) {
          setHubConnection(hubConnection);

          // Listen for game updates from the server
          hubConnection.on("UpdateGame", (game) => {
            setBoard(game.board); // Update board state
            setCurrentPlayer(game.currentPlayer); // Update active player
            setWinner(game.winner); // Update winner state if game is won
          });

          hubConnection.on("AssignPlayer", (assignedPlayer) => {
            setPlayer(assignedPlayer); // Set player ('X' or 'O')
          });

          // Handle disconnection and attempt to reconnect
          hubConnection.onclose(() => {
            console.warn("SignalR Disconnected. Reconnecting...");
            startConnection();
          });

          // Join the game and receive assigned player symbol
          await hubConnection.invoke("JoinGame", gameId);
        }
      } catch (err) {
        console.error("Error connecting to game:", err);
        setError("Failed to connect to the game server.");
      }
    };

    connectToHub();

    // Cleanup function: stop SignalR connection on unmount
    return () => {
      if (hubConnection) {
        hubConnection.stop();
      }
    };
  }, [gameId]); // Runs when `gameId` or `player` changes

  // Handle a player making a move
  const handleClick = (index) => {
    if (
      hubConnection &&
      board[index] === null && // Ensure the cell is empty
      currentPlayer === player && // Ensure it's the player's turn
      !winner // Ensure game is not already won
    ) {
      // Send move to the server via SignalR
      hubConnection
        .invoke("MakeMove", gameId, index, player)
        .catch((err) => console.error("Move failed:", err));
    }
  };

  const restartGame = () => {
    if (hubConnection) {
      hubConnection
        .invoke("ResetGame", gameId)
        .catch((err) => console.error("Reset failed:", err));
    }
  };

  return (
    <div className="container text-center mt-4">
      <h1 className="mb-4">Tic-Tac-Toe</h1>

      {/* Show connection error if any */}
      {error && <p className="text-danger">{error}</p>}

      {/* Display player's symbol */}
      {player ? (
        <h2 className="text-primary">You are: {player}</h2>
      ) : (
        <p>Waiting for player assignment...</p>
      )}

      {/* Display winner or current player's turn */}
      {winner ? (
        <h2 className="text-success">Player {winner} Wins!</h2>
      ) : (
        <p className="mt-4 fs-5">
          Current Player: <strong>{currentPlayer}</strong>
        </p>
      )}

      {/* Game board */}
      <div className="d-flex justify-content-center">
        <div className="grid-container">
          {board.map((cell, index) => (
            <button
              key={index}
              className={`grid-item btn ${
                cell ? "btn-primary" : "btn-outline-dark"
              } fs-3`}
              onClick={() => handleClick(index)}
              disabled={cell !== null || winner !== null}
            >
              {cell}
            </button>
          ))}
        </div>
      </div>

      {/* Restart button */}
      <button className="btn btn-danger mt-3" onClick={restartGame}>
        Restart Game
      </button>

      {/* Styling for board */}
      <style>
        {`
          .grid-container {
            display: grid;
            grid-template-columns: repeat(3, 100px);
            grid-template-rows: repeat(3, 100px);
            gap: 10px;
          }
          .grid-item {
            width: 100px;
            height: 100px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2rem;
            border-radius: 10px;
            font-weight: bold;
          }
        `}
      </style>
    </div>
  );
}
