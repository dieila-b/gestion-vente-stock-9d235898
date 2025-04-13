
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserAvatarProps {
  photoUrl?: string;
  firstName: string;
  lastName: string;
}

export const UserAvatar = ({ photoUrl, firstName, lastName }: UserAvatarProps) => {
  const initials = `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`;
  
  return (
    <Avatar className="h-10 w-10">
      {photoUrl ? <AvatarImage src={photoUrl} alt={`${firstName} ${lastName}`} /> : null}
      <AvatarFallback>{initials || "U"}</AvatarFallback>
    </Avatar>
  );
};
