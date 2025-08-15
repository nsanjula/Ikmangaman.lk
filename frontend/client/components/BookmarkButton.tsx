import React, { useState, useEffect } from "react";
import { FiBookmark } from "react-icons/fi";
import { FiCheck } from "react-icons/fi";
import { authAPI } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";

interface BookmarkButtonProps {
  destinationName: string;
  variant?: "card" | "page";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const BookmarkButton: React.FC<BookmarkButtonProps> = ({
  destinationName,
  variant = "card",
  size = "md",
  className = "",
}) => {
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { isAuthenticated } = useAuth();

  // Check if this destination is already saved
  useEffect(() => {
    if (!isAuthenticated) return;

    const checkSavedStatus = async () => {
      try {
        const savedPlaces = await authAPI.getSavedPlaces();
        const isAlreadySaved = savedPlaces.some(
          (place) => place.name.toLowerCase() === destinationName.toLowerCase()
        );
        setIsSaved(isAlreadySaved);
      } catch (error) {
        console.warn("Failed to check saved status:", error);
      }
    };

    checkSavedStatus();
  }, [destinationName, isAuthenticated]);

  const handleBookmarkClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      // Could show a login prompt here
      console.warn("User must be logged in to save places");
      return;
    }

    setIsLoading(true);

    try {
      if (isSaved) {
        // Unsave the place
        await authAPI.unsavePlace(destinationName);
        setIsSaved(false);
      } else {
        // Save the place
        const result = await authAPI.savePlace(destinationName);
        setIsSaved(true);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);

        // If the response indicates place was already saved, no need for extra feedback
        if (result.message === "Place already saved") {
          console.log("Place was already in saved places");
        }
      }
    } catch (error) {
      console.error("Failed to toggle bookmark:", error);
      // You could show an error toast here
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null; // Don't show bookmark button for unauthenticated users
  }

  // Style configurations based on variant and size
  const getButtonStyles = () => {
    const baseStyles = "flex items-center justify-center transition-all duration-200";

    let sizeStyles = "";
    switch (size) {
      case "sm":
        sizeStyles = "w-8 h-8 text-sm";
        break;
      case "md":
        sizeStyles = "w-10 h-10 text-base";
        break;
      case "lg":
        sizeStyles = "w-12 h-12 text-lg";
        break;
    }

    let variantStyles = "";
    if (variant === "card") {
      variantStyles = "rounded-full shadow-md backdrop-blur-sm";
    } else if (variant === "page") {
      variantStyles = "btn btn-secondary";
    }

    return `${baseStyles} ${sizeStyles} ${variantStyles} ${className}`;
  };

  const getButtonStyle = () => {
    if (variant === "card") {
      return {
        background: isSaved ? 'var(--primary-600)' : 'rgba(255, 255, 255, 0.9)',
        color: isSaved ? 'white' : '#6B7280',
        border: 'none'
      };
    } else {
      return {
        borderColor: isSaved ? 'var(--primary-600)' : 'var(--border)',
        color: isSaved ? 'var(--primary-600)' : 'var(--text-900)',
        backgroundColor: isSaved ? 'var(--primary-100)' : 'transparent'
      };
    }
  };

  const getIconSize = () => {
    switch (size) {
      case "sm":
        return "w-4 h-4";
      case "md":
        return "w-5 h-5";
      case "lg":
        return "w-6 h-6";
      default:
        return "w-5 h-5";
    }
  };

  const renderIcon = () => {
    if (isLoading) {
      return (
        <div className={`animate-spin rounded-full border-2 border-current border-t-transparent ${getIconSize()}`} />
      );
    }

    if (showSuccess) {
      return <FiCheck className={getIconSize()} />;
    }

    // Use bookmark icon for both variants, fill when saved
    return <FiBookmark className={`${getIconSize()} ${isSaved ? "fill-current" : ""}`} />;
  };

  const getTitle = () => {
    if (isSaved) {
      return `Remove ${destinationName} from saved places`;
    }
    return `Save ${destinationName} to your places`;
  };

  const getButtonText = () => {
    if (variant === "page") {
      if (isLoading) return "Saving...";
      if (showSuccess) return "Saved!";
      return isSaved ? "Saved" : "Save Place";
    }
    return "";
  };

  return (
    <button
      onClick={handleBookmarkClick}
      className={getButtonStyles()}
      style={getButtonStyle()}
      title={getTitle()}
      disabled={isLoading}
      type="button"
    >
      {renderIcon()}
      {variant === "page" && (
        <span className="ml-2">{getButtonText()}</span>
      )}
    </button>
  );
};

export default BookmarkButton;
