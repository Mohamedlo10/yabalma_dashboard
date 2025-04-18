import { Article } from "@/app/dashboard/commandes/schema";
import React from "react";

const ArticleCard: React.FC<{ article: Article }> = ({ article }) => {
  return (
    <div className="bg-white rounded-2xl shadow-md p-4 w-36 md:w-56">
      <div className="relative">
        <img
          src={article.image}
          alt={article.name}
          className="w-full h-28 md:h-36 object-cover rounded-lg"
        />
      </div>

      <h2 className="font-semibold text-xs md:text-sm mt-2">{article.name}</h2>
      <p className="text-gray-500 text-xs md:text-sm">
        Quantity: {article.quantity}
      </p>

      <div className="flex justify-between text-xs md:text-sm items-center mt-3">
        <span className="font-bold  ">${article.price}</span>
        <span className="font-bold  ">Total ${article.totalPrice}</span>
      </div>
    </div>
  );
};

export default ArticleCard;
