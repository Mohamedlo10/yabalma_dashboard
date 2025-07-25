import { Article } from "@/app/dashboard/commandes/schema";
import React from "react";

const ArticleCard: React.FC<{ article: Article; variant?: string }> = ({
  article,
  variant,
}) => {
  if (variant === "modern") {
    return (
      <div className="flex flex-col items-center bg-blue-50 rounded-xl shadow p-3 min-w-[170px] max-w-[200px]">
        <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-blue-200 mb-2">
          <img
            src={article.image}
            alt={article.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="font-semibold text-sm text-blue-900 text-center  w-full">
          {article.name.length > 50
            ? article.name.substring(0, 50) + "…"
            : article.name}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Qté : {article.quantity}
        </div>
        <div className="flex flex-col items-center mt-1">
          <span className="bg-blue-200 text-blue-900 text-base font-bold rounded-full px-2 py-0.5">
            {article.price} €
          </span>
          <span className="bg-blue-600 text-white text-base font-bold rounded-full px-2 py-0.5 mt-1">
            Total {article.totalPrice.toFixed(2)} €
          </span>
        </div>
      </div>
    );
  }
  return (
    <div className="bg-white rounded-2xl shadow-md p-4 w-28 md:w-44">
      <div className="relative">
        <img
          src={article.image}
          alt={article.name}
          className="w-full h-32 md:h-36 object-cover rounded-lg"
        />
      </div>
      <h2 className="font-semibold text-sm md:text-sm mt-2">
        {article.name.length > 50
          ? article.name.substring(0, 50) + "..."
          : article.name}
      </h2>{" "}
      <p className="text-gray-500 text-base md:text-sm">
        Quantity: {article.quantity}
      </p>
      <div className="flex justify-between text-base md:text-sm flex-col items-center mt-3">
        <span className="font-bold  ">${article.price}</span>
        <span className="font-bold  ">Total ${article.totalPrice}</span>
      </div>
    </div>
  );
};

export default ArticleCard;
