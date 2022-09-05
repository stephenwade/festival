/**
 * Hash code function for an array of numbers.
 *
 * Used to compare output of huge arrays without filling up test output
 * with object diffs.
 */
export default (array) => {
  let hash = 0;
  array.forEach((item) => {
    // eslint-disable-next-line no-bitwise
    hash = (hash << 5) - hash + item;
  });
  return hash;
};
