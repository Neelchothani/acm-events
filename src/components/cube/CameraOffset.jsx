import React, { useEffect } from 'react';
import { useThree } from '@react-three/fiber';

/**
 * Shifts the camera's view frustum horizontally without moving the camera.
 * A positive offsetX moves the frustum center to the RIGHT on screen,
 * which pushes all 3D objects to the RIGHT half of the canvas.
 *
 * offsetX = 300 means the scene is rendered as if the viewport center is
 * 300px to the right of the canvas center.
 */
export const CameraOffset = ({ offsetX = 0 }) => {
  const { camera, size } = useThree();

  useEffect(() => {
    camera.setViewOffset(
      size.width,               // fullWidth
      size.height,              // fullHeight
      -offsetX,                 // x: negative shifts center right
      0,                        // y: no vertical shift
      size.width,               // width
      size.height               // height
    );
    camera.updateProjectionMatrix();

    return () => {
      camera.clearViewOffset();
      camera.updateProjectionMatrix();
    };
  }, [camera, size.width, size.height, offsetX]);

  return null;
};
