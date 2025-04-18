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
    <div className="grid grid-cols-2 md:grid-cols-5 p-2 gap-4">
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  );
};

export default ArticlesList;
