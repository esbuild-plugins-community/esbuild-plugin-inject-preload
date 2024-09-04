export type TypeOptions = Array<{
  templatePath: string;
  replace: string;
  as: (filePath: string) => string | void;
}>;
