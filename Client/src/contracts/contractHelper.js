import { ethers } from "ethers";
import FileStorageABI from "./contracts/FileStorage.json";
import { FILE_STORAGE_ADDRESS } from "./config";

export const getContract = async () => {
  if (!window.ethereum) throw new Error("MetaMask not installed");
  
  await window.ethereum.request({ method: "eth_requestAccounts" });
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const contract = new ethers.Contract(FILE_STORAGE_ADDRESS, FileStorageABI.abi, signer);

  return contract;
};
