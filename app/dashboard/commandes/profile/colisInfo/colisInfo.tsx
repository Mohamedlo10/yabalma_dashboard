"use client";
import React from "react";

import { Article, DetailsCommande } from "@/app/dashboard/commandes/schema";
import ArticlesList from "@/components/ui/article/article-list";
import { useRouter } from "next/navigation";
import { CSSProperties, useEffect, useState } from "react";
import BeatLoader from "react-spinners/BeatLoader";

const override: CSSProperties = {
  display: "block",
  margin: "0 auto",
  borderColor: "red",
};

type ColisInfoProps = {
  detailCommande: DetailsCommande | null | undefined;
};

const ColisInfo: React.FC<ColisInfoProps> = ({ detailCommande }) => {
  const [isLoading, setIsLoading] = useState(true);
  let [color, setColor] = useState("#ffffff");

  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    if (detailCommande?.articles) {
      setArticles(detailCommande?.articles);
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, []);

  const router = useRouter();

  const handleNavigation = (idUser: string) => {
    // Par exemple, naviguer vers la page de profil en passant l'ID de l'utilisateur en paramètre
    router.push(`/dashboard/utilisateurs/gp/profile?id=${idUser}`);
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
        <div className="sweet-loading">
          <BeatLoader
            color={color}
            loading={isLoading}
            cssOverride={override}
            size={15}
            aria-label="Loading Spinner"
            data-testid="loader"
          />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className=" max-h-[48vh] p-4 text-xs md:text-base bg-zinc-50 rounded-lg items-center justify-center overflow-y-auto flex-1 flex-col flex">
        <div className="mt-4 justify-start flex items-start w-full">
          <p className="font-bold">Type : {detailCommande?.type}</p>
        </div>
        <div className="mt-4 h-full overflow-y-auto">
          <ArticlesList articles={articles} />
        </div>

        {detailCommande?.expediteur ? (
          <div className="mt-4 justify-start text-xs md:text-base flex items-start w-full">
            <p className="font-bold text-xs md:text-base">
              Expediteur : {detailCommande?.expediteur}
            </p>
          </div>
        ) : (
          <div></div>
        )}

        {detailCommande?.poids ? (
          <div className="mt-4 justify-start text-xs md:text-base flex items-start w-full">
            <p className="font-bold">Poids : {detailCommande?.poids}</p>
          </div>
        ) : (
          <div></div>
        )}
        {detailCommande?.payeur ? (
          <div className="mt-4 justify-start text-xs md:text-base flex items-start w-full">
            <p className="font-bold">Payeur : {detailCommande?.payeur}</p>
          </div>
        ) : (
          <div></div>
        )}

        {detailCommande?.destination ? (
          <div className="mt-4 justify-start text-xs md:text-base flex items-start w-full">
            <p className="font-bold">
              Destination : {detailCommande?.destination}
            </p>
          </div>
        ) : (
          <div></div>
        )}

        {detailCommande?.first_name ? (
          <div className="mt-4 justify-start text-xs md:text-base flex items-start w-full">
            <p className="font-bold">
              Destinataire : {detailCommande?.first_name}
            </p>
          </div>
        ) : (
          <div></div>
        )}

        {detailCommande?.destinataire_number ? (
          <div className="mt-4 justify-start flex items-start w-full">
            <p className="font-bold">
              Numero destinataire : {detailCommande?.destinataire_number}
            </p>
          </div>
        ) : (
          <div></div>
        )}
      </div>
    </>
  );
};

export default ColisInfo;
