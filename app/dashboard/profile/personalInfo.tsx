"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Edit, Mail, User, Clock, Calendar, Key, Phone } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { ChangeEvent, useState } from "react";
import { User as UserType } from "../accounts/schema";

type PersonalInfoProps = {
  user: UserType | null | undefined;
};

const InfoItem = ({ 
  label, 
  value, 
  icon: Icon,
  className = ""
}: { 
  label: string; 
  value: React.ReactNode;
  icon: React.ElementType;
  className?: string;
}) => (
  <div className={`flex items-start gap-4 p-3 bg-white rounded-lg shadow-sm ${className}`}>
    <div className="p-2 bg-blue-50 rounded-lg">
      <Icon className="h-5 w-5 text-blue-600" />
    </div>
    <div className="flex-1">
      <div className="text-sm font-medium text-gray-500">{label}</div>
      <div className="mt-1 text-sm font-semibold text-gray-900">{value || "-"}</div>
    </div>
  </div>
);

const PersonalInfo: React.FC<PersonalInfoProps> = ({ user }) => {
  const [editMode, setEditMode] = useState(false);
  const router = useRouter();
  const [compte, setCompte] = useState({
    ...user,
    email: user?.email || "",
  });

  const toggleEditMode = () => setEditMode(!editMode);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCompte({ ...compte, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Your form submission logic here
    setEditMode(false);
  };

  if (!user) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Chargement...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return (
      <>
        {format(date, "dd MMMM yyyy", { locale: fr })}
        <span className="text-gray-500"> à {format(date, "HH:mm")}</span>
      </>
    );
  };

  return (
    <Card className="w-full max-w-xl">
      <CardHeader className="bg-white border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <User className="h-5 w-5" />
            Informations personnelles
          </CardTitle>
         {/*  <Button 
            variant="outline" 
            size="sm" 
            onClick={toggleEditMode}
            className="flex items-center gap-1"
          >
            <Edit className="h-4 w-4" />
            {editMode ? "Annuler" : "Modifier"}
          </Button> */}
        </div>
      </CardHeader>
      
      <CardContent className="">
        {editMode ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prénom
                  </label>
                  <input
                    type="text"
                    name="prenom"
                    value={compte?.user_metadata?.prenom || ""}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={compte.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom
                  </label>
                  <input
                    type="text"
                    name="nom"
                    value={compte?.user_metadata?.nom || ""}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={compte?.phone || ""}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-4 border-t mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={toggleEditMode}
              >
                Annuler
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                Enregistrer les modifications
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <InfoItem 
                  label="Prénom" 
                  value={compte?.user_metadata?.prenom} 
                  icon={User} 
                />
                <InfoItem 
                  label="Email" 
                  value={compte?.email} 
                  icon={Mail}
                />
                <InfoItem 
                  label="Rôle" 
                  value={compte?.user_metadata?.poste?.nom} 
                  icon={Key}
                />
              </div>
              <div className="space-y-4">
                <InfoItem 
                  label="Nom" 
                  value={compte?.user_metadata?.nom} 
                  icon={User}
                />
                {compte?.phone && (
                  <InfoItem 
                    label="Téléphone" 
                    value={compte.phone} 
                    icon={Phone}
                  />
                )}
                {user?.created_at && (
                  <InfoItem 
                    label="Date d'inscription" 
                    value={formatDate(user.created_at)} 
                    icon={Calendar}
                  />
                )}
                {user?.last_sign_in_at && (
                  <InfoItem 
                    label="Dernière connexion" 
                    value={formatDate(user.last_sign_in_at)} 
                    icon={Clock}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PersonalInfo;
