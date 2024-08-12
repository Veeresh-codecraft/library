export interface IBookBase {
  // immutable data which has to kept safe
  title: string;
  author: string;
  publisher: string;
  genre: string;
  isbnNo: number;
  numofPages: number;
  totalNumberOfCopies: number;
}

export interface IBook extends IBookBase {
  id: number;
  availableNumberOfCopies: number;
}
