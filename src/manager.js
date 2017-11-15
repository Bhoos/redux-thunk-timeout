import { START_TIMER, STOP_TIMER } from './ActionTypes';

const INFINITE = -1;

export default function createTimeManager(id) {
  // eslint-disable-next-line no-underscore-dangle
  let _id = null;
  // eslint-disable-next-line no-underscore-dangle
  let _handle = null;

  /**
   * Stop the current timer
   * @param {*} complete flag which should always be set to false when
   *                     called by user. Is only true when called from
   *                     the start below
   */
  function stop(complete = false) {
    if (_handle === null) {
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

  /**
   * Start the timer for running an action at a later time.
   *
   * @param {*} interval The number of milliseconds to wait before running the action.
   *                     Can be -1 for infinite
   * @param {*} actionCreator The actionCreator for providing action to be executed
   *                          when the timer expires
   * @param {*} timerId An id to identify the timer being run
   */
  function start(interval, actionCreator, timerId) {
    if (_handle !== null) {
      throw new Error(`Another timer is already running ${_id}`);
    }

    _id = timerId;
    const now = Date.now();

    const action = {
      type: START_TIMER,
      payload: {
        manager: id,
        timer: _id,
        start: now,
        end: now + interval,
      },
    };

    if (interval === INFINITE) {
      // No need to define timeout in case of infinite interval
      _handle = INFINITE;
      return action;
    }

    return (dispatch) => {
      _handle = setTimeout(() => {
        dispatch(stop(true));
        dispatch(actionCreator());
      }, interval);

      dispatch(action);
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
