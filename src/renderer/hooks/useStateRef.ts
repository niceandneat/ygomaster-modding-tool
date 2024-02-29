import { useCallback, useRef, useState } from 'react';

export const useStateRef = <T>(initialState: T) => {
  const [state, setState] = useState<T>(initialState);
  const stateRef = useRef<T>(initialState);

  const setStateAndRef = useCallback((next: T) => {
    stateRef.current = next;
    setState(next);
  }, []);

  return [state, setStateAndRef, stateRef] as const;
};
