import { IUser } from "../../user-management/models/user.model";

export interface ITransactionBase {
  // immutable data 
  bookId: number;
  userId: number; 
}

type transactionType ="borrow" | "return";
type statusType ="completed"| "overdue";

export interface ITransaction extends ITransactionBase {
  transactionId: number;
  transactionType: transactionType;
  issueddate: Date;
  dueDate: Date;
  returnDate: Date;
  status: statusType;
  lateFees: number;
}
