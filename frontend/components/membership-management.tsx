"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export function MembershipManagement() {
  const { user, logout } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [memberDetails, setMemberDetails] = useState<any>(null)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (user) {
      fetchMemberDetails()
    }
  }, [user])

  const fetchMemberDetails = async () => {
    if (!user?.id) return
    
    try {
      setIsLoading(true)
      const response = await fetch(`http://localhost:8080/api/members/${user.id}`)
      
      if (!response.ok) {
        throw new Error("Failed to fetch member details")
      }
      
      const data = await response.json()
      console.log("Member details:", data) // Add logging to see the actual structure
      setMemberDetails(data)
    } catch (error) {
      console.error("Error fetching member details:", error)
      toast({
        title: "Error",
        description: "Failed to load your membership details.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelMembership = async () => {
    if (!user?.id) return
    
    try {
      setIsLoading(true)
      const response = await fetch(`http://localhost:8080/api/members/${user.id}`, {
        method: "DELETE",
      })
      
      if (!response.ok) {
        throw new Error("Failed to cancel membership")
      }
      
      toast({
        title: "Membership Cancelled",
        description: "Your membership has been successfully cancelled.",
      })
      
      // Log the user out and redirect to home
      logout()
      router.push("/")
    } catch (error) {
      console.error("Error cancelling membership:", error)
      toast({
        title: "Error",
        description: "Failed to cancel your membership. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setShowCancelDialog(false)
    }
  }

  if (isLoading && !memberDetails) {
    return <div className="text-center py-10">Loading your membership details...</div>
  }

  // Check if the data structure is as expected
  const hasPerson = memberDetails && memberDetails.person
  const hasAddress = hasPerson && memberDetails.person.address

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Your Membership</CardTitle>
          <CardDescription>Manage your library membership details</CardDescription>
        </CardHeader>
        
        {memberDetails && (
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-medium text-lg">Personal Information</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-muted-foreground">Name:</span>
                <span>{hasPerson ? memberDetails.person.name : memberDetails.name || 'N/A'}</span>
                
                <span className="text-muted-foreground">Email:</span>
                <span>{hasPerson ? memberDetails.person.email : memberDetails.email || 'N/A'}</span>
                
                <span className="text-muted-foreground">Phone:</span>
                <span>{hasPerson ? memberDetails.person.phone : memberDetails.phone || 'N/A'}</span>
              </div>
            </div>
            
            {hasAddress && (
              <div className="space-y-2">
                <h3 className="font-medium text-lg">Address</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-muted-foreground">Street:</span>
                  <span>{memberDetails.person.address.street || 'N/A'}</span>
                  
                  <span className="text-muted-foreground">City:</span>
                  <span>{memberDetails.person.address.city || 'N/A'}</span>
                  
                  <span className="text-muted-foreground">State:</span>
                  <span>{memberDetails.person.address.state || 'N/A'}</span>
                  
                  <span className="text-muted-foreground">ZIP Code:</span>
                  <span>{memberDetails.person.address.zipCode || 'N/A'}</span>
                  
                  <span className="text-muted-foreground">Country:</span>
                  <span>{memberDetails.person.address.country || 'N/A'}</span>
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <h3 className="font-medium text-lg">Membership Details</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-muted-foreground">Member Since:</span>
                <span>{memberDetails.dateOfMembership ? new Date(memberDetails.dateOfMembership).toLocaleDateString() : 'N/A'}</span>
                
                <span className="text-muted-foreground">Status:</span>
                <span className={memberDetails.status === "ACTIVE" ? "text-green-600" : "text-red-600"}>
                  {memberDetails.status || 'N/A'}
                </span>
                
                <span className="text-muted-foreground">Books Checked Out:</span>
                <span>{memberDetails.totalBooksCheckedout !== undefined ? `${memberDetails.totalBooksCheckedout}/5` : 'N/A'}</span>
              </div>
            </div>
          </CardContent>
        )}
        
        <CardFooter>
          <Button 
            variant="destructive" 
            onClick={() => setShowCancelDialog(true)} 
            disabled={isLoading || (memberDetails?.totalBooksCheckedout > 0)}
          >
            {isLoading ? "Processing..." : "Cancel Membership"}
          </Button>
          
          {memberDetails?.totalBooksCheckedout > 0 && (
            <p className="text-sm text-red-500 ml-4">
              You must return all checked out books before cancelling your membership.
            </p>
          )}
        </CardFooter>
      </Card>
      
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently cancel your membership and you will lose access to all library services.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelMembership} className="bg-red-600 hover:bg-red-700">
              Yes, cancel my membership
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}