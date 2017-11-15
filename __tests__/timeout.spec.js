import { createStore, applyMiddleware, combineReducers } from 'redux';
import thunk from 'redux-thunk';

import { startTimer, stopTimer, getRunningTimer, reducer } from '../src';

// Test action creator
const action1 = payload => ({
  type: 'ACTION_1',
  payload,
});

// Test reducer
const testReducer = (state = {}, action) => {
  switch (action.type) {
    case 'ACTION_1':
      return {
        ...state,
        one: action.payload,
      };
    case 'TIMEOUT':
      return {
        ...state,
        timeout: true,
      };
    default:
      return state;
  }
};

// use fake timers for full control
jest.useFakeTimers();

describe('Test redux-thunk-timeout', () => {
  const rootReducer = combineReducers({
    timeout: reducer,
    test: testReducer,
  });

  test('Timeout action runs', () => {
    const store = createStore(rootReducer, applyMiddleware(thunk));

    // Note current time
    const startTime = Date.now();

    // Dispatch the timer action to be run in 1 second
    store.dispatch(startTimer(1000, () => action1(1), 'T1'));
    // The timeout should have been set on the store
    expect(store.getState()).toMatchObject({
      timeout: {
        manager: 'DEFAULT',
        timer: 'T1',
        running: true,
      },
      test: {},
    });
    // Also check start and end time to have correct values
    expect(store.getState().timeout.start).toBeGreaterThanOrEqual(startTime);
    expect(store.getState().timeout.end).toBe(store.getState().timeout.start + 1000);

    // Advance timer for some interval to make sure the timer is run within 1000 ms
    jest.runTimersToTime(500);

    // Make sure the timer is still running as per library
    expect(getRunningTimer()).toBe('T1');

    // Make sure the state has not changed (No action is executed yet)
    expect(store.getState()).toMatchObject({
      timeout: {
        manager: 'DEFAULT',
        timer: 'T1',
        running: true,
      },
      test: {},
    });

    // Make sure timer can't be run until the other completes
    expect(() => store.dispatch(startTimer(1000, action1, 'dummy'))).toThrow();

    // Advance timer to run the timer
    jest.runTimersToTime(500);

    // Make sure the test action is run
    expect(store.getState()).toMatchObject({
      timeout: {
        manager: 'DEFAULT',
        timer: 'T1',
        complete: true, /* The timeout has completed */
        running: false, /* The timeout is not running anymore */
      },
      test: { one: 1 },
    });

    // Make sure there aren't any timer left to run
    expect(getRunningTimer()).toBeFalsy();

    // Make sure stop timer is not allowed when there isn't any timer
    expect(() => store.dispatch(stopTimer())).toThrow();
  });

  test('Timeout action stop', () => {
    const store = createStore(rootReducer, applyMiddleware(thunk));

    // Start the timer
    store.dispatch(startTimer(1000, () => action1(1), 'T1'));
    expect(store.getState()).toMatchObject({
      timeout: {
        manager: 'DEFAULT',
        timer: 'T1',
        running: true,
      },
      test: {},
    });
    jest.runTimersToTime(500);

    // Stop the timer
    store.dispatch(stopTimer());

    // Make sure the timeout has changed, with complete flag as false
    expect(store.getState()).toMatchObject({
      timeout: {
        manager: 'DEFAULT',
        timer: 'T1',
        running: false,
        complete: false,
      },
      test: {},
    });
    // Make sure there is no timer
    expect(getRunningTimer()).toBeFalsy();

    // Make sure not timer is run
    jest.runAllTimers();
    expect(store.getState()).toMatchObject({
      timeout: {
        manager: 'DEFAULT',
        timer: 'T1',
        running: false,
        complete: false,
      },
      test: {},
    });

    // Can't stop when no timer is running
    expect(() => store.dispatch(stopTimer())).toThrow();

    // We should be able to start another timer howerver
    store.dispatch(startTimer(1000, () => action1(2), 'T2'));
    expect(store.getState()).toMatchObject({
      timeout: {
        manager: 'DEFAULT',
        timer: 'T2',
        running: true,
      },
      test: {},
    });
    jest.runAllTimers();
    expect(store.getState()).toMatchObject({
      timeout: {
        manager: 'DEFAULT',
        timer: 'T2',
        running: false,
        complete: true,
      },
      test: { one: 2 },
    });
    expect(getRunningTimer()).toBeFalsy();
  });
});
