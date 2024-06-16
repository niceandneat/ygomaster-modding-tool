import { createHashRouter, redirect } from 'react-router-dom';

import { RootErrorBoundary } from './components/error/RootErrorBoundary';
import { GateCreate } from './components/gate/GateCreate';
import { GateDetail } from './components/gate/GateDetail';
import { GateList } from './components/gate/GateList';
import { Layout } from './components/layout/Layout';
import { SettingsDetail } from './components/settings/SettingsDetail';
import { StructureDeckCreate } from './components/structure-deck/StructureDeckCreate';
import { StructureDeckDetail } from './components/structure-deck/StructureDeckDetail';
import { StructureDeckList } from './components/structure-deck/StructureDeckList';
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
      },
      {
        path: 'gates/create',
        element: <GateCreate />,
      },
      {
        path: 'gates/:id',
        element: <GateDetail />,
      },
      {
        path: 'structure-decks',
        element: <StructureDeckList />,
      },
      {
        path: 'structure-decks/create',
        element: <StructureDeckCreate />,
      },
      {
        path: 'structure-decks/:id',
        element: <StructureDeckDetail />,
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
