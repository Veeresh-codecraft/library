import { readChar, readLine } from "../../core/input.utils";
import { IInteractor } from "../../core/interactor";
import { IUserBase, IUser } from "./models/user.model";
import { UserRepository } from "./user.repository";
import { UDatabase } from "../../db/userDb";
import { z } from "zod";
import chalk from "chalk"; 
import { Menu } from "../../core/menu";
const menu = new Menu("Book Management", [
  { key: "1", label: "Add User" },
  { key: "2", label: "Update User" },
  { key: "3", label: "Search User" },
  { key: "4", label: "List Users" },
  { key: "5", label: "Delete User" },
  { key: "6", label: "<Previous Menu>" },
]);
// Schema validation for user input
const userSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .regex(/^[A-Za-z]+$/, "Name must contain only alphabets"),
  DOB: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "DOB must be in YYYY-MM-DD format"),
  phoneNum: z
    .string()
    .regex(
      /^\d{10,}$/,
      "Phone number must be at least 10 digits and contain only numbers"
    ),
});

/**
 * Class representing the user interactor.
 * @implements {IInteractor}
 */
export class UserInteractor implements IInteractor {
  private repo = new UserRepository();
  
  /**
   * Displays the menu and handles user input.
   * @returns {Promise<void>}
   */
  async showMenu(): Promise<void> {
    let loop = true;
    while (loop) {
      const op = await menu.show();
      if (op) {
        switch (op?.key.toLowerCase()) {
          case "1":
            await addUser(this.repo);
            break;
          case "2":
            await updateUser(this.repo);
            break;
          case "3":
            await deleteUser(this.repo);
            break;
          case "4":
            await searchUser(this.repo);
            // console.table(this.repo.list({ limit: 1000, offset: 0 }).items);
            break;
          case "5":
            // await showPaginatedBooks(this.repo);
            break;
          case "6":
            await closeConnection(this.repo);
            loop = false;
            break;
          default:
            console.log("\nInvalid input\n\n");
            break;
        }
      } else {
        console.log("\nInvalid input\n\n");
      }
    }
  }
}

/**
 * Prompts the user for input and validates it.
 * @param {IUser} [previous={ name: "", DOB: "", phoneNum: "", UserId: -1 }] - The previous user data.
 * @returns {Promise<IUserBase>} The validated user input.
 */
async function getUserInput(): Promise<IUserBase> {
  // console.log(previous);
  const name = await readLine(`Please enter the Name):`);
  const DOB = await readLine(`Please enter the Date Of Birth :`);
  // TODO create a sanitize for phone number so tht only numbers are send to database
  const phoneNum = await readLine(`Please enter the Phone Number :`);
  const address = await readLine(`Please enter the Address :`);
  const age = +await readLine(`Please enter the Age :`);
  return {
name:name,
DOB:new Date(DOB),
phoneNum:+phoneNum,
address:address,
age:age
  }
  // const parsed = userSchema.safeParse({
  //   name: name,
  //   DOB: DOB,
  //   phoneNum: phoneNum,
  // });

  // if (previous.UserId !== -1) {
  //   return { name: name, DOB: DOB, phoneNum: phoneNum };
  // }

  // if (!parsed.success) {
  //   console.log(chalk.red("Invalid input:"));
  //   parsed.error.issues.forEach((error) =>
  //     console.log(chalk.red(error.message))
  //   );
  //   return getUserInput(previous); // Prompt again if validation fails
  // }

  // return parsed.data;
}

/**
 * Adds a new user to the repository.
 * @param {UserRepository} repo - The user repository.
 */
async function addUser(repo: UserRepository) {
  const user: IUserBase = await getUserInput();
  const createdUser = await repo.create(user);
  console.log("User Created:", createdUser);
}

/**
 * Updates an existing user in the repository.
 * @param {UserRepository} repo - The user repository.
 */
async function updateUser(repo: UserRepository) {
  const UserIdToUpdate: number = +(await readLine(
    "Please enter the ID of the User to update:"
  ));
  const user = ((await repo.getById(UserIdToUpdate)!) as unknown as IUser[])[0];
  if (user === undefined) {
    console.log(`User with ${UserIdToUpdate} does not exist.`);
    return;
  }
  const updatedData = await getUserInput();
  repo.update(UserIdToUpdate, updatedData);
}


async function deleteUser(repo: UserRepository)  {
  const userId = await readLine(`Please enter User id to delete:`);
  const deletedUser = await repo.delete(+userId);
  console.log("User deleted successfully\nDeleted User:");
  console.table(deletedUser);
}
async function searchUser(repo: UserRepository) {
  throw new Error("Function not implemented.");
}

async function closeConnection(repo: UserRepository) {
    repo.close();
}
// const a: UserInteractor = new UserInteractor();
// a.showMenu();
