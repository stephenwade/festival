import { useEffect, useState } from 'react';

import type { AudioMetadata } from '../../../app/playback/AudioManager';
import type { ShowData } from '../../../server/types/ShowData';
import type { ShowInfo } from '../../../server/types/ShowInfo';
import { AudioManagerTestManager } from './AudioManagerTestManager';

interface TestProps {
  forceSkipAudioContext: boolean;
  showData: ShowData;
}

export function AudioManagerTest({
  forceSkipAudioContext,
  showData,
}: TestProps) {
  const [alternate, setAlternate] = useState(false);
  const [manager] = useState<AudioManagerTestManager>(
    () =>
      new AudioManagerTestManager(showData, {
        forceSkipAudioContext,
      }),
  );
  const [showInfo, setShowInfo] = useState<ShowInfo>(() => manager.showInfo);
  const [metadatas, setMetadatas] = useState<AudioMetadata[]>([]);
  const [visualizerAvailable, setVisualizerAvailable] = useState(false);

  useEffect(() => {
    const unsubscribeShowInfo = manager.addShowInfoListener((nextShowInfo) => {
      setShowInfo(nextShowInfo);
    });
    const unsubscribeMetadata = manager.addLoadedMetadataListener(
      (metadata) => {
        setMetadatas((prev) => [...prev, metadata]);
      },
    );

    return () => {
      unsubscribeMetadata();
      unsubscribeShowInfo();
      manager.dispose();
    };
  }, [manager]);

  useEffect(() => {
    manager.setAlternateData(alternate);
  }, [alternate, manager]);

  return (
    <div>
      <p>
        <button
          data-testid="init-button"
          onClick={() => {
            manager.initializeAudio();
            setShowInfo(manager.showInfo);
            setVisualizerAvailable(Boolean(manager.getAudioVisualizerData));
          }}
        >
          Initialize audio
        </button>
      </p>
      <p>
        {alternate ? (
          'Using alternate data'
        ) : (
          <button
            data-testid="alternate-button"
            onClick={() => {
              setAlternate(true);
            }}
          >
            Use alternate data
          </button>
        )}
      </p>
      <p>Show status: {showInfo.status}</p>
      <p>
        Metadata events:
        <ul>
          {metadatas.map((metadata, i) => (
            // eslint-disable-next-line @eslint-react/no-array-index-key
            <li data-testid="metadata-event" key={i}>
              <span data-testid="metadata-event-id">{metadata.setId}</span>{' '}
              <span data-testid="metadata-event-duration">
                {metadata.duration}
              </span>
            </li>
          ))}
        </ul>
      </p>
      <p>
        {visualizerAvailable
          ? 'Visualizer data is available'
          : 'Visualizer data is not available'}
      </p>
    </div>
  );
}
