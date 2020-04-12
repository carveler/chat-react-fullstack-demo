import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import io from 'socket.io-client'

let socket = io(":8000")

function App() {

  // state: rooms with histories
  let [rooms, setRooms] = useState([
    {title: "Public", history: [
      { msg: "Hello Irina", user: "Rob" },
      { msg: "Hey Rob", user: "Irina" }
    ], users: ["Rob", "Irina"]},
    {title: "Issues", history: [
      { msg: "Hello to issue channel", user: "Admin" },
    ], users: ["Admin"]},
  ])
  let [activeRoom, setActiveRoom] = useState(rooms[0])
  let [error, setError] = useState("")

    // ref to input chat message
  let inputMsg = useRef()
  let inputUser = useRef()
  let txtChat = useRef()


    // switch room in state 
  const switchRoom = (room) => {
    console.log(`Switched room to ${room.title}`)
    setActiveRoom(room)
    // TODO: join room centrally too
  }

  // send message to currently active room
  const sendMessage = () => {
    let msg = inputMsg.current.value;
    let user = inputUser.current.value;
    if(msg && user) {
      socket.emit("message", { msg, user, room: activeRoom.title })
      setError("")
    }
    else {
      console.log("Please provide username & message")
      setError("Please provide username & message")
    }
  }

  // add received message to chat history of given room
  const addMessageToHistory = ({msg, user, room}) => {

    // find room
    console.log("Attaching message to room: ", room)
    // update history state by creating a copy, update it & re-assign it
    let roomsCopy = [...rooms]
    let roomFound = roomsCopy.find(currentRoom => currentRoom.title == room)

    // add message to chat history array of given room
    if(roomFound) {
      console.log("Adding message: ", msg)
      roomFound.history.push({ msg, user, room})
      setRooms(roomsCopy)
    }
  }

  // connect to socket AFTER first render (=componentDidMount)
  // fetch rooms and store them into state
  useEffect(() => {

    // on message receipt: add to state
    // TODO: read room and add it to history
    socket.on("message", (objMsg) => {
      console.log("Socket ID: ", socket.id)
      console.log("YAAA! Message received: ", objMsg)
      if(objMsg.user && objMsg.msg) {
        addMessageToHistory(objMsg)
        // scroll to end of textarea
        txtChat.current.scrollTop = txtChat.current.scrollHeight;
      }
    })
  }, [])



  // UI rendering
	return (
		<div className="App">
			<header className="App-header">
				<p>Chat-App</p>
			</header>
			<main>
				<div className="chat">
					<div className="chat-rooms">
            Rooms
            <ul>
            {rooms.map(room => (
              <li key={room.title} onClick={(e) => switchRoom(room)}>{room.title}</li>
            ))}
            </ul>
          </div>
					<div className="chat-history">
            <div>{activeRoom.title ? activeRoom.title : "(no room active)" }</div>
              <textarea 
                autoComplete="off" placeholder="Chat messages..." 
                readOnly ref={txtChat}
              value={
                activeRoom.history.map(entry => (
                  `${entry.user}: ${entry.msg}`
                )).join("\n")
              } />
              <div className="chat-message">
                <input placeholder="Username..." 
                  autoComplete="off" type="text" id="user"  ref={inputUser} />
                <input placeholder="Write your message here..." 
                  autoComplete="off" type="text" id="message" ref={inputMsg} 
                />
	  						<button onClick={sendMessage}>Send</button>
              </div>
					</div>
				</div>
			</main>
      <div className="errors">{error}</div>
			<footer>&copy; My Chat Copyright</footer>
		</div>
	);
}

export default App;