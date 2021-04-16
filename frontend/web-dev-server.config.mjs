import range from 'koa-range';

export default {
  // koa-range adds HTTP range requests, which is needed to seek in audio files
  // http://www.jplayer.org/latest/developer-guide/#:~:text=Byte-Range%20Requests
  middleware: [range],

  port: 8080,
  watch: true,
  nodeResolve: true,
};
