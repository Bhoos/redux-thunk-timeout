import { START_TIMER, STOP_TIMER } from './ActionTypes';

export default function reducer(state = {}, action) {
  switch (action.type) {
    case START_TIMER:
      return {
        ...action.payload,
        running: true,
      };

    case STOP_TIMER:
      return {
        ...action.payload,
        running: false,
      };
    default:
      return state;
  }
}
