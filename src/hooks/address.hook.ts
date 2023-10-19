import { useCreateAddress } from ".";
import { useApp } from "../app";

export type Address = {
  data: string[];
  address: string;
  createAddress: () => Promise<{ address: string }>;
  switchAddress: (address: string) => void;
  setAddress: (address: string) => void;
}

export const useAddress = (): Address => {
  const app = useApp();
  const _createAddress = useCreateAddress();

  const createAddress = async () => {
    const { address } = await _createAddress.dispatch();
    app.setAddresses([...app.addresses, address]);
    return { address };
  };

  const switchAddress = (address: string) => {
    app.setAddress(address);
  };

  const setAddress = (address: string) => {
    app.setAddress(address);
  };

  return {
    address: app.address,
    data: app.addresses,
    createAddress,
    switchAddress,
    setAddress,
  };
};