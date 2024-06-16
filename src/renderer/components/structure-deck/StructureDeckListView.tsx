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
  tokens,
} from '@fluentui/react-components';
import {
  AddCircleRegular,
  ArrowClockwiseRegular,
  DeleteRegular,
  EditRegular,
} from '@fluentui/react-icons';
import { useMemo } from 'react';

import { StructureDeck } from '../../../common/type';

const useStyles = makeStyles({
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
  columnHeader: {
    userSelect: 'none',
  },
});

interface StructureDeckListViewProps {
  structureDecks: StructureDeck[];
  onClickCreate: () => void;
  onClickEdit: (gate: StructureDeck) => void;
  onClickDelete: (gate: StructureDeck) => void;
  onClickReload: () => void;
}

const defaultSortState: Parameters<
  NonNullable<DataGridProps['onSortChange']>
>[1] = { sortColumn: 'id', sortDirection: 'ascending' };

const columnSizingOptions: TableColumnSizingOptions = {
  name: {
    defaultWidth: 300,
  },
  description: {
    defaultWidth: 400,
  },
};

export const StructureDeckListView = ({
  structureDecks,
  onClickCreate,
  onClickEdit,
  onClickDelete,
  onClickReload,
}: StructureDeckListViewProps) => {
  const classes = useStyles();

  const columns: TableColumnDefinition<StructureDeck>[] = useMemo(
    () => [
      createTableColumn<StructureDeck>({
        columnId: 'id',
        compare: (a, b) => {
          return a.id - b.id;
        },
        renderHeaderCell: () => {
          return 'ID';
        },
        renderCell: ({ id }) => {
          return <TableCellLayout truncate>{id}</TableCellLayout>;
        },
      }),
      createTableColumn<StructureDeck>({
        columnId: 'name',
        compare: (a, b) => {
          return a.name.localeCompare(b.name);
        },
        renderHeaderCell: () => {
          return 'Name';
        },
        renderCell: ({ name }) => {
          return <TableCellLayout truncate>{name}</TableCellLayout>;
        },
      }),
      createTableColumn<StructureDeck>({
        columnId: 'description',
        compare: (a, b) => {
          return a.description.localeCompare(b.description);
        },
        renderHeaderCell: () => {
          return 'Description';
        },
        renderCell: ({ description }) => {
          return <TableCellLayout truncate>{description}</TableCellLayout>;
        },
      }),
      createTableColumn<StructureDeck>({
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
    [classes.gap, onClickEdit, onClickDelete],
  );

  return (
    <div>
      <div className={classes.header}>
        <Title1 className={classes.title}>Structure Decks</Title1>
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
        items={structureDecks}
        columns={columns}
        sortable
        defaultSortState={defaultSortState}
        resizableColumns
        columnSizingOptions={columnSizingOptions}
      >
        <DataGridHeader>
          <DataGridRow>
            {({ renderHeaderCell }) => (
              <DataGridHeaderCell className={classes.columnHeader}>
                {renderHeaderCell()}
              </DataGridHeaderCell>
            )}
          </DataGridRow>
        </DataGridHeader>
        <DataGridBody<StructureDeck>>
          {({ item, rowId }) => (
            <DataGridRow<StructureDeck> key={rowId}>
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
