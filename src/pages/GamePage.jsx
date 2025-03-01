import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import GameCanvas from "../components/Gamecanvas";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

const GamePage = () => {
  const [assignment, setAssignment] = useState(null);

  useEffect(() => {
    socket.on("load_assignment", (data) => {
      console.log("📩 Received assignment:", data);
      setAssignment(data);
    });

    return () => {
      socket.off("load_assignment");
    };
  }, []);

  return (
    <div>
      {assignment ? (
        <div>
          <h2>{assignment.name}</h2>
          {assignment.objects.map((obj, index) => (
            <GameCanvas
              key={index}
              imageSrc={obj.imageSrc}
              initialPosition={obj.position}
              shadowPosition={obj.shadowPosition} // ✅ Pass shadowPosition here
              socket={socket}
            />
          ))}
        </div>
      ) : (
        <h2>Waiting for assignment...</h2>
      )}
    </div>
  );
};

export default GamePage;