import { FC, useState } from 'react';
import { Layer, Stage, Image, Rect as KonvaRect } from 'react-konva';
import useImage from 'use-image';
import { useWindowSize } from './hooks/useWindowSize';
import "./Crop.css";

type Props = {
  img: string;
  onRectChange: (rect: {x: number, y: number, width: number, height: number}) => void;
  onDragEnd: () => void;
};

type BackImageProps = {
  img: string;
}

const BackImage: FC<BackImageProps> = ({img}) => {
  const [image] = useImage(img);
  return <Image image={image} className={"preview-fullscreen"} />;
};

const Crop: FC<Props> =({ img, onRectChange, onDragEnd }) => {
  const { windowWidth, windowHeight } = useWindowSize();
  const [rect, setRect] = useState({x: 0, y: 0, width: 0, height: 0});
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = (e: any) => {
    setIsDragging(true);
    setRect({x: e.evt.x, y: e.evt.y, width: 0, height: 0});
  };

  const handleMouseMove = (e: any) => {
    if (!isDragging) return;
    const width = e.evt.x - rect.x;
    const height = e.evt.y - rect.y;
    setRect({ ...rect, width: width, height: height });
    onRectChange(rect);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    onDragEnd();
  };

  return (
    <Stage
      width={windowWidth}
      height={windowHeight}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className={"cursor-crosshair"}
    >
      <Layer>
        <BackImage img={img} />
      </Layer>
      <Layer>
        <KonvaRect
          x={0}
          y={0}
          width={windowWidth}
          height={windowWidth}
          fill={'rgba(0,0,0,0.5)'}
          opacity={0.8}
          listening={false}
        />
      </Layer>
      <Layer>
        <KonvaRect
          x={rect.x}
          y={rect.y}
          width={rect.width}
          height={rect.height}
          fill={'rgba(255,255,255,0.5)'}
          opacity={0.6}
          listening={true}
        />
      </Layer>
    </Stage>
  );
};

export default Crop;
