import { Tab, TabList, Tooltip, makeStyles } from '@fluentui/react-components';
import {
  ConferenceRoomRegular,
  LayerRegular,
  SettingsRegular,
  WrenchScrewdriverRegular,
} from '@fluentui/react-icons';
import { useLocation, useNavigate } from 'react-router-dom';

const useStyles = makeStyles({
  container: {
    height: '100%',
  },
  item: {
    width: '64px',
    height: '64px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export const MenuBar = () => {
  const classes = useStyles();

  const { pathname } = useLocation();
  const menu = pathname.split('/')[1] || 'settings';

  const navigate = useNavigate();

  return (
    <TabList
      className={classes.container}
      selectedValue={menu}
      onTabSelect={(_, { value }) => navigate(value as string)}
      size="large"
      vertical
    >
      <Tooltip content="Gates" relationship="label" positioning="after">
        <Tab
          className={classes.item}
          icon={<ConferenceRoomRegular />}
          value="gates"
          aria-label="Gates"
        />
      </Tooltip>
      <Tooltip
        content="Structure Decks"
        relationship="label"
        positioning="after"
      >
        <Tab
          className={classes.item}
          icon={<LayerRegular />}
          value="structure-decks"
          aria-label="Structure Decks"
        />
      </Tooltip>
      <Tooltip content="Utilities" relationship="label" positioning="after">
        <Tab
          className={classes.item}
          icon={<WrenchScrewdriverRegular />}
          value="utilities"
          aria-label="Utilities"
        />
      </Tooltip>
      <Tooltip content="Settings" relationship="label" positioning="after">
        <Tab
          className={classes.item}
          icon={<SettingsRegular />}
          value="settings"
          aria-label="Settings"
        />
      </Tooltip>
    </TabList>
  );
};
