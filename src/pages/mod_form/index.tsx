import { useParams } from "react-router";
import { ModFormView } from "./ModFormView";
import { Loading } from "@/components/loading";

export default function ModFormPage() {
  const { id } = useParams()
  if (!id) return <>
    <Loading loading fixed center big />
  </>
  return <ModFormView mod_id={Number(id)} />
}