import type { FC } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useMediaQuery, useUpdateEffect, useWindowSize } from 'usehooks-ts';

type Props = {
  currentTime: number;
  setLength: number;
  progressLineFrozen: boolean;

  getAudioVisualizerData: (() => Uint8Array) | null;
};

export const AudioCanvas: FC<Props> = ({
  currentTime,
  setLength,
  progressLineFrozen,

  getAudioVisualizerData,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  const [sizeMultiplier, setSizeMultiplier] = useState(1);

  const renderedAt = performance.now();

  const animationRequestIdRef = useRef<number>();

  const { width, height } = useWindowSize();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const scale = window.devicePixelRatio;

    canvas.width = width * scale;
    canvas.height = height * scale;

    const sizeMultiplier =
      window.devicePixelRatio * Math.min(1, width / 500, height / 800);

    setSizeMultiplier(sizeMultiplier);

    // canvas properties must be reset after canvas is resized
    ctx.lineWidth = 4 * sizeMultiplier;
    const color = '#fff';
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
  }, [height, width]);

  const getCirclePoint = useCallback(
    (i: number, end: number, dataArray: Uint8Array, grow: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return [0, 0];

      const midX = canvas.width / 2;
      const midY = canvas.height / 2;

      const loudness = dataArray[i + 10];

      const p1 = 0.1275;
      const p2 = 2;
      const p3 = 0.168;
      const p4 = 0.18;
      const p5 = 120;

      const distanceFromCenter =
        (grow * p1 + p2) *
        (loudness * ((i / end) * p3 + p4) + p5) *
        sizeMultiplier;

      const angleAroundCircle = 2 * Math.PI * (0.5 + (1 - i / end) ** 1.5);

      const x = midX + Math.sin(angleAroundCircle) * distanceFromCenter;
      const y = midY + Math.cos(angleAroundCircle) * distanceFromCenter;

      return [x, y];
    },
    [sizeMultiplier]
  );

  const drawCircle = useCallback(
    (dataArray: Uint8Array, grow: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const midX = canvas.width / 2;
      const midY = canvas.height / 2;

      // draw waves
      ctx.beginPath();
      const end = dataArray.length * 0.43;
      let [x, y] = getCirclePoint(0, end, dataArray, grow);
      let [xNext, yNext] = getCirclePoint(1, end, dataArray, grow);
      for (let i = 1; i < end + 1; i += 1) {
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          const xc = (x + xNext) / 2;
          const yc = (y + yNext) / 2;
          ctx.quadraticCurveTo(x, y, xc, yc);
        }
        [x, y] = [xNext, yNext];
        [xNext, yNext] = getCirclePoint(i + 1, end, dataArray, grow);
      }
      ctx.fill();

      // clear center of circle
      ctx.save();
      ctx.beginPath();

      const p1 = 22.95;
      const p2 = 290;

      const radius = (grow * p1 + p2) * sizeMultiplier;

      ctx.arc(midX, midY, radius, 0, 2 * Math.PI);

      ctx.clip();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
    },
    [getCirclePoint, sizeMultiplier]
  );

  const calculateProgress = useCallback(() => {
    let time: number;
    if (progressLineFrozen) {
      time = currentTime;
    } else {
      const delayMs = performance.now() - renderedAt;
      time = currentTime + delayMs / 1000;
    }

    const result = time / setLength;
    if (result > 1) return 1;
    return result;

    // Excluding `renderedAt` is needed to make the line animate smoothly
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTime, progressLineFrozen, setLength]);

  const drawProgress = useCallback(
    (grow: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const progress = calculateProgress();
      if (progress === undefined) return;

      const midX = canvas.width / 2;
      const midY = canvas.height / 2;

      const p1 = 12.75;
      const p2 = 280;

      const distance = (grow * p1 + p2) * sizeMultiplier;

      const angleStart = Math.PI * -0.5;
      const progressAngle = 2 * Math.PI * progress;

      // progress line
      ctx.beginPath();
      ctx.arc(midX, midY, distance, angleStart, angleStart + progressAngle);
      ctx.stroke();

      const dotRadius = 7 * sizeMultiplier;

      // start dot
      ctx.beginPath();
      ctx.arc(midX, midY - distance, dotRadius, 0, 2 * Math.PI);
      ctx.fill();

      // end dot
      ctx.beginPath();
      ctx.arc(
        midX + Math.sin(progressAngle) * distance,
        midY - Math.cos(progressAngle) * distance,
        dotRadius,
        0,
        2 * Math.PI
      );
      ctx.fill();
    },
    [calculateProgress, sizeMultiplier]
  );

  const animate = useCallback(() => {
    if (!getAudioVisualizerData) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const dataArray = getAudioVisualizerData();

    const grow = reduceMotion ? 0 : calcGrow(dataArray);
    if (!reduceMotion) drawCircle(dataArray, grow);
    drawProgress(grow);

    animationRequestIdRef.current = requestAnimationFrame(animate);
  }, [drawCircle, drawProgress, getAudioVisualizerData, reduceMotion]);

  useUpdateEffect(() => {
    if (animationRequestIdRef.current) {
      cancelAnimationFrame(animationRequestIdRef.current);
    }

    animate();

    return () => {
      if (animationRequestIdRef.current) {
        cancelAnimationFrame(animationRequestIdRef.current);
      }
    };
  }, [animate]);

  return <canvas ref={canvasRef} className="full-page"></canvas>;
};

function calcGrow(dataArray: Uint8Array) {
  const average = dataArray.slice(0, 5).reduce((a, b) => a + b) / 5;
  return average / 255;
}
