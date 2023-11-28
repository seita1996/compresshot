import Konva from 'konva';
import { FC } from 'react';
import { Layer, Stage, Shape, Image } from 'react-konva';
import useImage from 'use-image';
import { useWindowSize } from './hooks/useWindowSize';
import "./Crop.css";

type Props = {
  x: number;
  y: number;
  width: number;
  height: number;
  img: string;
};

type BackImageProps = {
  img: string;
}

const BackImage: FC<BackImageProps> = ({img}) => {
  const [image] = useImage(img);
  return <Image image={image} className={"preview-fullscreen"} />;
};

const Crop: FC<Props> =({ x, y, width, height, img }) => {
  const { windowWidth, windowHeight } = useWindowSize();
  return (
    <Stage width={windowWidth} height={windowHeight}>
      <Layer>
        <BackImage img={img} />
      </Layer>
      <Layer>
        <Shape
          width={windowWidth}
          height={windowHeight}
          fill={'rgba(0,0,0,0.5)'}
          opacity={0.6}
          sceneFunc={(ctx: Konva.Context, shape: Konva.Shape) => {
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(shape.width(), 0);
            ctx.lineTo(shape.width(), shape.height());
            ctx.lineTo(0, shape.height());
            ctx.lineTo(0, 0);
            ctx.closePath();
            ctx.fill();
            ctx.clearRect(x, y, width, height);
            ctx.fillStrokeShape(shape);
          }}
          listening={false}
        />
      </Layer>
    </Stage>
  );
};

export default Crop;