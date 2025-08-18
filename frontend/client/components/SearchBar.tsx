import React, { useState, useRef } from "react";
import { FiCamera, FiSearch, FiX } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

interface SearchBarProps {
  onSearch?: (query: string, type: 'text' | 'image', image?: File) => void;
  className?: string;
}

export default function SearchBar({ onSearch, className = "" }: SearchBarProps) {
  const [searchText, setSearchText] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [searchMode, setSearchMode] = useState<'text' | 'image'>('text');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleTextSearch = () => {
    if (searchText.trim()) {
      if (onSearch) {
        onSearch(searchText.trim(), 'text');
      } else {
        // Navigate to search results page with text query
        navigate(`/search?q=${encodeURIComponent(searchText.trim())}&type=text`);
      }
    }
  };

  const handleImageSearch = (file: File) => {
    if (onSearch) {
      onSearch('', 'image', file);
    } else {
      // Navigate to search results page with image
      navigate('/search', { state: { imageFile: file, type: 'image' } });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchMode === 'text') {
      e.preventDefault();
      handleTextSearch();
    }
  };

  const handleCameraClick = () => {
    if (searchMode === 'image' && selectedImage) {
      // If already in image mode with an image, perform search
      handleImageSearch(selectedImage);
    } else {
      // Switch to image mode and open file picker
      setSearchMode('image');
      setSearchText('');
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      setSearchMode('image');
      setSearchText(`Image selected: ${file.name}`);
    }
  };

  const handleClearSearch = () => {
    setSearchText('');
    setSelectedImage(null);
    setSearchMode('text');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isSearchReady = searchMode === 'text' ? searchText.trim() : selectedImage;

  return (
    <div className={`relative ${className}`}>
      <div className="relative flex items-center">
        {/* Search Input */}
        <div className="relative flex-1">
          <input
            type="text"
            value={searchMode === 'image' && selectedImage ? `Image selected: ${selectedImage.name.length > 25 ? selectedImage.name.substring(0, 25) + '...' : selectedImage.name}` : searchText}
            onChange={(e) => {
              if (searchMode !== 'image' || !selectedImage) {
                setSearchText(e.target.value);
                if (searchMode === 'image') {
                  setSearchMode('text');
                  setSelectedImage(null);
                }
              }
            }}
            onKeyDown={handleKeyDown}
            placeholder={searchMode === 'image' ? "Click camera to select image..." : "Search destinations..."}
            className="w-full pl-10 pr-20 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all duration-200 text-sm"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: '#E2E8F0',
              color: 'var(--text-900)',
            }}
            readOnly={searchMode === 'image' && selectedImage !== null}
          />
          
          {/* Search Icon */}
          <FiSearch 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4"
            style={{ color: 'var(--text-600)' }}
          />

          {/* Clear Button */}
          {(searchText || selectedImage) && (
            <button
              onClick={handleClearSearch}
              className="absolute right-14 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
              type="button"
            >
              <FiX className="w-4 h-4" style={{ color: 'var(--text-600)' }} />
            </button>
          )}

          {/* Camera Button */}
          <button
            onClick={handleCameraClick}
            className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1.5 rounded-full transition-all duration-200 ${
              searchMode === 'image' 
                ? 'bg-cyan-500 text-white hover:bg-cyan-600' 
                : 'hover:bg-gray-100'
            }`}
            type="button"
            title={searchMode === 'image' && selectedImage ? "Search by image" : "Search by image"}
          >
            <FiCamera 
              className="w-4 h-4"
              style={{ 
                color: searchMode === 'image' ? 'white' : 'var(--text-600)'
              }}
            />
          </button>
        </div>

        {/* Search Button - Only show for text search, not for image search since camera button handles it */}
        {isSearchReady && searchMode === 'text' && (
          <button
            onClick={handleTextSearch}
            className="ml-2 px-4 py-2.5 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors duration-200 text-sm font-medium"
          >
            Search
          </button>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Image Preview */}
      {selectedImage && searchMode === 'image' && (
        <div className="absolute top-full left-0 right-0 mt-2 p-3 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <FiCamera className="w-5 h-5 text-gray-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">Image selected</p>
              <p className="text-xs text-gray-500 truncate" title={selectedImage.name}>
                {selectedImage.name.length > 30
                  ? `${selectedImage.name.substring(0, 30)}...`
                  : selectedImage.name
                }
              </p>
            </div>
            <button
              onClick={() => selectedImage && handleImageSearch(selectedImage)}
              className="px-3 py-1.5 bg-cyan-500 text-white rounded text-sm hover:bg-cyan-600 transition-colors flex-shrink-0"
            >
              Search
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
