import createManager from './manager';
import startTimerFactory from './startTimerFactory';
import stopTimerFactory from './stopTimerFactory';
import reducer from './reducer';

import { START_TIMER, END_TIMER } from './ActionTypes';

// Create the default manager named as 'DEFAULT'
const timerManager = createManager('DEFAULT');

// Create startTimer for the default manager
const startTimer = startTimerFactory(timerManager);

// Create stopTimer for the default manager
const stopTimer = stopTimerFactory(timerManager);

// Helper method to check for the running timer in the default manager
const getRunningTimer = () => timerManager.isRunning() && timerManager.getTimerId();

export {
  startTimer,
  stopTimer,

  getRunningTimer,

  reducer,
  START_TIMER,
  END_TIMER,
};
