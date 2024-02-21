import { Button } from '@fluentui/react-components';
import { ArrowSwapRegular, ArrowUploadRegular } from '@fluentui/react-icons';
import { useMemo } from 'react';

interface FileInputProps {
  value?: string;
  placeholder?: string;
  directory?: boolean;
  path?: string;
  onChange?: (value: string) => void;
}

export const FileInput = ({
  value,
  placeholder,
  directory,
  path,
  onChange,
}: FileInputProps) => {
  const handleClick = useMemo(
    () =>
      directory
        ? async () => {
            const directoryPath = await window.electron.openDirectory(path);
            if (directoryPath) onChange?.(directoryPath);
          }
        : async () => {
            const filePath = await window.electron.openFile(path);
            if (filePath) onChange?.(filePath);
          },
    [directory, onChange, path],
  );

  return (
    <Button
      icon={value ? <ArrowSwapRegular /> : <ArrowUploadRegular />}
      onClick={handleClick}
    >
      {value || placeholder}
    </Button>
  );
};
