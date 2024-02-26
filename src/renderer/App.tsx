import {
  FluentProvider,
  makeStaticStyles,
  webDarkTheme,
} from '@fluentui/react-components';
import { RouterProvider } from 'react-router-dom';

import { InitGuard } from './components/guard/InitGuard';
import { router } from './router';

const useStaticStyles = makeStaticStyles({
  html: {
    overflowY: 'hidden',
  },
  body: {
    margin: '0',
  },
  '*': {
    boxSizing: 'border-box',
  },
});

export const App = () => {
  useStaticStyles();

  return (
    <FluentProvider theme={webDarkTheme}>
      <InitGuard>
        <RouterProvider router={router} />
      </InitGuard>
    </FluentProvider>
  );
};
