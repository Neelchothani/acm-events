import { useFrame } from '@react-three/fiber';
import { useScroll } from '@react-three/drei';
import { useScrollBridge } from '../../store/useScrollBridge';

/**
 * Lives inside <ScrollControls>. Writes scroll.offset into the zustand bridge
 * every frame so DOM-side components outside the Canvas can react to it.
 * Renders nothing.
 */
export const ScrollSync = () => {
  const scroll = useScroll();

  useFrame(() => {
    useScrollBridge.setState({ offset: scroll.offset });
  });

  return null;
};
