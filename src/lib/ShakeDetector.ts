export type ShakeEvent = {
  intensity: number;
  durationMs: number;
};

interface Position {
  x: number;
  y: number;
  time: number;
}

export class ShakeDetector {
  private history: Position[] = [];
  private readonly MAX_HISTORY_MS = 1500;
  private readonly MIN_SHAKE_HZ = 2; // Direction changes
  private readonly SWIPE_THRESHOLD = 0.02; // Minimum normalized distance to count as a directional swipe
  private isLocked = false;

  private onShakeCallback?: (event: ShakeEvent) => void;

  onShake(callback: (event: ShakeEvent) => void) {
    this.onShakeCallback = callback;
  }

  addLandmark(x: number, y: number, timestamp: number) {
    if (this.isLocked) return;

    this.history.push({ x, y, time: timestamp });

    // Prune old history
    this.history = this.history.filter(
      (pos) => timestamp - pos.time <= this.MAX_HISTORY_MS,
    );

    this.detectShake(timestamp);
  }

  reset() {
    this.history = [];
    this.isLocked = false;
  }

  lock(durationMs: number = 2000) {
    this.isLocked = true;
    setTimeout(() => {
      this.isLocked = false;
      this.history = [];
    }, durationMs);
  }

  private detectShake(currentTime: number) {
    if (this.history.length < 10) return; // Need some frames

    // Look for direction reversals in X or Y axis
    let xReversals = 0;
    let yReversals = 0;
    let lastXDir = 0; // 1 for right, -1 for left
    let lastYDir = 0; // 1 for down, -1 for up
    let totalXDistance = 0;
    let totalYDistance = 0;

    let localExtremaX = this.history[0].x;
    let localExtremaY = this.history[0].y;

    for (let i = 1; i < this.history.length; i++) {
      const prev = this.history[i - 1];
      const curr = this.history[i];

      const dx = curr.x - prev.x;
      const dy = curr.y - prev.y;

      totalXDistance += Math.abs(dx);
      totalYDistance += Math.abs(dy);

      // Smooth out tiny jitters
      if (Math.abs(curr.x - localExtremaX) > this.SWIPE_THRESHOLD) {
        const currentDir = curr.x > localExtremaX ? 1 : -1;
        if (lastXDir !== 0 && currentDir !== lastXDir) {
          xReversals++;
        }
        lastXDir = currentDir;
        localExtremaX = curr.x;
      }

      if (Math.abs(curr.y - localExtremaY) > this.SWIPE_THRESHOLD) {
        const currentDir = curr.y > localExtremaY ? 1 : -1;
        if (lastYDir !== 0 && currentDir !== lastYDir) {
          yReversals++;
        }
        lastYDir = currentDir;
        localExtremaY = curr.y;
      }
    }

    if (xReversals >= this.MIN_SHAKE_HZ || yReversals >= this.MIN_SHAKE_HZ) {
      // We have a shake!
      const duration =
        this.history[this.history.length - 1].time - this.history[0].time;
      const intensity = (totalXDistance + totalYDistance) / (duration / 1000);

      this.lock(2000); // Lock for a bit so we don't trigger multiple times instantly

      if (this.onShakeCallback) {
        this.onShakeCallback({
          intensity,
          durationMs: duration,
        });
      }
    }
  }
}
