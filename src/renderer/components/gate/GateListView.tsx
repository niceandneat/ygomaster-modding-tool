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
import {
  AddCircleRegular,
  ArrowClockwiseRegular,
  DeleteRegular,
  EditRegular,
} from '@fluentui/react-icons';
import { useMemo } from 'react';

import { GateSummary } from '../../../common/type';
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

interface GateListViewProps {
  gates: GateSummary[];
  onClickCreate: () => void;
  onClickEdit: (gate: GateSummary) => void;
  onClickDelete: (gate: GateSummary) => void;
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

export const GateListView = ({
  gates,
  onClickCreate,
  onClickEdit,
  onClickDelete,
  onClickReload,
}: GateListViewProps) => {
  const classes = useStyles();
  const { gatePath } = useAppStore((s) => s.settings);

  const columns: TableColumnDefinition<GateSummary>[] = useMemo(
    () => [
      createTableColumn<GateSummary>({
        columnId: 'id',
        compare: (a, b) => {
          return a.id - b.id;
        },
        renderHeaderCell: () => {
          return 'ID';
        },
        renderCell: (gate) => {
          return <TableCellLayout truncate>{gate.id}</TableCellLayout>;
        },
      }),
      createTableColumn<GateSummary>({
        columnId: 'name',
        compare: (a, b) => {
          return a.name.localeCompare(b.name);
        },
        renderHeaderCell: () => {
          return 'Name';
        },
        renderCell: (gate) => {
          return <TableCellLayout truncate>{gate.name}</TableCellLayout>;
        },
      }),
      createTableColumn<GateSummary>({
        columnId: 'path',
        compare: (a, b) => {
          return a.path.localeCompare(b.path);
        },
        renderHeaderCell: () => {
          return 'Path';
        },
        renderCell: (gate) => {
          const name = toRelativePath(gate.path, gatePath);

          return <TableCellLayout truncate>{name}</TableCellLayout>;
        },
      }),
      createTableColumn<GateSummary>({
        columnId: 'actions',
        renderHeaderCell: () => {
          return 'Actions';
        },
        renderCell: (gate) => {
          return (
            <div className={classes.gap}>
              <Button
                aria-label="Edit"
                icon={<EditRegular />}
                onClick={() => onClickEdit(gate)}
              >
                Edit
              </Button>
              <Button
                aria-label="Delete"
                icon={<DeleteRegular />}
                onClick={() => onClickDelete(gate)}
              />
            </div>
          );
        },
      }),
    ],
    [onClickDelete, onClickEdit, gatePath, classes.gap],
  );

  return (
    <div className={classes.container}>
      <div className={classes.header}>
        <Title1 className={classes.title}>Gates</Title1>
        <div className={classes.headerButtons}>
          <Button icon={<ArrowClockwiseRegular />} onClick={onClickReload}>
            Reload
          </Button>
          <Button
            icon={<AddCircleRegular />}
            appearance="primary"
            onClick={onClickCreate}
          >
            Create
          </Button>
        </div>
      </div>
      <DataGrid
        items={gates}
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
        <DataGridBody<GateSummary>>
          {({ item, rowId }) => (
            <DataGridRow<GateSummary> key={rowId}>
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
