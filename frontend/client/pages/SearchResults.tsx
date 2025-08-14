import { useEffect } from "react";
import Header from "../components/Header";
import SearchResultsForm from "../components/SearchResultsForm";
import Footer from "../components/Footer";
import ProtectedRoute from "../components/ProtectedRoute";

const SearchResults: React.FC = () => {
  useEffect(() => {
    document.title = "Search Results | Ikmangaman.lk";
  }, []);

  return (
    <ProtectedRoute>
      <div className="min-h-screen">
        <Header />
        <SearchResultsForm />
        <Footer />
      </div>
    </ProtectedRoute>
  );
};

export default SearchResults;
