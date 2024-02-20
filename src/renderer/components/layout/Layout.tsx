import { makeStyles, shorthands, tokens } from '@fluentui/react-components';
import { Outlet } from 'react-router-dom';

import { MenuBar } from './MenuBar';

const useStyles = makeStyles({
  container: {
    position: 'relative',
    height: '100vh',
    display: 'grid',
    gridTemplateColumns: 'auto 1fr',
    backgroundColor: tokens.colorNeutralBackground2,
  },
  menu: {
    height: '100vh',
    overflowY: 'auto',
    ...shorthands.borderRight('0.5px', 'solid', tokens.colorNeutralStroke1),
  },
  contents: {
    height: '100vh',
    overflowY: 'hidden',
  },
});

export const Layout = () => {
  const classes = useStyles();

  return (
    <div className={classes.container}>
      <div className={classes.menu}>
        <MenuBar />
      </div>
      <div className={classes.contents}>
        <Outlet />
      </div>
    </div>
  );
};
