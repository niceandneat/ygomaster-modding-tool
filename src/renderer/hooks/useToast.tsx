import {
  Toast,
  ToastBody,
  ToastTitle,
  useToastController,
} from '@fluentui/react-components';
import { useCallback, useId } from 'react';

interface UseToastResults {
  toasterId: string;
  withToast: <T extends () => Promise<unknown>>(fn: T) => Promise<boolean>;
}

export const useToast = (success: string, fail: string): UseToastResults => {
  const toasterId = useId();
  const { dispatchToast } = useToastController(toasterId);

  const withToast = useCallback(
    async <T extends () => Promise<unknown>>(fn: T) => {
      try {
        if (!(await fn())) {
          dispatchToast(
            <Toast>
              <ToastTitle>{success}</ToastTitle>
            </Toast>,
            { intent: 'success', position: 'top' },
          );

          return true; // success
        }
      } catch (e) {
        console.error(e);
        dispatchToast(
          <Toast>
            <ToastTitle>{fail}</ToastTitle>
            <ToastBody>{String(e)}</ToastBody>
          </Toast>,
          { intent: 'error', position: 'top' },
        );
      }

      return false; // falied or skipped
    },
    [dispatchToast, fail, success],
  );

  return { toasterId, withToast };
};
