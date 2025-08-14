import { Article } from "@/app/dashboard/commandes/schema";
import React from "react";

const ArticleCard: React.FC<{ article: Article; variant?: string }> = ({
  article,
  variant,
}) => {
  if (variant === "modern") {
    return (
      <div className="group relative flex flex-row items-center bg-gradient-to-br from-emerald-50 via-white to-emerald-50 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-4 border border-emerald-100 hover:border-emerald-200 hover:-translate-y-1">
        {/* Image container with improved styling */}
        <div className="relative sm:w-28 sm:h-20 w-20 h-20 rounded-2xl overflow-hidden mb-3 ring-2 ring-emerald-200 group-hover:ring-emerald-300 transition-all duration-300">
          <img
            src={article.image}
            alt={article.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
        
        {/* Product name */}
        <h3 className="font-medium text-[10px] sm:text-xs text-gray-800 text-center leading-tight mb-2 px-1">
          {article.name.length > 33
            ? article.name.substring(0, 33) + "…"
            : article.name}
        </h3>
        
        {/* Quantity badge */}
        <div className="inline-flex items-center px-1 py-1 bg-amber-100 text-amber-700 text-[10px] sm:text-xs font-medium rounded-full mb-3">
          Qté: {article.quantity}
        </div>
        
        {/* Price section */}
        <div className="flex flex-col items-center gap-2 w-full ">
          <span className="bg-gradient-to-r from-amber-400 to-amber-500 text-white text-[10px] sm:text-xs font-semibold rounded-xl px-1 sm:px-2 py-1.5 shadow-sm">
            {article.price} €
          </span>
          <span className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-[10px] sm:text-xs font-semibold rounded-xl px-1 sm:px-2 py-1.5 shadow-sm">
            T : {article.totalPrice.toFixed(2)} €
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 p-4 w-40 border border-gray-100 hover:border-amber-200 hover:-translate-y-0.5">
      {/* Image container */}
      <div className="relative overflow-hidden rounded-xl mb-3">
        <img
          src={article.image}
          alt={article.name}
          className="w-full h-28 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
      
      {/* Product name */}
      <h3 className="font-medium text-xs text-gray-800 leading-tight mb-2 sm:text-[10px]">
        {article.name.length > 38
          ? article.name.substring(0, 38) + "..."
          : article.name}
      </h3>
      
      {/* Quantity */}
      <p className="text-xs text-gray-500 mb-3 flex items-center gap-1">
        <span className="w-1.5 h-1.5 bg-amber-400 rounded-full"></span>
        Quantité: {article.quantity}
      </p>
      
      {/* Price section */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-xs text-gray-500">Prix unitaire</span>
          <span className="font-semibold text-amber-600">{article.price} €</span>
        </div>
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-center py-2 rounded-lg">
          <span className="text-xs font-semibold">T : {article.totalPrice.toFixed(2)} €</span>
        </div>
      </div>
    </div>
  );
};

export default ArticleCard;