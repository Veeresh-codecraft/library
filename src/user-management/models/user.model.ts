export interface IUserBase {
  // immutable data which has to kept safe
  name: string;
  DOB: Date;
  age: number;
  phoneNum:number;
  address: string;
  password: string;
}

export interface IUser extends IUserBase {
  id: number; 
}