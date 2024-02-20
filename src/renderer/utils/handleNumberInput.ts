export const handleNumberInput =
  (func: (input: number) => void) =>
  (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) =>
    func(Number(e.target.value));
