import React from "react";
import ArticleCard from "./article-card";

interface Article {
  id: number;
  name: string;
  image: string;
  price: number;
  quantity: number;
  totalPrice: number;
}

const ArticlesList: React.FC<{ articles: Article[]; variant?: string }> = ({
  articles,
  variant,
}) => {
  if (variant === "modern") {
    return (
      <div className="grid grid-cols-2  max-h-[70vh] overflow-y-auto md:grid-cols-3 xl:grid-cols-5 p-2  gap-4">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} variant={variant} />
        ))}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2  max-h-[70vh] overflow-y-auto md:grid-cols-3 xl:grid-cols-5 p-2 gap-4">
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  );
};

export default ArticlesList;
