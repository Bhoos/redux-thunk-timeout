import { START_TIMER, STOP_TIMER } from './ActionTypes';

export default function createTimeManager(id) {
  // eslint-disable-next-line no-underscore-dangle
  let _id = null;
  // eslint-disable-next-line no-underscore-dangle
  let _handle = null;

  // The stop action
  function stop(complete = false) {
    if (_handle !== null) {
      throw new Error('No timer is running to end');
    }

    clearTimeout(_handle);
    _handle = null;

    return {
      type: STOP_TIMER,
      payload: {
        manager: id,
        timer: _id,
        start: Date.now(),
        complete,
      },
    };
  }

  function start(interval, actionCreator, timerId) {
    if (_handle !== null) {
      throw new Error(`Another timer is already running ${_id}`);
    }

    _id = timerId;
    const now = Date.now();
    return (dispatch) => {
      _handle = setTimeout(() => {
        dispatch(stop(true));
        dispatch(actionCreator());
      }, interval);

      dispatch({
        type: START_TIMER,
        payload: {
          manager: id,
          timer: _id,
          start: now,
          end: now + interval,
        },
      });
    };
  }

  return {
    id,

    isRunning: () => _handle !== null,

    getTimerId: () => _id,

    start,

    stop,
  };
}
