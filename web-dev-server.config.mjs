import range from 'koa-range';

export default {
  middleware: [range],
  port: 8080,
  watch: true,
};
