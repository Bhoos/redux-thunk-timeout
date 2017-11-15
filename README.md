# redux-thunk-timeout
A redux-thunk based timeout manager for redux actions

# Installation
> `$ npm install redux-thunk-timeout`

# Usage

## Creating timers
```javascript
import { startTimer } from 'redux-thunk-timeout';

// Create the timer actions for convenience
// The wait timer waits for 30 seconds before executing startGame (actionCreator)
const waitTimer = () => startTimer(30000, startGame, 'wait');

// Display summary infinitely. This should be stopped by some other user action
const finishTimer = () => startTimer(-1, null, 'summary');

// Customize timer to leverage the thunk extra arguments
// If is the first round (using isFirstRound selector), then use different
// timeout interval than otherwise, execute timeout action if the user fails
// to pick
const pickTimer = () => (dispatch, getState, { timeouts }) => {
  const interval = isFirstRound(getState()) ? timeouts.firstPick : timeouts.pick;
  dispatch(startTimer(interval, timeout, 'pick'));
}


// Use dispatch whenever needed
dispatch(waitTimer());
dispatch(pickTimer());

```

*Note: An interval of -1 creates an infinite timer. The infinite timer doesn't
stop on its own but must be stopped by stoptimer*

## Stop timers when not needed
```javascript
import { getRunningTimer, stopTimer } from 'redux-thunk-timeout';

function userPicked() {
  // The user has picked something, cancel timer
  assert(getRunningTimer() === 'pick'); // The current timer must be pick

  // Dispatch the stop
  dispatch(stopTimer());
}
```

## Use the reducer to keep track of the timeout on your redux state
```javascript
import { reducer } from 'redux-thunk-timeout';

const yourReducer = combineReducers({
  ...otherReducers,
  timeout: reducer,
});

// You will get the timer id, start time and end time on the state with this reducer,
// This could be used to display a timer on UI. The same object is available as the
// payload for START_TIMER/STOP_TIMER action type
// {
//   manager: 'DEFAULT',  /* Advance use case */
//   timer: 'pick', /* The last started timer */
//   start: timestamp, /* The timestamp when the timer ran */
//   end: timestamp, /* The timestamp when the timer is supposed to end */
//   running: true, /* Flag to determine if the timer is running or stopped */
//   complete: false, /* If running is false, then this flag can determine if the timeout completed or was stopped before completing */
// }
}
```

# Advance Usage
The standard exports provided by the library uses a single DEFAULT timeout manager. In
some advance cases you can manage multiple timeouts. You might require individual player
based timeout, or stuff like that.

```javascript
import { createManager } from 'redux-thunk-timeout'

const customTimer = createManager('player-timeout');

// You can then use the start and stop methods on this timer
dispatch(customTimer.start(1000, autoPlay, 'player-turn'));
dispatch(customTimer.stop());

// Check if any timeout is waiting to be run
customTimer.isRunning();

// Get the id of the running timeout
customTimer.getTimerId();

```

