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

const ArticlesList: React.FC<{ articles: Article[] }> = ({ articles }) => {
  return (
    <div className="flex flex-wrap gap-4">
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  );
};

export default ArticlesList;
