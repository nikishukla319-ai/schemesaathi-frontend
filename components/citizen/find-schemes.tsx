"use client"

import { useEffect, useState } from "react"
import { Sparkles } from "lucide-react"

import {
  categoryList,
  type Category,
  type Scheme,
} from "@/lib/data"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { SchemeCard } from "@/components/scheme-card"

const API_URL =
  "https://schemesaathi-backend-s2l1.onrender.com"

export function FindSchemes({
  onView,
}: {
  onView: (s: Scheme) => void
}) {
  const [category, setCategory] =
    useState<Category | "any">("Business")

  const [amount, setAmount] = useState("500000")

  const [schemes, setSchemes] =
    useState<Scheme[]>([])

  const [results, setResults] =
    useState<Scheme[] | null>(null)

  const [loading, setLoading] = useState(false)

  const [fetchingSchemes, setFetchingSchemes] =
    useState(true)

  const [error, setError] = useState("")

  // Fetch schemes from live backend
  useEffect(() => {
    async function fetchSchemes() {
      try {
        setFetchingSchemes(true)
        setError("")

        const response = await fetch(
          `${API_URL}/api/schemes`
        )

        if (!response.ok) {
          throw new Error("Failed to fetch schemes")
        }

        const data = await response.json()

        const formattedSchemes: Scheme[] =
          data.schemes.map((scheme: any) => ({
            id: scheme._id,
            name: scheme.name,
            shortName: scheme.shortName,
            category: scheme.category,
            ministry: scheme.ministry,
            summary: scheme.summary,
            minAmount: scheme.minAmount,
            maxAmount: scheme.maxAmount,
            interestRate: scheme.interestRate,
            maxTenureMonths:
              scheme.maxTenureMonths,
            eligibility:
              scheme.eligibility || [],
            documents:
              scheme.documents || [],
            benefits:
              scheme.benefits || "",
            active: scheme.active,
            applicants:
              scheme.applicants || 0,
          }))

        setSchemes(formattedSchemes)
      } catch (error) {
        console.error(error)

        setError(
          "Unable to load schemes. Please try again."
        )
      } finally {
        setFetchingSchemes(false)
      }
    }

    fetchSchemes()
  }, [])

  // Ask backend to match schemes
  async function run(e: React.FormEvent) {
    e.preventDefault()

    setLoading(true)
    setResults(null)
    setError("")

    try {
      const response = await fetch(
        `${API_URL}/api/schemes/match`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            category,
            amount: Number(amount),
          }),
        }
      )

      if (!response.ok) {
        throw new Error(
          "Scheme matching failed"
        )
      }

      const data = await response.json()

      const formattedResults: Scheme[] =
        data.schemes.map((scheme: any) => ({
          id: scheme._id,
          name: scheme.name,
          shortName: scheme.shortName,
          category: scheme.category,
          ministry: scheme.ministry,
          summary: scheme.summary,
          minAmount: scheme.minAmount,
          maxAmount: scheme.maxAmount,
          interestRate: scheme.interestRate,
          maxTenureMonths:
            scheme.maxTenureMonths,
          eligibility:
            scheme.eligibility || [],
          documents:
            scheme.documents || [],
          benefits:
            scheme.benefits || "",
          active: scheme.active,
          applicants:
            scheme.applicants || 0,
          match: scheme.match,
        }))

      setResults(formattedResults)
    } catch (error) {
      console.error(error)

      setError(
        "Unable to match schemes. Please try again."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">

      {/* Search / Matching Box */}
      <Card className="p-6">

        <div className="flex items-center gap-2">
          <Sparkles className="size-5 text-primary" />

          <h3 className="font-semibold">
            Describe what you need
          </h3>
        </div>

        <p className="mt-1 text-sm text-muted-foreground">
          Our AI matches your requirement against
          scheme rules and ranks the best fits.
        </p>

        <form
          onSubmit={run}
          className="mt-5 grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end"
        >

          {/* Category */}
          <div className="space-y-2">
            <Label>Category</Label>

            <Select
              value={category}
              onValueChange={(value) =>
                setCategory(
                  value as Category | "any"
                )
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>

              <SelectContent>

                <SelectItem value="any">
                  Any category
                </SelectItem>

                {categoryList.map((c) => (
                  <SelectItem
                    key={c}
                    value={c}
                  >
                    {c}
                  </SelectItem>
                ))}

              </SelectContent>
            </Select>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">
              Amount required (₹)
            </Label>

            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) =>
                setAmount(e.target.value)
              }
              placeholder="500000"
            />
          </div>

          {/* Button */}
          <Button
            type="submit"
            disabled={
              loading ||
              fetchingSchemes ||
              schemes.length === 0
            }
            className="md:w-auto"
          >
            {loading
              ? "Matching..."
              : "Find schemes"}
          </Button>

        </form>
      </Card>

      {/* Error */}
      {error && (
        <Card className="p-4">
          <p className="text-sm text-red-500">
            {error}
          </p>
        </Card>
      )}

      {/* Fetching Schemes */}
      {fetchingSchemes && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-48 animate-pulse rounded-xl bg-muted"
            />
          ))}

        </div>
      )}

      {/* Matching Loading */}
      {loading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-48 animate-pulse rounded-xl bg-muted"
            />
          ))}

        </div>
      )}

      {/* Results */}
      {results && !loading && (
        <div>

          <p className="mb-3 text-sm text-muted-foreground">

            Found{" "}

            <span className="font-semibold text-foreground">
              {results.length}
            </span>{" "}

            matching schemes, ranked by fit.

          </p>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

            {results.map((scheme) => (
              <SchemeCard
                key={scheme.id}
                scheme={scheme}
                onView={onView}
              />
            ))}

          </div>

        </div>
      )}

      {/* Initial schemes */}
      {!results &&
        !loading &&
        !fetchingSchemes &&
        schemes.length > 0 && (
          <div>

            <p className="mb-3 text-sm text-muted-foreground">
              Available schemes
            </p>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

              {schemes.map((scheme) => (
                <SchemeCard
                  key={scheme.id}
                  scheme={scheme}
                  onView={onView}
                />
              ))}

            </div>

          </div>
        )}

    </div>
  )
}