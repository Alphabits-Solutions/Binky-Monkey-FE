import React, { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Image as KonvaImage } from 'react-konva';

const GameCanvas = ({ imageSrc, imagePosition = { x: 0, y: 0 }, setImagePosition }) => {
    const [image, setImage] = useState(null);
    const [isVibrating, setIsVibrating] = useState(false);
    const shadowRef = useRef(null);
    const imageRef = useRef(null);

    useEffect(() => {
        const img = new window.Image();
        img.src = imageSrc;
        img.onload = () => setImage(img);
    }, [imageSrc]);

    const vibrate = (node) => {
        if (!node) return;

        const amplitude = 5; // How far the image moves
        const duration = 100; // Duration of each vibration step
        const steps = 10; // Number of steps in the vibration

        let step = 0;
        const interval = setInterval(() => {
            if (step >= steps) {
                clearInterval(interval);
                node.x(imagePosition.x);
                node.y(imagePosition.y);
                setIsVibrating(false);
                return;
            }

            const offsetX = (Math.random() - 0.5) * amplitude * 2;
            const offsetY = (Math.random() - 0.5) * amplitude * 2;

            node.x(imagePosition.x + offsetX);
            node.y(imagePosition.y + offsetY);

            step++;
        }, duration);
    };

    const handleDragEnd = (e) => {
        const newPos = { x: e.target.x(), y: e.target.y() };
        setImagePosition(newPos); // Update the image position in the parent component

        const shadow = shadowRef.current;
        if (shadow) {
            const offsetX = e.target.x() - shadow.x();
            const offsetY = e.target.y() - shadow.y();

            if (Math.abs(offsetX) < 20 && Math.abs(offsetY) < 20) {
                alert("Congratulations! You've placed the image correctly.");
            } else {
                setIsVibrating(true);
                vibrate(e.target);
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
                        x={200}
                        y={200}
                        opacity={0.5}
                        filters={[Konva.Filters.Grayscale, Konva.Filters.Blur]}
                    />
                )}
                {/* Draggable Image */}
                {image && (
                    <KonvaImage
                        ref={imageRef}
                        image={image}
                        x={imagePosition.x}
                        y={imagePosition.y}
                        draggable
                        onDragEnd={handleDragEnd}
                    />
                )}
            </Layer>
        </Stage>
    );
};

export default GameCanvas;