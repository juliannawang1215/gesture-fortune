import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";
import {
  useEffect,
  useRef,
  useState,
  useCallback,
  type RefObject,
} from "react";
import { ShakeDetector } from "../lib/ShakeDetector";

export function useHandTracker(
  videoRef: RefObject<HTMLVideoElement | null>,
  onShake: (intensity: number) => void,
) {
  const [isReady, setIsReady] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<
    boolean | null
  >(null);
  const [isHandVisible, setIsHandVisible] = useState(false);

  const landmarkerRef = useRef<HandLandmarker | null>(null);
  const shakeDetectorRef = useRef(new ShakeDetector());
  const animationFrameId = useRef<number | null>(null);
  const isVideoPlaying = useRef(false);

  // Initialize MediaPipe
  useEffect(() => {
    let active = true;

    async function initHandLandmarker() {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm",
        );

        if (!active) return;

        const landmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numHands: 1,
        });

        if (!active) {
          landmarker.close();
          return;
        }

        landmarkerRef.current = landmarker;
        setIsReady(true);
      } catch (err) {
        console.error("Failed to initialize hand landmarker:", err);
      }
    }

    initHandLandmarker();

    shakeDetectorRef.current.onShake((event) => {
      onShake(event.intensity);
    });

    return () => {
      active = false;
      if (landmarkerRef.current) {
        landmarkerRef.current.close();
      }
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [onShake]);

  const requestCamera = useCallback(async () => {
    if (!videoRef.current) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
      videoRef.current.srcObject = stream;

      const onPlay = () => {
        isVideoPlaying.current = true;
        setHasCameraPermission(true);
      };

      videoRef.current.addEventListener("loadedmetadata", onPlay);
      videoRef.current.addEventListener("playing", onPlay);

      videoRef.current.play().catch(console.warn);
    } catch (err) {
      console.warn(
        "Camera access denied or unavailable. Fallback controls (click/shake) can be used.",
        err,
      );
      setHasCameraPermission(false);
    }
  }, [videoRef]);

  useEffect(() => {
    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [videoRef]);

  // Main Detection Loop
  useEffect(() => {
    let lastVideoTime = -1;

    function renderLoop() {
      if (
        !isReady ||
        !videoRef.current ||
        !landmarkerRef.current ||
        !isVideoPlaying.current ||
        videoRef.current.videoWidth === 0
      ) {
        animationFrameId.current = requestAnimationFrame(renderLoop);
        return;
      }

      const video = videoRef.current;
      const startTimeMs = performance.now();

      if (lastVideoTime !== video.currentTime) {
        lastVideoTime = video.currentTime;
        const result = landmarkerRef.current.detectForVideo(video, startTimeMs);

        if (result.landmarks && result.landmarks.length > 0) {
          setIsHandVisible(true);
          // Landmark 9 is the middle finger MCP (base of middle finger)
          const palm = result.landmarks[0][9] || result.landmarks[0][0]; // fallback to wrist
          if (palm) {
            shakeDetectorRef.current.addLandmark(palm.x, palm.y, startTimeMs);
          }
        } else {
          setIsHandVisible(false);
        }
      }

      animationFrameId.current = requestAnimationFrame(renderLoop);
    }

    if (isReady && hasCameraPermission) {
      renderLoop();
    }

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isReady, hasCameraPermission, videoRef]);

  return {
    isReady,
    hasCameraPermission,
    isHandVisible,
    requestCamera,
    shakeDetector: shakeDetectorRef.current,
  };
}
