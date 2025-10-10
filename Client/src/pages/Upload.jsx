import React, { useState, useRef } from "react";
import { ethers } from "ethers";
import axios from "axios";
import Section from "../components/Section";
import { grid } from "../assets";
import Button from "../components/Button";
import {
  CONTRACT_ADDRESS,
  CONTRACT_ABI,
  PINATA_API_KEY,
  PINATA_SECRET_KEY,
} from "../config";

const UploadFile = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const openFileDialog = () => fileInputRef.current.click();

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles((prev) => [...prev, ...files]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    setSelectedFiles((prev) => [...prev, ...files]);
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleRemoveFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Upload single file to Pinata
  const uploadToPinata = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const metadata = JSON.stringify({ name: file.name });
    formData.append("pinataMetadata", metadata);

    const options = JSON.stringify({ cidVersion: 1 });
    formData.append("pinataOptions", options);

    const res = await axios.post(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      formData,
      {
        maxContentLength: "Infinity",
        headers: {
          "Content-Type": `multipart/form-data; boundary=${formData._boundary}`,
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_SECRET_KEY,
        },
      }
    );

    return res.data.IpfsHash;
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      alert("Please select files to upload");
      return;
    }

    setUploading(true);

    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      for (const file of selectedFiles) {
    const ipfsHash = await uploadToPinata(file);
    try {
        const tx = await contract.uploadFile(ipfsHash, { gasLimit: 500000 });
        await tx.wait();
        console.log(`Uploaded ${file.name} with CID: ${ipfsHash}`);
    } catch (err) {
        console.error("Upload failed:", err.error?.message || err.message);
    }
}


      alert("All files uploaded successfully!");
      setSelectedFiles([]);
    } catch (err) {
      console.error("Upload error:", err);
      alert("Error uploading files. Check console for details.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Section className="overflow-hidden">
      <div className="container">
        <h1 className="text-center h3 mb-10">Upload Your Files</h1>

        <div
          className="relative p-10 rounded-[2.5rem] bg-n-8 overflow-hidden mb-12"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <div className="absolute top-0 left-0 max-w-full opacity-40">
            <img src={grid} alt="Grid" className="w-full" />
          </div>

          <div className="relative z-10 border-2 border-dashed border-color-1 rounded-[2rem] p-10 text-center">
            <p className="text-lg mb-4 text-n-3">Drag & Drop your files here</p>
            <p className="text-sm text-n-4 mb-4">or</p>

            {selectedFiles.length === 0 && <Button onClick={openFileDialog}>Select Files</Button>}

            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />

            {selectedFiles.length > 0 && (
              <div className="mt-4">
                <div className="flex flex-wrap justify-center gap-4 mb-4">
                  {selectedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 bg-n-6 px-4 py-2 rounded-full"
                    >
                      <span>{file.name}</span>
                      <button
                        className="text-red-500 font-bold"
                        onClick={() => handleRemoveFile(index)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex justify-center">
                  <Button onClick={handleUpload} disabled={uploading}>
                    {uploading ? "Uploading..." : "Upload"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Section>
  );
};

export default UploadFile;
