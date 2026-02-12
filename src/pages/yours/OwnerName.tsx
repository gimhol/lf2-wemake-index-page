import { type IUserInfo, getUserInfo } from "@/api/getUserInfo";
import { useState, useEffect } from "react";

export function OwnerName(props: { owner_id?: number; }) {
  const { owner_id } = props;
  const [user_info, set_user_info] = useState<IUserInfo | undefined>();
  useEffect(() => {
    if (!owner_id) return;
    getUserInfo({ id: owner_id })
      .then(r => set_user_info(r))
      .catch(e => console.warn(e));
  }, [owner_id]);

  if (!owner_id) return <>----</>;
  return <>Owner: {user_info?.nickname || user_info?.username || owner_id}</>;
}
