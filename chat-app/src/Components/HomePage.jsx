//HomePage.jsx
import React, { useEffect, useState } from "react";
import "../Styles/HomePage.css";
import { UsersController, MessageController } from "../../apiService.js";
import { useAuth } from "../context/AuthProvider.jsx";
import personImg from "/src/assets/Person.jpg";
//import GamePage from "./GamePage.jsx";
import { useNavigate } from "react-router-dom";
import { startConnection, getHubConnection } from "../../../signalRService.js";

const HomePage = () => {
  const [data, setData] = useState([]); // Store users from the database
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedChat, setSelectedChat] = useState(null); // Store chat from the database
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const navigate = useNavigate();
  const userIn = sessionStorage.getItem("username");

  const handleInputChange = (e) => {
    setInputText(e.target.value.trimStart()); // Prevent leading spaces
  };

  const sendGameRequest = async () => {
    navigate("/game");
  };

  useEffect(() => {
    if (userIn) {
      startConnection(userIn); // ✅ Start SignalR connection only if userIn exists
    } else {
      console.warn("⚠️ No user found in sessionStorage. SignalR won't start.");
    }
  }, [userIn]);

  useEffect(() => {
    const hubConnection = getHubConnection();
    if (!hubConnection) return;

    hubConnection.on("ReceiveMessage", (senderId, content) => {
      console.log("Message received:", senderId, content);
       setMessages((prev) => [...prev, { senderId, content }]);
    });

    return () => {
      hubConnection.off("ReceiveMessage");
    };
  }, []);

  useEffect(() => {
    const getAllUsers = async () => {
      try {
        const result = await UsersController.getAllUsers();
        console.log("API Response:", result);

        if (Array.isArray(result) && result.length > 0) {
          let filterResult = result.filter((user) => user.id !== userIn);
          setData(filterResult);
        } else {
          console.error("Expected an array but got:", result);
          setData([]);
        }
      } catch (err) {
        console.error("❌ API Fetch Error:", err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    getAllUsers();
  }, []);

  const setActive = async (chat) => {
    setSelectedChat(chat);
    try {
      const data = await MessageController.GetMessagesBetweenUsers(
        userIn,
        chat.id
      );
      setMessages(data);
    } catch (error) {
      console.error("❌ Error fetching messages:", error);
    }
  };

  // ✅ Fixed: Properly pass `inputText`
  const addMessage = async () => {
    if (!inputText.trim() || !selectedChat) return;

    try {
      const trimmedMessage = inputText.trim();

      // Send message to backend
      const message = {
        content: trimmedMessage,
        senderId: userIn,
        receiverId: selectedChat.id,
      };

      const result = await MessageController.sendMessage(message);
      console.log("Message added successfully:", result);
      // Only update state if SignalR does not already update it
      setMessages((prev) => [
        ...prev,
        {
          senderId: userIn,
          content: trimmedMessage,
          sentAt: new Date().toISOString(),
        },
      ]);

      setInputText(""); // Clear input field
    } catch (err) {
      console.error(
        "❌ Error adding message:",
        err.response?.data || err.message
      );
    }
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
                  <div className="input-group-prepend">
                    <span className="input-group-text">
                      <i className="fa fa-search"></i>
                    </span>
                  </div>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search..."
                  />
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
              <div className="chat">
                <div className="chat-header clearfix">
                  <div className="row">
                    <div className="col-lg-6">
                      <a
                        href="#"
                        data-toggle="modal"
                        data-target="#view_info"
                        onClick={(e) => e.preventDefault()}
                      >
                        <img
                          src={selectedChat?.profilePicture || personImg}
                          alt="picture"
                        />
                      </a>
                      <button className="gamerequest" onClick={sendGameRequest}>
                        Game Rquest
                      </button>
                      <div className="chat-about">
                        <h6 className="m-b-0">
                          {selectedChat?.name || "Nobody"}
                        </h6>
                        <small>
                          Last seen: {selectedChat?.lastActiveDate || "never"}
                        </small>
                      </div>
                    </div>
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
                            <div className="msg-wrapper">
                              <span className="message-data-time float-right">
                                {message.sentAt}
                              </span>
                              <div className="message other-message float-right">
                                {message.content}
                              </div>
                            </div>
                          ) : (
                            <div className="msg-wrapper">
                              <span className="message-data-time">
                                {message.sentAt} <br /> {message.userid}
                              </span>
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
