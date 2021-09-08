export const getMockData = (adjustTimesForTesting = false) => {
  const data = {
    sets: [
      {
        audio: 'sample/energy-fix.mp3',
        artist: 'Computer Music All‑stars',
        start: '2020-01-01T00:00:00-0500',
        length: 181.34,
      },
      {
        audio: 'sample/bust-this-bust-that.mp3',
        artist: 'Professor Kliq',
        start: '2020-01-03T00:03:06-0500',
        length: 268.64,
      },
      {
        audio: 'sample/one-ride.mp3',
        artist: "'Etikit",
        start: '2020-01-02T00:07:40-0500',
        length: 183.72,
      },
    ],
  };

  return {
    ...data,
    adjustTimesForTesting,
    cacheBust: Math.random(),
  };
};
