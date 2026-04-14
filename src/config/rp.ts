import config from "./config";

interface RP {
  name: string;
  id: string;
  origin: string;
}

export const rp: RP = {
  name: config.rpName,
  id: config.rpId,
  origin: config.rpOrigin,
};
