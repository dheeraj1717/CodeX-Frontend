import { useEffect, useRef, useState } from 'react';
import { getSocket, setUserId } from '../services/socketService';
import { SubmissionResult } from '../types/problem.types';

const MOCK_USER_ID = 'user-001';

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [result, setResult] = useState<SubmissionResult | null>(null);
  const listenerRef = useRef(false);

  useEffect(() => {
    const socket = getSocket();

    const onConnect = () => {
      setIsConnected(true);
      setUserId(MOCK_USER_ID);
    };
    const onDisconnect = () => setIsConnected(false);
    const onResult = (payload: SubmissionResult) => {
      setResult(payload);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    if (!listenerRef.current) {
      socket.on('submissionPayloadResponse', onResult);
      listenerRef.current = true;
    }

    if (socket.connected) {
      setIsConnected(true);
      setUserId(MOCK_USER_ID);
    }

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('submissionPayloadResponse', onResult);
      listenerRef.current = false;
    };
  }, []);

  return { isConnected, result, userId: MOCK_USER_ID, clearResult: () => setResult(null) };
}
