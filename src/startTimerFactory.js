export default function createStartTimer(timerManager) {
  return (interval, actionCreator, timerId) => (
    timerManager.start(interval, actionCreator, timerId)
  );
}
