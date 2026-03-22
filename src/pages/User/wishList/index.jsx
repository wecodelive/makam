import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { getWishlist } from "../../../services/adminFunctions";
import DisplayProduct from "./components/displayProduct";
import { notifyError } from "../../../utils/notify";

export default function WishList() {
  const navigate = useNavigate();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  useEffect(() => {
    if (localStorage.getItem("adminId")) {
      navigate("/admin", { replace: true });
    }
  }, [navigate]);

  // Fetch wishlist on mount
  useEffect(() => {
    fetchWishlist();
  }, [pagination.page]);

  const fetchWishlist = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getWishlist({
        page: pagination.page,
        limit: pagination.limit,
      });

      if (response?.success) {
        setWishlistItems(response.wishlistItems || []);
        setPagination(response.pagination || pagination);
      } else {
        setError(response?.message || "Failed to load wishlist");
      }
    } catch (err) {
      console.error("Error fetching wishlist:", err);
      const errorMsg = err.response?.data?.message || "Failed to load wishlist";
      setError(errorMsg);
      notifyError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveItem = (wishlistItemId) => {
    setWishlistItems((prev) =>
      prev.filter((item) => item.id !== wishlistItemId),
    );
    // Update pagination if needed
    if (wishlistItems.length === 1 && pagination.page > 1) {
      setPagination((prev) => ({ ...prev, page: prev.page - 1 }));
    }
  };

  return (
    <div className="px-4 pb-20">
      <div className="self-center text-center gap-2 text-[16px] capitalize mt-2">
        <span className="flex gap-2 items-center text-[500] text-[15px] tracking-[1px] ">
          <h3 className="text-[#000000A8]">Home</h3> / <h3>Wishlist</h3>
        </span>
      </div>

      <h1 className="pb-3.25 font-extrabold text-[20px] leading-10 tracking-[2px] uppercase">
        My Wishlist
      </h1>

      {!isLoading && wishlistItems.length > 0 && (
        <p className="text-[12px] text-[#0000008C] mb-3">
          {pagination.total || wishlistItems.length} item
          {(pagination.total || wishlistItems.length) > 1 ? "s" : ""}
        </p>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 text-sm rounded">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="border border-[#DFDFDF] rounded-xl p-8 text-center bg-white">
          <p className="text-[#0000008C]">Loading your wishlist...</p>
        </div>
      ) : wishlistItems.length === 0 ? (
        <div className="border border-[#DFDFDF] rounded-xl p-12 text-center bg-white">
          <h3 className="text-[18px] font-medium text-[#000000A8]">
            Your wishlist is empty
          </h3>
          <p className="text-[12px] text-[#0000008C] mt-2">
            Add products to your wishlist to save them for later
          </p>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-4 my-2">
            {wishlistItems.map((item) => (
              <DisplayProduct
                key={item.id}
                wishlistItem={item}
                onRemove={handleRemoveItem}
              />
            ))}
          </div>

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 my-6">
              {pagination.page > 1 && (
                <button
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                  }
                  className="px-4 py-2 border border-[#DFDFDF] text-sm rounded-lg bg-white"
                >
                  Previous
                </button>
              )}
              <span className="px-4 py-2 text-sm text-[#0000008C]">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              {pagination.page < pagination.totalPages && (
                <button
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                  }
                  className="px-4 py-2 border border-[#DFDFDF] text-sm rounded-lg bg-white"
                >
                  Next
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
