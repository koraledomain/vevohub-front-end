import React, { useState, useRef } from "react";
import { Stage, Layer, Line } from "react-konva";
import Konva from "konva";
import { Box, Button, Stack } from "@mui/material";

type Point = {
  x: number;
  y: number;
};

type SignatureComponentProps = {
  disabled?: boolean;
  id?: string;
  width?: number;
  height?: number;
  onSignatureChange?: (signature: string) => void;
};

export default function SignatureComponent({
                                             disabled = false,
                                             id = "",
                                             width = 400,
                                             height = 200,
                                             onSignatureChange,
                                           }: SignatureComponentProps) {
  const [lines, setLines] = useState<Array<Point[]>>([]);
  const isDrawing = useRef(false);
  const stageRef = useRef<Konva.Stage | null>(null);

  const handleMouseDown = (e: any) => {
    if (disabled) return;
    isDrawing.current = true;
    const stage = e.target.getStage();
    if (stage) {
      const pos = stage.getPointerPosition();
      if (pos) {
        setLines([...lines, [pos]]);
      }
    }
  };

  const handleMouseMove = (e: any) => {
    if (!isDrawing.current || disabled) return;

    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    if (point) {
      const lastLine = lines[lines.length - 1].concat([point]);
      setLines(lines.slice(0, -1).concat([lastLine]));
    }
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
    if (onSignatureChange) {
      const stage = stageRef.current;
      if (stage) {
        try {
          const signature = stage.toDataURL();
          onSignatureChange(signature);
        } catch (err) {
          console.error("Error generating signature:", err);
        }
      }
    }
  };

  const handleClear = () => {
    setLines([]);
    if (onSignatureChange) {
      onSignatureChange("");
    }
  };

  return (
    <Box
      sx={{
        border: "1px solid #ccc",
        borderRadius: 1,
        bgcolor: "background.paper",
        overflow: "hidden",
      }}
    >
      <Stage
        ref={stageRef}
        width={width}
        height={height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          cursor: disabled ? "default" : "crosshair",
          backgroundColor: disabled ? "#f5f5f5" : "#fff",
        }}
      >
        <Layer>
          {lines.map((line, i) => (
            <Line
              key={i}
              points={line.flatMap((p) => [p.x, p.y])}
              stroke="#000"
              strokeWidth={2}
              tension={0.5}
              lineCap="round"
              lineJoin="round"
            />
          ))}
        </Layer>
      </Stage>
      {!disabled && (
        <Stack
          direction="row"
          spacing={2}
          sx={{ p: 1, bgcolor: "background.neutral" }}
        >
          <Button
            size="small"
            variant="contained"
            color="error"
            onClick={handleClear}
          >
            Clear
          </Button>
        </Stack>
      )}
    </Box>
  );
}
