import React, { useRef, useState, useEffect } from "react";
import { Stage, Layer, Image as KonvaImage } from "react-konva";

const AssignmentCanvas = ({ imageSrc, imagePosition, setImagePosition, shadowPosition, setShadowPosition }) => {
    const [image, setImage] = useState(null);
    const imageRef = useRef(null);
    const shadowRef = useRef(null);

    useEffect(() => {
        const img = new window.Image();
        img.src = imageSrc;
        img.onload = () => setImage(img);
    }, [imageSrc]);

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
                        draggable
                        onDragEnd={(e) => setShadowPosition({ x: e.target.x(), y: e.target.y() })}
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
                        onDragEnd={(e) => setImagePosition({ x: e.target.x(), y: e.target.y() })}
                    />
                )}
            </Layer>
        </Stage>
    );
};

export default AssignmentCanvas;
