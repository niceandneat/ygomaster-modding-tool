import { createHashRouter, redirect } from 'react-router-dom';

import { RootErrorBoundary } from './components/error/RootErrorBoundary';
import { GateCreate } from './components/gate/GateCreate';
import { GateDetail } from './components/gate/GateDetail';
import { GateList } from './components/gate/GateList';
import { Layout } from './components/layout/Layout';
import { SettingsDetail } from './components/settings/SettingsDetail';
import { SoloCreate } from './components/solo/SoloCreate';
import { SoloDetail } from './components/solo/SoloDetail';
import { SoloList } from './components/solo/SoloList';
import { Utilities } from './components/utilities/Utilities';

export const router = createHashRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <RootErrorBoundary />,
    children: [
      {
        index: true,
        loader: () => redirect('/settings'),
      },
      {
        path: 'gates',
        element: <GateList />,
        children: [
          { index: true, element: <GateCreate /> },
          { path: '*', element: <GateDetail /> },
        ],
      },
      {
        path: 'solos',
        element: <SoloList />,
        children: [
          { index: true, element: <SoloCreate /> },
          { path: '*', element: <SoloDetail /> },
        ],
      },
      {
        path: 'utilities',
        element: <Utilities />,
      },
      {
        path: 'settings',
        element: <SettingsDetail />,
      },
    ],
  },
]);
