export default (state = { errorLoading: false }, action) => {
  switch (action.type) {
    case 'ERROR_LOADING':
      return {
        ...state,
        errorLoading: true,
      };

    default:
      return state;
  }
};
