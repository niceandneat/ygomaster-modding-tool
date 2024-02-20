interface WithMessageBoxOptions {
  message?: string;
  confirmButton?: string;
  cancelButton?: string;
}

export const withMessageBox = async <T extends () => Promise<unknown>>(
  fn: T,
  {
    message = 'Are you sure?',
    confirmButton = 'yes',
    cancelButton = 'no',
  }: WithMessageBoxOptions = {},
) => {
  const response = await window.electron.showMessageBox({
    message,
    buttons: [confirmButton, cancelButton],
    cancelId: 1,
  });

  if (response !== 0) return true; // skip toast

  await fn();
  return false; // show toast
};
