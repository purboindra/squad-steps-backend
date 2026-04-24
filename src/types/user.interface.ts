import { ObjectId } from "mongodb";

export interface UserInterface {
  _id: ObjectId;
  email: string;
  username: string;
  refreshTokens: string[];
  passkeys: PasskeyInterface[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface PasskeyInterface {
  credentialID: string;
  publicKey: any;
  transports: string[];
  deviceName: string;
  counter: number;
}
