import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import Section from "../components/Section";
import Button from "../components/Button";
import { AiFillFilePdf, AiFillFileImage, AiFillFileWord, AiFillFile } from "react-icons/ai";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../config";
import { grid } from "../assets";

const getFileIcon = (fileType) => {
  if (fileType.includes("pdf")) return <AiFillFilePdf size={40} color="#e74c3c" />;
  if (fileType.includes("word") || fileType.includes("doc")) return <AiFillFileWord size={40} color="#2a5bd7" />;
  if (fileType.includes("image")) return <AiFillFileImage size={40} color="#f1c40f" />;
  return <AiFillFile size={40} />;
};

const Inventory = () => {
  const [myFiles, setMyFiles] = useState([]);
  const [otherFiles, setOtherFiles] = useState([]);
  const [viewMode, setViewMode] = useState(null); // "myFiles" or "otherUsers"
  const [userAddress, setUserAddress] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (viewMode === "myFiles") fetchMyFiles();
    if (viewMode === "otherUsers" && selectedUser) fetchOtherFiles(selectedUser);
  }, [viewMode, selectedUser]);

  // ----------------- Fetch current user's files -----------------
  const fetchMyFiles = async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      if (!window.ethereum) return alert("MetaMask not found!");

      const [account] = await window.ethereum.request({ method: "eth_requestAccounts" });
      if (!account) return alert("No wallet connected!");

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const files = await contract.display(account);
      const formatted = files.map((f) => ({
        name: f.name,
        ipfsHash: f.hash,
        owner: f.owner,
        type: f.name.split(".").pop(),
      }));

      setMyFiles(formatted);
    } catch (err) {
      console.error("Error fetching my files:", err);
      setErrorMsg("Failed to load your files. Please try again.");
      setMyFiles([]);
    } finally {
      setLoading(false);
    }
  };

  // ----------------- Fetch another user's shared files -----------------
  const fetchOtherFiles = async (ownerAddress) => {
    try {
      setLoading(true);
      setErrorMsg("");
      if (!window.ethereum) return alert("MetaMask not found!");

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const files = await contract.getSharedFiles(ownerAddress);

      // If contract throws or returns empty → likely no access
      if (!files || files.length === 0) {
        setOtherFiles([]);
        setErrorMsg("No files found or you don't have access to this user's uploads.");
        return;
      }

      const formatted = files.map((f) => ({
        name: f.name,
        ipfsHash: f.hash,
        owner: f.owner,
        type: f.name.split(".").pop(),
      }));

      setOtherFiles(formatted);
    } catch (err) {
      console.error("Error fetching shared files:", err);
      setOtherFiles([]);
      setErrorMsg("You don't have access to this user's files or an error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // ----------------- File download -----------------
  const handleDownload = (file) => {
    const url = `https://gateway.pinata.cloud/ipfs/${file.ipfsHash}`;
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const filesToShow = viewMode === "myFiles" ? myFiles : otherFiles;

  // ----------------- Render -----------------
  return (
    <Section className="overflow-hidden">
      <div className="container">
        <h1 className="text-center h3 mb-8">Inventory</h1>

        {/* Step 1: Choose Mode */}
        {viewMode === null && (
          <div className="flex justify-center gap-8 mb-12">
            <Button onClick={() => setViewMode("myFiles")}>My Files</Button>
            <Button onClick={() => setViewMode("otherUsers")}>Other Users</Button>
          </div>
        )}

        {/* Step 2: Other User Mode Input */}
        {viewMode === "otherUsers" && (
          <div className="flex flex-col items-center mb-8">
            <input
              type="text"
              placeholder="Enter user's wallet address..."
              className="px-4 py-2 border border-n-4 rounded-lg w-full max-w-md mb-4"
              value={userAddress}
              onChange={(e) => setUserAddress(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && setSelectedUser(userAddress.trim())}
            />
            <Button onClick={() => setSelectedUser(userAddress.trim())}>View Files</Button>
          </div>
        )}

        {/* Step 3: File Display */}
        {loading ? (
          <p className="text-center text-n-3 text-lg">Loading files...</p>
        ) : errorMsg ? (
          <p className="text-center text-red-400 text-lg">{errorMsg}</p>
        ) : filesToShow.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filesToShow.map((file, idx) => (
              <div
                key={idx}
                className="relative p-8 bg-n-8 rounded-[2.4375rem] overflow-hidden shadow-lg transition hover:scale-105"
              >
                <div className="absolute top-0 left-0 max-w-full opacity-40">
                  <img src={grid} alt="Grid" className="w-full" />
                </div>
                <div className="relative z-10">
                  <div className="mb-6 flex justify-center items-center h-48">
                    {file.type.startsWith("image") ? (
                      <img
                        src={`https://gateway.pinata.cloud/ipfs/${file.ipfsHash}`}
                        alt={file.name}
                        className="w-full h-48 object-cover rounded-xl"
                      />
                    ) : (
                      getFileIcon(file.type)
                    )}
                  </div>
                  <h4 className="text-center text-n-1 truncate mb-4">{file.name}</h4>
                  <div className="flex justify-center">
                    <Button onClick={() => handleDownload(file)}>Download</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-n-3 text-lg">
            {viewMode === "myFiles"
              ? "You have not uploaded any files yet."
              : selectedUser
              ? "No shared files found or access denied."
              : "Enter a user address to view their shared files."}
          </p>
        )}
      </div>
    </Section>
  );
};

export default Inventory;
