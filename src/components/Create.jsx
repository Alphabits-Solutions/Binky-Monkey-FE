import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import GameCanvas from "./Gamecanvas";

const Create = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const selectedImages = location.state?.selectedImages || [];

    const [imageSrc, setImageSrc] = useState(selectedImages.length > 0 ? selectedImages[0] : null);
    const [imagePosition, setImagePosition] = useState({ x: 50, y: 50 });

    const saveGame = async () => {
        const gameName = prompt("Enter a name for your game:");

        if (!gameName) {
            alert("Game name is required!");
            return;
        }

        const gameData = {
            name: gameName,
            objects: [
                {
                    imageSrc: imageSrc,
                    position: imagePosition,
                },
            ],
        };

        try {
            const response = await axios.post("http://localhost:5000/assignment", gameData);
            if (response.data.success) {
                alert("Game saved successfully!");
                navigate("/"); // Redirect to home page or assignments list
            } else {
                alert("Failed to save game.");
            }
        } catch (error) {
            console.error("Error saving game:", error);
            alert("An error occurred while saving the game.");
        }
    };

    return (
        <div>
            <h1>Create Game</h1>
            {imageSrc && (
                <GameCanvas
                    imageSrc={imageSrc}
                    imagePosition={imagePosition}
                    setImagePosition={setImagePosition}
                />
            )}
            <button onClick={saveGame}>Save Game</button>
        </div>
    );
};

export default Create;
