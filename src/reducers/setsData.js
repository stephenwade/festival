export default (state = {}, action) => {
  switch (action.type) {
    case 'LOAD_SETS_DATA':
      return action.data;

    default:
      return state;
  }
};
