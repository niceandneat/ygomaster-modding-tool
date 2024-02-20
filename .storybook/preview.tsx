import { FluentProvider, webLightTheme } from '@fluentui/react-components';
import type { Preview } from '@storybook/react';

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [
    (Story) => (
      <FluentProvider theme={webLightTheme}>
        <Story />
      </FluentProvider>
    ),
  ],
};

export default preview;
