import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import * as GaussianSplats3D from "@mkkellogg/gaussian-splats-3d";
import { Loader2, RotateCcw } from "lucide-react";

interface GaussianSplatViewerProps {
  plyUrl: string;
}

export function GaussianSplatViewer({ plyUrl }: GaussianSplatViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [loadInfo, setLoadInfo] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [sceneInfo, setSceneInfo] = useState<any>(null);
  const [upVector, setUpVector] = useState<[number, number, number]>([0, 1, 0]);
  const [modelRotation, setModelRotation] = useState<
    [number, number, number, number]
  >([1, 0, 0, 0]);
  const [modelCenter, setModelCenter] = useState<
    [number, number, number] | null
  >(null);

  const toggleUp = () => {
    const next: [number, number, number] =
      upVector[1] === -1 ? [0, 1, 0] : [0, -1, 0];
    setUpVector(next);
    addLog(`切换 Up 向量为: [${next.join(", ")}] (将自动重启)`);
  };

  const rotateMeshX = () => {
    setModelRotation((prev) => {
      const isFlipped = prev[0] === 1;
      addLog(`模型 X 轴翻转切换: ${isFlipped ? "正常" : "反转"}`);
      return isFlipped ? [0, 0, 0, 1] : [1, 0, 0, 0];
    });
  };

  const rotateMeshY = () => {
    setModelRotation((prev) => {
      const isFlipped = prev[1] === 1;
      addLog(`模型 Y 轴翻转切换: ${isFlipped ? "正常" : "反转"}`);
      return isFlipped ? [0, 0, 0, 1] : [0, 1, 0, 0];
    });
  };

  const rotateMeshZ = () => {
    setModelRotation((prev) => {
      const isFlipped = prev[2] === 1;
      addLog(`模型 Z 轴翻转切换: ${isFlipped ? "正常" : "反转"}`);
      return isFlipped ? [0, 0, 0, 1] : [0, 0, 1, 0];
    });
  };

  const calculateCenter = () => {
    const v = viewerRef.current;
    if (!v) return;
    try {
      const splatMesh = v.getSplatMesh();
      if (splatMesh) {
        addLog(`获取到 SplatMesh 对象。`);

        const center = splatMesh.calculatedSceneCenter;
        const dist = splatMesh.maxSplatDistanceFromSceneCenter;

        if (center && typeof dist !== "undefined") {
          addLog(
            `内置 sceneCenter: [${center.x.toFixed(2)}, ${center.y.toFixed(2)}, ${center.z.toFixed(2)}]`,
          );
          addLog(`最大渲染边界半径: ${dist.toFixed(2)}`);

          setModelCenter([center.x, center.y, center.z]);
          const viewDist = Math.max(dist * 2.5, 5); // back away enough
          setView(
            [center.x, center.y + dist * 0.5, center.z + viewDist],
            [center.x, center.y, center.z],
          );
        } else {
          addLog("无法读取 splatMesh 内置变量");
        }
      } else {
        addLog("未检测到 SplatMesh");
      }
    } catch (e) {
      addLog(`计算失败: ${String(e)}`);
    }
  };

  const addLog = (msg: string) => {
    console.log(`[ViewerLog] ${msg}`);
    setDebugLogs((prev) => [
      ...prev.slice(-9),
      `${new Date().toLocaleTimeString()}: ${msg}`,
    ]);
  };

  useEffect(() => {
    if (!containerRef.current || !plyUrl) return;

    let mounted = true;
    let viewer: any = null;

    addLog(`初始化加载流程... URL: ${plyUrl.substring(0, 50)}...`);

    const getDirectUrl = (url: string) => {
      if (!url) return "";
      let cleaned = url.trim();
      if (cleaned.includes("huggingface.co")) {
        cleaned = cleaned
          .replace("/blob/", "/resolve/")
          .replace("/viewer/", "/resolve/")
          .split("?")[0];
      }
      return cleaned;
    };

    const targetUrl = getDirectUrl(plyUrl);

    const initViewer = async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      if (!mounted) return;

      try {
        addLog("检查网络连接...");
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        try {
          const resp = await fetch(targetUrl, {
            method: "HEAD",
            mode: "cors",
            signal: controller.signal,
          });
          clearTimeout(timeoutId);
          addLog(
            `连接测试: ${resp.ok ? "成功" : "失败 (" + resp.status + ")"}`,
          );
        } catch (e) {
          addLog(`连接测试报错: ${String(e)}`);
        }

        addLog("正在构造 Viewer 实例...");
        addLog(
          `容器尺寸: ${containerRef.current.clientWidth}x${containerRef.current.clientHeight}`,
        );

        viewer = new GaussianSplats3D.Viewer({
          rootElement: containerRef.current,
          cameraUp: upVector,
          initialCameraPosition: [0, 0, 3],
          initialCameraLookAt: [0, 0, 0],
          sphericalHarmonicsDegree: 0,
          maxSceneImportSize: 1024 * 1024 * 1024,
          antialiased: true,
          gpuAccelerated: true,
          sharedMemoryForWorkers: false,
          workerCount: 1,
          dynamicScene: false,
        });

        if (!mounted) {
          viewer.dispose();
          return;
        }

        viewerRef.current = viewer;
        addLog("Viewer 构造完毕，开始解析场景...");

        await viewer.addSplatScene(targetUrl, {
          rotation: modelRotation,
          progressiveLoad: true,
          splatAlphaRemovalThreshold: 0,
          showLoadingUI: false,
          onProgress: (p: number, current: number, total: number) => {
            if (!mounted) return;
            const progressVal = Math.max(
              0,
              Math.min(100, Math.round(p * 100) || 0),
            );
            setProgress(progressVal);

            if (progressVal % 25 === 0) addLog(`数据下载进度: ${progressVal}%`);

            const curVal = Number(current) || 0;
            const totVal = Number(total) || 0;
            if (totVal > 0) {
              setLoadInfo(
                `正在载入: ${(curVal / 1024 / 1024).toFixed(1)}MB / ${(totVal / 1024 / 1024).toFixed(1)}MB`,
              );
            }
          },
        });

        if (!mounted) return;
        addLog("场景数据加载完成，开始准备渲染");
        setProgress(100);
        setLoadInfo("意境还原成功，准备入场...");

        await new Promise((resolve) => setTimeout(resolve, 800));

        if (!mounted) return;
        setIsLoading(false);
        addLog("关闭加载层，启动渲染循环");

        setTimeout(() => {
          if (viewer && mounted) {
            try {
              viewer.start();
              addLog("Renderer 启动循环开启");

              const splatMesh = viewer.getSplatMesh();
              if (splatMesh) {
                const count = splatMesh.getSplatCount();
                addLog(`点云数据确认: ${count.toLocaleString()} 点`);

                // Force bounding box calculation
                if (splatMesh.geometry) {
                  splatMesh.geometry.computeBoundingBox();
                  const bbox = splatMesh.geometry.boundingBox;
                  if (bbox) {
                    addLog(
                      `边界范围: min(${bbox.min.x.toFixed(1)}, ${bbox.min.y.toFixed(1)}), max(${bbox.max.x.toFixed(1)}, ${bbox.max.y.toFixed(1)})`,
                    );
                  }
                }

                setSceneInfo({
                  points: count,
                  scenes: 1,
                });
              } else {
                addLog("警告: 未找到渲染网格");
              }
              if (viewer.controls) viewer.controls.update();
            } catch (e) {
              addLog(`启动错误: ${String(e)}`);
            }
          }
        }, 200);
      } catch (err: any) {
        if (!mounted) return;
        const errMsg = err?.message || String(err);
        addLog(`严重错误: ${errMsg}`);
        setError(`无法加载: ${errMsg}`);
        setIsLoading(false);
      }
    };

    initViewer();

    return () => {
      mounted = false;
      addLog("组件卸载，清理资源");
      if (viewer) {
        try {
          // Prevent the library from throwing "Failed to execute 'removeChild' on 'Node'"
          // It incorrectly assumes rootElement is a child of document.body
          const originalRemoveChild = document.body.removeChild;
          const safeRemoveChild = function (node: Node): Node {
            if (node.parentNode !== document.body) {
              return node; // Ignore removing nodes that aren't children of body
            }
            return originalRemoveChild.call(document.body, node);
          };
          
          document.body.removeChild = safeRemoveChild as any;

          viewer.dispose().finally(() => {
            if (document.body.removeChild === safeRemoveChild as any) {
              document.body.removeChild = originalRemoveChild;
            }
          });
          viewerRef.current = null;
        } catch (e) {}
      }
    };
  }, [plyUrl, upVector, modelRotation]);

  const setView = (
    pos: [number, number, number],
    target: [number, number, number] = [0, 0, 0],
  ) => {
    const v = viewerRef.current;
    if (v && v.camera && v.controls) {
      try {
        v.camera.position.set(...pos);
        v.controls.target.set(...target);
        v.controls.update();
        addLog(`视角切换至: [${pos.join(", ")}]`);
      } catch (e) {
        addLog(`切换失败: ${String(e)}`);
      }
    } else {
      addLog("无法获取相机或控制器");
    }
  };

  const handleResetCamera = () => {
    if (modelCenter) {
      setView(
        [modelCenter[0], modelCenter[1], modelCenter[2] + 3],
        modelCenter,
      );
    } else {
      setView([0, 0, 3]);
    }
  };

  if (!plyUrl) {
    return (
      <div className="absolute inset-0 z-0 bg-[#0c0c0c] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 mb-6 opacity-20">
          <RotateCcw className="w-full h-full text-[#f4ebd9]" />
        </div>
        <p className="text-[#f4ebd9]/60 font-serif mb-4">
          尚未连接灵隐寺 3D 场景
        </p>
        <p className="text-[#f4ebd9]/40 text-xs max-w-xs leading-relaxed">
          请在设置中配置有效的 .ply 或 .splat 文件直链以开启沉浸式祈福体验。
        </p>
      </div>
    );
  }

  return (
    <div
      className="absolute inset-0 z-0 bg-[#0c0c0c] overflow-hidden touch-none"
      style={{ contain: "layout size" }}
    >
      <div ref={containerRef} className="w-full h-full pointer-events-auto" />

      {isLoading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md text-[#f4ebd9]">
          <Loader2 className="w-10 h-10 animate-spin mb-4 text-[#e15941]" />
          <p className="text-xl font-calligraphy tracking-widest mb-2 px-6 text-center">
            正在载入灵隐
            {plyUrl.includes("bg.ply") || plyUrl.includes("temple")
              ? "寺"
              : "祈福树"}
            实景...
          </p>
          <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden mt-2">
            <div
              className="h-full bg-[#e15941] transition-all duration-300 shadow-[0_0_10px_rgba(225,89,65,0.5)]"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-2 text-[10px] opacity-70 tracking-widest font-mono mb-6">
            {loadInfo}
          </p>

          <div className="max-w-xs text-center px-6">
            <p className="text-[10px] text-white/30 leading-relaxed font-serif">
              * 3D 实景还原需要较多内存与计算资源。如果加载缓慢，请静心。
            </p>
          </div>

          {(progress >= 60 || isLoading) && (
            <button
              onClick={() => {
                setIsLoading(false);
                if (viewerRef.current) {
                  try {
                    viewerRef.current.start();
                  } catch (e) {
                    console.error(e);
                  }
                }
              }}
              className="mt-12 px-8 py-3 border border-white/20 rounded-full text-[10px] hover:bg-white/10 transition-all tracking-[0.3em] bg-white/5 active:scale-95"
            >
              灵犀一动，立即进入
            </button>
          )}
        </div>
      )}

      {error && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/90 p-8 text-center text-[#f4ebd9]">
          <p className="text-lg font-serif mb-6">{error}</p>
          <p className="text-xs opacity-50 max-w-xs mb-8 font-mono break-all">
            {plyUrl}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 border border-[#f4ebd9]/30 rounded-full hover:bg-white/10 transition"
          >
            返回
          </button>
        </div>
      )}


      {!isLoading && !error && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex gap-4">
          <div className="bg-black/60 backdrop-blur-md p-4 border border-white/10 rounded-lg text-white/60 text-[10px] hidden md:block">
            <p className="mb-1 tracking-widest font-bold text-white/90">
              操作指南
            </p>
            <p>左键旋转 / 滚轮缩放 / 右键平移</p>
          </div>

          <button
            onClick={handleResetCamera}
            className="bg-black/60 backdrop-blur-md p-4 border border-white/10 rounded-lg text-white/90 text-[10px] hover:bg-white/20 transition-all tracking-widest flex items-center gap-2"
          >
            <RotateCcw className="w-3 h-3" />
            重置视角
          </button>
        </div>
      )}
    </div>
  );
}
