"use client"

import { useEffect, useState } from "react"
import { inr } from "@/lib/data"
import { Card } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { StatusBadge } from "@/components/status-badge"

const API_URL =
  "https://schemesaathi-backend-s2l1.onrender.com"

type Application = {
  _id: string
  applicationId: string
  schemeName: string
  businessName: string
  amount: number
  status: string
  createdAt: string
}

export function ApplicationsPanel() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function fetchApplications() {
      try {
        setLoading(true)
        setError("")

        const token = localStorage.getItem("token")

        if (!token) {
          setError("Please login first.")
          return
        }

        const response = await fetch(
          `${API_URL}/api/applications/my`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        )

        const data = await response.json()

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to fetch applications"
          )
        }

        setApplications(data.applications || [])
      } catch (error) {
        console.error(error)

        setError(
          error instanceof Error
            ? error.message
            : "Failed to fetch applications"
        )
      } finally {
        setLoading(false)
      }
    }

    fetchApplications()
  }, [])

  return (
    <Card className="p-0">
      <div className="border-b border-border p-5">
        <h3 className="font-semibold">
          My applications
        </h3>

        <p className="text-sm text-muted-foreground">
          Track every application you have submitted.
        </p>
      </div>

      {loading && (
        <div className="p-5 text-sm text-muted-foreground">
          Loading applications...
        </div>
      )}

      {error && !loading && (
        <div className="p-5 text-sm text-red-500">
          {error}
        </div>
      )}

      {!loading &&
        !error &&
        applications.length === 0 && (
          <div className="p-5 text-sm text-muted-foreground">
            No applications submitted yet.
          </div>
        )}

      {!loading &&
        !error &&
        applications.length > 0 && (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    Application ID
                  </TableHead>

                  <TableHead>
                    Scheme
                  </TableHead>

                  <TableHead>
                    Business
                  </TableHead>

                  <TableHead>
                    Date
                  </TableHead>

                  <TableHead>
                    Amount
                  </TableHead>

                  <TableHead>
                    Status
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {applications.map((a) => (
                  <TableRow key={a._id}>
                    <TableCell className="font-medium">
                      {a.applicationId}
                    </TableCell>

                    <TableCell>
                      {a.schemeName}
                    </TableCell>

                    <TableCell className="text-muted-foreground">
                      {a.businessName}
                    </TableCell>

                    <TableCell className="text-muted-foreground">
                      {new Date(
                        a.createdAt
                      ).toLocaleDateString("en-IN")}
                    </TableCell>

                    <TableCell>
                      {inr(a.amount)}
                    </TableCell>

                    <TableCell>
                      <StatusBadge
                        status={a.status as any}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
    </Card>
  )
}