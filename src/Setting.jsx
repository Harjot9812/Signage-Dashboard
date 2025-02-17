import React, { useEffect, useState } from 'react';
import { ChromePicker } from 'react-color';  // Import ChromePicker
import { Button, IconButton } from 'blocksin-system';
import { TrashIcon } from 'sebikostudio-icons';

export default function Setting({ canvas }) {
  const [selectedObject, setSelectedObject] = useState(null);
  const [color, setColor] = useState("");

  useEffect(() => {
    if (canvas) {
      canvas.on("selection:created", (event) => handleObjectSelection(event.selected[0]));
      canvas.on("selection:updated", (event) => handleObjectSelection(event.selected[0]));
      canvas.on("selection:cleared", () => clearSettings());
      canvas.on("object:modified", (event) => handleObjectSelection(event.target));
    }
  }, [canvas]);

  const handleObjectSelection = (object) => {
    if (!object) return;
    setSelectedObject(object);
    setColor(object.fill || "#000000");
  };

  const clearSettings = () => {
    setSelectedObject(null);
    setColor("");
  };

  const handleColorChange = (color) => {
    setColor(color.hex); // Update state with selected color hex value
    if (selectedObject) {
      selectedObject.set({ fill: color.hex });
      canvas.renderAll();
    }
  };

  const handleDeleteObject = () => {
    if (selectedObject && canvas) {
      canvas.remove(selectedObject);
      clearSettings();
      canvas.renderAll();
    }
  };

  return (
    <div className="settings-panel">
      {selectedObject && (
        <>
          <label>Change Color:</label>
          <ChromePicker
            color={color} // Controlled color state
            onChange={handleColorChange}  // Update color when picked
          />
          <IconButton onClick={handleDeleteObject} size="medium">
          <TrashIcon />
        </IconButton>
        </>
      )}
    </div>
  );
}
