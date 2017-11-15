export default function createStopTimer(timerManager) {
  return () => timerManager.stop(false);
}
