import {
  Button,
  Title1,
  makeStyles,
  shorthands,
} from '@fluentui/react-components';
import { useRouteError } from 'react-router-dom';

const useStyles = makeStyles({
  container: {
    height: '100vh',
    ...shorthands.padding('10px'),
  },
});

export const RootErrorBoundary = () => {
  const classes = useStyles();
  const error = useRouteError() as Error;
  console.error(error);

  return (
    <div className={classes.container}>
      <Title1>Uh oh, something went terribly wrong 😩</Title1>
      <pre>{error.message || JSON.stringify(error, null, 2)}</pre>
      <Button onClick={() => (window.location.href = '/')}>
        Click here to reload the app
      </Button>
    </div>
  );
};
