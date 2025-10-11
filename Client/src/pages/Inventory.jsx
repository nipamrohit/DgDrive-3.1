import React, { useEffect, useState, useMemo } from "react";
import { ethers } from "ethers";
import ClipPath from "../assets/svg/ClipPath";
import { GradientLight } from "../components/design/Benefits";
import Section from "../components/Section";
import Button from "../components/Button";
import { 
  AiFillFilePdf, 
  AiFillFileImage, 
  AiFillFileWord, 
  AiFillFile, 
  AiOutlineArrowLeft, 
  AiOutlineEye,
  AiOutlineSearch,
  AiOutlineAppstore,
  AiOutlineBars,
  AiOutlineDownload,
  AiOutlineShareAlt,
  AiOutlineFileText,
  AiOutlinePieChart,
  AiOutlineCloudUpload,
  AiOutlineFolderOpen,
  AiOutlineStar,
  AiOutlineHeart,
  AiOutlineBarChart,
  AiOutlineHistory,
  AiOutlineEdit,
  AiOutlineDelete,
  AiOutlineHome
} from "react-icons/ai";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../config";

const getFileIcon = (fileType, size = 32) => {
  if (fileType.includes("pdf")) return <AiFillFilePdf size={size} color="#e74c3c" />;
  if (fileType.includes("word") || fileType.includes("doc")) return <AiFillFileWord size={size} color="#2a5bd7" />;
  if (fileType.includes("image") || fileType.includes("jpg") || fileType.includes("png")) return <AiFillFileImage size={size} color="#f1c40f" />;
  return <AiFillFile size={size} />;
};

const Inventory = () => {
  const [myFiles, setMyFiles] = useState([]);
  const [otherFiles, setOtherFiles] = useState([]);
  const [viewMode, setViewMode] = useState(null);
  const [userAddress, setUserAddress] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  // Enhanced UI States
  const [viewType, setViewType] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [favorites, setFavorites] = useState(new Set());
  const [previewFile, setPreviewFile] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  // Access History States
  const [accessHistory, setAccessHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [editingNickname, setEditingNickname] = useState(null);
  const [tempNickname, setTempNickname] = useState('');

  // CORS-friendly IPFS gateways
  const ipfsGateways = [
    "https://ipfs.io/ipfs/",
    "https://cloudflare-ipfs.com/ipfs/",
    "https://dweb.link/ipfs/",
    "https://gateway.pinata.cloud/ipfs/"
  ];
  const [currentGatewayIndex, setCurrentGatewayIndex] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem('inventory-favorites');
    if (saved) setFavorites(new Set(JSON.parse(saved)));
  }, []);

  useEffect(() => {
    localStorage.setItem('inventory-favorites', JSON.stringify([...favorites]));
  }, [favorites]);

  // Load access history on component mount
  useEffect(() => {
    const saved = localStorage.getItem('inventory-access-history');
    if (saved) {
      setAccessHistory(JSON.parse(saved));
    }
  }, []);

  const getIpfsUrl = (hash) => `${ipfsGateways[currentGatewayIndex]}${hash}`;

  const tryNextGateway = () => {
    setCurrentGatewayIndex((prev) => (prev + 1) % ipfsGateways.length);
  };

  const processFiles = (files, ownerAddress) => {
    return files.map((file, index) => {
      const name = file.name || file[0];
      const ipfsHash = file.ipfsHash || file[1];
      const fileExtension = name.split('.').pop().toLowerCase();
      
      return {
        id: `${ownerAddress}-${index}`,
        name,
        ipfsHash,
        owner: ownerAddress,
        type: fileExtension,
        size: Math.floor(Math.random() * 10000000) + 100000,
        uploadDate: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
        category: getFileCategory(fileExtension),
        isFavorite: favorites.has(`${ownerAddress}-${index}`)
      };
    });
  };

  const getFileCategory = (extension) => {
    const categories = {
      images: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'],
      videos: ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'],
      documents: ['pdf', 'doc', 'docx', 'txt', 'rtf', 'xls', 'xlsx'],
      audio: ['mp3', 'wav', 'flac', 'aac', 'ogg'],
      code: ['js', 'html', 'css', 'py', 'java', 'cpp'],
      archives: ['zip', 'rar', '7z', 'tar', 'gz']
    };
    for (const [category, extensions] of Object.entries(categories)) {
      if (extensions.includes(extension)) return category;
    }
    return 'other';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  useEffect(() => {
    if (viewMode === "myFiles") fetchMyFiles();
    if (viewMode === "otherUsers" && selectedUser) fetchOtherFiles(selectedUser);
  }, [viewMode, selectedUser]);

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
      const processedFiles = processFiles(files, account);
      setMyFiles(processedFiles);
    } catch (err) {
      console.error("Error fetching my files:", err);
      setErrorMsg("Failed to load your files. Please try again.");
      setMyFiles([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchOtherFiles = async (ownerAddress) => {
    try {
      setLoading(true);
      setErrorMsg("");
      if (!window.ethereum) return alert("MetaMask not found!");

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const files = await contract.display(ownerAddress);

      if (!files || files.length === 0) {
        setOtherFiles([]);
        setErrorMsg("No files found or you don't have access to this user's uploads.");
        return;
      }

      const processedFiles = processFiles(files, ownerAddress);
      setOtherFiles(processedFiles);

      // Add to access history if successful and not already present
      const newHistory = accessHistory.filter(addr => addr.address !== ownerAddress);
      const historyEntry = {
        address: ownerAddress,
        lastAccessed: new Date().toISOString(),
        fileCount: files.length,
        nickname: newHistory.length > 0 ? newHistory[0].nickname : `User ${ownerAddress.slice(0, 6)}...${ownerAddress.slice(-4)}`
      };
      
      const updatedHistory = [historyEntry, ...newHistory].slice(0, 10); // Keep last 10
      setAccessHistory(updatedHistory);
      localStorage.setItem('inventory-access-history', JSON.stringify(updatedHistory));

    } catch (err) {
      console.error("Error fetching shared files:", err);
      setOtherFiles([]);
      setErrorMsg("You don't have access to this user's files or an error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedFiles = useMemo(() => {
    let files = viewMode === "myFiles" ? myFiles : otherFiles;
    
    if (searchTerm) {
      files = files.filter(file =>
        file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        file.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType !== 'all') {
      if (filterType === 'favorites') {
        files = files.filter(file => file.isFavorite);
      } else {
        files = files.filter(file => file.category === filterType);
      }
    }

    files.sort((a, b) => {
      const aValue = sortBy === 'size' ? a.size : a.name.toLowerCase();
      const bValue = sortBy === 'size' ? b.size : b.name.toLowerCase();
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    });

    return files;
  }, [myFiles, otherFiles, viewMode, searchTerm, filterType, sortBy, favorites]);

  const analytics = useMemo(() => {
    const files = viewMode === "myFiles" ? myFiles : otherFiles;
    const totalFiles = files.length;
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    const typeDistribution = files.reduce((acc, file) => {
      acc[file.category] = (acc[file.category] || 0) + 1;
      return acc;
    }, {});

    const sizeDistribution = files.reduce((acc, file) => {
      acc[file.category] = (acc[file.category] || 0) + file.size;
      return acc;
    }, {});

    return { 
      totalFiles, 
      totalSize, 
      typeDistribution, 
      sizeDistribution,
      favoriteCount: files.filter(f => f.isFavorite).length,
      averageFileSize: totalFiles > 0 ? totalSize / totalFiles : 0
    };
  }, [myFiles, otherFiles, viewMode, favorites]);

  // Nickname management functions
  const addNickname = (address, nickname) => {
    const updatedHistory = accessHistory.map(entry => 
      entry.address === address 
        ? { ...entry, nickname } 
        : entry
    );
    setAccessHistory(updatedHistory);
    localStorage.setItem('inventory-access-history', JSON.stringify(updatedHistory));
  };

  const removeFromHistory = (address) => {
    const newHistory = accessHistory.filter(h => h.address !== address);
    setAccessHistory(newHistory);
    localStorage.setItem('inventory-access-history', JSON.stringify(newHistory));
  };

  const startEditingNickname = (address, currentNickname) => {
    setEditingNickname(address);
    setTempNickname(currentNickname || '');
  };

  const saveNickname = (address) => {
    if (tempNickname.trim()) {
      addNickname(address, tempNickname.trim());
    }
    setEditingNickname(null);
    setTempNickname('');
  };

  const toggleFavorite = (fileId) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(fileId)) {
      newFavorites.delete(fileId);
    } else {
      newFavorites.add(fileId);
    }
    setFavorites(newFavorites);
  };

  const handleDownload = async (file) => {
    let attempts = 0;
    const maxAttempts = ipfsGateways.length;

    const attemptDownload = async (gatewayIndex) => {
      try {
        const url = `${ipfsGateways[gatewayIndex]}${file.ipfsHash}`;
        const response = await fetch(url, {
          mode: 'cors',
          headers: {
            'Accept': '*/*',
          },
        });
        
        if (!response.ok) throw new Error('Download failed');
        
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        
        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(downloadUrl);
        return true;
      } catch (err) {
        console.error(`Download failed with gateway ${gatewayIndex}:`, err);
        return false;
      }
    };

    // Try all gateways
    for (let i = 0; i < maxAttempts; i++) {
      const gatewayIndex = (currentGatewayIndex + i) % ipfsGateways.length;
      const success = await attemptDownload(gatewayIndex);
      
      if (success) {
        setCurrentGatewayIndex(gatewayIndex);
        return;
      }
    }

    // If all gateways fail, open in new tab
    window.open(getIpfsUrl(file.ipfsHash), '_blank');
  };

  const handlePreview = (file) => {
    setPreviewFile(file);
    setShowPreview(true);
  };

  const handleBack = () => {
    setViewMode(null);
    setSelectedUser("");
    setUserAddress("");
    setFilterType("all");
    setSearchTerm("");
    setOtherFiles([]);
    setMyFiles([]);
    setErrorMsg("");
    setShowHistory(false);
    setEditingNickname(null);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterType("all");
    setSortBy("name");
  };

  // Enhanced Preview Modal with CORS fix
  const PreviewModal = () => {
    const [imageError, setImageError] = useState(false);
    const [currentPreviewGateway, setCurrentPreviewGateway] = useState(0);

    if (!showPreview || !previewFile) return null;

    const isImage = ["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(previewFile.type);

    const handleImageError = () => {
      if (currentPreviewGateway < ipfsGateways.length - 1) {
        setCurrentPreviewGateway(prev => prev + 1);
        setImageError(false);
      } else {
        setImageError(true);
      }
    };

    const getPreviewUrl = () => {
      return `${ipfsGateways[currentPreviewGateway]}${previewFile.ipfsHash}`;
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-n-8 rounded-2xl max-w-4xl max-h-[90vh] overflow-auto">
          <div className="p-6 border-b border-n-6 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-n-1">{previewFile.name}</h3>
              <p className="text-sm text-n-3">{formatFileSize(previewFile.size)} • {previewFile.type.toUpperCase()}</p>
            </div>
            <button 
              onClick={() => {
                setShowPreview(false);
                setImageError(false);
                setCurrentPreviewGateway(0);
              }} 
              className="text-n-3 hover:text-n-1 text-2xl"
            >
              ×
            </button>
          </div>
          <div className="p-6">
            {isImage && !imageError ? (
              <div className="text-center">
                <img
                  src={getPreviewUrl()}
                  alt={previewFile.name}
                  className="max-w-full max-h-[60vh] object-contain mx-auto rounded-xl"
                  crossOrigin="anonymous"
                  onError={handleImageError}
                  onLoad={() => console.log('Image loaded successfully')}
                />
                {currentPreviewGateway > 0 && (
                  <p className="text-xs text-n-4 mt-2">
                    Using alternative gateway due to loading issues
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">{getFileIcon(previewFile.type, 64)}</div>
                <p className="text-n-3 mb-4">
                  {imageError ? "Unable to load image preview" : "Preview not available for this file type"}
                </p>
                <Button onClick={() => handleDownload(previewFile)}>
                  Download to View
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Section>
      <div className="container mt-16">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="h2 mb-4">Smart Inventory</h2>
          <p className="text-n-4 max-w-2xl mx-auto">
            Manage and explore your decentralized files with advanced search and analytics
          </p>
        </div>

        {/* Main Mode Selection */}
        {viewMode === null && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <div className="block relative p-1 bg-no-repeat bg-[length:100%_100%] min-h-[24rem] hover:scale-105 transition-transform duration-300"
                 style={{ backgroundImage: `url(/src/assets/benefits/card-1.svg)` }}>
              <div className="relative z-2 flex flex-col justify-center min-h-[24rem] p-8 text-center">
                <div className="mb-8">
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-color-1 to-color-2 rounded-2xl flex items-center justify-center">
                    <AiOutlineFolderOpen className="text-3xl text-n-8" />
                  </div>
                  <h5 className="h5 mb-4">My Files</h5>
                  <p className="body-2 text-n-3 mb-8">
                    Access and manage your uploaded files with advanced search and filtering capabilities
                  </p>
                </div>
                <Button onClick={() => setViewMode("myFiles")} className="mx-auto">
                  Browse My Files
                </Button>
              </div>
              <GradientLight />
              <div className="absolute inset-1 bg-n-8 rounded-[2rem]" style={{ clipPath: "url(#benefits)" }}></div>
              <ClipPath />
            </div>

            <div className="block relative p-1 bg-no-repeat bg-[length:100%_100%] min-h-[24rem] hover:scale-105 transition-transform duration-300"
                 style={{ backgroundImage: `url(/src/assets/benefits/card-2.svg)` }}>
              <div className="relative z-2 flex flex-col justify-center min-h-[24rem] p-8 text-center">
                <div className="mb-8">
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-color-2 to-color-1 rounded-2xl flex items-center justify-center">
                    <AiOutlineFileText className="text-3xl text-n-8" />
                  </div>
                  <h5 className="h5 mb-4">Shared Files</h5>
                  <p className="body-2 text-n-3 mb-8">
                    Explore and access files that have been shared with you by other users on the network
                  </p>
                </div>
                <Button onClick={() => setViewMode("otherUsers")} className="mx-auto">
                  View Shared Files
                </Button>
              </div>
              <GradientLight />
              <div className="absolute inset-1 bg-n-8 rounded-[2rem]" style={{ clipPath: "url(#benefits)" }}></div>
              <ClipPath />
            </div>
          </div>
        )}

        {/* Enhanced Other User Address Input */}
        {viewMode === "otherUsers" && !selectedUser && (
          <div className="block relative p-1 bg-no-repeat bg-[length:100%_100%] mb-8"
               style={{ backgroundImage: `url(/src/assets/benefits/card-3.svg)` }}>
            <div className="relative z-2 p-8">
              {/* Enhanced Back Button and History Toggle */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
                <Button 
                  onClick={handleBack} 
                  className="flex items-center transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  {/* <AiOutlineHome className="mr-2" /> */}
                  Back to Main Menu
                </Button>
                {accessHistory.length > 0 && (
                  <Button 
                    onClick={() => setShowHistory(!showHistory)} 
                    className={`flex items-center transition-all duration-300 ${
                      showHistory 
                        ? 'bg-color-1 shadow-lg' 
                        : 'bg-n-7 hover:bg-n-6 border border-n-6'
                    }`}
                  >
                    {/* <AiOutlineHistory className="mr-2" /> */}
                    Recent Access ({accessHistory.length})
                  </Button>
                )}
              </div>

              {/* Recent Addresses with Nicknames */}
              {showHistory && accessHistory.length > 0 && (
                <div className="mb-8 bg-n-7 rounded-2xl p-6">
                  <h6 className="text-lg font-semibold text-n-1 mb-4 flex items-center">
                    <AiOutlineHistory className="mr-2 text-color-1" />
                    Recently Accessed Addresses
                  </h6>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {accessHistory.map((entry, index) => (
                      <div 
                        key={entry.address}
                        className="flex items-center justify-between p-4 bg-n-6 rounded-xl hover:bg-n-5 transition-colors border border-n-5"
                      >
                        <div 
                          className="text-left flex-1 cursor-pointer"
                          onClick={() => {
                            setUserAddress(entry.address);
                            setSelectedUser(entry.address);
                            setShowHistory(false);
                          }}
                        >
                          {editingNickname === entry.address ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={tempNickname}
                                onChange={(e) => setTempNickname(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') saveNickname(entry.address);
                                  if (e.key === 'Escape') {
                                    setEditingNickname(null);
                                    setTempNickname('');
                                  }
                                }}
                                className="px-2 py-1 text-sm bg-n-7 border border-n-5 rounded text-n-1"
                                placeholder="Enter nickname..."
                                autoFocus
                              />
                              <Button 
                                onClick={() => saveNickname(entry.address)}
                                className="text-xs px-2 py-1 bg-green-500 hover:bg-green-600"
                              >
                                ✓
                              </Button>
                              <Button 
                                onClick={() => {
                                  setEditingNickname(null);
                                  setTempNickname('');
                                }}
                                className="text-xs px-2 py-1 bg-red-500 hover:bg-red-600"
                              >
                                ✕
                              </Button>
                            </div>
                          ) : (
                            <>
                              <p className="text-sm font-medium text-n-1">
                                {entry.nickname || `User ${entry.address.slice(0, 6)}...${entry.address.slice(-4)}`}
                              </p>
                              <p className="text-xs text-n-4">
                                {entry.address.slice(0, 16)}...{entry.address.slice(-8)} • {entry.fileCount} files
                              </p>
                              <p className="text-xs text-n-5">
                                Last accessed: {new Date(entry.lastAccessed).toLocaleDateString()}
                              </p>
                            </>
                          )}
                        </div>
                        <div className="flex items-center gap-1 ml-4">
                          <Button 
                            onClick={(e) => {
                              e.stopPropagation();
                              startEditingNickname(entry.address, entry.nickname);
                            }}
                            className="text-xs px-2 py-1 bg-blue-500 hover:bg-blue-600"
                            title="Edit nickname"
                          >
                            <AiOutlineEdit size={12} />
                          </Button>
                          <Button 
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm('Remove this address from history?')) {
                                removeFromHistory(entry.address);
                              }
                            }}
                            className="text-xs px-2 py-1 bg-red-500 hover:bg-red-600"
                            title="Remove from history"
                          >
                            <AiOutlineDelete size={12} />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Address Input Form */}
              <div className="max-w-lg mx-auto text-center">
                <h5 className="h5 mb-4">Enter Wallet Address</h5>
                <p className="text-n-4 mb-6">
                  Enter the Ethereum wallet address of the user whose files you want to access
                </p>
                
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="0x742d35Cc6601C590F3b1f8c020542A5FaC7C0A28"
                    className="w-full px-6 py-4 bg-n-7 border border-n-6 rounded-2xl text-n-1 placeholder-n-4 focus:border-color-1 transition-colors"
                    value={userAddress}
                    onChange={(e) => setUserAddress(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && setSelectedUser(userAddress.trim())}
                  />
                  <Button 
                    onClick={() => setSelectedUser(userAddress.trim())} 
                    className="w-full hover:to-color-1 transition-all duration-300"
                    disabled={!userAddress.trim()}
                  >
                    Access Files
                  </Button>
                </div>
              </div>
            </div>
            <GradientLight />
            <div className="absolute inset-1 bg-n-8 rounded-[2rem]" style={{ clipPath: "url(#benefits)" }}></div>
            <ClipPath />
          </div>
        )}

        {/* Main Interface */}
        {(viewMode === "myFiles" || (viewMode === "otherUsers" && selectedUser)) && (
          <>
            {/* Clean Control Bar */}
            <div className="block relative p-1 bg-no-repeat bg-[length:100%_100%] mb-8"
                 style={{ backgroundImage: `url(/src/assets/benefits/card-3.svg)` }}>
              <div className="relative z-2 p-6">
                {/* Top Row - Enhanced Back and Title */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <Button 
                      onClick={handleBack} 
                      className="flex items-center hover:to-color-1 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      {/* <AiOutlineHome className="mr-2" /> */}
                      Back to Main Menu
                    </Button>
                    <h5 className="h5">{viewMode === "myFiles" ? "My Files" : "Shared Files"}</h5>
                  </div>
                </div>

                {/* Search and Filters Row */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                  {/* Search - Takes more space */}
                  <div className="lg:col-span-6 relative">
                    <AiOutlineSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-n-4" />
                    <input
                      type="text"
                      placeholder="Search files by name or type..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-n-7 border border-n-6 rounded-xl text-n-1 placeholder-n-4 focus:border-color-1 transition-colors"
                    />
                  </div>

                  {/* Filter */}
                  <div className="lg:col-span-2">
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="w-full px-4 py-3 bg-n-7 border border-n-6 rounded-xl text-n-1 focus:border-color-1 transition-colors"
                    >
                      <option value="all">All Types</option>
                      <option value="favorites">⭐ Favorites</option>
                      <option value="images">🖼️ Images</option>
                      <option value="videos">🎥 Videos</option>
                      <option value="documents">📄 Documents</option>
                      <option value="audio">🎵 Audio</option>
                    </select>
                  </div>

                  {/* Sort */}
                  <div className="lg:col-span-2">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full px-4 py-3 bg-n-7 border border-n-6 rounded-xl text-n-1 focus:border-color-1 transition-colors"
                    >
                      <option value="name">Sort by Name</option>
                      <option value="size">Sort by Size</option>
                      <option value="type">Sort by Type</option>
                    </select>
                  </div>

                  {/* View Toggle and Clear */}
                  <div className="lg:col-span-2 flex gap-2">
                    <div className="flex bg-n-7 rounded-xl border border-n-6 flex-1">
                      <button
                        onClick={() => setViewType('grid')}
                        className={`flex-1 p-3 rounded-l-xl transition-colors ${
                          viewType === 'grid' ? 'bg-color-1 text-n-8' : 'text-n-4 hover:text-n-1'
                        }`}
                      >
                        <AiOutlineAppstore />
                      </button>
                      <button
                        onClick={() => setViewType('list')}
                        className={`flex-1 p-3 rounded-r-xl transition-colors ${
                          viewType === 'list' ? 'bg-color-1 text-n-8' : 'text-n-4 hover:text-n-1'
                        }`}
                      >
                        <AiOutlineBars />
                      </button>
                    </div>
                    {(searchTerm || filterType !== 'all') && (
                      <Button onClick={clearFilters} className="px-4 py-3 text-sm">
                        Clear
                      </Button>
                    )}
                  </div>
                </div>

                {/* Results Info */}
                <div className="flex justify-between items-center mt-4 text-sm text-n-4">
                  <span>
                    Showing {filteredAndSortedFiles.length} file{filteredAndSortedFiles.length !== 1 ? 's' : ''}
                    {searchTerm && ` matching "${searchTerm}"`}
                    {filterType !== 'all' && ` in ${filterType}`}
                  </span>
                </div>
              </div>
              <GradientLight />
              <div className="absolute inset-1 bg-n-8 rounded-[2rem]" style={{ clipPath: "url(#benefits)" }}></div>
              <ClipPath />
            </div>

            {/* Files Display */}
            <div className="block relative p-1 bg-no-repeat bg-[length:100%_100%] mb-8"
                 style={{ backgroundImage: `url(/src/assets/benefits/card-1.svg)` }}>
              <div className="relative z-2 p-6 min-h-[32rem]">
                {loading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-color-1 mx-auto mb-4"></div>
                      <p className="text-n-3 text-lg">Loading files...</p>
                    </div>
                  </div>
                ) : errorMsg ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <div className="text-6xl text-red-400 mb-4">⚠️</div>
                      <p className="text-red-400 text-lg">{errorMsg}</p>
                    </div>
                  </div>
                ) : filteredAndSortedFiles.length > 0 ? (
                  <>
                    {viewType === 'grid' ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredAndSortedFiles.map((file) => (
                          <div key={file.id} className="bg-n-7 rounded-2xl p-5 hover:bg-n-6 transition-all duration-300 hover:scale-105">
                            <div className="flex justify-between items-start mb-4">
                              <div className="text-3xl">{getFileIcon(file.type)}</div>
                              <button
                                onClick={() => toggleFavorite(file.id)}
                                className={`transition-colors ${file.isFavorite ? 'text-yellow-400' : 'text-n-4 hover:text-yellow-400'}`}
                              >
                                <AiOutlineStar className={file.isFavorite ? 'fill-current' : ''} size={18} />
                              </button>
                            </div>
                            
                            <h6 className="text-sm font-semibold text-n-1 mb-2 truncate" title={file.name}>
                              {file.name}
                            </h6>
                            <div className="text-xs text-n-4 mb-4 space-y-1">
                              <div>{formatFileSize(file.size)}</div>
                              <div className="uppercase">{file.type}</div>
                            </div>
                            
                            <div className="flex gap-2">
                              <Button 
                                onClick={() => handlePreview(file)} 
                                className="flex-1 text-xs py-2 bg-n-6 hover:bg-n-5"
                              >
                                <AiOutlineEye className="mr-1" />
                                Preview
                              </Button>
                              <Button 
                                onClick={() => handleDownload(file)} 
                                className="text-xs py-2 px-4 bg-color-1 hover:bg-color-2"
                              >
                                <AiOutlineDownload />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {filteredAndSortedFiles.map((file) => (
                          <div key={file.id} className="flex items-center p-4 bg-n-7 rounded-xl hover:bg-n-6 transition-colors">
                            <div className="text-2xl mr-4">{getFileIcon(file.type, 28)}</div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="text-sm font-medium text-n-1 truncate">{file.name}</p>
                                <button
                                  onClick={() => toggleFavorite(file.id)}
                                  className={`transition-colors ${file.isFavorite ? 'text-yellow-400' : 'text-n-4 hover:text-yellow-400'}`}
                                >
                                  <AiOutlineStar className={file.isFavorite ? 'fill-current' : ''} size={16} />
                                </button>
                              </div>
                              <p className="text-xs text-n-4">{formatFileSize(file.size)} • {file.type.toUpperCase()}</p>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              <button
                                onClick={() => handlePreview(file)}
                                className="p-2 text-n-4 hover:text-color-1 transition-colors rounded-lg hover:bg-n-6"
                              >
                                <AiOutlineEye size={18} />
                              </button>
                              <button
                                onClick={() => handleDownload(file)}
                                className="p-2 text-n-4 hover:text-color-1 transition-colors rounded-lg hover:bg-n-6"
                              >
                                <AiOutlineDownload size={18} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64">
                    <div className="text-6xl text-n-4 mb-6">📂</div>
                    <p className="text-n-3 text-xl text-center mb-4">
                      {viewMode === "myFiles"
                        ? searchTerm || filterType !== 'all'
                          ? "No files match your search criteria"
                          : "You haven't uploaded any files yet"
                        : selectedUser
                        ? searchTerm || filterType !== 'all'
                          ? "No files match your search criteria" 
                          : "No shared files found or access denied"
                        : "Enter a user address to view their shared files"}
                    </p>
                    {(searchTerm || filterType !== 'all') && (
                      <Button onClick={clearFilters}>
                        Clear Filters
                      </Button>
                    )}
                  </div>
                )}
              </div>
              <GradientLight />
              <div className="absolute inset-1 bg-n-8 rounded-[2rem]" style={{ clipPath: "url(#benefits)" }}></div>
              <ClipPath />
            </div>

            {/* Storage Analytics - Always Shown */}
            {filteredAndSortedFiles.length > 0 && (
              <div className="block relative p-1 bg-no-repeat bg-[length:100%_100%]"
                   style={{ backgroundImage: `url(/src/assets/benefits/card-4.svg)` }}>
                <div className="relative z-2 p-6">
                  <h5 className="h5 flex items-center mb-6">
                    <AiOutlinePieChart className="mr-3 text-color-1" />
                    Storage Analytics
                  </h5>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="text-center p-4 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-2xl">
                      <AiOutlineFileText className="mx-auto text-3xl text-blue-400 mb-2" />
                      <p className="text-2xl font-bold text-n-1">{analytics.totalFiles}</p>
                      <p className="text-sm text-n-4">Total Files</p>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-2xl">
                      <AiOutlineCloudUpload className="mx-auto text-3xl text-green-400 mb-2" />
                      <p className="text-2xl font-bold text-n-1">{formatFileSize(analytics.totalSize)}</p>
                      <p className="text-sm text-n-4">Total Size</p>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-2xl">
                      <AiOutlineHeart className="mx-auto text-3xl text-purple-400 mb-2" />
                      <p className="text-2xl font-bold text-n-1">{analytics.favoriteCount}</p>
                      <p className="text-sm text-n-4">Favorites</p>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-2xl">
                      <AiOutlineBarChart className="mx-auto text-3xl text-orange-400 mb-2" />
                      <p className="text-2xl font-bold text-n-1">{formatFileSize(analytics.averageFileSize)}</p>
                      <p className="text-sm text-n-4">Avg Size</p>
                    </div>
                  </div>

                  {/* Detailed Breakdown */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                      <h6 className="text-lg font-semibold text-n-1 mb-4 flex items-center">
                        <AiOutlinePieChart className="mr-2 text-color-1" />
                        File Type Distribution
                      </h6>
                      <div className="space-y-3">
                        {Object.entries(analytics.typeDistribution)
                          .sort(([,a], [,b]) => b - a)
                          .map(([type, count]) => (
                          <div key={type} className="flex items-center justify-between p-4 bg-n-7 rounded-xl">
                            <div className="flex items-center">
                              <div className="w-4 h-4 rounded-full bg-gradient-to-r from-color-1 to-color-2 mr-3"></div>
                              <span className="text-n-1 capitalize font-medium">{type}</span>
                            </div>
                            <div className="text-right">
                              <div className="text-n-1 font-semibold">{count} files</div>
                              <div className="text-xs text-n-4">
                                {((count / analytics.totalFiles) * 100).toFixed(1)}%
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h6 className="text-lg font-semibold text-n-1 mb-4 flex items-center">
                        <AiOutlineBarChart className="mr-2 text-color-1" />
                        Storage by Category
                      </h6>
                      <div className="space-y-3">
                        {Object.entries(analytics.sizeDistribution)
                          .sort(([,a], [,b]) => b - a)
                          .map(([type, size]) => (
                          <div key={type} className="flex items-center justify-between p-4 bg-n-7 rounded-xl">
                            <div className="flex items-center">
                              <div className="w-4 h-4 rounded-full bg-gradient-to-r from-color-2 to-color-1 mr-3"></div>
                              <span className="text-n-1 capitalize font-medium">{type}</span>
                            </div>
                            <div className="text-right">
                              <div className="text-n-1 font-semibold">{formatFileSize(size)}</div>
                              <div className="text-xs text-n-4">
                                {((size / analytics.totalSize) * 100).toFixed(1)}%
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <GradientLight />
                <div className="absolute inset-1 bg-n-8 rounded-[2rem]" style={{ clipPath: "url(#benefits)" }}></div>
                <ClipPath />
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Preview Modal */}
      <PreviewModal />
    </Section>
  );
};

export default Inventory;
