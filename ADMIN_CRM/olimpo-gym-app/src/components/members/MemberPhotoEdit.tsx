"use client";

import { useState } from "react";
import { PhotoUploader } from "@/components/ui/PhotoUploader";
import { updateMemberPhoto } from "@/actions/members";

export function MemberPhotoEdit({ memberId, initialPhotoUrl }: { memberId: string, initialPhotoUrl: string | null }) {
  const [photoUrl, setPhotoUrl] = useState(initialPhotoUrl);

  const handlePhotoUpload = async (url: string) => {
    setPhotoUrl(url);
    await updateMemberPhoto(memberId, url);
  };

  return (
    <div className="shrink-0">
      <PhotoUploader 
        currentPhotoUrl={photoUrl} 
        onPhotoUploaded={handlePhotoUpload} 
      />
    </div>
  );
}
