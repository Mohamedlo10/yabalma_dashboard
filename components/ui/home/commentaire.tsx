import {
  get5lastCommentaires,
  getCommentairesLength,
} from "@/app/api/commentaire/query";
import { Commente } from "@/app/dashboard/commentaires/schema";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { CSSProperties, useEffect, useState } from "react";
import BeatLoader from "react-spinners/BeatLoader";
import { Button } from "../button";

const override: CSSProperties = {
  display: "block",
  margin: "0 auto",
  borderColor: "red",
};
function Commentaire() {
  // const [commentaire, setcommentaire] = useState<Commande[]>([]);
  let [color, setColor] = useState("#ffffff");
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const [totalCommentaire, settotalCommentaire] = useState(0);
  const [commentaires, setCommentaires] = useState<Commente[]>([]);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const data: any = await get5lastCommentaires();
        const data2: any = await getCommentairesLength();
        console.log(data);

        if (data && data.length > 0) {
          console.log(data);
          setCommentaires(data);
          // setTotal(data.length);
        }
        if (data2 && data2 > 0) {
          console.log(data2);
          settotalCommentaire(data2);
        }
      } catch (error) {
        console.error("Error fetching room details:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

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
    <div className="h-full">
      <Card x-chunk="dashboard-01-chunk-5" className="h-full bg-gradient-to-br from-white to-indigo-50 border-indigo-100 shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xs sm:text-sm lg:text-base text-indigo-800">
              Derniers commentaires
            </CardTitle>
            <div className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">
              {totalCommentaire} au total
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 mt-2 flex-1 min-h-0 p-2 sm:p-4">
          <div className="flex items-start gap-3 flex-col flex-1 overflow-y-auto max-h-[calc(100vh-220px)] pr-1">
            {commentaires?.map((commentaire) => (
              <div key={commentaire.id} className="flex items-center gap-2">
                <Avatar className="lg:flex hidden h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10">
                  <AvatarImage
                    src={commentaire.client?.img_url ?? "/avatars/01.png"}
                    alt={`Avatar of ${commentaire.client?.nom}`}
                  />
                  <AvatarFallback className="text-xs">
                    {commentaire.client?.prenom[0]}
                    {commentaire.client?.nom[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="grid gap-1 flex-1 bg-white p-2 rounded-lg border border-indigo-50 shadow-sm">
                  <div className="flex justify-between items-center">
                    <p className="text-xs sm:text-sm font-medium text-indigo-900">
                      {commentaire.client?.prenom} {commentaire.client?.nom}
                    </p>
                    <span className="text-[10px] text-indigo-400">
                      {new Date(commentaire.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-indigo-700">
                    {commentaire.content}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-1 mt-2">
            <div className="flex py-1 sm:py-2 justify-center rounded-full text-red-700 font-bold text-lg sm:text-xl lg:text-2xl xl:text-3xl tabular-nums">
              +{totalCommentaire}
            </div>
            <div className="ml-auto font-medium">
              <Button
                variant="outline"
                className="w-full mt-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-800 transition-colors"
                onClick={() => router.push("/dashboard/commentaires")}
              >
                Voir tous les commentaires
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Commentaire;
