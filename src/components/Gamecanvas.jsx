import React, { useRef, useState, useEffect } from "react";
import { Stage, Layer, Image as KonvaImage } from "react-konva";

const GameCanvas = ({ imageSrc, initialPosition, shadowPosition, socket }) => {
    const [image, setImage] = useState(null);
    const [position, setPosition] = useState(initialPosition);
    const [isVibrating, setIsVibrating] = useState(false);
    const shadowRef = useRef(null);
    const imageRef = useRef(null);

    useEffect(() => {
        const img = new window.Image();
        img.src = imageSrc;
        img.onload = () => setImage(img);
    }, [imageSrc]);

    const vibrate = (node, callback) => {
        if (!node) return;
    
        const amplitude = 5;
        const duration = 50;
        const steps = 6;
    
        let step = 0;
        const initialX = node.x();
        const initialY = node.y();
    
        const interval = setInterval(() => {
            if (step >= steps) {
                clearInterval(interval);
                callback?.(); // 🔹 Ensure callback fires after vibration
                return;
            }
    
            const offsetX = (Math.random() - 0.5) * amplitude * 2;
            const offsetY = (Math.random() - 0.5) * amplitude * 2;
    
            node.x(initialX + offsetX);
            node.y(initialY + offsetY);
    
            step++;
        }, duration);
    }; 

    // useEffect(() => {
    //     socket?.on("position_updated", ({ imageSrc: updatedSrc, position }) => {
    //         if (updatedSrc === imageSrc) {
    //             setPosition(position);
    //         }
    //     });

    //     // Listen for the vibrate event from the server
    //     socket?.on("vibrate_image", ({ imageSrc: vibrateSrc }) => {
    //         if (vibrateSrc === imageSrc) {
    //             setIsVibrating(true);
    //             vibrate(imageRef.current);
    //         }
    //     });

    //     return () => {
    //         socket?.off("position_updated");
    //         socket?.off("vibrate_image");
    //     };
    // }, [socket, imageSrc]);
    // useEffect(() => {
    //     socket?.on("position_updated", ({ imageSrc: updatedSrc, position }) => {
    //         if (updatedSrc === imageSrc) {
    //             setPosition(position);
    //         }
    //     });
    
    //     socket?.on("vibrate_image", () => { // 🔹 No data, just trigger function
    //         // if (imageRef.current) {
    //             console.log("Emitted vibrate_image event..............");
    //             setIsVibrating(true);
    //             vibrate(imageRef.current, () => {
    //                 setIsVibrating(false);
    //             });
    //             setIsVibrating(true);
    //             vibrate(e.target, () => {
    //                 setIsVibrating(false);
    //             });
    //         // }
    //     });
    
    //     return () => {
    //         socket?.off("position_updated");
    //         socket?.off("vibrate_image");
    //     };
    // }, [socket, imageSrc]);

    useEffect(() => {
        if (!socket) return; // Ensure socket exists
    
        const handleVibration = ({ imageSrc: vibrateSrc }) => {
            if (vibrateSrc === imageSrc) {
                console.log("🔥 Received vibrate_image event for:", vibrateSrc);
                setIsVibrating(true);
                vibrate(imageRef.current, () => {
                    setIsVibrating(false);
                });
            }
        };

        const handleCorrectPlacement = ({ imageSrc: placedSrc }) => {
            if (placedSrc === imageSrc) {
                alert("Congratulations! You've placed the image correctly.");
            }
        };
    
    
        socket.on("position_updated", ({ imageSrc: updatedSrc, position }) => {
            if (updatedSrc === imageSrc) {
                setPosition(position);
            }
        });
    
        socket.on("vibrate_image", handleVibration);

        socket.on("image_correctly_placed", handleCorrectPlacement);
        
    
        return () => {
            socket.off("position_updated");
            socket.off("vibrate_image", handleVibration);
            socket.off("image_correctly_placed", handleCorrectPlacement);
        };
    }, [socket, imageSrc]);
    

    const handleDragEnd = (e) => {
        const newPos = { x: e.target.x(), y: e.target.y() };
        setPosition(newPos);
        socket.emit("update_position", { imageSrc, position: newPos });
    
        const shadow = shadowRef.current;
        if (shadow) {
            const offsetX = newPos.x - shadow.x();
            const offsetY = newPos.y - shadow.y();
    
            if (Math.abs(offsetX) < 20 && Math.abs(offsetY) < 20) {
                console.log("✅ Image placed correctly!");
                alert("Congratulations! You've placed the image correctly.");
                 // 🔹 Emit event to notify all clients
            socket.emit("image_correctly_placed", { imageSrc });
            } else {
                console.log("❌ Image placed incorrectly! Vibrating...");
                setIsVibrating(true);
                vibrate(e.target, () => {
                    setIsVibrating(false);
                });
    
                console.log("📡 Emitting vibrate_image event...");
                socket.emit("vibrate_image", { imageSrc });
            }
        }
    }; 

    return (
        <Stage width={window.innerWidth} height={window.innerHeight}>
            <Layer>
                {/* Shadow */}
                {image && (
                    <KonvaImage
                        ref={shadowRef}
                        image={image}
                        x={shadowPosition.x}
                        y={shadowPosition.y}
                        opacity={0.3}
                    />
                )}
                {/* Draggable Image */}
                {image && (
                    <KonvaImage
                        ref={imageRef}
                        image={image}
                        x={position.x}
                        y={position.y}
                        draggable
                        onDragEnd={handleDragEnd}
                    />
                )}
            </Layer>
        </Stage>
    );
};

export default GameCanvas;
