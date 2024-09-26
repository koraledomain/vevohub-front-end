import {IUserItem} from "./user";

export type candidatesResponseAPI = {
  content: IUserItem[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
  message?: string;
}
