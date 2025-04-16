import { Navbar } from "@/components/navbar"
import ListMembers from "./listmembers"
import { MemberManagement } from "@/components/member-management"
import { MembershipManagement } from "@/components/membership-management"

export default function BooksPage() {
  return (
    <>
      <Navbar />
      {/* <ListMembers/> */}
      <MemberManagement/> 
      
    </>
  )
}