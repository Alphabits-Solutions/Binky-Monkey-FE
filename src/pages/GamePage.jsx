import React from "react";
import { useLocation } from "react-router-dom";
import GameCanvas from "../components/Gamecanvas";

const GamePage = () => {
  const { state } = useLocation();
  const assignment = state?.assignment;

  if (!assignment) {
    return <div>No game selected</div>;
  }

  return (
    <div>
      <h1>{assignment.name}</h1>
      {assignment.objects.map((obj, index) => (
        <GameCanvas
          key={index}
          imageSrc={obj.imageSrc}
          imagePosition={obj.position}
          setImagePosition={(newPos) => {
            console.log("New position:", newPos);
          }}
        />
      ))}
    </div>
  );
};

export default GamePage;