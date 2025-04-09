import React, { useEffect, useState, useMemo } from "react";
import "../Styles/HomePage.css";
import {
  UsersController,
  MessageController,
  GameController,
} from "../../apiService.js";
import personImg from "/src/assets/Person.jpg";
import { useNavigate } from "react-router-dom";
import { startConnection, getHubConnection } from "../../../signalRService.js";
import TicTacToeGame from "./TicTacDog.jsx"; // Import as requested
import { use } from "react";

const HomePage = () => {
  // Full users list is stored in allUsers.
  const [allUsers, setAllUsers] = useState([]);
  // data holds filtered users (initially, same as full list).
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedChat, setSelectedChat] = useState(null); // Currently selected chat
  const [messages, setMessages] = useState([]);
  const [games, setGames] = useState([]);
  const [inputText, setInputText] = useState("");
  const navigate = useNavigate();
  const userIn = sessionStorage.getItem("username");

  // Format timestamps for display.
  const formatTime = (dateString) => {
    if (!dateString) return "never";
    const date = new Date(dateString);
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const [searchText, setSearchText] = useState("");
  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
  };

  // On clicking search, filter the full users list (allUsers) and update 'data'
  const handleSearchClick = () => {
    const filteredUsers = allUsers.filter((user) =>
      user.name.toLowerCase().includes(searchText.toLowerCase())
    );
    setData(filteredUsers);
  };

  const handleInputChange = (e) => setInputText(e.target.value.trimStart());

  const sendGameRequest = (e) => {
    e.preventDefault();
    // Example game request; adjust as needed.
    GameController.saveGame({ id: 1, senderId: "aaa", receiverId: "bbb" });
  };

  // Improved addGameData: always create a new array instance and update a game that matches by sender/receiver.
  const addGameData = (g) => {
    if (!g) return;
    setGames((prevGames) => {
      const newGames = prevGames.map((pg) => {
        if (
          (pg.SenderId === g.SenderId && pg.ReceiverId === g.ReceiverId) ||
          (pg.SenderId === g.ReceiverId && pg.ReceiverId === g.SenderId)
        ) {
          return { ...g };
        }
        return pg;
      });
      // If no match was found, add new game to the front.
      const found = prevGames.find(
        (pg) =>
          (pg.SenderId === g.SenderId && pg.ReceiverId === g.ReceiverId) ||
          (pg.SenderId === g.ReceiverId && pg.ReceiverId === g.SenderId)
      );
      if (!found) {
        return [{ ...g }, ...newGames];
      }
      return newGames;
    });
  };

  useEffect(() => {
    console.log("Games:", games);
  }, [games]);

  useEffect(() => {
    if (userIn) {
      startConnection(userIn);
    } else {
      console.warn("No user found in sessionStorage. SignalR won't start.");
    }
  }, [userIn]);

  useEffect(() => {
    const hubConnection = getHubConnection();
    if (!hubConnection) return;
    hubConnection.on("ReceiveMessage", (senderId, content) => {
      console.log("Message received:", senderId, content);
      setMessages((prev) => [...prev, { senderId, content }]);
    });
    hubConnection.on("ReceiveGame", (gameData) => {
      console.log("Game data received via SignalR:", gameData);

      // If gameData is a string, parse it
      const parsedGame =
        typeof gameData === "string" ? JSON.parse(gameData) : gameData;

      // Add immediate debug logging
      console.log("Parsed game data:", parsedGame);
      console.log("Current selected chat:", selectedChat);

      // Add the game data to the games array
      addGameData(parsedGame);

      // If this game involves the current selected chat, update activeGame directly
      if (
        selectedChat &&
        ((parsedGame.SenderId === userIn &&
          parsedGame.ReceiverId === selectedChat.id) ||
          (parsedGame.SenderId === selectedChat.id &&
            parsedGame.ReceiverId === userIn))
      ) {
        console.log("Updating active game directly for selected chat");
        setActiveGame(parsedGame);
      }
    });
    return () => {
      hubConnection.off("ReceiveMessage");
      hubConnection.off("ReceiveGame");
    };
  }, []);

  useEffect(() => {
    const getAllUsers = async () => {
      try {
        const result = await UsersController.getAllUsers();
        console.log("API Response:", result);
        if (Array.isArray(result) && result.length > 0) {
          // Filter out the current user.
          const filtered = result.filter((user) => user.id !== userIn);
          setAllUsers(filtered);
          // initialize data with the full (filtered) list.
          setData(filtered);
        } else {
          setAllUsers([]);
          setData([]);
        }
      } catch (err) {
        console.error("API Fetch Error:", err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    getAllUsers();
  }, [userIn]);

  // When a chat is selected, load messages and fetch the game using the two user IDs.
  const setActive = async (chat) => {
    setSelectedChat(chat);
    try {
      const messagesData = await MessageController.GetMessagesBetweenUsers(
        userIn,
        chat.id
      );
      setMessages(messagesData);

      const game = await GameController.getGame(userIn, chat.id);
      addGameData(game);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const addMessage = async () => {
    if (!inputText.trim() || !selectedChat) return;
    try {
      const trimmedMessage = inputText.trim();
      const message = {
        content: trimmedMessage,
        senderId: userIn,
        receiverId: selectedChat.id,
      };
      const result = await MessageController.sendMessage(message);
      console.log("Message added successfully:", result);
      setMessages((prev) => [
        ...prev,
        {
          senderId: userIn,
          content: trimmedMessage,
          sentAt: new Date().toISOString(),
        },
      ]);
      setInputText("");
    } catch (err) {
      console.error("Error adding message:", err.response?.data || err.message);
    }
  };

  const [activeGame, setActiveGame] = useState(undefined);

  useEffect(() => {
    if (games.length > 0 && selectedChat) {
      const foundGame = games.find(
        (game) =>
          (game.senderId === userIn && game.receiverId === selectedChat.id) ||
          (game.senderId === selectedChat.id && game.receiverId === userIn)
      );
      console.log("Active game found:", foundGame);
      setActiveGame(foundGame);
    }
  }, [games, selectedChat, userIn]);
  const makeMove = (newGame) => {
    GameController.saveGame(newGame);
    addGameData(newGame);
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <div className="container">
        <div className="row clearfix">
          <div className="col-lg-12">
            <div className="card chat-app">
              <div id="plist" className="people-list">
                <div className="input-group">
                  <div className="input-group-prepend"></div>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search..."
                    value={searchText}
                    onChange={handleSearchChange}
                  />
                  <div className="input-group-append">
                    <button
                      className="btn btn-primary"
                      onClick={handleSearchClick}
                    >
                      <i className="fa fa-search"></i> Search
                    </button>
                  </div>
                </div>
                <ul className="list-unstyled chat-list mt-2 mb-0">
                  {data.map((chat, index) => (
                    <li
                      key={chat.chatId || `chat-${index}`}
                      onClick={() => setActive(chat)}
                      className="clearfix"
                    >
                      <img src={chat.profilePicture || personImg} alt="P" />
                      <div className="name">{chat.name}</div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="chat-game-wrapper">
                <div className="chat">
                  <div className="chat-header clearfix">
                    <div className="row">
                      <div className="col-lg-6">
                        <a href="#" onClick={(e) => e.preventDefault()}>
                          <img
                            src={selectedChat?.profilePicture || personImg}
                            alt="profile"
                          />
                        </a>
                        <div className="chat-about">
                          <h6 className="m-b-0">
                            {selectedChat?.name || "Nobody"}
                          </h6>
                          <small>
                            Last seen:{" "}
                            {formatTime(selectedChat?.lastActiveDate)}
                          </small>
                        </div>
                      </div>
                      <button className="gamerequest" onClick={sendGameRequest}>
                        Game Request
                      </button>
                    </div>
                  </div>
                  <div className="chat-history">
                    <ul className="m-b-0">
                      {messages.length > 0 ? (
                        messages.map((message, index) => (
                          <li
                            key={message.messageId || `msg-${index}`}
                            className="clearfix"
                          >
                            {message.senderId === userIn ? (
                              <div className="msg-wrapper text-right">
                                <div className="text-left">
                                  {formatTime(message.sentAt)}
                                </div>
                                <div className="message other-message float-right">
                                  {message.content}
                                </div>
                              </div>
                            ) : (
                              <div className="msg-wrapper">
                                <div className="text-right">
                                  {formatTime(message.sentAt)}
                                </div>
                                <div className="message my-message">
                                  {message.content}
                                </div>
                              </div>
                            )}
                          </li>
                        ))
                      ) : (
                        <li className="clearfix">
                          <div className="message my-message">
                            No messages available.
                          </div>
                        </li>
                      )}
                    </ul>
                  </div>
                  <div className="chat-message clearfix">
                    <div
                      className="input-group mb-0"
                      style={{ display: "flex", alignItems: "center" }}
                    >
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter text here..."
                        value={inputText}
                        onChange={handleInputChange}
                        style={{ flex: 1, marginRight: "10px" }}
                      />
                      <button
                        className="fa fa-send btn btn-primary"
                        onClick={addMessage}
                        disabled={!inputText.trim()}
                        style={{ padding: "10px 20px" }}
                      >
                        Send
                      </button>
                    </div>
                  </div>
                </div>
                {selectedChat ? (
                  <div className="game-wrapper">
                    <TicTacToeGame
                      game={activeGame}
                      saveGame={makeMove}
                      myId={userIn}
                      opponentId={selectedChat.id}
                      onGameUpdate={addGameData}
                    />
                  </div>
                ) : (
                  <div className="game-wrapper">
                    <p>Select a chat to start a game.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
