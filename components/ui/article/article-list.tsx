import React, { useState, useEffect } from "react";
import ArticleCard from "./article-card";
import { Checkbox } from "@/components/ui/checkbox";

interface Article {
  id: number;
  name: string;
  image: string;
  price: number;
  quantity: number;
  totalPrice: number;
  currency?: string;
}

interface ArticlesListProps {
  articles: Article[];
  variant?: string;
  selectable?: boolean;
  onSelectionChange?: (selectedIds: number[]) => void;
  selectedArticles?: number[];
}

const ArticlesList: React.FC<ArticlesListProps> = ({
  articles,
  variant = 'default',
  selectable = false,
  onSelectionChange,
  selectedArticles: externalSelectedArticles = []
}) => {
  const [localSelectedArticles, setLocalSelectedArticles] = useState<number[]>(externalSelectedArticles);

  // Synchronise la sélection si la prop change
  useEffect(() => {
    setLocalSelectedArticles(externalSelectedArticles);
  }, [externalSelectedArticles]);

  const handleToggleArticle = (articleId: number) => {
    const newSelected = localSelectedArticles.includes(articleId)
      ? localSelectedArticles.filter((id) => id !== articleId)
      : [...localSelectedArticles, articleId];
    
    setLocalSelectedArticles(newSelected);
    onSelectionChange?.(newSelected);
  };

  if (variant === "modern") {
    return (
      <div className="grid grid-cols-1  max-h-[70vh] overflow-y-auto md:grid-cols-2 lg:grid-cols-3 sm:mx-0 mx-8  p-2 gap-4">
        {articles.map((article) => (
          <div key={article.id} className="relative">
            {selectable && (
              <div className="absolute top-2 right-2 z-10">
                <Checkbox
                  checked={localSelectedArticles.includes(article.id)}
                  onCheckedChange={() => handleToggleArticle(article.id)}
                  className="h-10 w-10 rounded-full border-2 border-zinc-400 bg-zinc-200 shadow-xl"
                />
              </div>
            )}
            <ArticleCard article={article} variant={variant} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid  grid-cols-1 max-h-[70vh] overflow-y-auto md:grid-cols-2 lg:grid-cols-3 sm:mx-0 mx-8 p-2 gap-4">
      {articles.map((article) => (
        <div key={article.id} className="relative">
          {selectable && (
            <div className="absolute top-2 right-2 z-10">
              <Checkbox
                checked={localSelectedArticles.includes(article.id)}
                onCheckedChange={() => handleToggleArticle(article.id)}
                className="h-10 w-10 rounded-full border-2 border-zinc-400 bg-zinc-200 shadow-xl"
              />
            </div>
          )}
          <ArticleCard article={article} />
        </div>
      ))}
    </div>
  );
};

export default ArticlesList;
