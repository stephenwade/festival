export default (state = {}, action) => {
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
