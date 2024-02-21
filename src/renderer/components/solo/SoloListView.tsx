import {
  Button,
  DataGrid,
  DataGridBody,
  DataGridCell,
  DataGridHeader,
  DataGridHeaderCell,
  DataGridProps,
  DataGridRow,
  TableCellLayout,
  TableColumnDefinition,
  TableColumnSizingOptions,
  Title1,
  createTableColumn,
  makeStyles,
  shorthands,
  tokens,
} from '@fluentui/react-components';
import { DeleteRegular, EditRegular } from '@fluentui/react-icons';
import { useMemo } from 'react';

import { SoloSummary } from '../../../common/type';
import { useAppStore } from '../../store';
import { toRelativePath } from '../../utils/toRelativePath';

const useStyles = makeStyles({
  container: {
    ...shorthands.padding(tokens.spacingHorizontalL),
  },
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  headerButtons: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
    columnGap: tokens.spacingVerticalS,
  },
  title: {
    marginBottom: tokens.spacingVerticalL,
  },
  gap: {
    display: 'flex',
    columnGap: tokens.spacingVerticalS,
  },
});

interface SoloListViewProps {
  solos: SoloSummary[];
  onClickCreate: () => void;
  onClickEdit: (solo: SoloSummary) => void;
  onClickDelete: (solo: SoloSummary) => void;
  onClickReload: () => void;
}

const defaultSortState: Parameters<
  NonNullable<DataGridProps['onSortChange']>
>[1] = { sortColumn: 'id', sortDirection: 'ascending' };

const columnSizingOptions: TableColumnSizingOptions = {
  id: {
    defaultWidth: 80,
  },
  path: {
    defaultWidth: 120,
  },
  deck: {
    defaultWidth: 280,
  },
};

export const SoloListView = ({
  solos,
  onClickCreate,
  onClickEdit,
  onClickDelete,
  onClickReload,
}: SoloListViewProps) => {
  const classes = useStyles();
  const { soloPath } = useAppStore((s) => s.settings);

  const columns: TableColumnDefinition<SoloSummary>[] = useMemo(
    () => [
      createTableColumn<SoloSummary>({
        columnId: 'id',
        compare: (a, b) => {
          return a.id - b.id;
        },
        renderHeaderCell: () => {
          return 'ID';
        },
        renderCell: (solo) => {
          return <TableCellLayout truncate>{solo.id}</TableCellLayout>;
        },
      }),
      createTableColumn<SoloSummary>({
        columnId: 'deck',
        compare: (a, b) => {
          return a.deck.localeCompare(b.deck);
        },
        renderHeaderCell: () => {
          return 'Deck';
        },
        renderCell: (solo) => {
          const name = solo.deck.replace(/\.json$/, '');

          return <TableCellLayout truncate>{name}</TableCellLayout>;
        },
      }),
      createTableColumn<SoloSummary>({
        columnId: 'path',
        compare: (a, b) => {
          return a.path.localeCompare(b.path);
        },
        renderHeaderCell: () => {
          return 'Path';
        },
        renderCell: (solo) => {
          const name = toRelativePath(solo.path, soloPath);

          return <TableCellLayout truncate>{name}</TableCellLayout>;
        },
      }),
      createTableColumn<SoloSummary>({
        columnId: 'actions',
        renderHeaderCell: () => {
          return 'Actions';
        },
        renderCell: (solo) => {
          return (
            <div className={classes.gap}>
              <Button
                aria-label="Edit"
                icon={<EditRegular />}
                onClick={() => onClickEdit(solo)}
              >
                Edit
              </Button>
              <Button
                aria-label="Delete"
                icon={<DeleteRegular />}
                onClick={() => onClickDelete(solo)}
              />
            </div>
          );
        },
      }),
    ],
    [onClickDelete, onClickEdit, soloPath, classes.gap],
  );

  return (
    <div className={classes.container}>
      <div className={classes.header}>
        <Title1 className={classes.title}>Solos</Title1>
        <div className={classes.headerButtons}>
          <Button onClick={onClickReload}>Reload</Button>
          <Button appearance="primary" onClick={onClickCreate}>
            Create
          </Button>
        </div>
      </div>
      <DataGrid
        items={solos}
        columns={columns}
        sortable
        defaultSortState={defaultSortState}
        resizableColumns
        columnSizingOptions={columnSizingOptions}
      >
        <DataGridHeader>
          <DataGridRow>
            {({ renderHeaderCell }) => (
              <DataGridHeaderCell>{renderHeaderCell()}</DataGridHeaderCell>
            )}
          </DataGridRow>
        </DataGridHeader>
        <DataGridBody<SoloSummary>>
          {({ item, rowId }) => (
            <DataGridRow<SoloSummary> key={rowId}>
              {({ renderCell }) => (
                <DataGridCell>{renderCell(item)}</DataGridCell>
              )}
            </DataGridRow>
          )}
        </DataGridBody>
      </DataGrid>
    </div>
  );
};
