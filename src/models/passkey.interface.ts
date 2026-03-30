export interface IPasskeyInterface {
  userId: string;
  credentialId: string;
  publicKey: string;
  counter: number;
  transports?: string[];
  createdAt: Date;
}
